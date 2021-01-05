import { bool, boolean } from '@hapi/joi';
import {Entity, Column, PrimaryGeneratedColumn} from 'typeorm';

@Entity()
export class Note{
    @PrimaryGeneratedColumn('uuid')
    id: number;

    @Column({
        nullable: false
    })
    content: string;

    @Column({
        nullable: false
    })
    login: string;

    @Column({
        type: 'bool',
        nullable: false
    }) 
    isRestricted: boolean; 

    @Column({
        //type: 'bool',
        nullable: false
    }) 
    havePassword: boolean;

    @Column({
        type: "blob",
        nullable: false
    })
    passwordHash: string;

}