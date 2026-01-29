import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from "typeorm";

@Entity("users")

export class User {
  @PrimaryGeneratedColumn()
  id!: number;


  @Column({ nullable: true })       // allow null
  firstName?: string;


  @Column({ nullable: true })
  lastName?: string;

  @Column({ unique: true })
  email!: string;


  @Column({ default: true })
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;
  
  @Column({ nullable: true })
  firebaseUid?: string;

}

