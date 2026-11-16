import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Cargar .env manualmente si existe
const envPath = path.join(rootDir, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const idx = trimmed.indexOf('=');
      const key = trimmed.slice(0, idx).trim();
      let value = trimmed.slice(idx + 1).trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  }
}

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('❌ Error: DATABASE_URL no está configurada.');
  process.exit(1);
}

const backupsDir = path.join(rootDir, 'backups');
if (!fs.existsSync(backupsDir)) {
  fs.mkdirSync(backupsDir, { recursive: true });
}

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

function setGithubEnv(file) {
  if (process.env.GITHUB_ENV) {
    try {
      fs.appendFileSync(process.env.GITHUB_ENV, `BACKUP_FILE=${file}\nTIMESTAMP=${timestamp}\n`);
    } catch {
      // Ignorar si no se puede escribir en GITHUB_ENV
    }
  }
}

// Verificar si pg_dump está disponible
let hasPgDump = false;
try {
  execSync('pg_dump --version', { stdio: 'ignore' });
  hasPgDump = true;
} catch {
  hasPgDump = false;
}

if (hasPgDump) {
  const sqlFile = path.join(backupsDir, `db_backup_${timestamp}.sql.gz`);
  // En Neon, pg_dump requiere conexión directa sin pooler (-pooler)
  const dumpUrl = databaseUrl.replace('-pooler', '');
  console.log('⏳ Ejecutando pg_dump (acceso directo Neon)...');
  try {
    execSync(
      `pg_dump "${dumpUrl}" --clean --if-exists --no-owner --no-privileges | gzip > "${sqlFile}"`,
      { stdio: 'inherit' }
    );
    console.log(`✅ Respaldo SQL completado con éxito: ${sqlFile}`);
    setGithubEnv(sqlFile);
    process.exit(0);
  } catch (err) {
    console.warn('⚠️ Falló pg_dump, activando respaldo de contingencia vía Prisma JSON...');
  }
} else {
  console.log('ℹ️  pg_dump no está disponible en el entorno. Generando exportación completa vía Prisma...');
}

// Fallback: Exportación completa de todas las tablas de PostgreSQL vía Prisma
const prisma = new PrismaClient();

async function runJsonBackup() {
  try {
    const tablesResult = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `;

    const backupData = {
      timestamp: new Date().toISOString(),
      databaseUrlRedacted: databaseUrl.replace(/:[^:@]+@/, ':****@'),
      tables: {},
      totalRows: 0,
    };

    for (const row of tablesResult) {
      const tableName = row.table_name;
      const rows = await prisma.$queryRawUnsafe(`SELECT * FROM "${tableName}"`);
      backupData.tables[tableName] = rows;
      backupData.totalRows += rows.length;
      console.log(`  📦 Tabla ${tableName}: ${rows.length} registros`);
    }

    const jsonFile = path.join(backupsDir, `db_backup_${timestamp}.json`);
    fs.writeFileSync(jsonFile, JSON.stringify(backupData, null, 2), 'utf-8');
    const size = (fs.statSync(jsonFile).size / 1024).toFixed(2);
    console.log(`\n✅ Respaldo JSON completado con éxito (${size} KB, ${backupData.totalRows} filas totales):`);
    console.log(`📁 ${jsonFile}`);
    setGithubEnv(jsonFile);
  } catch (error) {
    console.error('❌ Error al generar respaldo JSON:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runJsonBackup();
