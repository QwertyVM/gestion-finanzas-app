import prisma from '../prisma';

let schemaEnsured = false;
export async function autoEnsureSchema(): Promise<void> {
  if (schemaEnsured) return;
  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE "CostoFijo" ADD COLUMN IF NOT EXISTS "tag" TEXT;`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "Gasto" ADD COLUMN IF NOT EXISTS "tag" TEXT;`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "Gasto" ADD COLUMN IF NOT EXISTS "ingresoId" TEXT;`);
    schemaEnsured = true;
  } catch {
    schemaEnsured = true;
  }
}

// Caché en memoria para evitar consultas recurrentes de minPeriodo en PostgreSQL remoto (Neon)
export const minPeriodoCache = new Map<string, { minPeriodo: string; expiresAt: number }>();

export function invalidarCacheMinPeriodo(usuarioId?: string) {
  if (usuarioId) {
    minPeriodoCache.delete(usuarioId);
  } else {
    minPeriodoCache.clear();
  }
}
