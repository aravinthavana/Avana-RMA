import { Request, Response, NextFunction } from 'express';
import { RmaService } from '../services/rma.service';

export class RmaController {
    constructor(private readonly rmaService: RmaService) { }

    /**
     * GET /api/rmas
     * Get all RMAs with pagination and filtering
     */
    async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 50;

            const filters = {
                searchTerm: req.query.search as string,
                statuses: req.query.status ? (req.query.status as string).split(',') : undefined,
                customerId: req.query.customerId as string,
                dateFrom: req.query.dateFrom as string,
                dateTo: req.query.dateTo as string,
            };

            const { rmas, total } = await this.rmaService.getAllRmas({ page, limit }, filters);
            const totalPages = Math.ceil(total / limit);

            res.json({
                success: true,
                data: rmas,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages,
                },
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/rmas/stats
     * B-2: Aggregate dashboard statistics from the DB (avoids loading all records into memory)
     */
    async getStats(req: Request, res: Response, next: NextFunction) {
        try {
            const stats = await this.rmaService.getStats();
            res.json({ success: true, data: stats });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/rmas/export
     * Export RMAs to CSV based on filters
     */
    async exportFilteredRmas(req: Request, res: Response, next: NextFunction) {
        try {
            const filters = {
                searchTerm: req.query.search as string,
                statuses: req.query.status ? (req.query.status as string).split(',') : undefined,
                customerId: req.query.customerId as string,
                dateFrom: req.query.dateFrom as string,
                dateTo: req.query.dateTo as string,
                isInjuryRelated: req.query.isInjuryRelated as string,
            };

            const csvString = await this.rmaService.exportRmasToCsv(filters);

            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename="rmas_export.csv"');
            res.status(200).send(csvString);
        } catch (error: any) {
            console.error('Export CSV Error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to generate CSV export',
                message: error.message
            });
        }
    }

    /**
     * GET /api/rmas/:id
     * Get a single RMA by ID
     */
    async getById(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const rma = await this.rmaService.getRmaById(id);

            res.json({
                success: true,
                data: rma,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/rmas
     * Create a new RMA
     */
    async create(req: Request, res: Response, next: NextFunction) {
        try {
            // Recursively sanitize null bytes from all strings to prevent PostgreSQL UTF-8 0x00 errors
            const sanitizeNullBytes = (obj: any): any => {
                if (typeof obj === 'string') return obj.replace(/\0/g, '');
                if (Array.isArray(obj)) return obj.map(sanitizeNullBytes);
                if (obj !== null && typeof obj === 'object') {
                    return Object.fromEntries(
                        Object.entries(obj).map(([k, v]) => [k, sanitizeNullBytes(v)])
                    );
                }
                return obj;
            };

            const requestBody = sanitizeNullBytes(req.body);

            // Handle both old format (customer object) and new format (customerId)
            const rmaData = {
                ...requestBody,
                customerId: requestBody.customerId || requestBody.customer?.id,
            };

            // Remove customer object if it exists (use customerId instead)
            delete rmaData.customer;

            // Remove history from serviceCycles (Prisma handles initial history automatically)
            if (rmaData.serviceCycles) {
                rmaData.serviceCycles = rmaData.serviceCycles.map((cycle: any) => {
                    const { history, ...cycleWithoutHistory } = cycle;
                    return cycleWithoutHistory;
                });
            }

            const rma = await this.rmaService.createRma(rmaData);

            res.status(201).json({
                success: true,
                data: rma,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * PUT /api/rmas/:id
     * Update an RMA
     */
    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const rma = await this.rmaService.updateRma(id, req.body);

            res.json({
                success: true,
                data: rma,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * DELETE /api/rmas/:id
     * Delete an RMA
     */
    async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            await this.rmaService.deleteRma(id);

            res.json({
                success: true,
                message: 'RMA deleted successfully',
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * PATCH /api/rmas/:id/status
     * Update RMA service cycle status by device serial number
     */
    async updateStatus(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const { deviceSerialNumber, newStatus, notes } = req.body;

            const updatedRma = await this.rmaService.updateServiceCycleStatusBySerialNumber(
                id,
                deviceSerialNumber,
                newStatus,
                notes
            );

            if (!updatedRma) {
                throw new Error('Failed to update RMA status');
            }

            res.json({
                success: true,
                data: updatedRma,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/rmas/:id/cycles
     * Add a new service cycle to an RMA
     */
    async addServiceCycle(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const cycle = await this.rmaService.addServiceCycle(id, req.body);

            res.status(201).json({
                success: true,
                data: cycle,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * PUT /api/rmas/cycles/:cycleId/status
     * Update service cycle status
     */
    async updateCycleStatus(req: Request, res: Response, next: NextFunction) {
        try {
            const cycleId = parseInt(req.params.cycleId, 10);
            if (isNaN(cycleId)) {
                return res.status(400).json({ success: false, error: 'Invalid cycle ID — must be a number' });
            }
            const cycle = await this.rmaService.updateServiceCycleStatus(cycleId, req.body);

            res.json({
                success: true,
                data: cycle,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/customers/:customerId/rmas
     * Get all RMAs for a specific customer
     */
    async getByCustomer(req: Request, res: Response, next: NextFunction) {
        try {
            const { customerId } = req.params;
            const rmas = await this.rmaService.getRmasByCustomer(customerId);

            res.json({
                success: true,
                data: rmas,
            });
        } catch (error) {
            next(error);
        }
    }
}

// Import and instantiate after class definition to avoid circular dependency
import rmaService from '../services/rma.service';
export default new RmaController(rmaService);
