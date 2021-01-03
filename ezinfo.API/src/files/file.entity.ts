import { bool, boolean } from '@hapi/joi';
import {Entity, Column, PrimaryGeneratedColumn} from 'typeorm';

@Entity()
export class File{
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        nullable: false
    })
    filename: string;

    @Column({
        nullable: false
    })
    downloadLink: string;

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
        type: "blob",
        nullable: false
    })
    passwordHash: string;

}