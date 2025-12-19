import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Rma, RmaStatus } from '../../types';
import { rmasApi } from '../api';
import { useAuth } from '../context/AuthContext';

export interface RmaFilters {
    searchTerm: string;
    statuses: RmaStatus[];
    customerId: string;
    dateFrom: string;
    dateTo: string;
}

/**
 * Custom hook for managing RMA state and operations
 */
export const useRmas = (initialPage: number = 1, initialLimit: number = 50) => {
    const { isAuthenticated } = useAuth();
    const [rmas, setRmas] = useState<Rma[]>([]);
    const [page, setPage] = useState(initialPage);
    const [limit] = useState(initialLimit);
    const [totalRmas, setTotalRmas] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [filters, setFilters] = useState<RmaFilters>({
        searchTerm: '',
        statuses: [],
        customerId: '',
        dateFrom: '',
        dateTo: '',
    });

    /**
     * Fetch RMAs from API
     */
    const fetchRmas = async () => {
        if (!isAuthenticated) return;

        setIsLoading(true);
        try {
            const response = await rmasApi.getAll(page, limit, {
                search: filters.searchTerm,
                status: filters.statuses.join(','),
                customerId: filters.customerId,
                dateFrom: filters.dateFrom,
                dateTo: filters.dateTo,
            });

            if (response.data) {
                setRmas(response.data);
                setTotalRmas(response.pagination?.total || 0);
            }
        } catch (error) {
            console.error('Failed to fetch RMAs:', error);
            toast.error('Failed to load RMAs');
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Create a new RMA
     */
    const createRma = async (rmaData: any): Promise<Rma | null> => {
        try {
            const response = await rmasApi.create(rmaData);
            const savedRma = response.data;

            if (!savedRma) {
                throw new Error('No RMA data returned');
            }

            // Add to local state
            setRmas(prevRmas => [savedRma, ...prevRmas]);
            setTotalRmas(prev => prev + 1);

            toast.success('RMA created successfully');
            return savedRma;
        } catch (error) {
            console.error('Error creating RMA:', error);
            toast.error('Failed to create RMA');
            return null;
        }
    };

    /**
     * Update an existing RMA
     */
    const updateRma = async (id: string, rmaData: any): Promise<Rma | null> => {
        try {
            const response = await rmasApi.update(id, rmaData);
            const savedRma = response.data;

            if (!savedRma) {
                throw new Error('No RMA data returned');
            }

            // Update in local state
            setRmas(rmas.map(r => r.id === id ? savedRma : r));

            toast.success('RMA updated successfully');
            return savedRma;
        } catch (error) {
            console.error('Error updating RMA:', error);
            toast.error('Failed to update RMA');
            return null;
        }
    };

    /**
     * Delete an RMA
     */
    const deleteRma = async (id: string): Promise<boolean> => {
        try {
            await rmasApi.delete(id);

            // Remove from local state
            setRmas(rmas.filter(r => r.id !== id));
            setTotalRmas(prev => prev - 1);

            toast.success('RMA deleted');
            return true;
        } catch (error) {
            console.error('Error deleting RMA:', error);
            toast.error('Failed to delete RMA');
            return false;
        }
    };

    /**
     * Update RMA status
     */
    const updateStatus = async (
        rmaId: string,
        deviceSerialNumber: string,
        newStatus: RmaStatus,
        notes: string
    ): Promise<boolean> => {
        try {
            const response = await rmasApi.updateStatus(rmaId, {
                deviceSerialNumber,
                newStatus,
                notes
            });

            const { lastUpdateDate } = response.data;

            // Update local state
            setRmas(prevRmas => prevRmas.map(rma => {
                if (rma.id !== rmaId) return rma;

                const updatedRma = { ...rma, lastUpdateDate };

                updatedRma.serviceCycles = rma.serviceCycles.map(cycle => {
                    if (cycle.deviceSerialNumber !== deviceSerialNumber) return cycle;

                    const updatedCycle = { ...cycle, status: newStatus, statusDate: new Date().toISOString() };
                    updatedCycle.history = [...cycle.history, { status: newStatus, date: new Date().toISOString(), notes }];
                    return updatedCycle;
                });

                return updatedRma;
            }));

            toast.success('RMA Status updated');
            return true;
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Failed to update status');
            return false;
        }
    };

    /**
     * Auto-fetch RMAs when page or filters change
     */
    useEffect(() => {
        if (isAuthenticated) {
            fetchRmas();
        }
    }, [page, limit, filters, isAuthenticated]);

    return {
        // State
        rmas,
        page,
        limit,
        totalRmas,
        filters,
        isLoading,

        // Actions
        fetchRmas,
        createRma,
        updateRma,
        deleteRma,
        updateStatus,
        setPage,
        setFilters,
        setRmas,
    };
};
