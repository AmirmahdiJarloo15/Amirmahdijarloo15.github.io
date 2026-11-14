import { PrismaClient } from "@prisma/client";

// یک نمونه‌ی مشترک از Prisma (جلوگیری از اتصال‌های اضافی در حالت توسعه)
const g = globalThis as unknown as { prisma?: PrismaClient };
export const db = g.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") g.prisma = db;
