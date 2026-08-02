import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: PrismaClient;
};

function getDatabaseUrl() {
  const value = process.env.DATABASE_URL;
  if (!value) return undefined;

  try {
    const url = new URL(value);
    // Shared hosting limits new connections per hour. A single pooled connection
    // is sufficient for this application and prevents each server instance from
    // opening Prisma's larger default pool.
    if (!url.searchParams.has("connection_limit")) {
      url.searchParams.set("connection_limit", "1");
    }
    return url.toString();
  } catch {
    return value;
  }
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    ...(getDatabaseUrl()
      ? { datasources: { db: { url: getDatabaseUrl() } } }
      : {}),
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

// Keep one client per server process in every environment, including production.
globalForPrisma.prisma = prisma;
