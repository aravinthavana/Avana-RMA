import React, { createContext, useContext, ReactNode } from 'react';
import { useRmas } from '../hooks/useRmas';
import { Rma } from '../../types';

// Return type of useRmas hook
type UseRmasReturnType = ReturnType<typeof useRmas>;

const RmaContext = createContext<UseRmasReturnType | undefined>(undefined);

export const RmaProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const rmaData = useRmas(1, 10); // Default pagination

    return (
        <RmaContext.Provider value={rmaData}>
            {children}
        </RmaContext.Provider>
    );
};

export const useRmaContext = () => {
    const context = useContext(RmaContext);
    if (context === undefined) {
        throw new Error('useRmaContext must be used within a RmaProvider');
    }
    return context;
};
