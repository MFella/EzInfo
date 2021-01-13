import { BadRequestException, HttpException, Injectable, InternalServerErrorException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import { HttpResponse, S3 } from "aws-sdk";
import { Repository, Not } from "typeorm";
import { File } from "./file.entity";
import {v4 as uuid} from 'uuid';
import * as argon2 from 'argon2';
import { User } from "src/user";
import { Note } from "./note.entity";
import * as crypto from 'crypto';
import { Sharing } from "./shared.entity";
import {Readable} from 'stream';
import {Response} from 'express';
import * as fs from 'fs';
import { resolve } from "path";

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

    async uploadFile(dataBuffer: Buffer, filename: string, user: User, body: any)
    {
        const s3 = new S3();
        // const xd = this.configService.get('AWS_PUBLIC_BUCKET_NAME');
        // console.log(user);
        console.log(body);

        if(!user)
        {
            throw new HttpException('You are not allowed, or token expired ;c', 401);
        }

        try{

            //const xd = Buffer.from(dataBuffer, 'binary');
            const createdId = uuid();
            const options = {
                Bucket: this.configService.get('AWS_PUBLIC_BUCKET_NAME'),
                Body: dataBuffer.buffer,
                Key: `${createdId}-${filename}`
            }

            const uploadResult = await s3.upload(options)
            .promise();

            //const mixed_Base_id = "login_idPliku?_hasloDoPliku"
            const mixedBaseId = `${createdId}_${user.login}_${body.password}`;

            const hashed = await argon2.hash(mixedBaseId);

            const newFile = await this.fileRepository.save({
                id: createdId,
                key: uploadResult.Key,
                url: uploadResult.Location,
                login: user.login,
                filename: filename,
                isRestricted: body.accessType === 'Restricted' ? true: false,    //false -> for everyone; true -> for some group of people
                passwordHash: hashed,
                havePassword: body.password.length === 0? false: true   //false -> without additional info in password; true -> with additional info in password
            }); 

            if(body.loginList.length !== 0)
            {
                const logins = body.loginList.split(',');
                console.log(logins);

                for(let i = 0; i < logins.length; i++)
                {
                    const userFromDb = await this.usersRepository.findOne({where:{login: logins[i]}});
                    if(userFromDb)
                    {
                        
                        await this.sharingRepository.save({
                            ownerId: user.id.toString(),
                            authorizedUserId: userFromDb.id.toString(),
                            entityId: createdId, 
                            isFile: true 
                        });
                    }
                }

            }

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

    async retrieveAllFiles(user: User)
    {
        if(user === null)
        {
            throw new HttpException('You are not allowed', 401);
        }

        let selfFromDb = await this.fileRepository.find({where:{login: user.login}});

        const filesWithoutRestriction = await this.fileRepository.find({where: {isRestricted: false, login: Not(user.login)}});

        selfFromDb = [...selfFromDb, ...filesWithoutRestriction];

        selfFromDb.forEach(el =>
            {
                delete el.url
                delete el.passwordHash;
                delete el.key;
            })

        const sharedFilesIdsFromDb = await this.sharingRepository.find({where: {authorizedUserId: user.id, isFile: true}});

        for(let i = 0; i < sharedFilesIdsFromDb.length; i++)
        {
            const fileFromDb = await this.fileRepository.findOne({where: {id: sharedFilesIdsFromDb[i].entityId, login: Not(user.login)}});

            if(fileFromDb)
            {
                delete fileFromDb.url
                delete fileFromDb.passwordHash; 
                delete fileFromDb.key;
    
                selfFromDb.push(fileFromDb);
            }
        }
  
        return selfFromDb;
    }


    async downloadFile(id: string, password: string, user: User, res: Response)
    {
        //how to download file?

        if(user === null)
        {
            throw new HttpException('You are not allowed, sorry', 401);
        }

        const userFromDb = await this.usersRepository.findOne({login: user.login});

        if(!userFromDb || userFromDb.login !== user.login)
        {
            throw new HttpException('Ha! Faked creds, bro', 401);
        }

        

        //try to retrieve note from db

        const fileFromDb = await this.fileRepository.findOne(id);

        //console.log(noteFromDb);

        //if note belongs to user, or note is 'shared' to that user
        const authorization = await this.sharingRepository
        .find({where: {authorizedUserId: user.id, entityId: id}});

        if((fileFromDb.login !== user.login && authorization.length === 0) && fileFromDb.isRestricted)
        {
            
            throw new HttpException('You havent got an access for that ;c', 400);
        }

        const passwordToVerify = fileFromDb.id + '_' + fileFromDb.login + '_' + password;

        const convert = Buffer.from(fileFromDb.passwordHash, 'base64').toString('utf-8');

        const matches = await argon2.verify(convert, passwordToVerify);


        if(matches)
        {
            try{
                const stream = new Readable();
                const s3 = new S3();
                const options = {
                    Bucket: this.configService.get('AWS_PUBLIC_BUCKET_NAME'),
                    Key: fileFromDb.key
                };

                console.log('file');
                


                const file = await s3.getObject(options).createReadStream()
                .on('error', (err) => {
                    
                   //return null
                   return null;
                   // or death
                   //throw new InternalServerErrorException('Cant work anymore');

                })
                .on('end', () => {console.log('ended')})
                ;

                return file;

             }
             catch(e)
             {
                throw new HttpException('Error occured during download file', 500);
            }

        }else{
            console.log('gere')

            throw new BadRequestException('Wrong password');//HttpException('Wrong password', 400);
        }

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
            const toHash = textToSaveDto.password.length === 0 ? newId + '_' + user.login + '_' : 
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
                console.log("tutaj zapis do charing");
                console.log(logArr);

               logArr.forEach(async(el) =>
                {
                    const userFromDb = await this.usersRepository.findOne({where: {login: el}});

                    console.log(userFromDb);

                    if(userFromDb)
                    {
                        //save him in sharing table
                        const xd = await this.sharingRepository.save({
                            ownerId: user.id.toString(), 
                            authorizedUserId: userFromDb.id.toString(),
                            entityId: newId,
                            isFile: false
                        });

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

        //console.log(noteFromDb);

        //if note belongs to user, or note is 'shared' to that user
        const authorization = await this.sharingRepository
        //.findOne({where: {authorizedUserId: user.id, entityId: id}});
        .find({where: {authorizedUserId: user.id, entityId: id}});

        if((noteFromDb.login !== user.login && authorization.length === 0) && noteFromDb.isRestricted)
        {
            throw new HttpException('You havent got an access for that ;c', 400);
        }

        const passwordToVerify = noteFromDb.id + '_' + noteFromDb.login + '_' + password;

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
            throw new HttpException('Wrong password, kido', 400);
        }
    }

    async retrieveAllNotes(user: User)
    {
        if(user === null)
        {
            throw new HttpException('You are not allowed', 401);
        }

        let selfnotesFromDb = await this.noteRepository.find({where:{login: user.login}});

        const notesWithoutRestriction = await this.noteRepository.find({where: {isRestricted: false, login: Not(user.login)}});

        selfnotesFromDb = [...selfnotesFromDb, ...notesWithoutRestriction];

        //console.log(selfnotesFromDb);

        selfnotesFromDb.forEach(el =>
            {
                delete el.iv;
                delete el.passwordHash;
                delete el.content;
            })

        const sharedNotesIdsFromDb = await this.sharingRepository.find({where: {authorizedUserId: user.id, isFile: false}});

        //console.log(sharedNotesIdsFromDb);

        for(let i = 0; i < sharedNotesIdsFromDb.length; i++)
        {
            const noteFromDb = await this.noteRepository.findOne({where: {id: sharedNotesIdsFromDb[i].entityId, login: Not(user.login)}});

            if(noteFromDb)
            {
                delete noteFromDb.iv;
                delete noteFromDb.passwordHash;
                delete noteFromDb.content;

                selfnotesFromDb.push(noteFromDb);
            }
        }
  
        return selfnotesFromDb;
    }


}