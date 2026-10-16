import { PrismaClient, Prisma, ValidationDeviation } from '@prisma/client';

const prisma = new PrismaClient();

export interface FindDeviationsQuery {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    protocolPortion?: string;
    startDate?: string;
    endDate?: string;
}

export class DeviationRepository {
    private buildWhereClause(query: FindDeviationsQuery): Prisma.ValidationDeviationWhereInput {
        const where: Prisma.ValidationDeviationWhereInput = {};

        if (query.status && query.status !== 'ALL') {
            where.status = query.status;
        }

        if (query.protocolPortion && query.protocolPortion !== 'ALL') {
            where.protocolPortion = query.protocolPortion;
        }

        if (query.startDate || query.endDate) {
            where.dateObserved = {};
            if (query.startDate) where.dateObserved.gte = new Date(query.startDate);
            if (query.endDate) where.dateObserved.lte = new Date(query.endDate);
        }

        if (query.search && query.search.trim()) {
            const search = query.search.trim();
            where.OR = [
                { deviationNumber: { contains: search, mode: 'insensitive' } },
                { testSection: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
                { observedByName: { contains: search, mode: 'insensitive' } },
            ];
        }

        return where;
    }

    async findAll(query: FindDeviationsQuery = {}): Promise<{ deviations: ValidationDeviation[]; total: number }> {
        const page = Math.max(1, Number(query.page) || 1);
        const limit = Math.max(1, Math.min(100, Number(query.limit) || 20));
        const skip = (page - 1) * limit;

        const where = this.buildWhereClause(query);

        const [deviations, total] = await Promise.all([
            prisma.validationDeviation.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    createdBy: {
                        select: { id: true, name: true, email: true },
                    },
                },
            }),
            prisma.validationDeviation.count({ where }),
        ]);

        return { deviations, total };
    }

    async findById(id: string): Promise<ValidationDeviation | null> {
        return prisma.validationDeviation.findUnique({
            where: { id },
            include: {
                createdBy: {
                    select: { id: true, name: true, email: true },
                },
            },
        });
    }

    async findByDeviationNumber(deviationNumber: string): Promise<ValidationDeviation | null> {
        return prisma.validationDeviation.findUnique({
            where: { deviationNumber },
        });
    }

    async create(data: Prisma.ValidationDeviationCreateInput): Promise<ValidationDeviation> {
        return prisma.validationDeviation.create({
            data,
        });
    }

    async update(id: string, data: Prisma.ValidationDeviationUpdateInput): Promise<ValidationDeviation> {
        return prisma.validationDeviation.update({
            where: { id },
            data,
        });
    }

    async delete(id: string): Promise<ValidationDeviation> {
        return prisma.validationDeviation.delete({
            where: { id },
        });
    }

    async getNextDeviationNumber(): Promise<string> {
        const currentYear = new Date().getFullYear();
        const prefix = `DEV-${currentYear}-`;

        const latest = await prisma.validationDeviation.findFirst({
            where: {
                deviationNumber: {
                    startsWith: prefix,
                },
            },
            orderBy: {
                deviationNumber: 'desc',
            },
        });

        if (!latest) {
            return `${prefix}0001`;
        }

        const currentSeq = parseInt(latest.deviationNumber.replace(prefix, ''), 10);
        const nextSeq = isNaN(currentSeq) ? 1 : currentSeq + 1;
        return `${prefix}${nextSeq.toString().padStart(4, '0')}`;
    }

    async findByIds(ids: string[]): Promise<ValidationDeviation[]> {
        return prisma.validationDeviation.findMany({
            where: {
                id: { in: ids },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
}

export default new DeviationRepository();
