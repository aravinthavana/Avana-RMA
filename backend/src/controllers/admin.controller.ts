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

    /**
     * POST /api/admin/restore
     * Receives an uploaded .sql file and restores the database
     */
    async restoreDatabaseBackup(req: Request, res: Response, next: NextFunction) {
        try {
            // Check authorization: only SUPERADMIN or ADMIN should be able to do this
            const user = (req as any).user;
            if (!user || (user.role !== 'SUPERADMIN' && user.role !== 'ADMIN')) {
                return res.status(403).json({
                    success: false,
                    error: 'Forbidden: Insufficient privileges to restore database'
                });
            }

            const file = req.file;
            if (!file) {
                return res.status(400).json({
                    success: false,
                    error: 'No backup file provided'
                });
            }

            // Verify it's a SQL file by extension or mimetype (basic check)
            if (!file.originalname.endsWith('.sql')) {
                fs.unlinkSync(file.path);
                return res.status(400).json({
                    success: false,
                    error: 'Invalid file type. Only .sql files are allowed.'
                });
            }

            // Perform the restore operation
            await backupService.restoreDatabaseBackup(file.path);

            // Clean up the uploaded file
            fs.unlinkSync(file.path);

            res.json({
                success: true,
                message: 'Database restored successfully'
            });
        } catch (error: any) {
            console.error('Database restore error:', error);
            
            // Clean up uploaded file if it still exists
            if (req.file && fs.existsSync(req.file.path)) {
                try {
                    fs.unlinkSync(req.file.path);
                } catch (cleanupError) {
                    // Ignore
                }
            }

            res.status(500).json({
                success: false,
                error: 'Failed to restore database',
                message: error.message
            });
        }
    }
}

export default new AdminController();
