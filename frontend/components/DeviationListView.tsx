import React, { useState, useEffect, useMemo } from 'react';
import { pdf } from '@react-pdf/renderer';
import JSZip from 'jszip';
import { ValidationDeviation, ProtocolPortionType, DeviationStatusType } from '../types';
import { deviationsApi, DeviationsFilterParams } from '../src/api/deviations.api';
import { ValidationDeviationPdfDocument } from './ValidationDeviationPdfDocument';
import { DeviationFormModal } from './DeviationFormModal';
import { useAuth } from '../src/context/AuthContext';
import toast from 'react-hot-toast';

export const DeviationListView: React.FC = () => {
    const { user } = useAuth();

    // Data state
    const [deviations, setDeviations] = useState<ValidationDeviation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const limit = 15;

    // Filter state
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('ALL');
    const [portionFilter, setPortionFilter] = useState<string>('ALL');

    // Selection state for bulk operations
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isExportingExcel, setIsExportingExcel] = useState(false);
    const [isExportingPdf, setIsExportingPdf] = useState(false);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDeviation, setEditingDeviation] = useState<ValidationDeviation | undefined>(undefined);

    // Load Deviations
    const fetchDeviations = async () => {
        setIsLoading(true);
        try {
            const params: DeviationsFilterParams = {
                page,
                limit,
                search: search.trim() || undefined,
                status: statusFilter !== 'ALL' ? statusFilter : undefined,
                protocolPortion: portionFilter !== 'ALL' ? portionFilter : undefined,
            };
            const res = await deviationsApi.getAll(params);
            setDeviations(res.data);
            setTotal(res.pagination.total);
        } catch (error: any) {
            toast.error(error.message || 'Failed to load deviations');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDeviations();
    }, [page, statusFilter, portionFilter]);

    // Handle Search with debounce or Enter
    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        fetchDeviations();
    };

    // Selection handlers
    const isAllSelected = deviations.length > 0 && deviations.every(d => selectedIds.includes(d.id));

    const toggleSelectAll = () => {
        if (isAllSelected) {
            setSelectedIds([]);
        } else {
            setSelectedIds(deviations.map(d => d.id));
        }
    };

    const toggleSelectOne = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    // Delete handler
    const handleDelete = async (id: string, deviationNumber: string) => {
        if (!window.confirm(`Are you sure you want to delete deviation "${deviationNumber}"?`)) {
            return;
        }
        try {
            await deviationsApi.delete(id);
            toast.success(`Deviation ${deviationNumber} deleted`);
            setSelectedIds(prev => prev.filter(item => item !== id));
            fetchDeviations();
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete deviation');
        }
    };

    // Single PDF Download
    const handleDownloadPdf = async (deviation: ValidationDeviation) => {
        try {
            toast.loading(`Generating PDF for ${deviation.deviationNumber}...`, { id: 'pdf-toast' });
            const blob = await pdf(<ValidationDeviationPdfDocument deviation={deviation} />).toBlob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${deviation.deviationNumber}_FORM-SH001.pdf`;
            document.body.appendChild(a);
            a.click();
            URL.revokeObjectURL(url);
            document.body.removeChild(a);
            toast.success('PDF downloaded', { id: 'pdf-toast' });
        } catch (error: any) {
            toast.error(error.message || 'Failed to generate PDF', { id: 'pdf-toast' });
        }
    };

    // Bulk Excel Export
    const handleBulkExcelExport = async () => {
        setIsExportingExcel(true);
        try {
            const params: DeviationsFilterParams = {
                search: search.trim() || undefined,
                status: statusFilter !== 'ALL' ? statusFilter : undefined,
                protocolPortion: portionFilter !== 'ALL' ? portionFilter : undefined,
            };
            await deviationsApi.downloadExcel(params, selectedIds.length > 0 ? selectedIds : undefined);
            toast.success('Excel export generated successfully');
        } catch (error: any) {
            toast.error(error.message || 'Failed to export Excel');
        } finally {
            setIsExportingExcel(false);
        }
    };

    // Bulk PDF Export (ZIP)
    const handleBulkPdfExport = async () => {
        const itemsToExport = selectedIds.length > 0
            ? deviations.filter(d => selectedIds.includes(d.id))
            : deviations;

        if (itemsToExport.length === 0) {
            toast.error('No deviations found to export');
            return;
        }

        setIsExportingPdf(true);
        toast.loading(`Generating ${itemsToExport.length} PDFs into ZIP...`, { id: 'zip-toast' });

        try {
            const zip = new JSZip();

            for (const dev of itemsToExport) {
                const blob = await pdf(<ValidationDeviationPdfDocument deviation={dev} />).toBlob();
                zip.file(`${dev.deviationNumber}_FORM-SH001.pdf`, blob);
            }

            const zipContent = await zip.generateAsync({ type: 'blob' });
            const url = URL.createObjectURL(zipContent);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Validation_Deviations_${new Date().toISOString().slice(0, 10)}.zip`;
            document.body.appendChild(a);
            a.click();
            URL.revokeObjectURL(url);
            document.body.removeChild(a);

            toast.success(`Successfully exported ${itemsToExport.length} PDFs as ZIP!`, { id: 'zip-toast' });
        } catch (error: any) {
            toast.error(error.message || 'Failed to generate bulk PDFs', { id: 'zip-toast' });
        } finally {
            setIsExportingPdf(false);
        }
    };

    // Color-coded status badge
    const renderStatusBadge = (status: DeviationStatusType) => {
        switch (status) {
            case 'DRAFT':
                return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800 border border-slate-300">Draft</span>;
            case 'UNDER_INVESTIGATION':
                return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800 border border-amber-300">Under Investigation</span>;
            case 'PENDING_APPROVAL':
                return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 border border-purple-300">Pending Approval</span>;
            case 'APPROVED':
                return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 border border-blue-300">Approved</span>;
            case 'CLOSED':
                return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-300">Closed</span>;
            default:
                return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">{status}</span>;
        }
    };

    const totalPages = Math.ceil(total / limit) || 1;

    return (
        <div className="space-y-6">
            {/* Header / Banner */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-primary-500/20">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                                Validation Deviation Forms
                                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                                    Doc: FORM-SH001
                                </span>
                            </h1>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Document, investigate, and approve equipment & process validation deviations
                            </p>
                        </div>
                    </div>
                </div>

                {/* Primary Action Buttons */}
                <div className="flex items-center gap-2.5 flex-wrap">
                    <button
                        onClick={handleBulkExcelExport}
                        disabled={isExportingExcel}
                        className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-all shadow-sm disabled:opacity-50"
                        title="Export filtered deviations to Excel spreadsheet"
                    >
                        <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        {isExportingExcel ? 'Exporting...' : 'Export Excel (.xlsx)'}
                    </button>

                    <button
                        onClick={handleBulkPdfExport}
                        disabled={isExportingPdf}
                        className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-indigo-800 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl transition-all shadow-sm disabled:opacity-50"
                        title="Download selected deviations in a single ZIP archive"
                    >
                        <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        {isExportingPdf ? 'Zipping...' : 'Bulk PDF (ZIP)'}
                    </button>

                    <button
                        onClick={() => {
                            setEditingDeviation(undefined);
                            setIsModalOpen(true);
                        }}
                        className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-xl shadow-sm shadow-primary-500/20 transition-all"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        New Deviation Form
                    </button>
                </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200/80 flex flex-col md:flex-row items-center justify-between gap-3">
                <form onSubmit={handleSearchSubmit} className="flex-1 w-full md:w-auto flex items-center gap-2">
                    <div className="relative flex-1">
                        <input
                            type="text"
                            placeholder="Search by Deviation #, test section, observer..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                        <svg className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <button
                        type="submit"
                        className="px-3.5 py-2 bg-slate-800 text-white text-xs font-semibold rounded-lg hover:bg-slate-700 transition-colors"
                    >
                        Search
                    </button>
                </form>

                <div className="flex items-center gap-2 w-full md:w-auto">
                    {/* Portion Filter */}
                    <select
                        value={portionFilter}
                        onChange={e => {
                            setPortionFilter(e.target.value);
                            setPage(1);
                        }}
                        className="text-xs px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-700 font-medium focus:ring-2 focus:ring-primary-500"
                    >
                        <option value="ALL">All Portions (IQ/OQ/PQ)</option>
                        <option value="IQ">IQ (Installation)</option>
                        <option value="OQ">OQ (Operational)</option>
                        <option value="PQ">PQ (Performance)</option>
                        <option value="OTHER">Other</option>
                    </select>

                    {/* Status Filter */}
                    <select
                        value={statusFilter}
                        onChange={e => {
                            setStatusFilter(e.target.value);
                            setPage(1);
                        }}
                        className="text-xs px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-700 font-medium focus:ring-2 focus:ring-primary-500"
                    >
                        <option value="ALL">All Statuses</option>
                        <option value="DRAFT">Draft</option>
                        <option value="UNDER_INVESTIGATION">Under Investigation</option>
                        <option value="PENDING_APPROVAL">Pending Approval</option>
                        <option value="APPROVED">Approved</option>
                        <option value="CLOSED">Closed</option>
                    </select>
                </div>
            </div>

            {/* Selected Toolbar Notice */}
            {selectedIds.length > 0 && (
                <div className="p-3 bg-primary-50 border border-primary-200 rounded-xl flex items-center justify-between text-xs text-primary-900">
                    <div className="flex items-center gap-2">
                        <span className="font-bold">{selectedIds.length}</span> deviation(s) selected
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleBulkExcelExport}
                            className="px-2.5 py-1 bg-white font-semibold rounded border border-primary-300 text-primary-700 hover:bg-primary-100"
                        >
                            Export Selected Excel
                        </button>
                        <button
                            onClick={handleBulkPdfExport}
                            className="px-2.5 py-1 bg-white font-semibold rounded border border-primary-300 text-primary-700 hover:bg-primary-100"
                        >
                            Download Selected ZIP
                        </button>
                        <button
                            onClick={() => setSelectedIds([])}
                            className="px-2.5 py-1 text-slate-500 hover:text-slate-800"
                        >
                            Deselect All
                        </button>
                    </div>
                </div>
            )}

            {/* Data Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50/80 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                            <tr>
                                <th className="p-3 w-10 text-center">
                                    <input
                                        type="checkbox"
                                        checked={isAllSelected}
                                        onChange={toggleSelectAll}
                                        className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                                    />
                                </th>
                                <th className="p-3">Deviation #</th>
                                <th className="p-3">Protocol</th>
                                <th className="p-3">Test Section</th>
                                <th className="p-3">Observed By</th>
                                <th className="p-3">Date Observed</th>
                                <th className="p-3 text-center">Resolved?</th>
                                <th className="p-3">Status</th>
                                <th className="p-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={9} className="p-8 text-center text-slate-400">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
                                            Loading deviations...
                                        </div>
                                    </td>
                                </tr>
                            ) : deviations.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="p-12 text-center text-slate-400">
                                        <p className="font-semibold text-slate-600 mb-1">No deviations recorded yet</p>
                                        <p className="text-[11px]">Click "New Deviation Form" to create the first entry for FORM-SH001.</p>
                                    </td>
                                </tr>
                            ) : (
                                deviations.map(d => {
                                    const isSelected = selectedIds.includes(d.id);
                                    return (
                                        <tr
                                            key={d.id}
                                            className={`hover:bg-slate-50/80 transition-colors ${isSelected ? 'bg-primary-50/40' : ''}`}
                                        >
                                            <td className="p-3 text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => toggleSelectOne(d.id)}
                                                    className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                                                />
                                            </td>
                                            <td className="p-3 font-mono font-bold text-primary-700">
                                                {d.deviationNumber}
                                            </td>
                                            <td className="p-3 font-semibold text-slate-700">
                                                <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                                                    {d.protocolPortion === 'OTHER' ? (d.protocolPortionCustom || 'Other') : d.protocolPortion}
                                                </span>
                                            </td>
                                            <td className="p-3 font-medium text-slate-900 max-w-[200px] truncate" title={d.testSection}>
                                                {d.testSection}
                                            </td>
                                            <td className="p-3 text-slate-700">
                                                {d.observedByName}
                                            </td>
                                            <td className="p-3 text-slate-500">
                                                {d.dateObserved ? new Date(d.dateObserved).toLocaleDateString('en-GB') : '-'}
                                            </td>
                                            <td className="p-3 text-center">
                                                {d.isResolved ? (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                                        YES
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                                                        NO
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-3">
                                                {renderStatusBadge(d.status)}
                                            </td>
                                            <td className="p-3 text-right whitespace-nowrap">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <button
                                                        onClick={() => handleDownloadPdf(d)}
                                                        className="px-2.5 py-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200 transition-colors"
                                                        title="Download FORM-SH001 PDF"
                                                    >
                                                        PDF
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setEditingDeviation(d);
                                                            setIsModalOpen(true);
                                                        }}
                                                        className="px-2.5 py-1 text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                                                    >
                                                        Edit
                                                    </button>
                                                    {(user?.isAdmin || user?.role === 'ADMIN') && (
                                                        <button
                                                            onClick={() => handleDelete(d.id, d.deviationNumber)}
                                                            className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors"
                                                            title="Delete Deviation"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="p-4 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
                    <div>
                        Showing {deviations.length} of {total} deviation(s)
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setPage(prev => Math.max(1, prev - 1))}
                            disabled={page <= 1}
                            className="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium"
                        >
                            Previous
                        </button>
                        <span className="font-semibold text-slate-700">
                            Page {page} of {totalPages}
                        </span>
                        <button
                            onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={page >= totalPages}
                            className="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>

            {/* Deviation Form Modal */}
            <DeviationFormModal
                isOpen={isModalOpen}
                deviationToEdit={editingDeviation}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => fetchDeviations()}
            />
        </div>
    );
};

export default DeviationListView;
