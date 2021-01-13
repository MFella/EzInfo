import { bool, boolean } from '@hapi/joi';
import {Entity, Column, PrimaryGeneratedColumn} from 'typeorm';

@Entity()
export class Attempt{
    @PrimaryGeneratedColumn('uuid')
    id: number;

    @Column({
        nullable: false
    })
    login: string;

    @Column({
        nullable: false
    })
    attempt_number: number;

    @Column({
        nullable: true
    })
    ban_time: string; 
}