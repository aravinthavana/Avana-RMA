import customerRepository, { CustomerRepository, PaginationOptions, CustomerFilters } from '../repositories/customer.repository';
import { Customer } from '@prisma/client';

export interface CreateCustomerDto {
    name: string;
    contactPerson?: string;
    email?: string;
    phone?: string;
    address?: string;
}

export interface UpdateCustomerDto {
    name?: string;
    contactPerson?: string;
    email?: string;
    phone?: string;
    address?: string;
}

export class CustomerService {
    constructor(private readonly customerRepo: CustomerRepository = customerRepository) { }

    /**
     * Get all customers with pagination and filtering
     */
    async getAllCustomers(pagination: PaginationOptions = {}, filters: CustomerFilters = {}) {
        return await this.customerRepo.findAll(pagination, filters);
    }

    /**
     * Get a single customer by ID
     */
    async getCustomerById(id: string): Promise<Customer | null> {
        return await this.customerRepo.findById(id);
    }

    /**
     * Create a new customer.
     * C-4: Input is pre-validated by Zod at the route layer (customerSchema).
     * No need to re-validate name or email here.
     */
    async createCustomer(data: CreateCustomerDto): Promise<Customer> {
        return await this.customerRepo.create({
            name: data.name,
            contactPerson: data.contactPerson || null,
            email: data.email || null,
            phone: data.phone || null,
            address: data.address || null,
        });
    }

    /**
     * Update an existing customer.
     * C-4: Input is pre-validated by Zod at the route layer.
     * Existence check is kept for correct 404 responses.
     */
    async updateCustomer(id: string, data: UpdateCustomerDto): Promise<Customer> {
        const existing = await this.customerRepo.findById(id);
        if (!existing) {
            throw new Error(`Customer with ID ${id} not found`);
        }
        return await this.customerRepo.update(id, data);
    }

    /**
     * Delete a customer
     */
    async deleteCustomer(id: string, deleteRmas: boolean = false): Promise<Customer> {
        const existing = await this.customerRepo.findById(id);
        if (!existing) {
            throw new Error(`Customer with ID ${id} not found`);
        }
        return await this.customerRepo.delete(id, deleteRmas);
    }
}

export default new CustomerService();
