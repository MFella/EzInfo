import {Column, Entity, PrimaryGeneratedColumn} from 'typeorm';

@Entity()
export class ForgotPassword {

    @PrimaryGeneratedColumn('uuid')
    id: number;

    @Column({
        nullable: false,
        type: 'blob'
    })
    tokenHash: string;

    @Column({
        nullable: false
    })
    email: string;

    @Column({
        type: 'blob',
        nullable: false
    })
    iv: Buffer;
}