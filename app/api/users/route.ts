import { initDB } from "@/src/db/init-db";
import { AppDataSource } from "@/src/db/data-source";
import { User } from "@/src/entities/user";

export const runtime = "nodejs"; //nodejs environment
//GET fetch users
export async function GET() {
  console.log("GET /api/users called");

  await initDB();
  console.log("Database initialized");

  const repo = AppDataSource.getRepository(User);
  const users = await repo.find();

  console.log("Users fetched:", users);
  return Response.json(users);
}
//POST
export async function POST(req: Request) {
  console.log("POST /api/users called");

  await initDB();

  const body = await req.json(); 
  console.log("Request body:", body);

  const repo = AppDataSource.getRepository(User);

  const user = repo.create({
    firstName: body.firstName ?? "Usman",
    lastName: body.lastName ?? "Ali",
    email: body.email ?? "Usman123@gmail.com",
    isActive: false,
  });

  const saved = await repo.save(user);
  console.log("User saved:", saved);

  return Response.json(saved, { status: 201 });
}



