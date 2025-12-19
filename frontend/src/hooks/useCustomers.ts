import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Customer } from '../../types';
import { customersApi } from '../api';

/**
 * Custom hook for managing customer state and operations
 */
export const useCustomers = (initialPage: number = 1, initialLimit: number = 10) => {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [page, setPage] = useState(initialPage);
    const [limit] = useState(initialLimit);
    const [totalCustomers, setTotalCustomers] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [lastCreatedCustomerId, setLastCreatedCustomerId] = useState<string | null>(null);

    /**
     * Fetch customers from API
     */
    const fetchCustomers = async () => {
        setIsLoading(true);
        try {
            const response = await customersApi.getAll(page, limit);

            if (response.data) {
                setCustomers(response.data);
                setTotalCustomers(response.pagination?.total || 0);
            }
        } catch (error) {
            console.error('Failed to fetch customers:', error);
            toast.error('Failed to load customers');
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Create a new customer
     */
    const createCustomer = async (customerData: Omit<Customer, 'id'>): Promise<Customer | null> => {
        try {
            const response = await customersApi.create(customerData);
            const savedCustomer = response.data;

            if (!savedCustomer) {
                throw new Error('No customer data returned');
            }

            // Add to local state
            setCustomers([savedCustomer, ...customers]);
            setTotalCustomers(prev => prev + 1);
            setLastCreatedCustomerId(savedCustomer.id);

            toast.success('Customer created');
            return savedCustomer;
        } catch (error) {
            console.error('Error creating customer:', error);
            toast.error('Failed to create customer');
            return null;
        }
    };

    /**
     * Update an existing customer
     */
    const updateCustomer = async (id: string, customerData: Omit<Customer, 'id'>): Promise<Customer | null> => {
        try {
            const response = await customersApi.update(id, customerData);
            const savedCustomer = response.data;

            if (!savedCustomer) {
                throw new Error('No customer data returned');
            }

            // Update in local state
            setCustomers(customers.map(c => c.id === id ? savedCustomer : c));

            toast.success('Customer updated');
            return savedCustomer;
        } catch (error) {
            console.error('Error updating customer:', error);
            toast.error('Failed to update customer');
            return null;
        }
    };

    /**
     * Delete a customer
     */
    const deleteCustomer = async (id: string, deleteRmas: boolean = false): Promise<boolean> => {
        try {
            await customersApi.delete(id, deleteRmas);

            // Remove from local state
            setCustomers(customers.filter(c => c.id !== id));
            setTotalCustomers(prev => prev - 1);

            toast.success(deleteRmas ? 'Customer and RMAs deleted' : 'Customer deleted');
            return true;
        } catch (error) {
            console.error('Error deleting customer:', error);
            toast.error('Failed to delete customer');
            return false;
        }
    };

    /**
     * Auto-fetch customers when page changes or showArchived toggles
     */
    useEffect(() => {
        fetchCustomers();
    }, [page, limit]);

    return {
        // State
        customers,
        page,
        limit,
        totalCustomers,
        isLoading,
        lastCreatedCustomerId,

        // Actions
        fetchCustomers,
        createCustomer,
        updateCustomer,
        deleteCustomer,
        setPage,
        setCustomers,
        setLastCreatedCustomerId,
    };
};
