import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateServiceCycleData {
    rmaId: string;
    deviceSerialNumber: string;
    status: string;
    creationDate: string;
    statusDate: string;
    issueDescription?: string;
    accessoriesIncluded?: string;
}

export interface AddHistoryEventData {
    status: string;
    date: string;
    notes?: string;
}

export class ServiceCycleRepository {
    /**
     * Find service cycles by RMA ID
     */
    async findByRmaId(rmaId: string) {
        return await prisma.serviceCycle.findMany({
            where: { rmaId },
            include: {
                history: {
                    orderBy: { date: 'desc' },
                },
            },
        });
    }

    /**
     * Find a single service cycle by ID
     */
    async findById(id: number) {
        return await prisma.serviceCycle.findUnique({
            where: { id },
            include: {
                history: {
                    orderBy: { date: 'desc' },
                },
            },
        });
    }

    /**
     * Create a new service cycle
     */
    async create(data: CreateServiceCycleData) {
        return await prisma.serviceCycle.create({
            data,
            include: {
                history: true,
            },
        });
    }

    /**
     * Update a service cycle status
     */
    async updateStatus(id: number, status: string, statusDate: string) {
        return await prisma.serviceCycle.update({
            where: { id },
            data: {
                status,
                statusDate,
            },
            include: {
                history: true,
            },
        });
    }

    /**
     * Add a history event to a service cycle
     */
    async addHistoryEvent(serviceCycleId: number, data: AddHistoryEventData) {
        return await prisma.serviceHistory.create({
            data: {
                serviceCycleId,
                status: data.status,
                date: data.date,
                notes: data.notes,
            },
        });
    }

    /**
     * Get history for a service cycle
     */
    async getHistory(serviceCycleId: number) {
        return await prisma.serviceHistory.findMany({
            where: { serviceCycleId },
            orderBy: { date: 'desc' },
        });
    }

    /**
     * Delete a service cycle
     */
    async delete(id: number) {
        return await prisma.serviceCycle.delete({
            where: { id },
        });
    }
}

export default new ServiceCycleRepository();
