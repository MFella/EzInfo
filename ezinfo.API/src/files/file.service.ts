import { HttpException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import { HttpResponse, S3 } from "aws-sdk";
import { Repository } from "typeorm";
import { File } from "./file.entity";
import {v4 as uuid} from 'uuid';
import * as argon2 from 'argon2';
import { User } from "src/user";
import { Note } from "./note.entity";
import * as crypto from 'crypto';
import { Sharing } from "./shared.entity";


@Injectable()
export class FileService {

    constructor(
        @InjectRepository(File)
        private fileRepository: Repository<File>,
        @InjectRepository(Note)
        private noteRepository: Repository<Note>,
        @InjectRepository(User) 
        private usersRepository: Repository<User>,
        @InjectRepository(Sharing)
        private sharingRepository: Repository<Sharing>,
        private readonly configService: ConfigService
    )
    {}

    async uploadFile(dataBuffer: Buffer, filename: string)
    {
        const s3 = new S3();
        const xd = this.configService.get('AWS_PUBLIC_BUCKET_NAME');

        try{

            //const xd = Buffer.from(dataBuffer, 'binary');
            const createdId = uuid();
            const options = {
                Bucket: this.configService.get('AWS_PUBLIC_BUCKET_NAME'),
                Body: dataBuffer.buffer,
                Key: `${createdId}-${filename}`
            }


            // const uploadResult = await s3.upload(
            // {
            //     Bucket: this.configService.get('AWS_PUBLIC_BUCKET_NAME'),
            //     Body: dataBuffer.buffer,
            //     Key: `${uuid()}-${filename}`
            // }
            // )
            // .promise();

            const uploadResult = await s3.upload(options)
            .promise();
            // .then(async(res) =>
            // {
            //     console.log(res);
            //     //const mixed_Base_id = "login_idPliku?_hasloDoPliku"
            //     const mixedBaseId = `mojLogin_${createdId}`;
            //     const hashed = await argon2.hash(mixedBaseId);
            //     const newFile = await this.fileRepository.save({
            //         id: createdId,
            //         key: res.Key,
            //         url: res.Location,
            //         login: 'mojLogin',
            //         filename: filename,
            //         isRestricted: false,    //if true -> hashed should be different
            //         passwordHash: hashed
            //     }); 

            //     console.log(newFile); 
            //     return newFile;
            // })
            // .catch(err =>
            // {
            //     console.log(`Error occured: ${err}`);
            // })
            // s3.putObject(options, (err, data) => 
            // {
            //     if (err)
            //     {
            //         console.log(err);
            //     } else
            //     {
            //         console.log('Success');
            //     }
            // })
            //console.log(uploadResult);

            //return uploadResult;
            console.log(uploadResult);

            //const mixed_Base_id = "login_idPliku?_hasloDoPliku"
            const mixedBaseId = `mojLogin_${createdId}`;
            const hashed = await argon2.hash(mixedBaseId);
            const newFile = await this.fileRepository.save({
                id: createdId,
                key: uploadResult.Key,
                url: uploadResult.Location,
                login: 'mojLogin',
                filename: filename,
                isRestricted: false,    //false -> for everyone; true -> for some group of people
                passwordHash: hashed,
                havePassword: false   //false -> without additional info in password; true -> with additional info in password
            }); 

            const {passwordHash, key, ...rest} = newFile;
            return rest;

        }
        catch(e)
        {
            console.log(e);
            throw new HttpException('Something went wrong ;/', 400);

        }
        //a potem url -> uploadResult.Location
    }

    async getObject(key: string)
    {
        const s3 = new S3();

        const options = {
            Key: key,
            Bucket: this.configService.get('AWS_PUBLIC_BUCKET_NAME'),
        }

        s3.getObject(options, (err, data) =>
        {
            if(err) throw err;

            console.log(data);
        })
    }

    async deleteFile(id: number)
    {
        const s3 = new S3();
        const fileFromDb = await this.fileRepository.findOne({id: id});

        if(!fileFromDb)
        {
            throw new HttpException('Cant find file with that id!', 404);
        }

        // if(fileFromDb.login !== 'mojLogin')
        // {
        //     throw new HttpException('You are not allowed!', 401);
        // }
        if(fileFromDb.isRestricted)
        {
            //take whole accessed list from another table, 
            //and if i am here with that file, let me in
            //if not, throw an authorized
        } 

        if(fileFromDb.havePassword)
        {
            //provide special password(as input, or in query), verify password -> if truthy, lets go
        }

        //delete from s3
        const delRes = await s3.deleteObject({
            Bucket: this.configService.get('AWS_PUBLIC_BUCKET_NAME'),
            Key: fileFromDb.key
        }).promise();

        //delete records from sharedTable: TODO

        //delete from main-file table
        await this.fileRepository.delete(id);

        return {'deleted': true}

    }

    async saveText(textToSaveDto: any, user: User)
    {
        if(!user)
        {
            throw new HttpException('You are not allowed to do this!', 401);
        }

        if(textToSaveDto.text.length === 0)
        {
            throw new HttpException('Nothing to save', 400);
        }


        try{

            const newId = uuid();
            const toHash = textToSaveDto.password.length === 0 ? newId + '_' + user.login : 
            newId + '_' + user.login + '_' + textToSaveDto.password;

            const passHash = await argon2.hash(toHash);

            const algorithm = 'aes-192-cbc';
            const key = crypto.scryptSync(textToSaveDto.password, 'salt', 24);

            const iv = crypto.randomBytes(16);
            const cipher = crypto.createCipheriv(algorithm, key, iv);
            const encrypted = cipher.update(textToSaveDto.text, 'utf8', 'hex') + cipher.final('hex');

            //const decipher = crypto.createDecipheriv(algorithm, key, iv);
            //const decrypted = decipher.update(encrypted, 'hex', 'utf8') + decipher.final('utf8');

            const newNote = await this.noteRepository.save({
                id: newId,
                //TODO: change to hashedContent
                content: encrypted,
                iv: iv,
                login: user.login,
                isRestricted: textToSaveDto.accessType === 'Restricted' ? true: false,
                havePassword: textToSaveDto.password.length === 0 ? false: true,
                passwordHash: passHash
            });

            if(textToSaveDto.loginList.length !== 0)
            {
                const logArr = textToSaveDto.loginList.split(',');
                
               logArr.forEach(async(el) =>
                {
                    const userFromDb = await this.usersRepository.findOne({where: {login: el}});

                    if(userFromDb)
                    {
                        //save him in sharing table

                        await this.sharingRepository.save({
                            ownerId: user.id.toString(), 
                            authorizedUserId: userFromDb.id.toString(),
                            entityId: newId,
                            isFile: false
                        })


                    }
                })

            }


            return newNote;

        }catch(e)
        {
            throw new HttpException('Error occured during processing', 500);
        }
        
    }

    async retrieveNote(id: string, password: string, user: User)
    {
        if(!user)
        {
            throw new HttpException('You are not allowed to do this!', 401);
        }

        //check if user exists... -> later maybe
        const userFromDb = await this.usersRepository.findOne({login: user.login});
        
        if(!userFromDb || userFromDb.login !== user.login)
        {
            throw new HttpException('Ha! Faked creds, bro', 401);
        }

        //try to retrieve note from db

        const noteFromDb = await this.noteRepository.findOne(id);

        //if note belongs to user, or note is 'shared' to that user
        const authorization = await this.sharingRepository
        .findOne({where: {authorizedUserId: user.id, entityId: id}});

        if(noteFromDb.login !== user.login || !authorization)
        {
            throw new HttpException('You havent got an access for that ;c', 401);
        }

        const passwordToVerify = noteFromDb.id + '_' + user.login + '_' + password;

        const convert = Buffer.from(noteFromDb.passwordHash, 'base64').toString('utf-8');
        //try to verify password
        const matches = await argon2.verify(convert, passwordToVerify);

        if(matches)
        {   
            //try to decrypt file content:
            const algorithm = 'aes-192-cbc'; 
            const key = crypto.scryptSync(password, 'salt', 24);

            const decipher = crypto.createDecipheriv(algorithm, key, noteFromDb.iv);
            const decrypted = decipher.update(noteFromDb.content, 'hex', 'utf8') + decipher.final('utf8');
            
            return {note: decrypted};

        } else
        {
            throw new HttpException('Wrong password, kido', 401);
        }
    }

    async retrieveAllNotes(user: User)
    {
        const selfnotesFromDb = await this.noteRepository.find({where:{login: user.login}});

        const sharedNotesIdsFromDb = await this.sharingRepository.find({where: {authorizedUserId: user.id}});

        sharedNotesIdsFromDb.forEach(async(el) =>
        {
            const noteFromDb = await this.noteRepository.findOne({where: {id: el.entityId}});
            if(noteFromDb)
            {
                selfnotesFromDb.push(noteFromDb);
            }

        })

        
        return selfnotesFromDb;

    }


}