import {Entity, Column, PrimaryGeneratedColumn} from 'typeorm';

@Entity()
export class User{
    @PrimaryGeneratedColumn('uuid')
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
        nullable: false,
       // unique: true 
    })
    login: string;

    @Column({
        nullable: false, 
        //unique: true
    })
    email: string;

    @Column({
        type: "blob",
        nullable: false
    })
    passwordHash: string;

}