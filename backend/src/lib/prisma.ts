/**
 * Shared Prisma client singleton.
 * 
 * IMPORTANT: Never call `new PrismaClient()` directly in repository or service files.
 * Always import this module instead. Creating multiple PrismaClient instances
 * wastes database connection pool slots and can exhaust the pool under high load.
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default prisma;
