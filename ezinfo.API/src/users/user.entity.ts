import {Entity, Column, PrimaryGeneratedColumn} from 'typeorm';

@Entity()
export class User{
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        nullable: false
    })
    name: string;

    @Column({
        nullable: false
    })
    surname: string;

    @Column({
        nullable: false
    })
    login: string;

    @Column({
        type: "blob",
        nullable: false
    })
    passwordHash: string;

}