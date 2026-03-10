import { exec } from 'child_process';
import util from 'util';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const execPromise = util.promisify(exec);

export class BackupService {
    /**
     * Generates a PostgreSQL database dump using pg_dump.
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

        try {
            // Run pg_dump
            // Note: pg_dump must be installed in the environment (e.g., inside the Docker container)
            const command = `pg_dump "${databaseUrl}" -f "${filePath}" --clean --if-exists --no-owner --no-privileges`;
            await execPromise(command);

            // Verify file was created
            if (!fs.existsSync(filePath)) {
                throw new Error('Backup file was not created by pg_dump.');
            }

            return filePath;
        } catch (error: any) {
            console.error('Backup generation failed:', error);
            // Clean up partial file if it exists
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
            throw new Error(`Failed to generate database backup: ${error.message}`);
        }
    }
}

export default new BackupService();
