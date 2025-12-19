import { Router } from 'express';
import customerController from '../controllers/customer.controller';
import { customerSchema } from '../validation';

const router = Router();

/**
 * Validation middleware for customer data
 */
const validateCustomer = (req: any, res: any, next: any) => {
    try {
        customerSchema.parse(req.body);
        next();
    } catch (error: any) {
        res.status(400).json({
            success: false,
            error: 'Validation failed',
            details: error.errors || error.message,
        });
    }
};

/**
 * @route   GET /api/customers
 * @desc    Get all customers with pagination
 * @access  Public
 * @query   page, limit, search
 */
router.get('/', (req, res, next) => customerController.getAll(req, res, next));

/**
 * @route   GET /api/customers/:id
 * @desc    Get customer by ID
 * @access  Public
 */
router.get('/:id', (req, res, next) => customerController.getById(req, res, next));

/**
 * @route   POST /api/customers
 * @desc    Create a new customer
 * @access  Public
 * @body    { name, contactPerson?, email?, phone?, address? }
 */
router.post('/', validateCustomer, (req, res, next) => customerController.create(req, res, next));

/**
 * @route   PUT /api/customers/:id
 * @desc    Update a customer
 * @access  Public
 * @body    { name?, contactPerson?, email?, phone?, address? }
 */
router.put('/:id', validateCustomer, (req, res, next) => customerController.update(req, res, next));

/**
 * @route   DELETE /api/customers/:id
 * @desc    Delete a customer
 * @access  Public
 * @query   deleteRmas - whether to delete associated RMAs (true/false)
 */
router.delete('/:id', (req, res, next) => customerController.delete(req, res, next));

export default router;
