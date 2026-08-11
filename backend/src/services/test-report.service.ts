import { TestReportRepository } from '../repositories/test-report.repository';
import { RmaRepository } from '../repositories/rma.repository';
import { Prisma } from '@prisma/client';

export class TestReportService {
    private testReportRepo: TestReportRepository;
    private rmaRepo: RmaRepository;

    constructor() {
        this.testReportRepo = new TestReportRepository();
        this.rmaRepo = new RmaRepository();
    }

    async createReport(serviceCycleId: number, data: Omit<Prisma.TestReportUncheckedCreateInput, 'serviceCycleId' | 'id'>) {
        if (!serviceCycleId) {
            throw new Error('Service Cycle ID is required');
        }

        // Check if report already exists for this cycle
        const existing = await this.testReportRepo.findByServiceCycleId(serviceCycleId);
        if (existing) {
            throw new Error('Test Report already exists for this service cycle');
        }

        const createData: Prisma.TestReportUncheckedCreateInput = {
            ...data,
            serviceCycleId
        };

        return await this.testReportRepo.create(createData);
    }

    async getReportByServiceCycleId(serviceCycleId: number) {
        if (!serviceCycleId) {
            throw new Error('Service Cycle ID is required');
        }

        const report = await this.testReportRepo.findByServiceCycleId(serviceCycleId);
        if (!report) {
            throw new Error(`Test report not found for service cycle ${serviceCycleId}`);
        }
        return report;
    }

    async getReportById(id: string) {
        if (!id) {
            throw new Error('Report ID is required');
        }

        const report = await this.testReportRepo.findById(id);
        if (!report) {
            throw new Error(`Test report not found with id ${id}`);
        }
        return report;
    }

    async updateReport(id: string, data: Omit<Prisma.TestReportUncheckedUpdateInput, 'serviceCycleId' | 'id'>) {
        if (!id) {
            throw new Error('Report ID is required');
        }

        // Ensure exists
        await this.getReportById(id);

        return await this.testReportRepo.update(id, data);
    }

    async deleteReport(id: string) {
        if (!id) {
            throw new Error('Report ID is required');
        }

        await this.getReportById(id);

        return await this.testReportRepo.delete(id);
    }
}
