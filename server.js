import { createServer } from "http";
import next from "next";
import express from "express";
import { WebSocketServer } from "ws";
import { DataSource } from "typeorm";
import "reflect-metadata";
import { config } from "dotenv";

// Load environment variables from .env.local file
config({ path: '.env.local' });
console.log("[Server] Environment loaded - DB_HOST:", process.env.DB_HOST);

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

// TypeORM DataSource configuration for raw SQL queries
// We use raw SQL to avoid entity schema mismatches with the TypeScript entities
const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: false, // Don't sync - let Next.js API routes handle that
  logging: ["query", "error"], // Log all queries for debugging
});

// Initialize TypeORM database connection
const initializeDatabase = async () => {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log("[Database] TypeORM connection established successfully");
    }
    return AppDataSource;
  } catch (error) {
    console.error("[Database] Failed to initialize TypeORM:", error.message);
    throw error;
  }
};

// Save comment to database using raw SQL (works with existing schema)
const saveComment = async (postId, content, userId) => {
  console.log("[Comment] ========== SAVING COMMENT ==========");
  console.log("[Comment] PostId:", postId);
  console.log("[Comment] UserId:", userId);
  console.log("[Comment] Content:", content.substring(0, 50) + "...");

  const queryRunner = AppDataSource.createQueryRunner();

  try {
    // Verify post exists using raw SQL
    console.log("[Comment] Checking if post exists...");
    const postResult = await queryRunner.query(
      `SELECT id FROM posts WHERE id = $1`,
      [postId]
    );
    
    if (!postResult || postResult.length === 0) {
      console.error("[Comment] ERROR: Post not found:", postId);
      throw new Error("Post not found");
    }
    console.log("[Comment] Post found ✓");

    // Verify user exists and get user data using raw SQL
    console.log("[Comment] Checking if user exists...");
    const userResult = await queryRunner.query(
      `SELECT id, "firstName", "lastName", "avatarUrl" FROM users WHERE id = $1`,
      [userId]
    );
    
    if (!userResult || userResult.length === 0) {
      console.error("[Comment] ERROR: User not found:", userId);
      throw new Error("User not found");
    }
    const user = userResult[0];
    console.log("[Comment] User found:", user.firstName, user.lastName, "✓");

    // Insert comment using raw SQL with proper foreign key columns
    console.log("[Comment] Inserting comment into database...");
    const insertResult = await queryRunner.query(
      `INSERT INTO comments (content, "postId", "userId", "createdAt")
       VALUES ($1, $2, $3, NOW())
       RETURNING id, content, "createdAt"`,
      [content, postId, userId]
    );

    const savedComment = insertResult[0];
    console.log("[Comment] ✅ Comment saved successfully!");
    console.log("[Comment] Comment ID:", savedComment.id);
    console.log("[Comment] Created at:", savedComment.createdAt);

    // Return comment with user data for broadcasting to clients
    return {
      id: savedComment.id,
      postId: postId,
      content: savedComment.content,
      createdAt: savedComment.createdAt,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        avatarUrl: user.avatarUrl,
      },
    };
  } catch (error) {
    console.error("[Comment] ❌ Database error:", error.message);
    throw error;
  } finally {
    // Release the query runner
    await queryRunner.release();
  }
};

// Broadcast message to all connected WebSocket clients
const broadcastToClients = (wss, message, senderWs = null) => {
  const payload = JSON.stringify(message);
  let clientCount = 0;

  wss.clients.forEach((client) => {
    // Send to all connected clients (including sender for confirmation)
    if (client.readyState === 1) { // WebSocket.OPEN = 1
      client.send(payload);
      clientCount++;
    }
  });

  console.log("[Broadcast] Message sent to", clientCount, "client(s)");
};

app.prepare().then(async () => {
  // Initialize database before starting server
  await initializeDatabase();

  const server = express();

  // Create HTTP server
  const httpServer = createServer(server);

  // Create WebSocket server instance (noServer mode for path filtering)
  const wss = new WebSocketServer({ noServer: true });

  // Get Next.js upgrade handler for HMR
  const nextUpgradeHandler = app.getUpgradeHandler();

  // Handle WebSocket upgrade requests
  httpServer.on("upgrade", (request, socket, head) => {
    const { pathname } = new URL(request.url, "http://localhost");
    console.log("[WebSocket] Upgrade request for:", pathname);

    // Only handle /ws path, let Next.js handle HMR
    if (pathname === "/ws") {
      console.log("[WebSocket] Handling upgrade for /ws...");
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit("connection", ws, request);
      });
    } else {
      // Let Next.js handle HMR and other upgrade requests
      nextUpgradeHandler(request, socket, head);
    }
  });

  // Handle WebSocket connections
  wss.on("connection", (ws) => {
    console.log("[WebSocket] New client connected. Total clients:", wss.clients.size);

    // Handle incoming messages (new comments)
    ws.on("message", async (message) => {
      console.log("[WebSocket] Received message:", message.toString());

      try {
        // Parse the incoming comment data
        const data = JSON.parse(message.toString());
        const { postId, content, userId } = data;

        // Validate required fields
        if (!postId || !content || !userId) {
          console.error("[WebSocket] Missing required fields: postId, content, or userId");
          ws.send(JSON.stringify({ error: "Missing required fields" }));
          return;
        }

        // Save comment to database
        const savedComment = await saveComment(postId, content, userId);
        console.log("[WebSocket] Comment processed, broadcasting to clients...");

        // Broadcast the new comment to all connected clients
        broadcastToClients(wss, savedComment);

      } catch (error) {
        console.error("[WebSocket] Error processing message:", error.message);
        ws.send(JSON.stringify({ error: error.message }));
      }
    });

    // Handle WebSocket errors
    ws.on("error", (err) => {
      console.error("[WebSocket] Client error:", err.message);
    });

    // Handle client disconnect
    ws.on("close", () => {
      console.log("[WebSocket] Client disconnected. Remaining clients:", wss.clients.size);
    });
  });

  // Serve Next.js pages and static assets
  server.all("/{*path}", (req, res) => {
    return handle(req, res);
  });

  // Start the HTTP server
  httpServer.listen(3000, (err) => {
    if (err) throw err;
    console.log("> Ready on http://localhost:3000");
  });
});
