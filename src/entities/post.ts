// import {
//   Entity,
//   PrimaryGeneratedColumn,
//   Column,
//   CreateDateColumn,
//   ManyToOne,
// } from "typeorm";
// import { User } from "./user";  // Keep the import of User

// @Entity("posts")
// export class Post {
//   @PrimaryGeneratedColumn("uuid")
//   id!: string;

//   @Column("text")
//   content!: string;

//   @Column("text", { array: true, nullable: true })
//   images?: string[];

//   @ManyToOne(() => User, (user) => user.posts, {
//     onDelete: "CASCADE",
//   })
//   user!: User;

//   @CreateDateColumn()
//   createdAt!: Date;
// }


// src/entities/post.ts
 
import {
  Entity,                 
  PrimaryGeneratedColumn, 
  Column,                 
  ManyToOne,              
  CreateDateColumn,      
} from "typeorm";


import type { User } from "./user";  //type-only import (used for type checking only)

@Entity("posts")  
export class Post {
  @PrimaryGeneratedColumn("uuid") 
  id!: string;  

  // Defines a "content" column that stores text content of the post
  @Column({ type: "text" })  
  content!: string; 

  // stores array of image URLs (string array)
  @Column({ type: "simple-array", default: [] })  
  images!: string[];  // image URLs (optional, defaults to empty array)

  // Defines a "many-to-one" relationship between the Post and User entities
  @ManyToOne(() => require("./user").User, (user: User) => user.posts, {
    nullable: false,    // Post must be linked to a User (cannot be null)
    onDelete: "CASCADE", // If the associated user is deleted, all their posts will be deleted
  })
  user!: User;  // The user who created this post (required)

  // Automatically generates a column to store the creation date of the post
  @CreateDateColumn()  
  createdAt!: Date;  // The creation date of the post (automatically set by TypeORM)
}

