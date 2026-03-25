// import { DataSource } from "typeorm";
// import { User } from "../entities/user";
// import { Post } from "../entities/post";
// import { Like } from "../entities/like";
// import { Comment } from "../entities/comment";
// import { config } from "dotenv";

// // Load environment variables from .env.local file
// config({ path: '.env.local' });

// console.log("[data-source] Checking env vars...");
// console.log("[data-source] DB_HOST:", process.env.DB_HOST);
// console.log("[data-source] All env keys:", Object.keys(process.env).filter(k => k.startsWith('DB')));

// if (!process.env.DB_HOST || !process.env.DB_PORT || !process.env.DB_USER || !process.env.DB_PASSWORD || !process.env.DB_NAME) {
//   console.error("[data-source] Missing environment variables!");
//   console.error("[data-source] DB_HOST:", process.env.DB_HOST);
//   console.error("[data-source] DB_PORT:", process.env.DB_PORT);
//   console.error("[data-source] DB_USER:", process.env.DB_USER);
//   console.error("[data-source] DB_PASSWORD:", process.env.DB_PASSWORD);
//   console.error("[data-source] DB_NAME:", process.env.DB_NAME);
  
//   // Don't throw error - just log and continue
//   // The actual database connection will fail later if vars are missing
// }

// export const AppDataSource = new DataSource({
//   type: "postgres",
//   host: process.env.DB_HOST || "localhost",
//   port: Number(process.env.DB_PORT) || 5432,
//   username: process.env.DB_USER || "postgres",
//   password: process.env.DB_PASSWORD || "",
//   database: process.env.DB_NAME || "postgres",
//   synchronize: true,
//   logging: true,
//   entities: [User, Post, Like, Comment],
//   migrations: [__dirname + "/../migrations/*.ts"],
//   subscribers: [__dirname + "/../subscribers/*.ts"],
// });

// data-source.ts

// // src/db/data-source.ts
// import { DataSource } from "typeorm";
// import { User } from "@entities/user";
// import { Post } from "@entities/post";
// import { Like } from "@entities/like";
// import { Comment } from "@entities/comment";
// import { Follow } from "@entities/follow";
// import { Notification } from "@entities/notification";

// // Use a private variable to store the DataSource instance
// let _AppDataSource: DataSource | null = null;

// /**
//  * Returns a guaranteed initialized DataSource
//  */
// export const AppDataSource = (): DataSource => {
//   if (!_AppDataSource) {
//     // Only server-side
//     if (typeof window !== "undefined") {
//       throw new Error("[data-source] AppDataSource cannot be used in the browser");
//     }

//     // Load environment variables
//     import("dotenv").then(dotenv => dotenv.config({ path: ".env.local" }));

//     // Check required environment variables
//     const requiredVars = ["DB_HOST", "DB_PORT", "DB_USER", "DB_PASSWORD", "DB_NAME"];
//     const missingVars = requiredVars.filter(v => !process.env[v]);
//     if (missingVars.length) {
//       console.error(`[data-source] Missing environment variables: ${missingVars.join(", ")}`);
//       process.exit(1);
//     }

//     // Create DataSource instance
//     _AppDataSource = new DataSource({
//       type: "postgres",
//       host: process.env.DB_HOST!,
//       port: Number(process.env.DB_PORT) || 5432,
//       username: process.env.DB_USER!,
//       password: process.env.DB_PASSWORD!,
//       database: process.env.DB_NAME!,
//       synchronize: false, // ✅ only dev
//       logging: process.env.NODE_ENV === "development",
//       entities: [User, Post, Like, Comment, Follow, Notification],
//       migrations: [__dirname + "/../migrations/*.ts"],
//       subscribers: [__dirname + "/../subscribers/*.ts"],
//     });

//     // Initialize immediately
//     _AppDataSource
//       .initialize()
//       .then(() => console.log("[data-source] DataSource initialized successfully"))
//       .catch(err => console.error("[data-source] DataSource initialization failed:", err));
//   }

//   return _AppDataSource!;
// };

// src/db/data-source.ts
import { DataSource } from "typeorm";
import { User } from "@entities/user";
import { Post } from "@entities/post";
import { Like } from "@entities/like";
import { Comment } from "@entities/comment";
import { Follow } from "@entities/follow";
import { Notification } from "@entities/notification";

// ✅ AppDataSource will only exist server-side
let AppDataSource: DataSource | null = null;

// Only initialize when running in Node.js
if (typeof window === "undefined") {
  // Load environment variables from local file (safe on server)
  import("dotenv").then(dotenv => dotenv.config({ path: ".env.local" }));

  // Check critical DB environment variables
  const requiredVars = ["DB_HOST", "DB_PORT", "DB_USER", "DB_PASSWORD", "DB_NAME"];
  const missingVars = requiredVars.filter(v => !process.env[v]);

  if (missingVars.length) {
    console.error(`[data-source] Missing environment variables: ${missingVars.join(", ")}`);
    console.error("[data-source] Critical environment variables are missing. Exiting...");
    process.exit(1); // Safe: Node.js only
  }

  // Initialize TypeORM DataSource
  AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST!,
    port: Number(process.env.DB_PORT) || 5432,
    username: process.env.DB_USER!,
    password: process.env.DB_PASSWORD!,
    database: process.env.DB_NAME!,
    synchronize: false, // ❌ Never use true in production; use migrations
    logging: process.env.NODE_ENV === "development", // Only log in dev
    entities: [User, Post, Like, Comment, Follow, Notification],
    migrations: [__dirname + "/../migrations/*.ts"],
    subscribers: [__dirname + "/../subscribers/*.ts"],
  });

  // Initialize and log errors if any
  AppDataSource.initialize()
    .then(() => console.log("[data-source] DataSource initialized successfully"))
    .catch(err => console.error("[data-source] DataSource initialization failed:", err));
} else if (process.env.NODE_ENV === "development") {
  // Dev-only browser log
  // console.log("[data-source] Skipped DataSource initialization in browser (development mode)");
}

export { AppDataSource };
// is ko aseay hi rahany do agr change phir phir porey proect mai changes hongi isay axaha dusri file ko is ky mutabik set kerlo are understand? 