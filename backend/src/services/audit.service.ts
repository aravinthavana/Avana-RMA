import { PrismaClient } from '@prisma/client';
import logger from '../logger';

const prisma = new PrismaClient();

export enum AuditAction {
    LOGIN = 'LOGIN',
    LOGOUT = 'LOGOUT',
    CREATE = 'CREATE',
    UPDATE = 'UPDATE',
    DELETE = 'DELETE',
    VIEW = 'VIEW'
}

export enum AuditEntity {
    USER = 'USER',
    CUSTOMER = 'CUSTOMER',
    RMA = 'RMA',
    SYSTEM = 'SYSTEM'
}

interface CreateAuditLogParams {
    userId: string;
    action: string;
    entity: string;
    entityId?: string;
    details?: string | object;
    ipAddress?: string;
}

/**
 * Service to handle audit logging operations
 */
export const auditService = {
    /**
     * persistent log entry creation
     */
    log: async (params: CreateAuditLogParams) => {
        try {
            const { userId, action, entity, entityId, details, ipAddress } = params;

            const detailsString = typeof details === 'object' ? JSON.stringify(details) : details;

            await prisma.auditLog.create({
                data: {
                    userId,
                    action,
                    entity,
                    entityId,
                    details: detailsString,
                    ipAddress
                }
            });

            logger.info(`[Audit] ${action} on ${entity} by ${userId}`);
        } catch (error) {
            // We don't want audit logging failure to crash the request, but we must log it
            logger.error('Failed to create audit log entry:', error);
        }
    },

    /**
     * Fetch audit logs with pagination and filtering
     */
    getLogs: async (limit: number = 50, offset: number = 0, filters: { userId?: string, action?: string, entity?: string } = {}) => {
        const whereClause: any = {};

        if (filters.userId) whereClause.userId = filters.userId;
        if (filters.action) whereClause.action = filters.action;
        if (filters.entity) whereClause.entity = filters.entity;

        const [logs, total] = await Promise.all([
            prisma.auditLog.findMany({
                where: whereClause,
                take: limit,
                skip: offset,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: {
                        select: { name: true, email: true }
                    }
                }
            }),
            prisma.auditLog.count({ where: whereClause })
        ]);

        return { logs, total };
    }
};
