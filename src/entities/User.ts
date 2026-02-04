// //entities/user.ts
// import {
//   Entity,
//   PrimaryGeneratedColumn,
//   Column,
//   CreateDateColumn,
//   OneToMany,
// } from "typeorm";
// import { Post } from "./post";  // Keep the import of Post

// @Entity("users")
// export class User {
//    @PrimaryGeneratedColumn("uuid")
//   id!: string;

//   @Column({ nullable: true })       // allow null
//   firstName?: string;

//   @Column({ nullable: true })
//   lastName?: string;

//   @Column({ unique: true })
//   email!: string;

//   @Column({ default: true })
//   isActive!: boolean;

//   @CreateDateColumn()
//   createdAt!: Date;
  
//   @Column({ nullable: true })
//   firebaseUid?: string;

//   // @OneToMany(() => Post, (post) => post.user)
//   // posts!: Post[];
//   // Lazy relation using require() but typed properly
//   @OneToMany<Post>(() => require("./post").Post, (post: Post) => post.user)
//   posts!: Post[];

// }


// src/entities/user.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from "typeorm";
import type { Post } from "./post"; // type-only import

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ nullable: true })
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

  @OneToMany(() => require("./post").Post, (post: Post) => post.user)
  posts!: Post[];
}
