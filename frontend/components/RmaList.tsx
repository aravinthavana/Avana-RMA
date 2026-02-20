import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Rma, RmaStatus, Customer } from '../types';
import { PlusIcon, FilterIcon, XMarkIcon, MagnifyingGlassIcon, ChevronRightIcon, PencilIcon, TrashIcon } from './icons';
import { RmaFilters } from '../src/hooks/useRmas';
import { motion, AnimatePresence } from 'framer-motion';
import { Skeleton } from '../src/components/ui/Skeleton';
import { useRmaContext } from '../src/context/RmaContext';
import { useCustomerContext } from '../src/context/CustomerContext';

/**
 * Props for the RmaList component.
 */
interface RmaListProps {
  onNewRma: () => void;
  onEditRma: (rma: Rma) => void;
}

/**
 * A utility function to get the Tailwind CSS classes for a status badge based on the RMA status.
 * @param status The status of the RMA.
 * @returns A string of CSS classes.
 */
export const getStatusBadgeColor = (status: RmaStatus) => {
  switch (status) {
    case RmaStatus.PENDING: return 'bg-yellow-100 text-yellow-800 ring-yellow-600/20';
    case RmaStatus.RECEIVED: return 'bg-blue-100 text-blue-800 ring-blue-600/20';
    case RmaStatus.IN_REPAIR: return 'bg-indigo-100 text-indigo-800 ring-indigo-600/20';
    case RmaStatus.REPAIRED: return 'bg-purple-100 text-purple-800 ring-purple-600/20';
    case RmaStatus.SHIPPED: return 'bg-green-100 text-green-800 ring-green-600/20';
    case RmaStatus.CLOSED: return 'bg-slate-100 text-slate-800 ring-slate-600/20';
    default: return 'bg-gray-100 text-gray-800 ring-gray-600/20';
  }
};

/**
 * Formats a date string into a dd-mm-yyyy format.
 * @param dateString The date string to format.
 * @returns The formatted date string.
 */
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

/**
 * Renders a list of RMAs with filtering and action controls.
 */
