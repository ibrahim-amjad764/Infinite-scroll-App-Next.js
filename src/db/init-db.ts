import { AppDataSource } from "./data-source";

export async function initDB() {
    if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
    }
}