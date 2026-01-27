import { NextResponse } from "next/server";
import { initDB } from "@/src/db/init-db";
import { AppDataSource } from "@/src/db/data-source";
import { User } from "@/src/entities/User";
import admin from "@/src/lib/firebase-admin";

export async function POST(req: Request) {
  try {
    console.log("Login API Hit");

    await initDB();

    // bearer is token checking for authorization for authorized
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      console.log("Missing Bearer token");
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    // verification of token
    const decode = await admin.auth().verifyIdToken(token);
    console.log("Token verified:", decode.uid);
    const repo = AppDataSource.getRepository(User);
    // find DB user
    const user = await repo.findOneBy({ email: decode.email! });

    if (!user) {
      console.log("DB user not found");
      return NextResponse.json({ message: "User not found in DB" }, { status: 404 });
    }
    console.log("Returning DB user:", user.email);
    return NextResponse.json(user);
  } catch (err: any) {
    console.error("Login API Error:", err.message || err);
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
}