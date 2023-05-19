import { Column, Entity, ObjectId, ObjectIdColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Sharing {
  @ObjectIdColumn()
  id: ObjectId;

  @Column({
    nullable: false,
  })
  ownerId: string;

  @Column({
    nullable: false,
  })
  authorizedUserId: string;

  @Column({
    nullable: false,
  })
  entityId: string;

  @Column({
    type: "bool",
    nullable: false,
  })
  isFile: boolean;
}
