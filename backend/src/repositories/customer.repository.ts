import { Customer as PrismaCustomer } from '@prisma/client';
import prisma from '../lib/prisma';


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
     * C-1: id is now DB-generated via @default(uuid()) in schema — no need to pass it here.
     */
    async create(data: Omit<PrismaCustomer, 'id'>): Promise<PrismaCustomer> {
        return await prisma.customer.create({
            data,
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
     * Wrapped in a transaction so the name-preservation step and the delete
     * are atomic — no partial state if the connection drops between them.
     */
    async delete(id: string, deleteRmas: boolean = false): Promise<PrismaCustomer> {
        if (deleteRmas) {
            // Delete customer and all associated RMAs (cascade) in a transaction
            return await prisma.$transaction(async (tx) => {
                await tx.rma.deleteMany({
                    where: { customerId: id },
                });
                return tx.customer.delete({
                    where: { id },
                });
            });
        } else {
            // Before deleting customer, atomically preserve customer info in all linked RMAs
            const customer = await this.findById(id);
            return await prisma.$transaction(async (tx) => {
                if (customer) {
                    await tx.rma.updateMany({
                        where: { customerId: id },
                        data: {
                            customerName: customer.name,
                            customerEmail: customer.email,
                            customerPhone: customer.phone,
                        },
                    });
                }
                return tx.customer.delete({
                    where: { id },
                });
            });
        }
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
     * Count customers matching optional filters
     */
    async count(filters: CustomerFilters = {}): Promise<number> {
        const { searchTerm } = filters;
        const where: any = {};

        if (searchTerm) {
            where.OR = [
                { name: { contains: searchTerm, mode: 'insensitive' } },
                { contactPerson: { contains: searchTerm, mode: 'insensitive' } },
                { email: { contains: searchTerm, mode: 'insensitive' } },
            ];
        }

        return await prisma.customer.count({ where });
    }

}

export default new CustomerRepository();