const RmaList: React.FC<RmaListProps> = ({ onNewRma, onEditRma }) => {
  const navigate = useNavigate();
  const { rmas, filters, setFilters, page, totalRmas, setPage, isLoading, deleteRma } = useRmaContext();
  const { customers } = useCustomerContext();

  const totalPages = Math.ceil(totalRmas / 10); // Assuming limit is 10, or get from context

  const updateFilters = (newFilters: RmaFilters) => setFilters(newFilters);

  const [showFilters, setShowFilters] = useState(false);

  /**
   * Toggles a status in the filter state.
   * @param status The status to toggle.
   */
  const handleStatusChange = (status: RmaStatus) => {
    const newStatuses = filters.statuses.includes(status)
      ? filters.statuses.filter(s => s !== status)
      : [...filters.statuses, status];
    setFilters({ ...filters, statuses: newStatuses });
  };

  /**
   * Clears all active filters.
   */
  const clearFilters = () => {
    setFilters({ searchTerm: '', statuses: [], customerId: '', dateFrom: '', dateTo: '' });
  };

  /**
   * Handles the click event for editing an RMA, preventing row selection.
   * @param e The mouse event.
   * @param rma The RMA to edit.
   */
  const handleEdit = (e: React.MouseEvent, rma: Rma) => {
    e.stopPropagation();
    onEditRma(rma);
  }

  /**
   * Handles the click event for deleting an RMA, preventing row selection and showing a confirmation.
   * @param e The mouse event.
   * @param rmaId The ID of the RMA to delete.
   */
  const handleDelete = (e: React.MouseEvent, rmaId: string) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this RMA? This action cannot be undone.')) {
      deleteRma(rmaId);
    }
  }

  // Calculate the number of currently active filters.
  const activeFilterCount =
    (filters.searchTerm ? 1 : 0) +
    filters.statuses.length +
    (filters.customerId ? 1 : 0) +
    (filters.dateFrom ? 1 : 0) +
    (filters.dateTo ? 1 : 0);

  const getCustomerName = (id: string) => customers.find(c => c.id === id)?.name || 'Unknown Customer';

  const labelStyles = "block text-sm font-medium text-slate-700";
  const inputStyles = "block w-full rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm";

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 font-display">RMAs</h1>
          <p className="mt-2 text-sm text-slate-600">Manage your Return Merchandise Authorizations.</p>
        </div>
        <div className="shrink-0">
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="button" onClick={onNewRma} className="inline-flex w-full sm:w-auto items-center justify-center gap-x-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-500/30 hover:bg-primary-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 transition-all"><PlusIcon className="w-5 h-5" />New RMA</motion.button>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative grow group">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><MagnifyingGlassIcon className="h-5 w-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" aria-hidden="true" /></div>
          <input type="search" placeholder="Search RMAs..." value={filters.searchTerm} onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })} className="block w-full rounded-lg border-0 py-2.5 pl-10 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary-500 sm:text-sm sm:leading-6 transition-shadow" />
        </div>
        <button onClick={() => setShowFilters(!showFilters)} aria-expanded={showFilters} aria-controls="filter-panel" className={`relative inline-flex shrink-0 items-center gap-x-2 rounded-lg px-4 py-2.5 text-sm font-semibold shadow-sm ring-1 ring-inset ring-slate-200 transition-all ${showFilters ? 'bg-primary-50 ring-primary-500 text-primary-700' : 'bg-white text-slate-700 hover:bg-slate-50'}`}>
          <FilterIcon className={`w-5 h-5 ${showFilters ? 'text-primary-500' : 'text-slate-500'}`} />
          Filters
          {activeFilterCount > 0 && <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary-500 text-xs font-semibold text-white ring-2 ring-white">{activeFilterCount}</span>}
        </button>
      </div>

      {/* Collapsible Filter Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} id="filter-panel" className="overflow-hidden">
            <div className="bg-white/50 backdrop-blur-sm p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Status Filter */}
                <div>
                  <label className={labelStyles}>Status</label>
                  <div className="mt-2 space-y-2">
                    {Object.values(RmaStatus).map(status => (
                      <div key={status} className="flex items-center">
                        <input id={`status-${status}`} type="checkbox" checked={filters.statuses.includes(status)} onChange={() => handleStatusChange(status)} className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500" />
                        <label htmlFor={`status-${status}`} className="ml-3 text-sm text-slate-600">{status}</label>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Customer Filter */}
                <div>
                  <label htmlFor="customer" className={labelStyles}>Customer</label>
                  <select id="customer" value={filters.customerId} onChange={e => setFilters({ ...filters, customerId: e.target.value })} className={`mt-2 ${inputStyles}`}>
                    <option value="">All Customers</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                {/* Date Range Filter */}
                <div>
                  <label htmlFor="dateFrom" className={labelStyles}>Created After</label>
                  <input type="date" id="dateFrom" value={filters.dateFrom} onChange={e => setFilters({ ...filters, dateFrom: e.target.value })} className={`mt-2 ${inputStyles}`} />
                </div>
                <div>
                  <label htmlFor="dateTo" className={labelStyles}>Created Before</label>
                  <input type="date" id="dateTo" value={filters.dateTo} onChange={e => setFilters({ ...filters, dateTo: e.target.value })} className={`mt-2 ${inputStyles}`} />
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end">
                <button onClick={clearFilters} className="text-sm font-semibold text-primary-600 hover:text-primary-500 transition-colors">Clear All Filters</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Filter Pills */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          {filters.statuses.map(status => (
            <span key={status} className="inline-flex items-center gap-x-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 border border-slate-200">{status}<button onClick={() => handleStatusChange(status)} aria-label={`Remove ${status} filter`} className="-mr-0.5 h-4 w-4 rounded-full inline-flex items-center justify-center text-slate-400 hover:bg-slate-200 hover:text-slate-600"><XMarkIcon className="h-3 w-3" /></button></span>
          ))}
          {filters.customerId && (<span className="inline-flex items-center gap-x-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 border border-slate-200">{getCustomerName(filters.customerId)}<button onClick={() => setFilters({ ...filters, customerId: '' })} aria-label={`Remove ${getCustomerName(filters.customerId)} filter`} className="-mr-0.5 h-4 w-4 rounded-full inline-flex items-center justify-center text-slate-400 hover:bg-slate-200 hover:text-slate-600"><XMarkIcon className="h-3 w-3" /></button></span>)}
          {filters.dateFrom && (<span className="inline-flex items-center gap-x-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 border border-slate-200">From: {filters.dateFrom}<button onClick={() => setFilters({ ...filters, dateFrom: '' })} aria-label={`Remove created after filter`} className="-mr-0.5 h-4 w-4 rounded-full inline-flex items-center justify-center text-slate-400 hover:bg-slate-200 hover:text-slate-600"><XMarkIcon className="h-3 w-3" /></button></span>)}
          {filters.dateTo && (<span className="inline-flex items-center gap-x-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 border border-slate-200">To: {filters.dateTo}<button onClick={() => setFilters({ ...filters, dateTo: '' })} aria-label={`Remove created before filter`} className="-mr-0.5 h-4 w-4 rounded-full inline-flex items-center justify-center text-slate-400 hover:bg-slate-200 hover:text-slate-600"><XMarkIcon className="h-3 w-3" /></button></span>)}
        </div>
      )}

      {/* RMA Table - Desktop */}
      <div className="hidden sm:block bg-white/70 backdrop-blur-sm shadow-xl ring-1 ring-black/5 sm:rounded-xl overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200/50">
          <thead className="bg-slate-50/50">
            <tr>
              <th scope="col" className="py-4 pl-4 pr-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500 sm:pl-6">RMA #</th>
              <th scope="col" className="px-3 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Customer</th>
              <th scope="col" className="px-3 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Device(s)</th>
              <th scope="col" className="px-3 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
              <th scope="col" className="px-3 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Date</th>
              <th scope="col" className="relative py-4 pl-3 pr-4 sm:pr-6"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/50 bg-white/50">
            {isLoading ? (
              // Skeleton Loading State
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 sm:pl-6"><Skeleton className="h-4 w-24" /></td>
                  <td className="whitespace-nowrap px-3 py-4"><div className="space-y-2"><Skeleton className="h-4 w-32" /><Skeleton className="h-3 w-24" /></div></td>
                  <td className="whitespace-nowrap px-3 py-4"><div className="space-y-2"><Skeleton className="h-4 w-20" /><Skeleton className="h-3 w-28" /></div></td>
                  <td className="whitespace-nowrap px-3 py-4"><Skeleton className="h-6 w-24 rounded-full" /></td>
                  <td className="whitespace-nowrap px-3 py-4"><Skeleton className="h-4 w-24" /></td>
                  <td className="whitespace-nowrap px-3 py-4 text-right"><Skeleton className="h-6 w-6 inline-block rounded-full" /></td>
                </tr>
              ))
            ) : rmas.length > 0 ? (
              rmas.map((rma) => {
                // Get unique statuses for the RMA to display multiple badges if necessary.
                const uniqueStatuses = [...new Set(rma.serviceCycles?.map(cycle => cycle.status) || [])];
                return (
                  <motion.tr
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    viewport={{ once: true }}
                    key={rma.id}
                    className="group hover:bg-slate-50/80 transition-colors"
                    onClick={() => navigate(`/rmas/${rma.id}`)}
                  >
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-primary-600 sm:pl-6 cursor-pointer group-hover:text-primary-700 transition-colors">{rma.id}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500 cursor-pointer">
                      <div className="font-medium text-slate-900">{rma.customer?.name || 'Unknown Customer'}</div>
                      <div className="text-slate-400 text-xs mt-0.5">{rma.customer?.contactPerson || 'N/A'}</div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500 cursor-pointer">
                      {rma.devices && rma.devices.length === 1 ? (
                        <>
                          <div className="font-medium text-slate-900">{rma.devices[0].articleNumber || 'No Article Number'}</div>
                          <div className="text-slate-400 text-xs font-mono mt-0.5">S/N: {rma.devices[0].serialNumber}</div>
                        </>
                      ) : rma.devices && rma.devices.length > 1 ? (
                        <div className="font-medium text-slate-900">{rma.devices.length} Devices</div>
                      ) : (
                        <div className="text-slate-400 text-xs">No devices</div>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500 cursor-pointer">
                      <div className="flex flex-wrap gap-1">
                        {uniqueStatuses.map(status => (<span key={status} className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${getStatusBadgeColor(status as RmaStatus)}`}>{status}</span>))}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500 cursor-pointer">{formatDate(rma.creationDate)}</td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      <div className="flex items-center justify-end gap-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={(e) => handleEdit(e, rma)} className="text-slate-400 hover:text-primary-600 p-1.5 rounded-full hover:bg-white/80 transition-all shadow-sm ring-1 ring-transparent hover:ring-slate-200"><PencilIcon className="h-4 w-4" /><span className="sr-only">Edit</span></button>
                        <button onClick={(e) => handleDelete(e, rma.id)} className="text-slate-400 hover:text-red-600 p-1.5 rounded-full hover:bg-white/80 transition-all shadow-sm ring-1 ring-transparent hover:ring-red-100"><TrashIcon className="h-4 w-4" /><span className="sr-only">Delete</span></button>
                        <button onClick={() => navigate(`/rmas/${rma.id}`)} className="text-slate-400 hover:text-primary-600 p-1.5 rounded-full hover:bg-white/80 transition-all shadow-sm ring-1 ring-transparent hover:ring-slate-200"><ChevronRightIcon className="h-4 w-4" /><span className="sr-only">View</span></button>
                      </div>
                    </td>
                  </motion.tr>
                )
              })
            ) : (
              <tr>
                <td colSpan={6} className="text-center py-16">
                  <div className="flex flex-col items-center justify-center text-slate-500">
                    <MagnifyingGlassIcon className="h-12 w-12 text-slate-300 mb-3" />
                    <p className="text-lg font-medium text-slate-900">No RMAs found</p>
                    <p className="text-sm">Try adjusting your filters or search terms.</p>
                    <button onClick={clearFilters} className="mt-4 text-primary-600 hover:text-primary-700 font-medium text-sm">Clear Filters</button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* RMA Cards - Mobile */}
      <div className="sm:hidden space-y-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-lg p-4 shadow-sm border border-slate-200">
              <Skeleton className="h-5 w-32 mb-3" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>
            </div>
          ))
        ) : rmas.length > 0 ? (
          rmas.map((rma) => {
            const uniqueStatuses = [...new Set(rma.serviceCycles.map(cycle => cycle.status))];
            return (
              <motion.div
                key={rma.id}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                viewport={{ once: true }}
                onClick={() => navigate(`/rmas/${rma.id}`)}
                className="bg-white rounded-lg p-4 shadow-sm border border-slate-200 active:bg-slate-50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-primary-600 truncate">#{rma.id}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{formatDate(rma.creationDate)}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    <button onClick={(e) => handleEdit(e, rma)} className="text-slate-400 hover:text-primary-600 p-1.5"><PencilIcon className="h-4 w-4" /></button>
                    <button onClick={(e) => handleDelete(e, rma.id)} className="text-slate-400 hover:text-red-600 p-1.5"><TrashIcon className="h-4 w-4" /></button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wide">Customer</p>
                    <p className="text-sm font-medium text-slate-900 truncate">{rma.customer?.name || rma.customerName || 'Unknown Customer'}</p>
                    <p className="text-xs text-slate-500 truncate">{rma.customer?.contactPerson || 'N/A'}</p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wide">Device(s)</p>
                    {rma.devices && rma.devices.length === 1 ? (
                      <>
                        <p className="text-sm font-medium text-slate-900 truncate">{rma.devices[0].articleNumber || 'No Article Number'}</p>
                        <p className="text-xs text-slate-500 font-mono truncate">S/N: {rma.devices[0].serialNumber}</p>
                      </>
                    ) : rma.devices && rma.devices.length > 1 ? (
                      <p className="text-sm font-medium text-slate-900">{rma.devices.length} Devices</p>
                    ) : (
                      <p className="text-xs text-slate-400">No devices</p>
                    )}
                  </div>

                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Status</p>
                    <div className="flex flex-wrap gap-1">
                      {uniqueStatuses.map(status => (
                        <span key={status} className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${getStatusBadgeColor(status as RmaStatus)}`}>{status}</span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 flex justify-end">
                  <button onClick={() => navigate(`/rmas/${rma.id}`)} className="text-primary-600 hover:text-primary-700 text-sm font-medium inline-flex items-center gap-1">
                    View Details <ChevronRightIcon className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            );
          })
        ) : (
          <div className="bg-white rounded-lg p-8 text-center">
            <MagnifyingGlassIcon className="h-12 w-12 text-slate-300 mb-3 mx-auto" />
            <p className="text-base font-medium text-slate-900 mb-1">No RMAs found</p>
            <p className="text-sm text-slate-500 mb-4">Try adjusting your filters or search terms.</p>
            <button onClick={clearFilters} className="text-primary-600 hover:text-primary-700 font-medium text-sm">Clear Filters</button>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-200 bg-white/50 backdrop-blur-sm px-4 py-3 sm:px-6 mt-4 rounded-xl shadow-sm">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={() => setPage(Math.max(page - 1, 1))}
              disabled={page === 1}
              className="relative inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(Math.min(page + 1, totalPages))}
              disabled={page === totalPages}
              className="relative ml-3 inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-slate-600">
                Showing page <span className="font-medium text-slate-900">{page}</span> of <span className="font-medium text-slate-900">{totalPages}</span>
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <button
                  onClick={() => setPage(Math.max(page - 1, 1))}
                  disabled={page === 1}
                  className="relative inline-flex items-center rounded-l-md px-2 py-2 text-slate-400 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Previous</span>
                  <ChevronRightIcon className="h-5 w-5 rotate-180" aria-hidden="true" />
                </button>
                <button
                  onClick={() => setPage(Math.min(page + 1, totalPages))}
                  disabled={page === totalPages}
                  className="relative inline-flex items-center rounded-r-md px-2 py-2 text-slate-400 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Next</span>
                  <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default RmaList;