// // app/api/posts/like/route.ts
// import { NextRequest } from "next/server";
// import { initDB } from "@/db/init-db";
// import { AppDataSource } from "@/db/data-source";
// import { Post } from "@/entities/post";
// import { Like } from "@entities/like";
// import { User } from "@entities/user";
// import admin from "@/lib/firebase-admin";
// import { cookies } from "next/headers";

// export const runtime = "nodejs";

// // Get authenticated user from Firebase token
// async function getAuthUser() {
//   const tokenCookie = (await cookies()).get("auth-token");
//   if (!tokenCookie?.value) return null;

//   try {
//     const decoded = await admin.auth().verifyIdToken(tokenCookie.value);
//     if (!decoded.email) return null;

//     const userRepo = AppDataSource.getRepository(User);
//     return await userRepo.findOneBy({ email: decoded.email });
//   } catch {
//     return null;
//   }
// }

// // POST /api/posts/like - Toggle like on a post
// export async function POST(req: NextRequest) {
//   const startTime = Date.now();
//   console.log("[POST /api/posts/like] Request started");

//   try {
//     await initDB();

//     // Authenticate user
//     const user = await getAuthUser();
//     if (!user) {
//       console.log("[POST /api/posts/like] Unauthorized - no valid auth token");
//       return Response.json({ message: "Unauthorized" }, { status: 401 });
//     }
//     console.log(`[POST /api/posts/like] User authenticated: ${user.email} (${user.id})`);

//     // Parse request body
//     const { postId } = await req.json();
//     if (!postId) {
//       console.log("[POST /api/posts/like] Bad request - postId missing");
//       return Response.json({ message: "postId is required" }, { status: 400 });
//     }
//     console.log(`[POST /api/posts/like] Processing like for postId: ${postId}`);

//     const postRepo = AppDataSource.getRepository(Post);
//     const likeRepo = AppDataSource.getRepository(Like);

//     // Check if post exists
//     const post = await postRepo.findOneBy({ id: postId });
//     if (!post) {
//       console.log(`[POST /api/posts/like] Post not found: ${postId}`);
//       return Response.json({ message: "Post not found" }, { status: 404 });
//     }

//     // Check if user already liked this post
//     const existingLike = await likeRepo.findOne({
//       where: { post: { id: postId }, user: { id: user.id } },
//     });

//     // Get updated like count after operation
//     let likesCount: number;

//     if (existingLike) {
//       // Unlike: remove the like
//       await likeRepo.remove(existingLike);
//       likesCount = await likeRepo.count({ where: { post: { id: postId } } });

//       const duration = Date.now() - startTime;
//       console.log(`[POST /api/posts/like] UNLIKED - User: ${user.email}, Post: ${postId}, New count: ${likesCount}, Took: ${duration}ms`);

//       return Response.json({
//         liked: false,
//         likesCount,
//         message: "Post unliked",
//       });
//     }

//     // Like: create new like
//     const like = new Like();
//     like.post = post;
//     like.user = user;
//     await likeRepo.save(like);
//     likesCount = await likeRepo.count({ where: { post: { id: postId } } });

//     const duration = Date.now() - startTime;
//     console.log(`[POST /api/posts/like] LIKED - User: ${user.email}, Post: ${postId}, New count: ${likesCount}, Took: ${duration}ms`);

//     return Response.json(
//       { liked: true, likesCount, message: "Post liked" },
//       { status: 201 }
//     );

//   } catch (err) {
//     const duration = Date.now() - startTime;
//     console.error(`[POST /api/posts/like] ERROR after ${duration}ms:`, err);
//     return Response.json({ error: "Failed to like post" }, { status: 500 });
//   }
// }


// // app/api/posts/like/route.ts
// import { NextRequest } from "next/server";
// import { initDB } from "@/db/init-db";
// import { AppDataSource } from "@/db/data-source";
// import { Post } from "@/entities/post";
// import { Like } from "@entities/like";
// import { User } from "@entities/user";
// import admin from "@/lib/firebase-admin";
// import { cookies } from "next/headers";

// // Ensure this function runs in Node.js environment
// export const runtime = "nodejs";

// // Get authenticated user from Firebase token
// async function getAuthUser() {
//   const tokenCookie = (await cookies()).get("auth-token");
//   if (!tokenCookie?.value) return null; // No token found

//   try {
//     const decoded = await admin.auth().verifyIdToken(tokenCookie.value); // Verify token
//     if (!decoded.email) return null; // Ensure token contains email

//     // Fetch the user from the database based on decoded email
//     const userRepo = AppDataSource.getRepository(User);
//     return await userRepo.findOneBy({ email: decoded.email });
//   } catch (err) {
//     console.error("Error verifying token:", err);
//     return null; // Invalid token or user not found
//   }
// }

// // POST /api/posts/like - Toggle like on a post
// export async function POST(req: NextRequest) {
//   const startTime = Date.now();
//   console.log("[POST /api/posts/like] Request started");

//   try {
//     await initDB(); // Ensure database is initialized

//     const user = await getAuthUser(); // Get authenticated user
//     if (!user) {
//       console.log("[POST /api/posts/like] Unauthorized - no valid auth token");
//       return Response.json({ message: "Unauthorized" }, { status: 401 }); // If user is not authenticated
//     }

