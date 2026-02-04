import { NextResponse } from "next/server";
import admin from "@/src/lib/firebase-admin";
import { initDB } from "@/src/db/init-db";
import { AppDataSource } from "@/src/db/data-source";
import { User } from "@/src/entities/user";
// POST
export async function POST(req: Request) {
  try {
    await initDB();
      if (!AppDataSource.isInitialized) await AppDataSource.initialize();

    // Read token form body
    const { idToken } = await req.json();
    console.log("Token Recieved:", idToken?.slice(0, 20));

    if (!idToken) {
      return NextResponse.json({ message: "Token Missing" }, { status: 401 });
    }
    const decoded = await admin.auth().verifyIdToken(idToken);
    console.log("Token Verified:", decoded.uid, "Email:", decoded.email);

    const repo = AppDataSource.getRepository(User);

    let user = await repo.findOneBy({ email: decoded.email! });

    if (user) {
      console.log("User already exist in DB:", user.email);
      return NextResponse.json(user);
    }
    console.log("Creating new DB user...");

    user = repo.create({
      email: decoded.email!,
      firebaseUid: decoded.uid,
      firstName: decoded.name ? decoded.name.split(" ")[0] : null,
      lastName: decoded.name?.split(" ").slice(1).join(" ") || null,
    })

    await repo.save(user);
    console.log("User Saved in DB:", user.email);

    return NextResponse.json(user);
  } catch (err) {
    console.log("Signup Error:", err);
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
}
