import prisma from '../lib/prisma';
import { Prisma } from '@prisma/client';

export class TestReportRepository {
    async create(data: Prisma.TestReportUncheckedCreateInput) {
        return await prisma.testReport.create({
            data,
            include: {
                serviceCycle: {
                    include: {
                        rma: true
                    }
                }
            }
        });
    }

    async update(id: string, data: Prisma.TestReportUncheckedUpdateInput) {
        return await prisma.testReport.update({
            where: { id },
            data,
            include: {
                serviceCycle: {
                    include: {
                        rma: true
                    }
                }
            }
        });
    }

    async findById(id: string) {
        return await prisma.testReport.findUnique({
            where: { id },
            include: {
                serviceCycle: {
                    include: {
                        rma: true
                    }
                }
            }
        });
    }

    async findByServiceCycleId(serviceCycleId: number) {
        return await prisma.testReport.findUnique({
            where: { serviceCycleId },
            include: {
                serviceCycle: {
                    include: {
                        rma: true
                    }
                }
            }
        });
    }

    async delete(id: string) {
        return await prisma.testReport.delete({
            where: { id }
        });
    }
}
