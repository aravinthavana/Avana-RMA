const { execSync } = require('child_process');

// 1. Get the Neon Database URL from Render environment variables
let dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
    console.error('DATABASE_URL environment variable is missing.');
    process.exit(1);
}

// 2. Prisma requires a DIRECT connection (not a PgBouncer pooled connection) to run migrations.
// In Neon, pooled connection strings have "-pooler" in the hostname.
// We auto-detect and convert it here so the Render build works seamlessly without the user needing to set 2 variables.
if (dbUrl.includes('-pooler.') && dbUrl.includes('neon.tech')) {
    console.log('Detected Neon pooled connection string. Converting to direct connection for Prisma migration...');
    process.env.DIRECT_URL = dbUrl.replace('-pooler.', '.');
} else {
    // If it's already direct (or another provider), just use the same URL
    process.env.DIRECT_URL = dbUrl;
}

// 3. Run the Prisma migration deploy command with the new injected DIRECT_URL environment variable
try {
    console.log('Running robust database migration...');
    // Use stdio: inherit so Render logs output to the dashboard
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    console.log('Database migration completed successfully.');
} catch (error) {
    console.error('Database migration failed during Render build.');
    process.exit(1);
}
