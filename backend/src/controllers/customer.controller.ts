import { Request, Response, NextFunction } from 'express';
import { CustomerService } from '../services/customer.service';

export class CustomerController {
    constructor(private readonly customerService: CustomerService) { }

    /**
     * GET /api/customers
     * Get all customers with pagination
     */
    async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const search = req.query.search as string;

            const { customers, total } = await this.customerService.getAllCustomers(
                { page, limit },
                { searchTerm: search }
            );

            const totalPages = Math.ceil(total / limit);

            res.json({
                success: true,
                data: customers,
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
     * GET /api/customers/:id
     * Get a single customer by ID
     */
    async getById(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const customer = await this.customerService.getCustomerById(id);

            if (!customer) {
                return res.status(404).json({
                    success: false,
                    error: 'Customer not found',
                });
            }

            res.json({
                success: true,
                data: customer,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/customers
     * Create a new customer
     */
    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const customer = await this.customerService.createCustomer(req.body);

            res.status(201).json({
                success: true,
                data: customer,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * PUT /api/customers/:id
     * Update an existing customer
     */
    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const customer = await this.customerService.updateCustomer(id, req.body);

            res.json({
                success: true,
                data: customer,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * DELETE /api/customers/:id
     * Delete a customer
     */
    async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const deleteRmas = req.query.deleteRmas === 'true';

            await this.customerService.deleteCustomer(id, deleteRmas);

            res.json({
                success: true,
                message: deleteRmas
                    ? 'Customer and associated RMAs deleted successfully'
                    : 'Customer deleted successfully. RMAs preserved.',
            });
        } catch (error) {
            next(error);
        }
    }
}

// Import and instantiate after class definition to avoid circular dependency
import customerService from '../services/customer.service';
export default new CustomerController(customerService);
