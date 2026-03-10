import { Request, Response, NextFunction } from 'express';
import backupService from '../services/backup.service';
import fs from 'fs';

export class AdminController {
    /**
     * GET /api/admin/backup
     * Generates and downloads a PostgreSQL database dump
     */
    async downloadDatabaseBackup(req: Request, res: Response, next: NextFunction) {
        let backupPath: string | null = null;
        try {
            // Check authorization: only SUPERADMIN or ADMIN should be able to do this
            const user = (req as any).user;
            if (!user || (user.role !== 'SUPERADMIN' && user.role !== 'ADMIN')) {
                return res.status(403).json({
                    success: false,
                    error: 'Forbidden: Insufficient privileges to download database backup'
                });
            }

            backupPath = await backupService.createDatabaseBackup();

            // Stream the file back to the client
            res.download(backupPath, 'database-backup.sql', (err) => {
                // Cleanup temp file after download completes or fails
                if (backupPath && fs.existsSync(backupPath)) {
                    try {
                        fs.unlinkSync(backupPath);
                    } catch (cleanupError) {
                        console.error('Failed to cleanup backup file:', cleanupError);
                    }
                }

                if (err && !res.headersSent) {
                    next(err);
                }
            });

        } catch (error: any) {
            console.error('Database backup error:', error);

            // Clean up if the file was created but the response failed before streaming
            if (backupPath && fs.existsSync(backupPath)) {
                try {
                    fs.unlinkSync(backupPath);
                } catch (cleanupError) {
                    // Ignore
                }
            }

            // If headers have not been sent, return an error
            if (!res.headersSent) {
                res.status(500).json({
                    success: false,
                    error: 'Failed to generate database backup',
                    message: error.message
                });
            }
        }
    }
}

export default new AdminController();
