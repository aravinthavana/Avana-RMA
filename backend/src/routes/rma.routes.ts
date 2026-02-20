import { Router } from 'express';
import rmaController from '../controllers/rma.controller';
import { createRmaSchema, updateRmaSchema, statusUpdateSchema } from '../validation';
import authMiddleware from '../middleware/auth.middleware';
import { auditMiddleware } from '../middleware/audit.middleware';
import { AuditAction, AuditEntity } from '../services/audit.service';

const router = Router();

// Protect all routes
router.use(authMiddleware);

/**
 * Validation middleware for RMA creation
 */
const validateCreateRma = (req: any, res: any, next: any) => {
    try {
        createRmaSchema.parse(req.body);
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
 * Validation middleware for RMA update
 */
const validateUpdateRma = (req: any, res: any, next: any) => {
    try {
        updateRmaSchema.parse(req.body);
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
 * Validation middleware for status update
 */
const validateStatusUpdate = (req: any, res: any, next: any) => {
    try {
        statusUpdateSchema.parse(req.body);
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
 * @route   GET /api/rmas
 * @desc    Get all RMAs with pagination and filtering
 * @access  Public
 * @query   page, limit, search, status, customerId, dateFrom, dateTo
 */
router.get('/', (req, res, next) => rmaController.getAll(req, res, next));

/**
 * @route   GET /api/rmas/:id
 * @desc    Get RMA by ID with all relations
 * @access  Public
 */
router.get('/:id', (req, res, next) => rmaController.getById(req, res, next));

/**
 * @route   POST /api/rmas
 * @desc    Create a new RMA
 * @access  Public
 * @body    { customerId, devices[], serviceCycles[], dateOfIncident, dateOfReport, attachment? }
 */
router.post('/', validateCreateRma, auditMiddleware(AuditAction.CREATE, AuditEntity.RMA), (req, res, next) => rmaController.create(req, res, next));

/**
 * @route   PUT /api/rmas/:id
 * @desc    Update an RMA
 * @access  Public
 * @body    { dateOfIncident?, dateOfReport?, attachment? }
 */
router.put('/:id', validateUpdateRma, auditMiddleware(AuditAction.UPDATE, AuditEntity.RMA), (req, res, next) => rmaController.update(req, res, next));

/**
 * @route   DELETE /api/rmas/:id
 * @desc    Delete an RMA
 * @access  Public
 */
router.delete('/:id', auditMiddleware(AuditAction.DELETE, AuditEntity.RMA), (req, res, next) => rmaController.delete(req, res, next));

/**
 * @route   PATCH /api/rmas/:id/status
 * @desc    Update RMA service cycle status by device serial number
 * @access  Public
 * @body    { deviceSerialNumber, newStatus, notes? }
 */
router.patch('/:id/status', validateStatusUpdate, auditMiddleware(AuditAction.UPDATE, AuditEntity.RMA), (req, res, next) => rmaController.updateStatus(req, res, next));

/**
 * @route   POST /api/rmas/:id/cycles
 * @desc    Add a new service cycle to an existing RMA
 * @access  Public
 * @body    { deviceSerialNumber, status, issueDescription?, accessoriesIncluded? }
 */

router.post('/:id/cycles', auditMiddleware(AuditAction.UPDATE, AuditEntity.RMA), (req, res, next) => rmaController.addServiceCycle(req, res, next));

/**
 * @route   PUT /api/rmas/cycles/:cycleId/status
 * @desc    Update service cycle status
 * @access  Public
 * @body    { status, notes? }
 */
router.put('/cycles/:cycleId/status', validateStatusUpdate, auditMiddleware(AuditAction.UPDATE, AuditEntity.RMA), (req, res, next) => rmaController.updateCycleStatus(req, res, next));

export default router;
