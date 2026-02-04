// //db/datasource
// import "reflect-metadata";
// import { DataSource } from "typeorm";
// import { User } from "../entities/user";
// import { Post } from "../entities/post"
// import * as dotenv from "dotenv";

// // Load .env.local
// dotenv.config({ path: ".env.local" });
// console.log("DB_PASSWORD:", process.env.DB_PASSWORD);


// export const AppDataSource = new DataSource({
//   type: "postgres",
//   host: process.env.DB_HOST,
//   port: Number(process.env.DB_PORT),
//   username: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,

//   synchronize: true,
//   logging: false,
//   entities: [User, Post],
//   // Updated paths for migrations and subscribers:
//   migrations: [__dirname + "/../migrations/*.ts"],  // Fix for TypeScript paths
//   subscribers: [__dirname + "/../subscribers/*.ts"],

//   // // If in production (compiled JS), use .js files:
//   // migrations: [__dirname + "/../migrations/*.js"], 
//   // subscribers: [__dirname + "/../subscribers/*.js"],
// });
// AppDataSource.initialize()
//   .then(() => {
//     console.log("Data Source has been initialized!");
//   })
//   .catch((error) => {
//     console.error("Error during Data Source initialization", error);
//   });


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
