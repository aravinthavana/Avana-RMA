import { Request, Response, NextFunction } from 'express';
import { auditService } from '../services/audit.service';

export class AuditController {

    getAll = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 20;
            const offset = (page - 1) * limit;

            const filters = {
                userId: req.query.userId as string,
                action: req.query.action as string,
                entity: req.query.entity as string
            };

            const result = await auditService.getLogs(limit, offset, filters);

            res.json({
                success: true,
                data: result.logs,
                pagination: {
                    page,
                    limit,
                    total: result.total,
                    totalPages: Math.ceil(result.total / limit)
                }
            });
        } catch (error) {
            next(error);
        }
    };
}

export default new AuditController();
