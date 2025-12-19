import { PrismaClient, Customer as PrismaCustomer } from '@prisma/client';

const prisma = new PrismaClient();

export interface PaginationOptions {
    page?: number;
    limit?: number;
}

export interface CustomerFilters {
    searchTerm?: string;
}

export class CustomerRepository {
    /**
     * Find all customers with pagination and filtering
     */
    async findAll(
        pagination: PaginationOptions = {},
        filters: CustomerFilters = {}
    ): Promise<{ customers: PrismaCustomer[]; total: number }> {
        const { page = 1, limit = 50 } = pagination;
        const { searchTerm } = filters;

        const where: any = {};

        // Apply search filter if provided
        if (searchTerm) {
            where.OR = [
                { name: { contains: searchTerm, mode: 'insensitive' } },
                { contactPerson: { contains: searchTerm, mode: 'insensitive' } },
                { email: { contains: searchTerm, mode: 'insensitive' } },
            ];
        }

        const [customers, total] = await Promise.all([
            prisma.customer.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { name: 'asc' },
            }),
            prisma.customer.count({ where }),
        ]);

        return { customers, total };
    }

    /**
     * Find a single customer by ID
     */
    async findById(id: string): Promise<PrismaCustomer | null> {
        return await prisma.customer.findUnique({
            where: { id },
            include: {
                rmas: {
                    select: {
                        id: true,
                        creationDate: true,
                        lastUpdateDate: true,
                    },
                },
            },
        });
    }

    /**
     * Create a new customer
     */
    async create(data: Omit<PrismaCustomer, 'id'>): Promise<PrismaCustomer> {
        return await prisma.customer.create({
            data: {
                id: this.generateId(),
                ...data,
            },
        });
    }

    /**
     * Update an existing customer
     */
    async update(id: string, data: Partial<Omit<PrismaCustomer, 'id'>>): Promise<PrismaCustomer> {
        return await prisma.customer.update({
            where: { id },
            data,
        });
    }

    /**
     * Delete a customer
     */
    async delete(id: string, deleteRmas: boolean = false): Promise<PrismaCustomer> {
        if (deleteRmas) {
            // Delete customer and all associated RMAs (cascade)
            await prisma.rma.deleteMany({
                where: { customerId: id },
            });
        } else {
            // Before deleting customer, preserve customer info in RMAs
            const customer = await this.findById(id);
            if (customer) {
                await prisma.rma.updateMany({
                    where: { customerId: id },
                    data: {
                        customerName: customer.name,
                        customerEmail: customer.email,
                        customerPhone: customer.phone,
                    },
                });
            }
        }

        return await prisma.customer.delete({
            where: { id },
        });
    }

    /**
     * Check if customer has any RMAs
     */
    async hasRmas(customerId: string): Promise<boolean> {
        const count = await prisma.rma.count({
            where: { customerId },
        });
        return count > 0;
    }

    /**
     * Count customers
     */
    async count(filters: CustomerFilters = {}): Promise<number> {
        const { searchTerm } = filters;
        const where: any = {};

        if (searchTerm) {
            where.OR = [
                { name: { contains: searchTerm } },
                { contactPerson: { contains: searchTerm } },
                { email: { contains: searchTerm } },
            ];
        }

        return await prisma.customer.count({ where });
    }

    /**
     * Generate a unique customer ID
     */
    private generateId(): string {
        return `CUST-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
}

export default new CustomerRepository();
