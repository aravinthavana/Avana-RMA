import { apiClient, ApiResponse } from './client';

export interface TestEquipment {
    id: string;
    name: string;
}

export interface TestStep {
    stepNo: number;
    name: string;
    criterion: string;
    isOk: boolean;
}

export interface TestReport {
    id: string;
    serviceCycleId: number;
    testDate: string;
    deviceType: string;
    manufacturer: string;
    performedBy: string;
    testerName: string;
    kindOfTest: string;
    equipmentUsed: TestEquipment[];
    testSteps: TestStep[];
    overallAssessment?: string;
    overallResult: string;
    copyPrintedBy?: string;
    reportNo?: string;
}

export type CreateTestReportData = Omit<TestReport, 'id'>;

export const testReportsApi = {
    getByServiceCycleId: async (serviceCycleId: number): Promise<ApiResponse<TestReport>> => {
        const response = await apiClient.get<TestReport>(`/api/test-reports/service-cycle/${serviceCycleId}`);
        return response;
    },

    create: async (data: CreateTestReportData): Promise<ApiResponse<TestReport>> => {
        const response = await apiClient.post<TestReport>('/api/test-reports', data);
        return response;
    },

    update: async (id: string, data: Partial<CreateTestReportData>): Promise<ApiResponse<TestReport>> => {
        const response = await apiClient.put<TestReport>(`/api/test-reports/${id}`, data);
        return response;
    },

    delete: async (id: string): Promise<ApiResponse<void>> => {
        const response = await apiClient.delete<void>(`/api/test-reports/${id}`);
        return response;
    }
};
