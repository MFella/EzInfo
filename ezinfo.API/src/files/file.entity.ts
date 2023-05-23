import { ItemType } from "../types/item/itemType";
import { Entity, Column, ObjectIdColumn, ObjectId } from "typeorm";

@Entity()
export class File {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column({
    nullable: false,
  })
  itemId: string;

  @Column({
    nullable: false,
  })
  filename: string;

  @Column({
    nullable: false,
  })
  key: string;

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
    //type: 'bool',
    nullable: false,
  })
  havePassword: boolean;

  @Column({
    nullable: false,
    default: "file",
  })
  itemType: ItemType;

  @Column({
    type: "blob",
    nullable: false,
  })
  passwordHash: string;
}
