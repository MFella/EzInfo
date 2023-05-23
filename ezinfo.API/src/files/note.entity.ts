import { ItemType } from "../types/item/itemType";
import { Entity, Column, ObjectIdColumn, ObjectId } from "typeorm";

@Entity()
export class Note {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column({
    nullable: false,
  })
  itemId: string;

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
    nullable: false,
    default: "note",
  })
  itemType: ItemType;

  @Column({
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
