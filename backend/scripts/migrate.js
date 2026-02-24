const { execSync } = require('child_process');

let dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
    console.error('DATABASE_URL environment variable is missing.');
    process.exit(1);
}

// Prisma needs a DIRECT connection to run migrations, not a PgBouncer pooler connection.
// By overwriting DATABASE_URL before spawning prisma, we trick it into using the direct connection just for the migration!
if (dbUrl.includes('-pooler.') && dbUrl.includes('neon.tech')) {
    console.log('Detected Neon pooled connection string. Overwriting DATABASE_URL to use direct connection for Prisma migration...');
    process.env.DATABASE_URL = dbUrl.replace('-pooler.', '.');
}

try {
    console.log('Running robust database migration...');
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    console.log('Database migration completed successfully.');
} catch (error) {
    console.error('Database migration failed during Render build.');
    process.exit(1);
}
