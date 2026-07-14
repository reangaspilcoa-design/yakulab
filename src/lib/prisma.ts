import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

let prismaClient: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  // En Vercel, copiamos la DB a /tmp (la única carpeta con permisos de escritura)
  const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');
  const tmpPath = '/tmp/dev.db';
  
  if (!fs.existsSync(tmpPath) && fs.existsSync(dbPath)) {
    fs.copyFileSync(dbPath, tmpPath);
  }
  
  prismaClient = new PrismaClient({ 
    log: ['error'],
    datasources: { db: { url: 'file:/tmp/dev.db' } }
  });
} else {
  prismaClient = globalForPrisma.prisma ?? new PrismaClient({ log: ['error'] });
  if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prismaClient;
}

export const prisma = prismaClient;
