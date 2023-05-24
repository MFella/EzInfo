import { BadRequestException, HttpException, Injectable, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import { S3 } from "aws-sdk";
import { MongoRepository } from "typeorm";
import { File } from "./file.entity";
import { v4 as uuid } from "uuid";
import * as argon2 from "argon2";
import { User } from "src/user";
import { Note } from "./note.entity";
import * as crypto from "crypto";
import { Sharing } from "./shared.entity";
import { PutObjectCommand, GetObjectCommand, DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { DeleteItemResponse } from "src/types/deleteItemResponse";

@Injectable()
export class FileService {
  private readonly s3Client!: S3Client;

  constructor(
    @InjectRepository(File)
    private fileRepository: MongoRepository<File>,
    @InjectRepository(Note)
    private noteRepository: MongoRepository<Note>,
    @InjectRepository(User)
    private usersRepository: MongoRepository<User>,
    @InjectRepository(Sharing)
    private sharingRepository: MongoRepository<Sharing>,
    private readonly configService: ConfigService,
  ) {
    this.s3Client = new S3Client({
      region: this.configService.get("AWS_REGION"),
      credentials: {
        accessKeyId: this.configService.get("AWS_SECRET_ACCESS_KEY"),
        secretAccessKey: this.configService.get("AWS_ACCESS_KEY_ID"),
      },
    });
  }

  async uploadFile(dataBuffer: Buffer, filename: string, user: User, body: any) {
    if (!user) {
      throw new HttpException("You are not allowed, or token expired ;c", 401);
    }

    try {
      const createdId = uuid();

      const keyOfFile: string = `${createdId}-${filename}`;

      const putObjectCommand = new PutObjectCommand({
        Bucket: this.configService.get("AWS_PUBLIC_BUCKET_NAME"),
        Body: dataBuffer,
        Key: keyOfFile,
      });

      await this.s3Client.send(putObjectCommand);

      const mixedBaseId = `${createdId}_${user.login}_${body.password}`;

      const hashed = await argon2.hash(mixedBaseId);

      const newFile = await this.fileRepository.save({
        itemId: createdId,
        key: keyOfFile,
        login: user.login,
        filename: filename,
        isRestricted: body.accessType === "Restricted" ? true : false, //false -> for everyone; true -> for some group of people
        passwordHash: hashed,
        havePassword: body.password.length === 0 ? false : true, //false -> without additional info in password; true -> with additional info in password
        itemType: "file",
      });

      if (body.loginList.length !== 0) {
        const logins = body.loginList.split(",");

        for (let i = 0; i < logins.length; i++) {
          const userFromDb = await this.usersRepository.findOne({ where: { login: logins[i] } });
          if (userFromDb) {
            await this.sharingRepository.save({
              ownerId: user.id.toString(),
              authorizedUserId: userFromDb.id.toString(),
              entityId: createdId,
              fileType: "file",
            });
          }
        }
      }

      const { passwordHash, key, ...rest } = newFile;

      return rest;
    } catch (e) {
      throw new HttpException("Something went wrong ;/", 400);
    }
  }

  async getObject(key: string) {
    const s3 = new S3();

    const options = {
      Key: key,
      Bucket: this.configService.get("AWS_PUBLIC_BUCKET_NAME"),
    };

    s3.getObject(options, (err, data) => {
      if (err) throw err;
    });
  }

  async retrieveAllFiles(user: User) {
    if (user === null) {
      throw new HttpException("You are not allowed", 401);
    }

    let selfFromDb = await this.fileRepository.find({ where: { login: user.login } });

    const filesWithoutRestriction = await this.fileRepository.find({ where: { isRestricted: false, login: { $ne: user.login } } });

    selfFromDb = [...selfFromDb, ...filesWithoutRestriction];

    selfFromDb.forEach(el => {
      delete el.passwordHash;
      delete el.key;
    });

    const sharedFilesIdsFromDb = await this.sharingRepository.find({ where: { authorizedUserId: user.id.toString(), itemType: "file" } });

    for (let i = 0; i < sharedFilesIdsFromDb.length; i++) {
      const fileFromDb = await this.fileRepository.findOne({ where: { itemId: sharedFilesIdsFromDb[i]?.entityId, login: { $ne: user.login } } });

      if (fileFromDb) {
        delete fileFromDb.passwordHash;
        delete fileFromDb.key;

        selfFromDb.push(fileFromDb);
      }
    }

    return selfFromDb;
  }

  async downloadFile(itemId: string, password: string, user: User): Promise<any> {
    if (user === null) {
      throw new HttpException("You are not allowed, sorry", 401);
    }

    const userFromDb = await this.usersRepository.findOne({ where: { login: user.login } });

    if (!userFromDb || userFromDb.login !== user.login) {
      throw new HttpException("Ha! Faked creds, bro", 401);
    }

    const fileFromDb = await this.fileRepository.findOne({ where: { itemId } });

    const authorization = await this.sharingRepository.find({ where: { authorizedUserId: user.id.toString(), entityId: itemId } });

    if (!fileFromDb) {
      throw new NotFoundException("File doesn't exists");
    }

    if (fileFromDb.login !== user.login && authorization.length === 0 && fileFromDb.isRestricted) {
      throw new HttpException("You havent got an access for that", 400);
    }

    const passwordToVerify = fileFromDb.itemId + "_" + fileFromDb.login + "_" + password;

    const matches = await argon2.verify(fileFromDb.passwordHash, passwordToVerify);

    if (matches) {
      try {
        const options = new GetObjectCommand({
          Bucket: this.configService.get("AWS_PUBLIC_BUCKET_NAME"),
          Key: fileFromDb.key,
        });

        const file = await this.s3Client.send(options);
        return file.Body;
      } catch (e) {
        throw new HttpException("Error occured during download file", 500);
      }
    } else {
      throw new BadRequestException("Wrong password");
    }
  }

  async deleteFile(id: number) {
    const s3 = new S3();
    const fileFromDb = await this.fileRepository.findOne({ where: { itemId: String(id) } });

    if (!fileFromDb) {
      throw new HttpException("Cant find file with that id!", 404);
    }

    if (fileFromDb.isRestricted) {
    }

    if (fileFromDb.havePassword) {
      //provide special password(as input, or in query), verify password -> if truthy, lets go
    }

    //delete from s3
    const delRes = await s3
      .deleteObject({
        Bucket: this.configService.get("AWS_PUBLIC_BUCKET_NAME"),
        Key: fileFromDb.key,
      })
      .promise();

    //delete records from sharedTable: TODO

    //delete from main-file table
    await this.fileRepository.delete(id);

    return { deleted: true };
  }

  async saveText(textToSaveDto: any, user: User) {
    if (!user) {
      throw new HttpException("You are not allowed to do this!", 401);
    }

    if (textToSaveDto.text.length === 0) {
      throw new HttpException("Nothing to save", 400);
    }

    try {
      const newId = uuid();
      const toHash = textToSaveDto.password.length === 0 ? newId + "_" + user.login + "_" : newId + "_" + user.login + "_" + textToSaveDto.password;

      const passHash = await argon2.hash(toHash);

      const algorithm = "aes-192-cbc";
      const key = crypto.scryptSync(textToSaveDto.password, "salt", 24);

      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv(algorithm, key, iv);
      const encrypted = cipher.update(textToSaveDto.text, "utf8", "hex") + cipher.final("hex");

      const newNote = await this.noteRepository.save({
        itemId: newId,
        content: encrypted,
        iv,
        login: user.login,
        isRestricted: textToSaveDto.accessType === "Restricted",
        havePassword: textToSaveDto.password.length !== 0,
        passwordHash: passHash,
        itemType: "note",
      });

      if (textToSaveDto.loginList.length !== 0) {
        const logArr = textToSaveDto.loginList.split(",");

        logArr.forEach(async el => {
          const userFromDb = await this.usersRepository.findOne({ where: { login: el } });

          if (userFromDb) {
            await this.sharingRepository.save({
              ownerId: user.id.toString(),
              authorizedUserId: userFromDb.id.toString(),
              entityId: newId,
              itemType: "note",
            });
          }
        });
      }

      return newNote;
    } catch (e) {
      throw new HttpException("Error occured during processing", 500);
    }
  }

  async retrieveNote(id: string, password: string, user: User) {
    if (!user) {
      throw new HttpException("You are not allowed to do this!", 401);
    }

    const userFromDb = await this.usersRepository.findOne({ where: { login: user.login } });

    if (!userFromDb || userFromDb.login !== user.login) {
      throw new HttpException("Ha! Faked creds, bro", 401);
    }

    const noteFromDb = await this.noteRepository.findOne({ where: { itemId: id } });

    const authorization = await this.sharingRepository.find({ where: { authorizedUserId: user.id.toString(), entityId: id } });

    if (!noteFromDb) {
      throw new NotFoundException("Note with that id doesnt exists");
    }

    if (noteFromDb.login !== user.login && authorization.length === 0 && noteFromDb.isRestricted) {
      throw new HttpException("You havent got an access for that ;c", 400);
    }

    const passwordToVerify = noteFromDb.itemId + "_" + noteFromDb.login + "_" + password;

    //try to verify password
    const matches = await argon2.verify(noteFromDb.passwordHash, passwordToVerify);

    if (matches) {
      const algorithm = "aes-192-cbc";
      const key = crypto.scryptSync(password, "salt", 24);

      const decipher = crypto.createDecipheriv(algorithm, key, noteFromDb.iv.buffer as Buffer);
      const decrypted = decipher.update(noteFromDb.content, "hex", "utf8") + decipher.final("utf8");

      return { note: decrypted };
    } else {
      throw new HttpException("Wrong password", 400);
    }
  }

  async deleteItem(code: string, itemId: string, user: User): Promise<DeleteItemResponse> {
    const fileFromDb = await this.fileRepository.findOne({ where: { itemId: itemId } });
    const noteFromDb = await this.noteRepository.findOne({ where: { itemId: itemId } });

    if (!fileFromDb && !noteFromDb) {
      throw new NotFoundException("Item with that id doesnt exists");
    }

    const appropriateCode = itemId
      .split("-")
      .map((codePart: string) => codePart.charAt(0))
      .join("");

    if (code !== appropriateCode) {
      return { deleted: false, message: "You provided wrong code - try again later" };
    }

    const itemToProceed = fileFromDb || noteFromDb;

    if (this.isItemNote(itemToProceed)) {
      await this.noteRepository.findOneAndDelete({ where: { itemId: itemId } });
      return { deleted: true, message: "Note has been deleted successfully" };
    } else {
      const command = new DeleteObjectCommand({
        Bucket: this.configService.get("AWS_PUBLIC_BUCKET_NAME"),
        Key: itemId,
      });
      await this.s3Client.send(command);

      const deletedResponse = await this.fileRepository.deleteOne({ itemId });

      if (deletedResponse.deletedCount === 1) {
        return { deleted: true, message: "File has been deleted successfully" };
      } else {
        return { deleted: false, message: "Cant delete file - unrecognized issue" };
      }
    }
  }

  private isItemNote(item: Note | File): item is Note {
    return item instanceof Note;
  }

  async retrieveAllNotes(user: User) {
    if (user === null) {
      throw new HttpException("You are not allowed", 401);
    }

    let selfNotesFromDb: Array<Note> = await this.noteRepository.find({ where: { login: user.login } });
    const notesWithoutRestriction = await this.noteRepository.find({ where: { isRestricted: false, login: { $ne: user.login } } });

    selfNotesFromDb = [...selfNotesFromDb, ...notesWithoutRestriction];

    selfNotesFromDb.forEach(el => {
      delete el.iv;
      delete el.passwordHash;
      delete el.content;
    });

    const sharedNotesIdsFromDb = await this.sharingRepository.find({ where: { authorizedUserId: user.id.toString(), itemType: "note" } });

    for (let i = 0; i < sharedNotesIdsFromDb.length; i++) {
      const noteFromDb = await this.noteRepository.findOne({ where: { itemId: sharedNotesIdsFromDb[i].entityId, login: { $ne: user.login } } });

      if (noteFromDb) {
        delete noteFromDb.iv;
        delete noteFromDb.passwordHash;
        delete noteFromDb.content;

        selfNotesFromDb.push(noteFromDb);
      }
    }

    return selfNotesFromDb;
  }
}
