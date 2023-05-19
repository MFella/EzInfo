import { Entity, Column, ObjectIdColumn, ObjectId } from "typeorm";

@Entity()
export class Note {
  @ObjectIdColumn()
  id: ObjectId;

  @Column({
    nullable: false,
  })
  content: string;

  @Column({
    nullable: false,
  })
  login: string;

  @Column({
    type: "bool",
    nullable: false,
  })
  isRestricted: boolean;

  @Column({
    type: "bool",
    nullable: false,
    default: false,
  })
  isFile: boolean;

  @Column({
    //type: 'bool',
    nullable: false,
  })
  havePassword: boolean;

  @Column({
    type: "blob",
    nullable: false,
  })
  passwordHash: string;

  @Column({
    type: "blob",
    nullable: false,
  })
  iv: Buffer;
}
