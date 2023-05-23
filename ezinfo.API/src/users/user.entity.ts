import { Entity, Column, ObjectIdColumn, ObjectId } from "typeorm";

@Entity()
export class User {
  @ObjectIdColumn()
  id: ObjectId;

  @Column({
    nullable: false,
  })
  name: string;

  @Column({
    nullable: false,
  })
  accountNumber: string;

  @Column({
    nullable: false,
  })
  surname: string;

  @Column({
    nullable: false,
  })
  login: string;

  @Column({
    nullable: false,
  })
  email: string;

  @Column({
    type: "blob",
    nullable: false,
  })
  passwordHash: string;
}
