import { bool, boolean } from '@hapi/joi';
import {Entity, Column, PrimaryGeneratedColumn, PrimaryColumn} from 'typeorm';

@Entity()
export class Sharing{

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({
        nullable: false
    }) 
    ownerId: string;

    @Column({  
        nullable: false
    })
    authorizedUserId: string; 

    @Column({
        nullable: false 
    }) 
    entityId: string;

    @Column({
        type: 'bool',
        nullable: false
    }) 
    isFile: boolean; 
}