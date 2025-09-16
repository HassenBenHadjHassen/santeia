// Database configuration and Prisma client setup
import { PrismaClient } from "@prisma/client";
import { config } from "./environment";

// Prisma client instance
let prisma: PrismaClient;

// Database connection class with Prisma
export class DatabaseConnection {
  private static instance: DatabaseConnection;
  private isConnected: boolean = false;

  private constructor() {}

  public static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  public async connect(): Promise<void> {
    try {
      // Initialize Prisma client
      prisma = new PrismaClient({
        datasources: {
          db: {
            url: config.DATABASE_URL,
          },
        },
        log: [],
      });

      // Test the connection
      await prisma.$connect();
      this.isConnected = true;
      console.log("Database connected successfully with Prisma");
    } catch (error) {
      console.error("Database connection failed:", error);
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    try {
      if (prisma) {
        await prisma.$disconnect();
      }
      this.isConnected = false;
      console.log("Database disconnected");
    } catch (error) {
      console.error("Database disconnection failed:", error);
      throw error;
    }
  }

  public getConnectionStatus(): boolean {
    return this.isConnected;
  }

  public getPrismaClient(): PrismaClient {
    if (!prisma) {
      throw new Error("Database not connected. Call connect() first.");
    }
    return prisma;
  }
}

// Export Prisma client getter
export const getPrismaClient = (): PrismaClient => {
  const db = DatabaseConnection.getInstance();
  return db.getPrismaClient();
};
