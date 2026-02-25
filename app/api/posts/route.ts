// // app/api/posts/route.ts
// import { NextResponse } from "next/server";
// import { AppDataSource } from "@/src/db/data-source";
// import { Post } from "@/src/entities/post";
// import { User } from "@/src/entities/user";
// import { Like } from "@/src/entities/like";
// import { Comment } from "@/src/entities/comment";
// import { cookies } from "next/headers";
// import admin from "@/src/lib/firebase-admin";

// export const runtime = "nodejs";

// // Helper: Get current authenticated user
// async function getAuthUser() {
//   const cookieStore = await cookies();
//   const token = cookieStore.get("auth-token")?.value;
//   if (!token) return null;

//   try {
//     const decoded = await admin.auth().verifyIdToken(token);
//     if (!decoded.email) return null;

//     const userRepo = AppDataSource.getRepository(User);
//     return await userRepo.findOneBy({ email: decoded.email });
//   } catch {
//     return null;
//   }
// }

// // GET: Fetch posts with pagination, likes count, comments count, and user like status
// export async function GET(req: Request) {
//   const startTime = Date.now();
//   console.log("[GET /api/posts] Request started");

//   try {
//     const { searchParams } = new URL(req.url);
//     const page = parseInt(searchParams.get("page") || "1");
//     const limit = parseInt(searchParams.get("limit") || "5");
//     const mine = searchParams.get("mine") === "1";
//     const skip = (page - 1) * limit;

//     console.log(`[GET /api/posts] Params: page=${page}, limit=${limit}, mine=${mine}`);

//     if (!AppDataSource.isInitialized) await AppDataSource.initialize();

//     const postRepo = AppDataSource.getRepository(Post);
//     const likeRepo = AppDataSource.getRepository(Like);
//     const commentRepo = AppDataSource.getRepository(Comment);

//     // Get current user (for checking if they liked posts)
//     const currentUser = await getAuthUser();
//     console.log(`[GET /api/posts] Current user: ${currentUser?.email || "anonymous"}`);

//     // Build where clause for filtering
//     let whereClause: { user?: { email: string } } | undefined;
//     if (mine) {
//       if (!currentUser) {
//         console.log("[GET /api/posts] Unauthorized - mine=1 but no auth");
//         return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
//       }
//       whereClause = { user: { email: currentUser.email } };
//     }

//     // Fetch posts with user relation
//     const posts = await postRepo.find({
//       where: whereClause,
//       relations: ["user"],
//       skip,
//       take: limit,
//       order: { createdAt: "DESC" },
//     });

//     console.log(`[GET /api/posts] Fetched ${posts.length} posts`);

//     // Enrich posts with likes/comments data
//     const enrichedPosts = await Promise.all(
//       posts.map(async (post) => {
//         // Count likes for this post
//         const likesCount = await likeRepo.count({ where: { post: { id: post.id } } });

//         // Count comments for this post
//         const commentsCount = await commentRepo.count({ where: { post: { id: post.id } } });

//         // Check if current user liked this post
//         let isLikedByUser = false;
//         if (currentUser) {
//           const userLike = await likeRepo.findOne({
//             where: { post: { id: post.id }, user: { id: currentUser.id } },
//           });
//           isLikedByUser = !!userLike;
//         }

//         return {
//           ...post,
//           likesCount,
//           commentsCount,
//           isLikedByUser,
//         };
//       })
//     );

//     // Total count for pagination
//     const totalPosts = whereClause
//       ? await postRepo.count({ where: whereClause })
//       : await postRepo.count();
//     const hasMore = totalPosts > page * limit;

//     const duration = Date.now() - startTime;
//     console.log(`[GET /api/posts] Success - ${enrichedPosts.length} posts, hasMore=${hasMore}, took ${duration}ms`);

//     return NextResponse.json({ posts: enrichedPosts, hasMore });

//   } catch (error: unknown) {
//     const duration = Date.now() - startTime;
//     console.error(`[GET /api/posts] ERROR after ${duration}ms:`, error);
//     return NextResponse.json(
//       { error: "Internal Server Error", message: error instanceof Error ? error.message : String(error) },
//       { status: 500 }
//     );
//   }
// }

// // POST: Create a new post
// export async function POST(req: Request) {
//   const startTime = Date.now();
//   console.log("[POST /api/posts] Request started");

//   try {
//     const { content, images } = await req.json();
//     console.log(`[POST /api/posts] Content length: ${content?.length || 0}, Images: ${images?.length || 0}`);

//     // Validate input
//     if (!content || !Array.isArray(images) || images.length === 0) {
//       console.log("[POST /api/posts] Bad request - content or images missing");
//       return NextResponse.json({ error: "Content and images are required" }, { status: 400 });
//     }
//     if (images.length > 6) {
//       console.log("[POST /api/posts] Bad request - too many images");
//       return NextResponse.json({ error: "Max 6 images allowed" }, { status: 400 });
//     }

//     // Authenticate user
//     const user = await getAuthUser();
//     if (!user) {
//       console.log("[POST /api/posts] Unauthorized - no valid auth token");
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }
//     console.log(`[POST /api/posts] User authenticated: ${user.email}`);

//     if (!AppDataSource.isInitialized) await AppDataSource.initialize();

//     // Create and save post
//     const postRepo = AppDataSource.getRepository(Post);
//     const post = postRepo.create({ content, images, user });
//     await postRepo.save(post);

//     const duration = Date.now() - startTime;
//     console.log(`[POST /api/posts] SUCCESS - Post ID: ${post.id}, User: ${user.email}, Images: ${images.length}, Took: ${duration}ms`);

//     // Return post with initial counts
//     return NextResponse.json(
//       { ...post, likesCount: 0, commentsCount: 0, isLikedByUser: false },
//       { status: 201 }
//     );

