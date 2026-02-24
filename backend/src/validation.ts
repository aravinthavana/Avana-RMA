import { z } from 'zod';

// Customer validation schema
export const customerSchema = z.object({
    name: z.string().min(1, 'Company name is required').max(255, 'Company name is too long'),
    contactPerson: z.string().max(255, 'Contact person name is too long').optional(),
    email: z.string().email('Invalid email format').max(255, 'Email is too long').optional(),
    phone: z.string().max(50, 'Phone number is too long').optional(),
    address: z.string().max(500, 'Address is too long').optional(),
});

// Device validation schema
export const deviceSchema = z.object({
    articleNumber: z.string().max(255, 'Article number is too long').optional(),
    serialNumber: z.string().min(1, 'Serial/Lot number is required').max(255, 'Serial number is too long'),
    quantity: z.number().int('Quantity must be an integer').min(1, 'Quantity must be at least 1').max(10000, 'Quantity is too large'),
});

// Service cycle validation schema
export const serviceCycleSchema = z.object({
    deviceSerialNumber: z.string().min(1, 'Device serial number is required'),
    status: z.string().min(1, 'Status is required'),
    issueDescription: z.string().min(1, 'Issue description is required').max(2000, 'Issue description is too long'),
    accessoriesIncluded: z.string().max(1000, 'Accessories description is too long').optional(),
    creationDate: z.string().optional(),
    statusDate: z.string().optional(),
    history: z.array(z.object({
        status: z.string(),
        date: z.string(),
        notes: z.string(),
    })).optional(),
});

// RMA creation validation schema
export const createRmaSchema = z.object({
    customer: z.object({
        id: z.string().min(1, 'Customer ID is required'),
    }),
    devices: z.array(deviceSchema).min(1, 'At least one device is required').max(50, 'Too many devices'),
    dateOfIncident: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
    dateOfReport: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
    isInjuryRelated: z.boolean().optional(),
    injuryDetails: z.string().max(2000, 'Injury details are too long').optional(),
    attachment: z.string().max(500, 'Attachment path is too long').optional(),
});

// RMA update validation schema
export const updateRmaSchema = z.object({
    customer: z.object({
        id: z.string().min(1, 'Customer ID is required'),
    }),
    devices: z.array(deviceSchema).min(1, 'At least one device is required').max(50, 'Too many devices'),
    serviceCycles: z.array(serviceCycleSchema).min(1, 'At least one service cycle is required'),
    dateOfIncident: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
    dateOfReport: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
    isInjuryRelated: z.boolean().optional(),
    injuryDetails: z.string().max(2000, 'Injury details are too long').optional(),
    attachment: z.string().max(500, 'Attachment path is too long').optional(),
});

// Status update validation schema
export const statusUpdateSchema = z.object({
    deviceSerialNumber: z.string().min(1, 'Device serial number is required'),
    newStatus: z.string().min(1, 'New status is required'),
    notes: z.string().min(1, 'Notes are required').max(2000, 'Notes are too long'),
});
