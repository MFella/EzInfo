import {Entity, Column, PrimaryGeneratedColumn} from 'typeorm';

@Entity()
export class User{
    @PrimaryGeneratedColumn()
    id: number;

    @Column('string')
    name: string;

    @Column()
    surname: string;

    @Column()
    login: string;

}