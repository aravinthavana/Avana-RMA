import React, { createContext, useContext, ReactNode } from 'react';
import { useCustomers } from '../hooks/useCustomers';
import { Customer } from '../../types';

// Return type of useCustomers hook
type UseCustomersReturnType = ReturnType<typeof useCustomers>;

const CustomerContext = createContext<UseCustomersReturnType | undefined>(undefined);

export const CustomerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const customerData = useCustomers(1, 10); // Default pagination

    return (
        <CustomerContext.Provider value={customerData}>
            {children}
        </CustomerContext.Provider>
    );
};

export const useCustomerContext = () => {
    const context = useContext(CustomerContext);
    if (context === undefined) {
        throw new Error('useCustomerContext must be used within a CustomerProvider');
    }
    return context;
};
