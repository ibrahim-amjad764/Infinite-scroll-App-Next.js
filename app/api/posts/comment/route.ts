// // app/api/posts/comment/route.ts
// import { NextRequest } from "next/server";
// import { initDB } from "@/db/init-db";
// import { AppDataSource } from "@/db/data-source";
// import { Post } from "@/entities/post";
// import { Comment } from "@/entities/comment";
// import { User } from "@/entities/user";
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

// // GET /api/posts/comment?postId=xxx - Get comments for a post
// export async function GET(req: NextRequest) {
//   const startTime = Date.now();
//   console.log("[GET /api/posts/comment] Request started");

//   try {
//     const { searchParams } = new URL(req.url);
//     const postId = searchParams.get("postId");

//     if (!postId) {
//       console.log("[GET /api/posts/comment] Bad request - postId missing");
//       return Response.json({ message: "postId is required" }, { status: 400 });
//     }

//     await initDB();
//     const commentRepo = AppDataSource.getRepository(Comment);

//     // Fetch comments with user info, ordered by newest first
//     const comments = await commentRepo.find({
//       where: { post: { id: postId } },
//       relations: ["user"],
//       order: { createdAt: "DESC" },
//     });

//     const duration = Date.now() - startTime;
//     console.log(`[GET /api/posts/comment] Fetched ${comments.length} comments for post ${postId}, Took: ${duration}ms`);

//     return Response.json({ comments });

//   } catch (err) {
//     const duration = Date.now() - startTime;
//     console.error(`[GET /api/posts/comment] ERROR after ${duration}ms:`, err);
//     return Response.json({ error: "Failed to fetch comments" }, { status: 500 });
//   }
// }

// // POST /api/posts/comment - Add a comment to a post
// export async function POST(req: NextRequest) {
//   const startTime = Date.now();
//   console.log("[POST /api/posts/comment] Request started");

//   try {
//     await initDB();

//     // Authenticate user
//     const user = await getAuthUser();
//     if (!user) {
//       console.log("[POST /api/posts/comment] Unauthorized - no valid auth token");
//       return Response.json({ message: "Unauthorized" }, { status: 401 });
//     }
//     console.log(`[POST /api/posts/comment] User authenticated: ${user.email} (${user.id})`);

//     // Parse request body
//     const { postId, content } = await req.json();

//     if (!postId || !content?.trim()) {
//       console.log("[POST /api/posts/comment] Bad request - postId or content missing");
//       return Response.json({ message: "postId and content are required" }, { status: 400 });
//     }
//     console.log(`[POST /api/posts/comment] Adding comment to post: ${postId}`);

//     const postRepo = AppDataSource.getRepository(Post);
//     const commentRepo = AppDataSource.getRepository(Comment);

//     // Check if post exists
//     const post = await postRepo.findOneBy({ id: postId });
//     if (!post) {
//       console.log(`[POST /api/posts/comment] Post not found: ${postId}`);
//       return Response.json({ message: "Post not found" }, { status: 404 });
//     }

//     // Create and save comment
//     const comment = new Comment();
//     comment.post = post;
//     comment.user = user;
//     comment.content = content.trim();
//     const savedComment = await commentRepo.save(comment);

//     // Get updated comment count
//     const commentsCount = await commentRepo.count({ where: { post: { id: postId } } });

//     // Return the saved comment with user info
//     const commentWithUser = await commentRepo.findOne({
//       where: { id: savedComment.id },
//       relations: ["user"],
//     });

//     const duration = Date.now() - startTime;
//     console.log(`[POST /api/posts/comment] SUCCESS - User: ${user.email}, Post: ${postId}, Comment ID: ${savedComment.id}, Total comments: ${commentsCount}, Took: ${duration}ms`);

//     return Response.json(
//       {
//         comment: commentWithUser,
//         commentsCount,
//         message: "Comment added successfully",
//       },
//       { status: 201 }
//     );

//   } catch (err) {
//     const duration = Date.now() - startTime;
//     console.error(`[POST /api/posts/comment] ERROR after ${duration}ms:`, err);
//     return Response.json({ error: "Failed to add comment" }, { status: 500 });
//   }
// }

// // DELETE /api/posts/comment - Delete a comment (only by comment owner)
// export async function DELETE(req: NextRequest) {
//   const startTime = Date.now();
//   console.log("[DELETE /api/posts/comment] Request started");

//   try {
//     await initDB();

//     // Authenticate user
//     const user = await getAuthUser();
//     if (!user) {
//       console.log("[DELETE /api/posts/comment] Unauthorized - no valid auth token");
//       return Response.json({ message: "Unauthorized" }, { status: 401 });
//     }

//     // Parse request body
//     const { commentId } = await req.json();
//     if (!commentId) {
//       console.log("[DELETE /api/posts/comment] Bad request - commentId missing");
//       return Response.json({ message: "commentId is required" }, { status: 400 });
//     }

//     const commentRepo = AppDataSource.getRepository(Comment);

//     // Find comment with user relation
//     const comment = await commentRepo.findOne({
//       where: { id: commentId },
//       relations: ["user", "post"],
//     });

//     if (!comment) {
//       console.log(`[DELETE /api/posts/comment] Comment not found: ${commentId}`);
//       return Response.json({ message: "Comment not found" }, { status: 404 });
//     }

//     // Check if user owns this comment
//     if (comment.user.id !== user.id) {
//       console.log(`[DELETE /api/posts/comment] Forbidden - User ${user.email} cannot delete comment ${commentId}`);
//       return Response.json({ message: "You can only delete your own comments" }, { status: 403 });
//     }

