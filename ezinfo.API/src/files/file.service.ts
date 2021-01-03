import { HttpException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import { S3 } from "aws-sdk";
import { Repository } from "typeorm";
import { File } from "./file.entity";
import {v4 as uuid} from 'uuid';


@Injectable()
export class FileService {

    constructor(
        @InjectRepository(File)
        private fileRepository: Repository<File>,
        private readonly configService: ConfigService
    )
    {}

    async uploadFile(dataBuffer: Buffer, filename: string)
    {
        const s3 = new S3();
        const xd = this.configService.get('AWS_PUBLIC_BUCKET_NAME');
        console.log(dataBuffer);

        s3.putObject()

        console.log(`dsadasd: ${xd}, typeofBody: ${typeof(dataBuffer)}`);

        try{

            //const xd = Buffer.from(dataBuffer, 'binary');
            const options = {
                Bucket: this.configService.get('AWS_PUBLIC_BUCKET_NAME'),
                Body: dataBuffer.buffer,
                Key: `${uuid()}-${filename}`
            }


            const uploadResult = await s3.upload(
            // {
            //     Bucket: this.configService.get('AWS_PUBLIC_BUCKET_NAME'),
            //     Body: dataBuffer.buffer,
            //     Key: `${uuid()}-${filename}`
            // }
            options
            )
            .promise();

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
            console.log(uploadResult);

            return uploadResult;

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



}