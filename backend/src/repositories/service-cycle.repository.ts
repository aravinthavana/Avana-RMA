import prisma from '../lib/prisma';


export interface CreateServiceCycleData {
    rmaId: string;
    deviceSerialNumber: string;
    status: string;
    creationDate?: Date;      // A-2: DateTime — DB defaults to now()
    statusDate?: Date;        // A-2: DateTime — DB defaults to now()
    issueDescription?: string;
    accessoriesIncluded?: string;
}

export interface AddHistoryEventData {
    status: string;
    date?: Date;              // A-2: DateTime — DB defaults to now()
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
     * A-2: statusDate is now a DateTime — accept a Date object
     */
    async updateStatus(id: number, status: string, statusDate: Date = new Date()) {
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
     * A-2: date is now a DateTime — accept a Date object (defaults to now)
     */
    async addHistoryEvent(serviceCycleId: number, data: AddHistoryEventData) {
        return await prisma.serviceHistory.create({
            data: {
                serviceCycleId,
                status: data.status,
                date: data.date ?? new Date(),
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
