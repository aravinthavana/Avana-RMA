import { PrismaClient, Rma as PrismaRma } from '@prisma/client';

const prisma = new PrismaClient();

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
    creationDate: string;
    lastUpdateDate: string;
    dateOfIncident: string;
    dateOfReport: string;
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
        creationDate: string;
        statusDate: string;
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
            if (dateFrom) where.creationDate.gte = dateFrom;
            if (dateTo) where.creationDate.lte = dateTo;
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
     */
    async create(data: CreateRmaData) {
        return await prisma.rma.create({
            data: {
                id: data.id,
                customerId: data.customerId,
                creationDate: data.creationDate,
                lastUpdateDate: data.lastUpdateDate,
                dateOfIncident: data.dateOfIncident,
                dateOfReport: data.dateOfReport,
                attachment: data.attachment,
                isInjuryRelated: data.isInjuryRelated,
                injuryDetails: data.injuryDetails,
                devices: {
                    create: data.devices,
                },
                serviceCycles: {
                    create: data.serviceCycles,
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
            lastUpdateDate: new Date().toISOString(),
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
        return `RMA-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    }

    /**
     * Count RMAs
     */
    async count(filters: RmaFilters = {}): Promise<number> {
        const { customerId, dateFrom, dateTo } = filters;
        const where: any = {};

        if (customerId) where.customerId = customerId;
        if (dateFrom) where.creationDate = { gte: dateFrom };
        if (dateTo) where.creationDate = { ...where.creationDate, lte: dateTo };

        return await prisma.rma.count({ where });
    }
}

export default new RmaRepository();
