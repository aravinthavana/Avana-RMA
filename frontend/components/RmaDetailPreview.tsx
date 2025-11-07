import React from 'react';
import { Rma } from '../types';

interface RmaDetailPreviewProps {
    rma: Rma;
}

// This component seems to be unused, RmaPreviewModal is used instead for previews.
// Creating a basic placeholder.
const RmaDetailPreview: React.FC<RmaDetailPreviewProps> = ({ rma }) => {
    return (
        <div className="p-4 border border-dashed border-slate-300 rounded-md">
            <h2 className="font-bold text-lg">RMA Detail Preview (Placeholder)</h2>
            <p>ID: {rma.id}</p>
            <p>Customer: {rma.customer.name}</p>
        </div>
    );
}

export default RmaDetailPreview;