//   } catch (error: unknown) {
//     const duration = Date.now() - startTime;
//     console.error(`[POST /api/posts] ERROR after ${duration}ms:`, error);
//     return NextResponse.json(
//       { error: "Something went wrong", message: error instanceof Error ? error.message : String(error) },
//       { status: 500 }
//     );
//   }
// }

// app/api/posts/route.ts
import { NextResponse } from "next/server";
import { AppDataSource } from "../../../src/db/data-source";
import admin from "../../../src/lib/firebase-admin";
import { Post } from "../../../src/entities/post";
import { Like } from "../../../src/entities/like";
import { Comment } from "../../../src/entities/comment";
import { User } from "../../../src/entities/user";
import { cookies } from "next/headers";
import { error } from "console";

// --- Type Guard for Firebase Errors ---
function isFirebaseError(error: unknown): error is { code: string; message: string } {
  return typeof error === "object" && error !== null && "code" in error && "message" in error;
}

// --- Helper: Get authenticated user ---
async function getAuthUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;
  if (!token) {
    console.log("[getAuthUser] No auth-token found");
    return null;
  }

  try {
    if (!AppDataSource?.isInitialized) await AppDataSource!.initialize();
    if (!AppDataSource) return null;

    const decoded = await admin.auth().verifyIdToken(token);
    if (!decoded.email) return null;

    const user = await AppDataSource.getRepository(User).findOneBy({ email: decoded.email });
    console.log("[getAuthUser] User found:", user?.email);
    return user;
  } catch (err) {
    console.error("[getAuthUser] Error verifying token:", err);
    return null;
  }
}

// --- GET: Fetch posts with likes/comments info ---
export async function GET(req: Request) {
  const startTime = Date.now();
  console.log("[GET /api/posts] Start request");

  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.max(1, parseInt(searchParams.get("limit") || "5"));
    const mine = searchParams.get("mine") === "1";
    const skip = (page - 1) * limit;

    if (!AppDataSource?.isInitialized) await AppDataSource!.initialize();
    if (!AppDataSource) return NextResponse.json({ error: "DB not initialized" }, { status: 500 });

    const postRepo = AppDataSource.getRepository(Post);
    const likeRepo = AppDataSource.getRepository(Like);
    const commentRepo = AppDataSource.getRepository(Comment);

    const currentUser = await getAuthUser();
    if (!currentUser) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const whereClause = mine ? { user: { email: currentUser.email } } : undefined;
    const posts = await postRepo.find({
      where: whereClause,
      relations: ["user"],
      skip,
      take: limit,
      order: { createdAt: "DESC" },
    });

    if (!posts.length) return NextResponse.json({ posts: [], hasMore: false });

    const postIds = posts.map(p => p.id);

    // Bulk fetch likes & comments counts
    const likesRaw = await likeRepo
      .createQueryBuilder("like")
      .select("like.postId", "postId")
      .addSelect("COUNT(*)", "count")
      .where("like.postId IN (:...postIds)", { postIds })
      .groupBy("like.postId")
      .getRawMany();

    const commentsRaw = await commentRepo
      .createQueryBuilder("comment")
      .select("comment.postId", "postId")
      .addSelect("COUNT(*)", "count")
      .where("comment.postId IN (:...postIds)", { postIds })
      .groupBy("comment.postId")
      .getRawMany();

    const likedRaw = await likeRepo
      .createQueryBuilder("like")
      .select("like.postId", "postId")
      .where("like.postId IN (:...postIds)", { postIds })
      .andWhere("like.userId = :userId", { userId: currentUser.id })
      .getRawMany();

    const likedPostIds = likedRaw.map(l => l.postId);

    const enrichedPosts = posts.map(post => {
      const likeData = likesRaw.find(l => l.postId === post.id);
      const commentData = commentsRaw.find(c => c.postId === post.id);
      return {
        ...post,
        likesCount: likeData ? Number(likeData.count) : 0,
        commentsCount: commentData ? Number(commentData.count) : 0,
        isLikedByUser: likedPostIds.includes(post.id),
      };
    });

    const totalPosts = whereClause ? await postRepo.count({ where: whereClause }) : await postRepo.count();
    const hasMore = totalPosts > page * limit;

    console.log(`[GET /api/posts] Success - ${enrichedPosts.length} posts, hasMore=${hasMore}, took ${Date.now() - startTime}ms`);
    return NextResponse.json({ posts: enrichedPosts, hasMore });
  } catch (error) {
    console.error("[GET /api/posts] Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// --- POST: Create new post ---
export async function POST(req: Request) {
  console.log("[POST /api/posts] Start request");

  try {
    if (!AppDataSource?.isInitialized) await AppDataSource!.initialize();
    if (!AppDataSource) return NextResponse.json({ error: "DB not initialized" }, { status: 500 });

    const currentUser = await getAuthUser();
    if (!currentUser) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { content, images } = await req.json();

    if (!content || typeof content !== "string" || !content.trim()) {
      return NextResponse.json({ error: "Post content is required" }, { status: 400 });
    }

    if (images && !Array.isArray(images)) {
      return NextResponse.json({ error: "Images must be an array" }, { status: 400 });
    }

    const postRepo = AppDataSource.getRepository(Post);

    // Create new post correctly
    const newPost: Partial<Post> = {
      content: content.trim(),
      images: images || [],
      user: currentUser,
    };

    const savedPost = await postRepo.save(newPost); // save automatically returns entity with id
    console.log("[POST /api/posts] Post created:", savedPost.id);

    return NextResponse.json(savedPost, { status: 201 });
  } catch (error) {
    console.error("[POST /api/posts] Error:", error);
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
  }
}