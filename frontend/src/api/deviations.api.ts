import { ValidationDeviation, SignerUser } from '../../types';

const API_BASE = '/api/deviations';

export interface DeviationsFilterParams {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    protocolPortion?: string;
    startDate?: string;
    endDate?: string;
}

export interface DeviationsResponse {
    success: boolean;
    data: ValidationDeviation[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

const getAuthHeaders = () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
};

export const deviationsApi = {
    async getAll(params: DeviationsFilterParams = {}): Promise<DeviationsResponse> {
        const query = new URLSearchParams();
        if (params.page) query.set('page', params.page.toString());
        if (params.limit) query.set('limit', params.limit.toString());
        if (params.search) query.set('search', params.search);
        if (params.status && params.status !== 'ALL') query.set('status', params.status);
        if (params.protocolPortion && params.protocolPortion !== 'ALL') query.set('protocolPortion', params.protocolPortion);
        if (params.startDate) query.set('startDate', params.startDate);
        if (params.endDate) query.set('endDate', params.endDate);

        const res = await fetch(`${API_BASE}?${query.toString()}`, {
            headers: getAuthHeaders(),
        });
        if (!res.ok) throw new Error('Failed to fetch deviations');
        return res.json();
    },

    async getById(id: string): Promise<{ success: boolean; data: ValidationDeviation }> {
        const res = await fetch(`${API_BASE}/${id}`, {
            headers: getAuthHeaders(),
        });
        if (!res.ok) throw new Error('Failed to fetch deviation');
        return res.json();
    },

    async getNextNumber(): Promise<string> {
        const res = await fetch(`${API_BASE}/next-number`, {
            headers: getAuthHeaders(),
        });
        if (!res.ok) throw new Error('Failed to get next number');
        const json = await res.json();
        return json.data.nextNumber;
    },

    async getSigners(): Promise<SignerUser[]> {
        const res = await fetch(`${API_BASE}/signers`, {
            headers: getAuthHeaders(),
        });
        if (!res.ok) throw new Error('Failed to fetch signers');
        const json = await res.json();
        return json.data;
    },

    async create(data: Partial<ValidationDeviation>): Promise<{ success: boolean; data: ValidationDeviation }> {
        const res = await fetch(API_BASE, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(data),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Failed to create deviation');
        return json;
    },

    async update(id: string, data: Partial<ValidationDeviation>): Promise<{ success: boolean; data: ValidationDeviation }> {
        const res = await fetch(`${API_BASE}/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(data),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Failed to update deviation');
        return json;
    },

    async delete(id: string): Promise<{ success: boolean; message: string }> {
        const res = await fetch(`${API_BASE}/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Failed to delete deviation');
        return json;
    },

    async sign(id: string, signPayload: { role: string; signerName: string; signatureUrl: string; date?: string }): Promise<{ success: boolean; data: ValidationDeviation }> {
        const res = await fetch(`${API_BASE}/${id}/sign`, {
            method: 'PATCH',
            headers: getAuthHeaders(),
            body: JSON.stringify(signPayload),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Failed to sign deviation');
        return json;
    },

    async uploadAttachment(file: File): Promise<string> {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch(`${API_BASE}/upload`, {
            method: 'POST',
            headers: {
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: formData,
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Failed to upload file');
        return json.data.url;
    },

    async downloadExcel(params: DeviationsFilterParams = {}, selectedIds?: string[]): Promise<void> {
        const query = new URLSearchParams();
        if (params.search) query.set('search', params.search);
        if (params.status && params.status !== 'ALL') query.set('status', params.status);
        if (params.protocolPortion && params.protocolPortion !== 'ALL') query.set('protocolPortion', params.protocolPortion);
        if (params.startDate) query.set('startDate', params.startDate);
        if (params.endDate) query.set('endDate', params.endDate);
        if (selectedIds && selectedIds.length > 0) query.set('ids', selectedIds.join(','));

        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const res = await fetch(`${API_BASE}/export/excel?${query.toString()}`, {
            headers: {
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
        });

        if (!res.ok) throw new Error('Failed to download Excel file');

        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Validation_Deviations_${new Date().toISOString().slice(0, 10)}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    },
};
