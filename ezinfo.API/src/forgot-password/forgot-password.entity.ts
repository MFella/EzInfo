import { Column, Entity, ObjectId, ObjectIdColumn } from "typeorm";

@Entity()
export class ForgotPassword {
  @ObjectIdColumn()
  id: ObjectId;

  @Column({
    nullable: false,
    type: "blob",
  })
  tokenHash: string;

  @Column({
    nullable: false,
  })
  email: string;

  @Column({
    type: "blob",
    nullable: false,
  })
  iv: Buffer;
}
