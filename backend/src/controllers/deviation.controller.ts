import { Request, Response, NextFunction } from 'express';
import deviationService from '../services/deviation.service';

export class DeviationController {
    async getDeviations(req: Request, res: Response, next: NextFunction) {
        try {
            const query = {
                page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
                limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 20,
                search: req.query.search as string,
                status: req.query.status as string,
                protocolPortion: req.query.protocolPortion as string,
                startDate: req.query.startDate as string,
                endDate: req.query.endDate as string,
            };

            const result = await deviationService.getDeviations(query);
            res.json({
                success: true,
                data: result.deviations,
                pagination: {
                    page: query.page,
                    limit: query.limit,
                    total: result.total,
                    totalPages: Math.ceil(result.total / query.limit),
                },
            });
        } catch (error) {
            next(error);
        }
    }

    async getDeviationById(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const deviation = await deviationService.getDeviationById(id);
            res.json({
                success: true,
                data: deviation,
            });
        } catch (error) {
            next(error);
        }
    }

    async getNextNumber(req: Request, res: Response, next: NextFunction) {
        try {
            const nextNumber = await deviationService.getNextNumber();
            res.json({
                success: true,
                data: { nextNumber },
            });
        } catch (error) {
            next(error);
        }
    }

    async getSigners(req: Request, res: Response, next: NextFunction) {
        try {
            const signers = await deviationService.getSigners();
            res.json({
                success: true,
                data: signers,
            });
        } catch (error) {
            next(error);
        }
    }

    async createDeviation(req: Request, res: Response, next: NextFunction) {
        try {
            const user = (req as any).user;
            const payload = {
                ...req.body,
                createdById: user?.id,
            };
            const created = await deviationService.createDeviation(payload, user);
            res.status(201).json({
                success: true,
                data: created,
                message: 'Deviation created successfully',
            });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                error: error.message || 'Failed to create deviation',
            });
        }
    }

    async updateDeviation(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const user = (req as any).user;
            const updated = await deviationService.updateDeviation(id, req.body, user);
            res.json({
                success: true,
                data: updated,
                message: 'Deviation updated successfully',
            });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                error: error.message || 'Failed to update deviation',
            });
        }
    }

    async deleteDeviation(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            await deviationService.deleteDeviation(id);
            res.json({
                success: true,
                message: 'Deviation deleted successfully',
            });
        } catch (error) {
            next(error);
        }
    }

    async signDeviation(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const user = (req as any).user;
            const { role, signerName, signatureUrl, date } = req.body;
            if (!role || !signerName || !signatureUrl) {
                return res.status(400).json({
                    success: false,
                    error: 'Role, signerName, and signatureUrl are required',
                });
            }
            const updated = await deviationService.signDeviation(id, {
                role,
                signerName,
                signatureUrl,
                date,
            }, user);
            res.json({
                success: true,
                data: updated,
                message: 'Deviation signed successfully',
            });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                error: error.message || 'Failed to sign deviation',
            });
        }
    }

    async exportExcel(req: Request, res: Response, next: NextFunction) {
        try {
            const query = {
                search: req.query.search as string,
                status: req.query.status as string,
                protocolPortion: req.query.protocolPortion as string,
                startDate: req.query.startDate as string,
                endDate: req.query.endDate as string,
            };

            const selectedIds = req.query.ids ? (req.query.ids as string).split(',').filter(Boolean) : undefined;
            const buffer = await deviationService.exportToExcel(query, selectedIds);

            const filename = `Validation_Deviations_${new Date().toISOString().slice(0, 10)}.xlsx`;
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            res.send(buffer);
        } catch (error) {
            next(error);
        }
    }

    async uploadAttachment(req: Request, res: Response) {
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'No file uploaded' });
        }
        const fileUrl = `/uploads/deviations/${req.file.filename}`;
        res.json({
            success: true,
            data: {
                url: fileUrl,
                filename: req.file.originalname,
            },
        });
    }
}

export default new DeviationController();
