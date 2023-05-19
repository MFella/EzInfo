import { Entity, Column, PrimaryGeneratedColumn, ObjectIdColumn, ObjectId } from "typeorm";

@Entity()
export class Attempt {
  @ObjectIdColumn()
  id: ObjectId;

  @Column({
    nullable: false,
  })
  login: string;

  @Column({
    nullable: false,
  })
  attempt_number: number;

  @Column({
    nullable: true,
  })
  ban_time: string;
}
