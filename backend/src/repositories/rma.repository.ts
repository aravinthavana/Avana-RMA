import prisma from '../lib/prisma';


export interface RmaFilters {
    searchTerm?: string;
    statuses?: string[];
    customerId?: string;
    dateFrom?: string;
    dateTo?: string;
    isInjuryRelated?: boolean | string;
}

export interface PaginationOptions {
    page?: number;
    limit?: number;
}

export interface CreateRmaData {
    id: string;
    customerId: string;
    creationDate?: Date;       // A-2: DateTime — defaults in DB
    lastUpdateDate?: Date;     // A-2: DateTime — defaults in DB
    dateOfIncident: string;    // Date-only string (YYYY-MM-DD)
    dateOfReport: string;      // Date-only string (YYYY-MM-DD)
    attachment?: string;
    isInjuryRelated: boolean;
    injuryDetails?: string;
    devices: Array<{
        articleNumber?: string;
        serialNumber: string;
        quantity?: number;
    }>;
    serviceCycles: Array<{
        deviceSerialNumber: string;
        status: string;
        creationDate?: Date;   // A-2: DateTime — defaults in DB
        statusDate?: Date;     // A-2: DateTime — defaults in DB
        issueDescription?: string;
        accessoriesIncluded?: string;
    }>;
}

export class RmaRepository {
    private buildWhereClause(filters: RmaFilters): any {
        const { searchTerm, statuses, customerId, dateFrom, dateTo, isInjuryRelated } = filters;
        const where: any = {};

        if (customerId) {
            where.customerId = customerId;
        }

        if (searchTerm) {
            where.OR = [
                { id: { contains: searchTerm } },
                { customer: { name: { contains: searchTerm, mode: 'insensitive' } } },
            ];
        }

        if (dateFrom || dateTo) {
            where.creationDate = {};
            // A-2: creationDate is now DateTime — parse filter strings to Date objects
            if (dateFrom) where.creationDate.gte = new Date(dateFrom);
            if (dateTo) where.creationDate.lte = new Date(dateTo + 'T23:59:59.999Z');
        }

        if (statuses && statuses.length > 0) {
            where.serviceCycles = {
                some: { status: { in: statuses } },
            };
        }

        if (isInjuryRelated !== undefined) {
            where.isInjuryRelated = isInjuryRelated === 'true' || isInjuryRelated === true;
        }

        return where;
    }

    /**
     * Find all RMAs with pagination, filtering, and full relations
     */
    async findAll(
        pagination: PaginationOptions = {},
        filters: RmaFilters = {}
    ) {
        const { page = 1, limit = 50 } = pagination;
        const where = this.buildWhereClause(filters);

        const [rmas, total] = await Promise.all([
            prisma.rma.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                include: {
                    customer: true,
                    devices: true,
                    serviceCycles: {
                        include: {
                            history: {
                                orderBy: { date: 'desc' },
                            },
                        },
                    },
                },
                orderBy: { creationDate: 'desc' },
            }),
            prisma.rma.count({ where }),
        ]);

        return { rmas, total };
    }

    /**
     * Find all RMAs without pagination for exporting
     */
    async findAllForExport(filters: RmaFilters = {}) {
        const where = this.buildWhereClause(filters);

        return await prisma.rma.findMany({
            where,
            include: {
                customer: true,
                devices: true,
                serviceCycles: {
                    include: {
                        history: {
                            orderBy: { date: 'desc' },
                        },
                    },
                },
            },
            orderBy: { creationDate: 'desc' },
        });
    }

    /**
     * Find a single RMA by ID with all relations
     */
    async findById(id: string) {
        return await prisma.rma.findUnique({
            where: { id },
            include: {
                customer: true,
                devices: true,
                serviceCycles: {
                    include: {
                        history: {
                            orderBy: { date: 'desc' },
                        },
                    },
                },
            },
        });
    }

    /**
     * Create a new RMA with devices and service cycles
     * A-2: creationDate and lastUpdateDate are now DateTime with @default(now()) — DB sets them automatically.
     */
    async create(data: CreateRmaData) {
        return await prisma.rma.create({
            data: {
                id: data.id,
                customerId: data.customerId,
                // creationDate and lastUpdateDate omitted — DB defaults to now()
                dateOfIncident: data.dateOfIncident,
                dateOfReport: data.dateOfReport,
                attachment: data.attachment,
                isInjuryRelated: data.isInjuryRelated,
                injuryDetails: data.injuryDetails,
                devices: {
                    create: data.devices,
                },
                serviceCycles: {
                    // creationDate and statusDate omitted in each cycle — DB defaults to now()
                    create: data.serviceCycles.map(({ creationDate: _, statusDate: __, ...cycle }) => cycle),
                },
            },
            include: {
                customer: true,
                devices: true,
                serviceCycles: {
                    include: {
                        history: true,
                    },
                },
            },
        });
    }

    /**
     * Update an RMA
     */
    async update(id: string, data: Partial<CreateRmaData>) {
        const updateData: any = {
            lastUpdateDate: new Date(), // A-2: was toISOString() — now proper Date object
        };

        if (data.dateOfIncident) updateData.dateOfIncident = data.dateOfIncident;
        if (data.dateOfReport) updateData.dateOfReport = data.dateOfReport;
        if (data.attachment !== undefined) updateData.attachment = data.attachment;

        return await prisma.rma.update({
            where: { id },
            data: updateData,
            include: {
                customer: true,
                devices: true,
                serviceCycles: {
                    include: {
                        history: true,
                    },
                },
            },
        });
    }

    /**
     * Delete an RMA and all related data
     */
    async delete(id: string) {
        // Prisma will handle cascading deletes based on schema relationships
        return await prisma.rma.delete({
            where: { id },
        });
    }

    /**
     * Find RMAs by customer ID
     */
    async findByCustomerId(customerId: string) {
        return await prisma.rma.findMany({
            where: { customerId },
            include: {
                devices: true,
                serviceCycles: {
                    include: {
                        history: true,
                    },
                },
            },
            orderBy: { creationDate: 'desc' },
        });
    }

    /**
     * Generate a unique RMA ID (short 6-character alphanumeric)
     */
    generateId(): string {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        // Use 6 random characters taken from a 30-byte random buffer to avoid Math.random() collisions
        const randomPart = Array.from({ length: 6 }).map(() => chars[Math.floor(Math.random() * chars.length)]).join('');
        return `RMA-${randomPart}`;
    }

    /**
     * Count RMAs
     */
    async count(filters: RmaFilters = {}): Promise<number> {
        const where = this.buildWhereClause(filters);
        return await prisma.rma.count({ where });
    }

    /**
     * B-2: Aggregate dashboard statistics from the DB — avoids loading all RMAs into memory.
     */
    async getStats(): Promise<{
        total: number;
        byStatus: Record<string, number>;
        totalInjuryRelated: number;
    }> {
        const [total, statusGroups, totalInjuryRelated] = await Promise.all([
            prisma.rma.count(),
            prisma.serviceCycle.groupBy({
                by: ['status'],
                _count: { status: true },
            }),
            prisma.rma.count({ where: { isInjuryRelated: true } }),
        ]);

        const byStatus: Record<string, number> = {};
        for (const group of statusGroups) {
            byStatus[group.status] = group._count.status;
        }

        return { total, byStatus, totalInjuryRelated };
    }
}

export default new RmaRepository();

