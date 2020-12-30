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
        nullable: false
    })
    isPrivate: boolean;
 
    @Column({
        nullable: false,
        default: false
    })
    toAll: boolean;

    @Column({
        type: "blob",
        nullable: false
    })
    passwordHash: string;

}