import { initDB } from "@/src/db/init-db";
import { AppDataSource } from "@/src/db/data-source";
import { User } from "@/src/entities/user";

// GET
// GET user by id
export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await initDB();

    const { id } = await context.params;
    const userId = Number(id);

    const repo = AppDataSource.getRepository(User);
    const user = await repo.findOneBy({ id: userId.toString() });

    if (!user) {
      return Response.json({ message: "User not found" }, { status: 404 });
    }

    return Response.json(user);
  } catch (err) {
    console.error("GET USER ERROR:", err);
    return Response.json({ error: "Fetch failed" }, { status: 500 });
  }
}

// PATCH
export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> } 
) {
  try {
    await initDB();

    const { id } = await context.params; 
    const userId = Number(id);            

    const body = await req.json();        
    delete body.id;                       

    const repo = AppDataSource.getRepository(User);

    const user = await repo.findOneBy({ id: userId.toString() }); 
    if (!user) {
      return Response.json({ message: "User not found" }, { status: 404 });
    }
    
    //shallow merge
    Object.assign(user, body);             
    const saved = await repo.save(user);   

    return Response.json(saved);        
  } catch (err) {
    console.error("PATCH ERROR:", err);  
    return Response.json({ error: "Update failed" }, { status: 500 });
  }
}
// DELETE
export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> } 
) {
  try {
    await initDB();

    const { id } = await context.params;   // unwrap params
    const userId = Number(id);

    const repo = AppDataSource.getRepository(User);

    const user = await repo.findOneBy({ id: userId.toString() });
    if (!user) {
      return Response.json({ message: "User not found" }, { status: 404 });
    }

    await repo.remove(user);        

    return Response.json({ success: true }); 
  } catch (err) {
    console.error("DELETE ERROR:", err);
    return Response.json({ error: "Delete failed" }, { status: 500 });
  }
}