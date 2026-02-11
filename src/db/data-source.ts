import { DataSource } from "typeorm";
import { User } from "../entities/user";
import { Post } from "../entities/post";

 export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: true,
  logging: false,
  entities: [User, Post], // both entities here
  migrations: [__dirname + "/../migrations/*.ts"],
  subscribers: [__dirname + "/../subscribers/*.ts"],
});
