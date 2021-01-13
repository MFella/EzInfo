import {Entity, Column, PrimaryGeneratedColumn} from 'typeorm';

@Entity()
export class File{
    @PrimaryGeneratedColumn('uuid')
    id: number;

    @Column({
        nullable: false
    })
    filename: string;

    @Column({
        nullable: false
    })
    url: string;

    @Column({
        nullable: false
    })
    key: string;

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
        nullable: false,
        default: true
    })
    isFile: boolean;
    
    @Column({
        type: "blob",
        nullable: false
    })
    passwordHash: string;

}