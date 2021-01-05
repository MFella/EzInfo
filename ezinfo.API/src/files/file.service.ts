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


@Injectable()
export class FileService {

    constructor(
        @InjectRepository(File)
        private fileRepository: Repository<File>,
        @InjectRepository(Note)
        private noteRepository: Repository<Note>,
        private readonly configService: ConfigService
    )
    {}

    async uploadFile(dataBuffer: Buffer, filename: string)
    {
        const s3 = new S3();
        const xd = this.configService.get('AWS_PUBLIC_BUCKET_NAME');
        //console.log(dataBuffer);

        //s3.putObject()

        console.log(`dsadasd: ${xd}, typeofBody: ${typeof(dataBuffer)}`);

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

            console.log('NewFile is: ');
            console.log(newFile);
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
        console.log(user);
        console.log(textToSaveDto);

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

            const newNote = await this.noteRepository.save({
                id: newId,
                //TODO: change to hashedContent
                content: textToSaveDto.text,
                login: user.login,
                isRestricted: textToSaveDto.accessType === 'Restricted' ? true: false,
                havePassword: textToSaveDto.password.length === 0 ? false: true,
                passwordHash: passHash
            });

            return newNote;

        }catch(e)
        {
            throw new HttpException('Error occured during processing', 500);
        }
        
        

    }



}