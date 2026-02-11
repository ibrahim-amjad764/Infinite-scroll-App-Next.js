// src/db/init-db.ts
import { AppDataSource } from "./data-source";

export async function initDB() {
    if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
    }
}
// Import the renamed function to avoid conflicts
import { initDB as initializeDatabase } from "@/src/db/init-db";  // Renamed import

// Initialize the database if it's not already initialized
await initializeDatabase();


