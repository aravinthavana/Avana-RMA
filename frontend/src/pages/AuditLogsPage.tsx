import React, { useState, useEffect } from 'react';
import { AuditLog } from '../../types';
import { auditApi } from '../api/audit.api';
import { RefreshCw, Filter, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import toast from 'react-hot-toast';

const AuditLogsPage: React.FC = () => {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [limit] = useState(20);
    const [total, setTotal] = useState(0);

    // Filters
    const [actionFilter, setActionFilter] = useState('');
    const [entityFilter, setEntityFilter] = useState('');

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const response = await auditApi.getAll({
                page,
                limit,
                action: actionFilter || undefined,
                entity: entityFilter || undefined
            });

            setLogs(response.data);
            setTotalPages(response.pagination.totalPages);
            setTotal(response.pagination.total);
        } catch (error) {
            console.error('Failed to fetch logs', error);
            toast.error('Failed to load audit logs');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, [page, actionFilter, entityFilter]);

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPage(newPage);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString();
    };

    const formatDetails = (details?: string) => {
        if (!details) return '-';
        try {
            const parsed = JSON.parse(details);
            return (
                <pre className="w-full overflow-hidden text-xs bg-slate-100 p-2 rounded whitespace-pre-wrap break-all border border-slate-200">
                    {JSON.stringify(parsed, null, 2)}
                </pre>
            );
        } catch (e) {
            return <div className="text-sm text-slate-600 break-all" title={details}>{details}</div>;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                        System Audit Logs
                    </h1>
                    <p className="text-slate-500 mt-1">Track all system activities and security events</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={fetchLogs}
                        className="p-2 text-slate-600 hover:bg-white/50 rounded-lg transition-colors border border-slate-200"
                        title="Refresh"
                    >
                        <RefreshCw size={20} />
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="glass p-4 rounded-xl border border-white/20 shadow-sm flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2 text-slate-500">
                    <Filter size={18} />
                    <span className="text-sm font-medium">Filters:</span>
                </div>

                <select
                    className="bg-white/50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    value={actionFilter}
                    onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
                >
                    <option value="">All Actions</option>
                    <option value="LOGIN">Login</option>
                    <option value="CREATE">Create</option>
                    <option value="UPDATE">Update</option>
                    <option value="DELETE">Delete</option>
                </select>

                <select
                    className="bg-white/50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    value={entityFilter}
                    onChange={(e) => { setEntityFilter(e.target.value); setPage(1); }}
                >
                    <option value="">All Entities</option>
                    <option value="USER">User</option>
                    <option value="RMA">RMA</option>
                    <option value="CUSTOMER">Customer</option>
                </select>
            </div>

            {/* Mobile View (Cards) */}
            <div className="md:hidden space-y-4">
                {loading ? (
                    <div className="glass p-8 text-center text-slate-500 rounded-xl">
                        <div className="flex justify-center items-center gap-2">
                            <RefreshCw className="animate-spin" size={20} />
                            <span>Loading logs...</span>
                        </div>
                    </div>
                ) : logs.length === 0 ? (
                    <div className="glass p-8 text-center text-slate-500 rounded-xl">
                        No audit logs found matching your criteria.
                    </div>
                ) : (
                    logs.map((log) => (
                        <div key={log.id} className="glass p-4 rounded-xl border border-white/20 shadow-sm space-y-3">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-2">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${log.action === 'DELETE' ? 'bg-red-50 text-red-700 border-red-100' :
                                        log.action === 'CREATE' ? 'bg-green-50 text-green-700 border-green-100' :
                                            log.action === 'UPDATE' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                                'bg-blue-50 text-blue-700 border-blue-100'
                                        }`}>
                                        {log.action}
                                    </span>
                                    <span className="text-xs text-slate-500">{formatDate(log.createdAt)}</span>
                                </div>
                            </div>

                            <div>
                                <div className="text-sm font-medium text-slate-800">{log.user?.name || 'Unknown'}</div>
                                <div className="text-xs text-slate-500">{log.user?.email || log.userId}</div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-sm border-t border-slate-100 pt-2">
                                <div>
                                    <span className="text-xs text-slate-500 block">Entity</span>
                                    <span className="text-slate-700">{log.entity}</span>
                                    {log.entityId && <span className="text-xs text-slate-400 font-mono block">#{log.entityId.slice(0, 8)}</span>}
                                </div>
                                <div>
                                    <span className="text-xs text-slate-500 block">IP</span>
                                    <span className="text-slate-700 font-mono">{log.ipAddress || '-'}</span>
                                </div>
                            </div>

                            <div className="bg-slate-50 p-2 rounded text-xs border border-slate-100">
                                <span className="text-slate-500 block mb-1">Details:</span>
                                {formatDetails(log.details)}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Desktop View (Table) */}
            <div className="hidden md:block glass rounded-xl border border-white/20 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full table-fixed">
                        <thead className="bg-slate-50/50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider w-40">Time</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider w-48">User</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider w-32">Action</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider w-40">Entity</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider w-auto">Details</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider w-36">IP Address</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                        <div className="flex justify-center items-center gap-2">
                                            <RefreshCw className="animate-spin" size={20} />
                                            <span>Loading logs...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                                        No audit logs found matching your criteria.
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log) => (
                                    <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 text-sm text-slate-600 align-top">
                                            {formatDate(log.createdAt)}
                                        </td>
                                        <td className="px-6 py-4 align-top">
                                            <div className="text-sm font-medium text-slate-800 truncate" title={log.user?.name}>{log.user?.name || 'Unknown'}</div>
                                            <div className="text-xs text-slate-500 truncate" title={log.user?.email || log.userId}>{log.user?.email || log.userId}</div>
                                        </td>
                                        <td className="px-6 py-4 align-top">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${log.action === 'DELETE' ? 'bg-red-50 text-red-700 border-red-100' :
                                                log.action === 'CREATE' ? 'bg-green-50 text-green-700 border-green-100' :
                                                    log.action === 'UPDATE' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                                        'bg-blue-50 text-blue-700 border-blue-100'
                                                }`}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600 align-top">
                                            <div className="font-medium truncate" title={log.entity}>{log.entity}</div>
                                            {log.entityId && <div className="text-xs text-slate-400 font-mono mt-0.5 truncate" title={log.entityId}>#{log.entityId.slice(0, 8)}</div>}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600 align-top">
                                            {formatDetails(log.details)}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500 font-mono align-top truncate" title={log.ipAddress}>
                                            {log.ipAddress || '-'}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination (Shared) */}
            {!loading && logs.length > 0 && (
                <div className="glass rounded-xl border border-white/20 shadow-sm px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="text-sm text-slate-500 text-center sm:text-left">
                        Showing <span className="font-medium">{((page - 1) * limit) + 1}</span> to <span className="font-medium">{Math.min(page * limit, total)}</span> of <span className="font-medium">{total}</span> results
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => handlePageChange(page - 1)}
                            disabled={page === 1}
                            className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-white/50"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <span className="px-3 py-2 text-sm font-medium text-slate-600 bg-white/50 border border-slate-200 rounded-lg">
                            Page {page} of {totalPages}
                        </span>
                        <button
                            onClick={() => handlePageChange(page + 1)}
                            disabled={page === totalPages}
                            className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-white/50"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AuditLogsPage;
