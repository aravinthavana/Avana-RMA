import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export class BackupService {
    /**
     * Generates a PostgreSQL database dump using pg_dump.
     * Uses spawn() with an explicit args array to prevent shell command injection.
     * Returns the absolute path to the generated .sql file.
     */
    async createDatabaseBackup(): Promise<string> {
        const databaseUrl = process.env.DATABASE_URL;

        if (!databaseUrl) {
            throw new Error('DATABASE_URL environment variable is missing.');
        }

        // Create a secure temporary file path
        const fileName = `backup-${new Date().toISOString().replace(/[:.]/g, '-')}-${uuidv4().substring(0, 8)}.sql`;
        const tempDir = path.join(process.cwd(), 'temp-backups');

        // Ensure temp directory exists
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }

        const filePath = path.join(tempDir, fileName);

        return new Promise((resolve, reject) => {
            // SECURITY: Use spawn() with a discrete args array, NOT exec() with a shell string.
            // This guarantees the DATABASE_URL is passed as a literal argument and
            // can never be interpreted as a shell command even if malformed.
            const pgDump = spawn('pg_dump', [
                databaseUrl,
                '-f', filePath,
                '--clean',
                '--if-exists',
                '--no-owner',
                '--no-privileges',
            ], { stdio: ['ignore', 'pipe', 'pipe'], shell: false });

            let stderrOutput = '';
            pgDump.stderr.on('data', (data) => {
                stderrOutput += data.toString();
            });

            pgDump.on('close', (code) => {
                if (code !== 0) {
                    // Clean up partial file if present
                    if (fs.existsSync(filePath)) {
                        try { fs.unlinkSync(filePath); } catch (_) { }
                    }
                    reject(new Error(`pg_dump process exited with code ${code}: ${stderrOutput}`));
                    return;
                }

                if (!fs.existsSync(filePath)) {
                    reject(new Error('Backup file was not created by pg_dump.'));
                    return;
                }

                resolve(filePath);
            });

            pgDump.on('error', (err) => {
                if (fs.existsSync(filePath)) {
                    try { fs.unlinkSync(filePath); } catch (_) { }
                }
                reject(new Error(`Failed to start pg_dump process: ${err.message}`));
            });
        });
    }

    /**
     * Restores a PostgreSQL database from a given SQL dump file using psql.
     * WARNING: This is a destructive operation that completely overwrites existing data!
     */
    async restoreDatabaseBackup(filePath: string): Promise<void> {
        const databaseUrl = process.env.DATABASE_URL;

        if (!databaseUrl) {
            throw new Error('DATABASE_URL environment variable is missing.');
        }

        if (!fs.existsSync(filePath)) {
            throw new Error(`Backup file not found at path: ${filePath}`);
        }

        return new Promise((resolve, reject) => {
            // SECURITY: Use spawn() to prevent shell injection.
            // psql -d <url> -f <file>
            const psql = spawn('psql', [
                databaseUrl,
                '-f', filePath,
                // --quiet to suppress massive output during restore
                '--quiet'
            ], { stdio: ['ignore', 'ignore', 'pipe'], shell: false });

            let stderrOutput = '';
            psql.stderr.on('data', (data) => {
                stderrOutput += data.toString();
            });

            psql.on('close', (code) => {
                // If it fails with code != 0, we still reject, though psql may exit 0 even if some statements fail
                // if ON_ERROR_STOP is not set. For a basic pg_dump restore, this is usually acceptable.
                if (code !== 0) {
                    reject(new Error(`psql restore process exited with code ${code}: ${stderrOutput}`));
                    return;
                }
                
                // If there are significant FATAL errors in stderr, we could optionally throw
                if (stderrOutput.includes('FATAL:')) {
                    reject(new Error(`Restore encountered fatal errors: ${stderrOutput}`));
                    return;
                }

                resolve();
            });

            psql.on('error', (err) => {
                reject(new Error(`Failed to start psql process: ${err.message}`));
            });
        });
    }
}

export default new BackupService();
