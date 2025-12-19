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
        if (!id) {
            throw new Error('Customer ID is required');
        }
        return await this.customerRepo.findById(id);
    }

    /**
     * Create a new customer
     */
    async createCustomer(data: CreateCustomerDto): Promise<Customer> {
        // Validate required fields
        if (!data.name || data.name.trim() === '') {
            throw new Error('Customer name is required');
        }

        // Validate email format if provided
        if (data.email && !this.isValidEmail(data.email)) {
            throw new Error('Invalid email format');
        }

        return await this.customerRepo.create({
            name: data.name,
            contactPerson: data.contactPerson || null,
            email: data.email || null,
            phone: data.phone || null,
            address: data.address || null,
        });
    }

    /**
     * Update an existing customer
     */
    async updateCustomer(id: string, data: UpdateCustomerDto): Promise<Customer> {
        if (!id) {
            throw new Error('Customer ID is required');
        }

        // Check if customer exists
        const existing = await this.customerRepo.findById(id);
        if (!existing) {
            throw new Error(`Customer with ID ${id} not found`);
        }

        // Validate name if being updated
        if (data.name !== undefined && data.name.trim() === '') {
            throw new Error('Customer name cannot be empty');
        }

        // Validate email if being updated
        if (data.email && !this.isValidEmail(data.email)) {
            throw new Error('Invalid email format');
        }

        return await this.customerRepo.update(id, data);
    }

    /**
     * Delete a customer
     */
    async deleteCustomer(id: string, deleteRmas: boolean = false): Promise<Customer> {
        if (!id) {
            throw new Error('Customer ID is required');
        }

        // Check if customer exists
        const existing = await this.customerRepo.findById(id);
        if (!existing) {
            throw new Error(`Customer with ID ${id} not found`);
        }

        return await this.customerRepo.delete(id, deleteRmas);
    }

    /**
     * Validate email format
     */
    private isValidEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
}

export default new CustomerService();