//     const postId = comment.post.id;
//     await commentRepo.remove(comment);

//     // Get updated comment count
//     const commentsCount = await commentRepo.count({ where: { post: { id: postId } } });

//     const duration = Date.now() - startTime;
//     console.log(`[DELETE /api/posts/comment] SUCCESS - User: ${user.email}, Comment: ${commentId}, Post: ${postId}, Remaining: ${commentsCount}, Took: ${duration}ms`);

//     return Response.json({ commentsCount, message: "Comment deleted" });

//   } catch (err) {
//     const duration = Date.now() - startTime;
//     console.error(`[DELETE /api/posts/comment] ERROR after ${duration}ms:`, err);
//     return Response.json({ error: "Failed to delete comment" }, { status: 500 });
//   }
// }


// app/api/posts/comment/route.ts
import { NextRequest } from "next/server";
import { initDB } from "../../../../src/db/init-db";
import { AppDataSource } from "../../../../src/db/data-source";
import { Post } from "../../../../src/entities/post";
import { Comment } from "../../../../src/entities/comment";
import { User } from "../../../../src/entities/user";
import admin from "../../../../src/lib/firebase-admin";
import { cookies } from "next/headers";

// Ensure this function runs in Node.js environment
export const runtime = "nodejs";

// Get authenticated user from Firebase token
async function getAuthUser() {
  const tokenCookie = (await cookies()).get("auth-token");
  if (!tokenCookie?.value) return null;

  try {
    const decoded = await admin.auth().verifyIdToken(tokenCookie.value); // Verify token
    if (!decoded.email) return null;

    // Ensure DB is initialized before accessing AppDataSource
    await initDB();

    // Defensive check for TypeScript safety (real-world production guard)
    if (!AppDataSource) {
      console.error("[getAuthUser] AppDataSource is null after initDB");
      return null;
    }

    // Fetch user from database by email
    const userRepo = AppDataSource.getRepository(User);
    return await userRepo.findOne({ where: { email: decoded.email } });
  } catch (err: unknown) {
    console.error("Error verifying token:", err instanceof Error ? err.message : err);
    return null; // Invalid token
  }
}

// GET /api/posts/comment?postId=xxx - Get comments for a post
export async function GET(req: NextRequest) {
  const startTime = Date.now();
  console.log("[GET /api/posts/comment] Request started");

  try {
    const { searchParams } = new URL(req.url);
    const postId = searchParams.get("postId");

    if (!postId) {
      console.log("[GET /api/posts/comment] Bad request - postId missing");
      return Response.json({ message: "postId is required" }, { status: 400 });
    }

    await initDB(); // Initialize DB connection

    // Defensive null check (fix for TS error)
    if (!AppDataSource) {
      console.error("[GET /api/posts/comment] AppDataSource is null after initDB");
      return Response.json({ error: "Database not initialized" }, { status: 500 });
    }

    const commentRepo = AppDataSource.getRepository(Comment);

    // Fetch comments for the post, ordered by newest first (including user info)
    const comments = await commentRepo.find({
      where: { post: { id: postId } },
      relations: ["user"], // Fetch user info along with comment
      order: { createdAt: "DESC" },
    });

    const duration = Date.now() - startTime;
    console.log(
      `[GET /api/posts/comment] Fetched ${comments.length} comments for post ${postId}, Took: ${duration}ms`
    );

    return Response.json({ comments });
  } catch (err) {
    console.error("[GET /api/posts/comment] ERROR:", err);
    return Response.json({ error: "Failed to fetch comments" }, { status: 500 });
  }
}

// POST /api/posts/comment - Add a comment to a post
export async function POST(req: NextRequest) {
  const startTime = Date.now();
  console.log("[POST /api/posts/comment] Request started");

  try {
    await initDB(); // Ensure database is initialized

    // Defensive null check (fix for TS error)
    if (!AppDataSource) {
      console.error("[POST /api/posts/comment] AppDataSource is null after initDB");
      return Response.json({ error: "Database not initialized" }, { status: 500 });
    }

    const user = await getAuthUser(); // Get authenticated user
    if (!user) {
      console.log("[POST /api/posts/comment] Unauthorized - no valid auth token");
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { postId, content } = await req.json(); // Get postId and comment content
    if (!postId || !content?.trim()) {
      console.log("[POST /api/posts/comment] Bad request - postId or content missing");
      return Response.json({ message: "postId and content are required" }, { status: 400 });
    }

    const postRepo = AppDataSource.getRepository(Post);
    const commentRepo = AppDataSource.getRepository(Comment);

    const post = await postRepo.findOneBy({ id: postId });
    if (!post) {
      console.log(`[POST /api/posts/comment] Post not found: ${postId}`);
      return Response.json({ message: "Post not found" }, { status: 404 });
    }

    // Create and save comment
    const comment = new Comment();
    comment.post = post;
    comment.user = user;
    comment.content = content.trim(); // Trim to avoid empty-space comments

    // Save the comment
    const savedComment = await commentRepo.save(comment);

    // Fetch again with relation (ensures consistent response structure)
    const commentWithUser = await commentRepo.findOne({
      where: { id: savedComment.id },
      relations: ["user"],
    });

    const duration = Date.now() - startTime;
    console.log(
      `[POST /api/posts/comment] SUCCESS - Comment ID: ${savedComment.id}, Took: ${duration}ms`
    );

    return Response.json(
      { comment: commentWithUser, message: "Comment added successfully" },
      { status: 201 }
    );
  } catch (err) {
    console.error("[POST /api/posts/comment] ERROR:", err);
    return Response.json({ error: "Failed to add comment" }, { status: 500 });
  }
}