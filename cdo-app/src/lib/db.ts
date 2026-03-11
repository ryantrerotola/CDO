import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl: addConnectTimeout(process.env.DATABASE_URL),
  });

function addConnectTimeout(url: string | undefined): string | undefined {
  if (!url) return url;
  const sep = url.includes("?") ? "&" : "?";
  if (url.includes("connect_timeout")) return url;
  return `${url}${sep}connect_timeout=5`;
}

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
