
// app/api/posts/like/route.ts
import { NextRequest } from "next/server";
import { AppDataSource } from "../../../../src/db/data-source";
import { Like } from "../../../../src/entities/like";
import { User } from "../../../../src/entities/user";
import admin from "../../../../src/lib/firebase-admin";
import { cookies } from "next/headers";
import { initDB } from "../../../../src/db/init-db";

export const runtime = "nodejs";

// Get authenticated user from Firebase token
async function getAuthUser() {
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get("auth-token");

  console.log("[Auth Debug] All cookies:", cookieStore.getAll());
  console.log("[Auth Debug] auth-token:", tokenCookie?.value);

  if (!tokenCookie?.value) return null;

  try {
    const decoded = await admin.auth().verifyIdToken(tokenCookie.value);
    console.log("[Auth Debug] Firebase decoded:", decoded.email);

    await initDB();

    return await AppDataSource!.getRepository(User).findOneBy({
      email: decoded.email,
    });
  } catch (err) {
    console.error("[Auth Debug] verifyIdToken error:", err);
    return null;
  }
}

// POST /api/posts/like - Toggle like on a post
export async function POST(req: NextRequest) {
  try {
    const { postId } = await req.json();

    const authUser = await getAuthUser();

    if (!authUser) {
      console.log("[Like API] Unauthorized");
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = authUser.id;

    console.log("=================================");
    console.log("[Like API] Authenticated user:", userId);
    console.log("[Like API] Post:", postId);

    const queryRunner = AppDataSource!.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    let action = "";
    let likesCount = 0;

    try {
      const insertResult = await queryRunner.query(
        `
        INSERT INTO likes ("postId", "userId", "createdAt")
        VALUES ($1, $2, NOW())
        ON CONFLICT ("postId", "userId") DO NOTHING
        RETURNING id
        `,
        [postId, userId]
      );

      if (insertResult.length > 0) {
        action = "liked";
        console.log("[Like API] LIKE");
      } else {
        await queryRunner.query(
          `DELETE FROM likes WHERE "postId" = $1 AND "userId" = $2`,
          [postId, userId]
        );
        action = "unliked";
        console.log("[Like API] UNLIKE");
      }

      const countResult = await queryRunner.query(
        `SELECT COUNT(*) FROM likes WHERE "postId" = $1`,
        [postId]
      );

      likesCount = Number(countResult[0].count);

      console.log(`[Like API] Final -> ${action}, likesCount: ${likesCount}`);

      await queryRunner.commitTransaction();

      return Response.json({ action, likesCount });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error("[Like API] Transaction error:", error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  } catch (error) {
    console.error("[Like API] Unexpected error:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// GET /api/posts/like?postIds=xxx,yyy - Get likes count for multiple posts
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const postIdsParam = searchParams.get("postIds");
    if (!postIdsParam) return Response.json({ message: "postIds required" }, { status: 400 });

    const postIds = postIdsParam.split(",");

    await initDB();

    const likeRepo = AppDataSource!.getRepository(Like);

    const likesData = await Promise.all(
      postIds.map(async id => {
        const count = await likeRepo.count({ where: { post: { id } } });
        return { postid: id, count };
      })
    );

    return Response.json(likesData);
  } catch (err) {
    console.error("[GET /api/posts/like] Error:", err);
    return Response.json({ error: "Failed to fetch likes" }, { status: 500 });
  }
}
