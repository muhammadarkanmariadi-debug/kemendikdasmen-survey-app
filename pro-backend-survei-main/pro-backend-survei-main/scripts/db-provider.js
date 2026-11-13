/**
 * Multi-Provider Database Switcher for Prisma
 * Supports: MySQL, PostgreSQL, SQLite, SQL Server
 */

const fs = require('fs');
const path = require('path');

// 1. Load .env manually if dotenv is not loaded
const envPath = path.resolve(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx !== -1) {
        const key = trimmed.substring(0, eqIdx).trim();
        let val = trimmed.substring(eqIdx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.substring(1, val.length - 1);
        }
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  });
}

// 2. Determine target provider
const args = process.argv.slice(2);
let targetProvider = null;

if (args.length > 0 && !args[0].startsWith('-')) {
  targetProvider = args[0].toLowerCase();
} else if (process.env.DB_PROVIDER) {
  targetProvider = process.env.DB_PROVIDER.toLowerCase();
} else if (process.env.DATABASE_URL) {
  const dbUrl = process.env.DATABASE_URL.toLowerCase();
  if (dbUrl.startsWith('postgresql://') || dbUrl.startsWith('postgres://')) {
    targetProvider = 'postgresql';
  } else if (dbUrl.startsWith('mysql://')) {
    targetProvider = 'mysql';
  } else if (dbUrl.startsWith('file:') || dbUrl.includes('.sqlite') || dbUrl.includes('.db')) {
    targetProvider = 'sqlite';
  } else if (dbUrl.startsWith('sqlserver://')) {
    targetProvider = 'sqlserver';
  }
}

if (!targetProvider) {
  targetProvider = 'mysql'; // Default fallback
}

// Normalize provider names
const providerMap = {
  postgres: 'postgresql',
  postgresql: 'postgresql',
  mysql: 'mysql',
  sqlite: 'sqlite',
  sqlserver: 'sqlserver',
  mssql: 'sqlserver',
};

const provider = providerMap[targetProvider] || 'mysql';

// 3. Read template schema
const templatePath = path.resolve(__dirname, '..', 'prisma', 'schema.template.prisma');
const targetSchemaPath = path.resolve(__dirname, '..', 'prisma', 'schema.prisma');

if (!fs.existsSync(templatePath)) {
  console.error(`[Error] Template file not found: ${templatePath}`);
  process.exit(1);
}

let schema = fs.readFileSync(templatePath, 'utf8');

// 4. Adapt schema according to provider rules
schema = schema.replace(/provider\s*=\s*"__PROVIDER__"/, `provider = "${provider}"`);

if (provider === 'postgresql') {
  // PostgreSQL supports @db.Text, but NOT @db.LongText
  schema = schema.replace(/@db\.LongText/g, '@db.Text');
} else if (provider === 'sqlite') {
  // SQLite does not support @db.Text or @db.LongText native attributes
  schema = schema.replace(/\s*@db\.LongText/g, '');
  schema = schema.replace(/\s*@db\.Text/g, '');
} else if (provider === 'sqlserver') {
  // SQL Server uses @db.Text or default NVarChar
  schema = schema.replace(/@db\.LongText/g, '@db.Text');
}

// 5. Write active schema.prisma
fs.writeFileSync(targetSchemaPath, schema, 'utf8');

console.log('====================================================');
console.log(`[DB Multi-Provider] Active Database: \x1b[32m${provider.toUpperCase()}\x1b[0m`);
console.log(`[DB Multi-Provider] Schema synchronized at: prisma/schema.prisma`);

// Provider connection hint
const hints = {
  mysql: 'mysql://user:password@localhost:3306/db_name',
  postgresql: 'postgresql://user:password@localhost:5432/db_name?schema=public',
  sqlite: 'file:./dev.db',
  sqlserver: 'sqlserver://localhost:1433;database=db_name;user=sa;password=pass;encrypt=true',
};

console.log(`[DB Multi-Provider] Example DATABASE_URL format:`);
console.log(`  \x1b[36m${hints[provider] || ''}\x1b[0m`);
console.log('====================================================');

