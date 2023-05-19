import { Entity, Column, PrimaryGeneratedColumn, ObjectIdColumn, ObjectId } from "typeorm";

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
    nullable: false,
  })
  passwordHash: string;
}
