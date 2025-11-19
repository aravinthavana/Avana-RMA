import React, { useState } from 'react';
import { Rma, RmaStatus, Customer } from '../types';
import { PlusIcon, FilterIcon, XMarkIcon, MagnifyingGlassIcon, ChevronRightIcon, PencilIcon, TrashIcon } from './icons';
import { RmaFilters } from '../App';

/**
 * Props for the RmaList component.
 */
interface RmaListProps {
  rmas: Rma[];
  customers: Customer[];
  filters: RmaFilters;
  onFiltersChange: (filters: RmaFilters) => void;
  onSelectRma: (id: string) => void;
  onNewRma: () => void;
  onEditRma: (rma: Rma) => void;
  onDeleteRma: (id: string) => void;
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
const RmaList: React.FC<RmaListProps> = ({ rmas, customers, filters, onFiltersChange, onSelectRma, onNewRma, onEditRma, onDeleteRma }) => {
  const [showFilters, setShowFilters] = useState(false);

  /**
   * Toggles a status in the filter state.
   * @param status The status to toggle.
   */
  const handleStatusChange = (status: RmaStatus) => {
    const newStatuses = filters.statuses.includes(status)
      ? filters.statuses.filter(s => s !== status)
      : [...filters.statuses, status];
    onFiltersChange({ ...filters, statuses: newStatuses });
  };

  /**
   * Clears all active filters.
   */
  const clearFilters = () => {
    onFiltersChange({ searchTerm: '', statuses: [], customerId: '', dateFrom: '', dateTo: '' });
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
          onDeleteRma(rmaId);
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
    <div>
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Return Merchandise Authorizations (RMAs)</h1>
          <p className="mt-1 text-sm text-slate-600">A list of all RMAs including their status and customer details.</p>
        </div>
        <div className="shrink-0">
          <button type="button" onClick={onNewRma} className="inline-flex w-full sm:w-auto items-center justify-center gap-x-2 rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"><PlusIcon className="w-5 h-5" />New RMA</button>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div className="relative grow">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><MagnifyingGlassIcon className="h-5 w-5 text-slate-400" aria-hidden="true" /></div>
          <input type="search" placeholder="Search by RMA #, Customer, or Serial #" value={filters.searchTerm} onChange={(e) => onFiltersChange({ ...filters, searchTerm: e.target.value })} className="block w-full rounded-md border-0 py-1.5 pl-10 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6" />
        </div>
        <button onClick={() => setShowFilters(!showFilters)} aria-expanded={showFilters} aria-controls="filter-panel" className="relative inline-flex shrink-0 items-center gap-x-2 rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50">
          <FilterIcon className="w-5 h-5 text-slate-500"/>
          Filters
          {activeFilterCount > 0 && <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary-500 text-xs font-semibold text-white ring-2 ring-slate-50">{activeFilterCount}</span>}
        </button>
      </div>
      
      {/* Collapsible Filter Panel */}
      {showFilters && (
        <div id="filter-panel" className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-4">
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
              <select id="customer" value={filters.customerId} onChange={e => onFiltersChange({...filters, customerId: e.target.value})} className={`mt-2 ${inputStyles}`}>
                  <option value="">All Customers</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            {/* Date Range Filter */}
            <div>
              <label htmlFor="dateFrom" className={labelStyles}>Created After</label>
              <input type="date" id="dateFrom" value={filters.dateFrom} onChange={e => onFiltersChange({...filters, dateFrom: e.target.value})} className={`mt-2 ${inputStyles}`} />
            </div>
             <div>
              <label htmlFor="dateTo" className={labelStyles}>Created Before</label>
              <input type="date" id="dateTo" value={filters.dateTo} onChange={e => onFiltersChange({...filters, dateTo: e.target.value})} className={`mt-2 ${inputStyles}`} />
            </div>
          </div>
           <div className="mt-4 pt-4 border-t border-slate-200 flex justify-end">
            <button onClick={clearFilters} className="text-sm font-semibold text-primary-600 hover:text-primary-500">Clear All Filters</button>
          </div>
        </div>
      )}

      {/* Active Filter Pills */}
      {activeFilterCount > 0 && (
         <div className="flex flex-wrap gap-2 items-center mb-4">
          {filters.statuses.map(status => (
            <span key={status} className="inline-flex items-center gap-x-1.5 rounded-full bg-slate-200 px-2 py-1 text-xs font-medium text-slate-700">{status}<button onClick={() => handleStatusChange(status)} aria-label={`Remove ${status} filter`} className="-mr-0.5 h-4 w-4 rounded-full inline-flex items-center justify-center text-slate-500 hover:bg-slate-300 hover:text-slate-600"><XMarkIcon className="h-3 w-3"/></button></span>
          ))}
          {filters.customerId && (<span className="inline-flex items-center gap-x-1.5 rounded-full bg-slate-200 px-2 py-1 text-xs font-medium text-slate-700">{getCustomerName(filters.customerId)}<button onClick={() => onFiltersChange({...filters, customerId: ''})} aria-label={`Remove ${getCustomerName(filters.customerId)} filter`} className="-mr-0.5 h-4 w-4 rounded-full inline-flex items-center justify-center text-slate-500 hover:bg-slate-300 hover:text-slate-600"><XMarkIcon className="h-3 w-3"/></button></span>)}
           {filters.dateFrom && (<span className="inline-flex items-center gap-x-1.5 rounded-full bg-slate-200 px-2 py-1 text-xs font-medium text-slate-700">From: {filters.dateFrom}<button onClick={() => onFiltersChange({...filters, dateFrom: ''})} aria-label={`Remove created after filter`} className="-mr-0.5 h-4 w-4 rounded-full inline-flex items-center justify-center text-slate-500 hover:bg-slate-300 hover:text-slate-600"><XMarkIcon className="h-3 w-3"/></button></span>)}
           {filters.dateTo && (<span className="inline-flex items-center gap-x-1.5 rounded-full bg-slate-200 px-2 py-1 text-xs font-medium text-slate-700">To: {filters.dateTo}<button onClick={() => onFiltersChange({...filters, dateTo: ''})} aria-label={`Remove created before filter`} className="-mr-0.5 h-4 w-4 rounded-full inline-flex items-center justify-center text-slate-500 hover:bg-slate-300 hover:text-slate-600"><XMarkIcon className="h-3 w-3"/></button></span>)}
        </div>
      )}

      {/* RMA Table */}
      <div className="bg-white shadow-sm ring-1 ring-black ring-opacity-5 sm:rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-300">
          <thead className="bg-slate-50">
            <tr>
              <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-slate-900 sm:pl-6">RMA #</th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">Customer</th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">Device(s)</th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">Status</th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">Created Date</th>
              <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {rmas.map((rma) => {
              // Get unique statuses for the RMA to display multiple badges if necessary.
              const uniqueStatuses = [...new Set(rma.serviceCycles.map(cycle => cycle.status))];
              return (
                <tr key={rma.id} className="group hover:bg-slate-50">
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-primary-600 sm:pl-6 cursor-pointer" onClick={() => onSelectRma(rma.id)}>{rma.id}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500 cursor-pointer" onClick={() => onSelectRma(rma.id)}>
                      <div className="font-medium text-slate-900">{rma.customer.name}</div>
                      <div className="text-slate-500">{rma.customer.contactPerson}</div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500 cursor-pointer" onClick={() => onSelectRma(rma.id)}>
                      {rma.devices.length === 1 ? (
                         <>
                            <div className="font-medium text-slate-900">{rma.devices[0].model}</div>
                            <div className="text-slate-500 font-mono">{rma.devices[0].serialNumber}</div>
                         </>
                      ) : (
                         <div className="font-medium text-slate-900">{rma.devices.length} Devices</div>
                      )}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500 cursor-pointer" onClick={() => onSelectRma(rma.id)}>
                    <div className="flex flex-wrap gap-1">
                      {uniqueStatuses.map(status => (<span key={status} className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${getStatusBadgeColor(status as RmaStatus)}`}>{status}</span>))}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500 cursor-pointer" onClick={() => onSelectRma(rma.id)}>{formatDate(rma.creationDate)}</td>
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <div className="flex items-center justify-end gap-x-2">
                            <button onClick={(e) => handleEdit(e, rma)} className="text-slate-500 hover:text-primary-600 p-1 rounded-full hover:bg-slate-100 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"><PencilIcon className="h-5 w-5" /><span className="sr-only">Edit</span></button>
                            <button onClick={(e) => handleDelete(e, rma.id)} className="text-slate-500 hover:text-red-600 p-1 rounded-full hover:bg-slate-100 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"><TrashIcon className="h-5 w-5" /><span className="sr-only">Delete</span></button>
                            <button onClick={() => onSelectRma(rma.id)} className="text-primary-600 hover:text-primary-900 p-1"><ChevronRightIcon className="h-6 w-6" /><span className="sr-only">View</span></button>
                        </div>
                  </td>
                </tr>
              )}
            )}
          </tbody>
        </table>
      </div>
      {rmas.length === 0 && (<div className="text-center py-10 text-slate-500 bg-white md:bg-transparent rounded-lg">No RMAs found matching your criteria.</div>)}
    </div>
  );
};

export default RmaList;