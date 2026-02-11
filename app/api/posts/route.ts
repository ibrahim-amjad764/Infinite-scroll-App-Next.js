
import { NextResponse } from "next/server";
import { AppDataSource } from "@/src/db/data-source";
import { Post } from "@/src/entities/post";
import { User } from "@/src/entities/user";
import { cookies } from "next/headers";
import admin from "@/src/lib/firebase-admin";

// GET: posts
// export async function GET() {
//   try {
//     if (!AppDataSource.isInitialized) await AppDataSource.initialize();
//     const postRepo = AppDataSource.getRepository(Post);//interact post in db table

//     const posts = await postRepo.find({
//       relations: ["user"],       // include user info
//       order: { createdAt: "DESC" } //recent
//     });
//     return NextResponse.json(posts);

//   } catch (error: unknown) {
//     console.error("GET /api/posts error:", error);
//     return NextResponse.json(
//       { error: "Internal Server Error", message: error instanceof Error ? error.message : String(error) },
//       { status: 500 }
//     );
//   }
// }



// POST: create a new post


// Backend GET for posts with pagination

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);//get query params from urls
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "5");
    const skip = (page - 1) * limit;

    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    const postRepo = AppDataSource.getRepository(Post);
    const posts = await postRepo.find({
      relations: ["user"],
      skip,
      take: limit,
      order: { createdAt: "DESC" },
    });
//check fetch limit of posts
    const totalPosts = await postRepo.count();
    const hasMore = totalPosts > page * limit;

    return NextResponse.json({ posts, hasMore });

  } catch (error: unknown) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { content, images } = await req.json();//collect in object = parse
    console.log("POST body:", { content, images });

    // Validate input
    if (!content || !Array.isArray(images) || images.length === 0) {
      return NextResponse.json({ error: "Content and images are required" }, { status: 400 });
    }
    if (images.length > 6) {
      return NextResponse.json({ error: "Max 6 images allowed" }, { status: 400 });
    }

    // Read Firebase token from cookie
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;
    console.log("Token from cookie:", cookieStore.get("auth-token")?.value);

    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Verify token
    const decoded = await admin.auth().verifyIdToken(token);
    const userEmail = decoded.email;
    if (!userEmail) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (!AppDataSource.isInitialized) await AppDataSource.initialize();

    // Fetch user from DB
    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({ where: { email: userEmail } });
    if (!user) return NextResponse.json({ error: "User not found in DB" }, { status: 404 });

    //Create post
    const postRepo = AppDataSource.getRepository(Post);
    const post = postRepo.create({ content, images, user });
    await postRepo.save(post);

    console.log("Post created:", post.id);
    return NextResponse.json(post, { status: 201 });

  } catch (error: unknown) {
    console.error("POST /api/posts error:", error);
    return NextResponse.json(
      { error: "Something went wrong", message: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}


