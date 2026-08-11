import { Request, Response } from 'express';
import { TestReportService } from '../services/test-report.service';

const testReportService = new TestReportService();

export const createTestReport = async (req: Request, res: Response) => {
    try {
        const { serviceCycleId } = req.body;
        if (!serviceCycleId) {
            return res.status(400).json({ success: false, error: 'serviceCycleId is required' });
        }

        const report = await testReportService.createReport(Number(serviceCycleId), req.body);
        res.status(201).json({ success: true, data: report });
    } catch (error: any) {
        console.error('Error creating test report:', error);
        res.status(400).json({ success: false, error: error.message || 'Failed to create test report' });
    }
};

export const getTestReportByServiceCycleId = async (req: Request, res: Response) => {
    try {
        const { serviceCycleId } = req.params;
        const report = await testReportService.getReportByServiceCycleId(Number(serviceCycleId));
        res.status(200).json({ success: true, data: report });
    } catch (error: any) {
        console.error('Error fetching test report:', error);
        if (error.message.includes('not found')) {
            return res.status(404).json({ success: false, error: error.message });
        }
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

export const updateTestReport = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const report = await testReportService.updateReport(id, req.body);
        res.status(200).json({ success: true, data: report });
    } catch (error: any) {
        console.error('Error updating test report:', error);
        res.status(400).json({ success: false, error: error.message || 'Failed to update test report' });
    }
};

export const deleteTestReport = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await testReportService.deleteReport(id);
        res.status(200).json({ success: true, message: 'Test report deleted successfully' });
    } catch (error: any) {
        console.error('Error deleting test report:', error);
        res.status(400).json({ success: false, error: error.message || 'Failed to delete test report' });
    }
};
