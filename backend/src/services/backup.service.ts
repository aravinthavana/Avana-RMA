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
}

export default new BackupService();