//     // Parse request body to extract postId
//     const { postId } = await req.json();
//     if (!postId) {
//       console.log("[POST /api/posts/like] Bad request - postId missing");
//       return Response.json({ message: "postId is required" }, { status: 400 });
//     }

//     console.log(`[POST /api/posts/like] Processing like for postId: ${postId}`);

//     const postRepo = AppDataSource.getRepository(Post);
//     const likeRepo = AppDataSource.getRepository(Like);

//     // Check if post exists
//     const post = await postRepo.findOneBy({ id: postId });
//     if (!post) {
//       console.log(`[POST /api/posts/like] Post not found: ${postId}`);
//       return Response.json({ message: "Post not found" }, { status: 404 });
//     }

//     // Check if user has already liked this post
//     const existingLike = await likeRepo.findOne({
//       where: { post: { id: postId }, user: { id: user.id } },
//     });

//     let likesCount: number;

//     if (existingLike) {
//       // User has already liked, so we will unlike (remove like)
//       await likeRepo.remove(existingLike);
//       likesCount = await likeRepo.count({ where: { post: { id: postId } } });
//       console.log(`[POST /api/posts/like] UNLIKED - New count: ${likesCount}`);
//       return Response.json({
//         liked: false,
//         likesCount,
//         message: "Post unliked",
//       });
//     }

//     // User has not liked, so we will like (add like)
//     const like = new Like();
//     like.post = post;
//     like.user = user;
//     await likeRepo.save(like);
//     likesCount = await likeRepo.count({ where: { post: { id: postId } } });

//     console.log(`[POST /api/posts/like] LIKED - New count: ${likesCount}`);
//     console.log("[POST /api/posts/like] Post fetched:", post);
//     console.log("[POST /api/posts/like] Likes count after action:", likesCount);

//     return Response.json(
//       { liked: true, likesCount, message: "Post liked" },
//       { status: 201 }
//     );
//   } catch (err) {
//     console.error("[POST /api/posts/like] ERROR:", err);
//     return Response.json({ error: "Failed to like post" }, { status: 500 });
//   }
// }



import { NextRequest } from "next/server";
import { AppDataSource } from "@/db/data-source"; 
import { Post } from "@/entities/post"; 
import { Like } from "@/entities/like"; 
import { User } from "@/entities/user"; 
import admin from "@/lib/firebase-admin"; 
import { cookies } from "next/headers";
import { initDB } from "@/db/init-db";
// WebSocket server cannot be imported in Next.js API routes (serverless/stateless)
// import { io } from "@/ws/server";

export const runtime = "nodejs";

async function getAuthUser() {
  const tokenCookie = (await cookies()).get("auth-token");
  if (!tokenCookie?.value) return null;

  try {
    const decoded = await admin.auth().verifyIdToken(tokenCookie.value);
    if (!decoded.email) return null;

    const userRepo = AppDataSource.getRepository(User);
    return await userRepo.findOneBy({ email: decoded.email });
  } catch (err) {
    console.error("Error verifying token:", err);
    return null;
  }
}

export async function POST(req: NextRequest) {
  console.log("[POST /api/posts/like] Request started");

  try {
    await initDB();

    const user = await getAuthUser();
    if (!user) {
      console.log("[POST /api/posts/like] Unauthorized");
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { postId } = await req.json();
    if (!postId) {
      console.log("[POST /api/posts/like] Bad request - postId missing");
      return Response.json({ message: "postId is required" }, { status: 400 });
    }

    const postRepo = AppDataSource.getRepository(Post);
    const likeRepo = AppDataSource.getRepository(Like);

    const post = await postRepo.findOneBy({ id: postId });
    if (!post) {
      console.log("[POST /api/posts/like] Post not found");
      return Response.json({ message: "Post not found" }, { status: 404 });
    }

    const existingLike = await likeRepo.findOne({
      where: { post: { id: postId }, user: { id: user.id } },
    });

    let likesCount: number;

    if (existingLike) {
      await likeRepo.remove(existingLike);
      likesCount = await likeRepo.count({ where: { post: { id: postId } } });

      console.log(`[POST /api/posts/like] UNLIKED - New count: ${likesCount}`);
      // TODO: Use a separate WebSocket service for real-time updates
      // io.emit("like_count_updated", { postId, likesCount });
      return Response.json({
        liked: false,
        likesCount,
        message: "Post unliked",
      });
    }

    const like = new Like();
    like.post = post;
    like.user = user;
    await likeRepo.save(like);
    likesCount = await likeRepo.count({ where: { post: { id: postId } } });

    console.log(`[POST /api/posts/like] LIKED - New count: ${likesCount}`);
    // TODO: Use a separate WebSocket service for real-time updates
    // io.emit("like_count_updated", { postId, likesCount });

    return Response.json(
      { liked: true, likesCount, message: "Post liked" },
      { status: 201 }
    );
  } catch (err) {
    console.error("[POST /api/posts/like] ERROR:", err);
    return Response.json({ error: "Failed to like post" }, { status: 500 });
  }
}











