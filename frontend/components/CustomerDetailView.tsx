import React, { useState, useMemo } from 'react';
import { Customer, Rma, RmaStatus } from '../types';
import { ArrowLeftIcon, FilterIcon, PlusIcon, XMarkIcon, ChevronRightIcon, ExclamationTriangleIcon } from './icons';
import { getStatusBadgeColor } from './RmaList';

/**
 * Props for the CustomerDetailView component.
 */
interface CustomerDetailViewProps {
  customer: Customer | null | undefined;
  rmas: Rma[];
  onBack: () => void;
  onSelectRma: (id: string) => void;
  onNewRma: (customerId: string) => void;
}

/**
 * Displays the details of a single customer, including a list of their associated RMAs.
 * Allows filtering of the RMA list and creating a new RMA for the customer.
 */
const CustomerDetailView: React.FC<CustomerDetailViewProps> = ({ customer, rmas, onBack, onSelectRma, onNewRma }) => {
  // State for managing filters for the associated RMAs list.
  const [filters, setFilters] = useState({ statuses: [] as RmaStatus[], dateFrom: '', dateTo: '' });
  const [showFilters, setShowFilters] = useState(false);

  /**
   * Toggles a status in the RMA filter state.
   * @param status The status to toggle.
   */
  const handleStatusChange = (status: RmaStatus) => {
    const newStatuses = filters.statuses.includes(status) ? filters.statuses.filter(s => s !== status) : [...filters.statuses, status];
    setFilters({ ...filters, statuses: newStatuses });
  };
  
  /**
   * A memoized list of RMAs for this customer, filtered by the current filter settings.
   */
  const filteredRmas = useMemo(() => {
    if (!rmas) return [];
    return rmas.filter(rma => {
      if (!rma) return false;
      const uniqueStatuses = [...new Set((rma.serviceCycles || []).map(cycle => cycle.status))];
      const hasMatchingStatus = filters.statuses.length === 0 || uniqueStatuses.some(status => filters.statuses.includes(status));
      if (!hasMatchingStatus) return false;

      const creationDate = new Date(rma.creationDate);
      const matchesDateFrom = !filters.dateFrom || creationDate >= new Date(filters.dateFrom);
      const matchesDateTo = !filters.dateTo || creationDate <= new Date(new Date(filters.dateTo).setHours(23, 59, 59, 999));

      return matchesDateFrom && matchesDateTo;
    });
  }, [rmas, filters]);
  
  /**
   * Clears all active filters for the RMA list.
   */
  const clearFilters = () => setFilters({ statuses: [], dateFrom: '', dateTo: '' });

  // Render a fallback UI if the customer data is not available.
  if (!customer) {
     return (
        <div className="text-center py-20">
            <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-slate-400" />
            <h3 className="mt-2 text-lg font-semibold text-slate-900">Customer Not Found</h3>
            <p className="mt-1 text-sm text-slate-500">The requested customer could not be loaded or does not exist.</p>
            <div className="mt-6">
              <button onClick={onBack} className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50">
                  <ArrowLeftIcon className="w-5 h-5" /> Back to Customer List
              </button>
            </div>
        </div>
    )
  }

  const { id, name, contactPerson, email, phone, address } = customer;

  const labelStyles = "block text-sm font-medium text-slate-700";
  const inputStyles = "block w-full rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm";

  return (
    <div>
        <button onClick={onBack} className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 mb-6">
            <ArrowLeftIcon className="w-5 h-5" />
            Back to Customer List
        </button>

      {/* Customer Information Panel */}
      <div className="bg-white shadow-sm ring-1 ring-slate-200 rounded-lg p-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">{name ?? 'Unknown Customer'}</h1>
        <div className="mt-4 border-t border-slate-200 pt-4">
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            <div><dt className="text-sm font-medium text-slate-500">Contact Person</dt><dd className="mt-1 text-sm text-slate-900">{contactPerson ?? 'N/A'}</dd></div>
            <div><dt className="text-sm font-medium text-slate-500">Email</dt><dd className="mt-1 text-sm text-slate-900">{email ?? 'N/A'}</dd></div>
            <div><dt className="text-sm font-medium text-slate-500">Phone</dt><dd className="mt-1 text-sm text-slate-900">{phone ?? 'N/A'}</dd></div>
            <div><dt className="text-sm font-medium text-slate-500">Address</dt><dd className="mt-1 text-sm text-slate-900 whitespace-pre-line">{address ?? 'N/A'}</dd></div>
          </dl>
        </div>
      </div>

      {/* Associated RMAs Section */}
      <div className="mt-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center mb-4">
            <h2 className="text-xl font-bold text-slate-900">Associated RMAs</h2>
            <div className="flex items-center gap-3">
                 <button type="button" onClick={() => onNewRma(id)} className="inline-flex items-center gap-x-2 rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"><PlusIcon className="w-5 h-5" /> New RMA for Customer</button>
                <button onClick={() => setShowFilters(!showFilters)} className="inline-flex items-center gap-x-2 rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50"><FilterIcon className="w-5 h-5 text-slate-500"/> Filter</button>
            </div>
        </div>

         {showFilters && (
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                        <label className={labelStyles}>Status</label>
                        <div className="mt-2 space-y-2">{Object.values(RmaStatus).map(status => <div key={status} className="flex items-center"><input id={`cust-status-${status}`} type="checkbox" checked={filters.statuses.includes(status)} onChange={() => handleStatusChange(status)} className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500" /><label htmlFor={`cust-status-${status}`} className="ml-3 text-sm text-slate-600">{status}</label></div>)}</div>
                    </div>
                    <div><label htmlFor="cust-dateFrom" className={labelStyles}>Created After</label><input type="date" id="cust-dateFrom" value={filters.dateFrom} onChange={e => setFilters({...filters, dateFrom: e.target.value})} className={`mt-2 ${inputStyles}`} /></div>
                    <div><label htmlFor="cust-dateTo" className={labelStyles}>Created Before</label><input type="date" id="cust-dateTo" value={filters.dateTo} onChange={e => setFilters({...filters, dateTo: e.target.value})} className={`mt-2 ${inputStyles}`} /></div>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-200 flex justify-end"><button onClick={clearFilters} className="text-sm font-semibold text-primary-600 hover:text-primary-500">Clear Filters</button></div>
            </div>
        )}

        {/* Mobile Card View for RMAs */}
        <div className="md:hidden space-y-4">
          {filteredRmas.map((rma) => {
             if (!rma) return null;
             const uniqueStatuses = [...new Set((rma.serviceCycles || []).map(cycle => cycle.status))];
             const devices = rma.devices || [];
            return (
              <div key={rma.id} onClick={() => onSelectRma(rma.id)} className="bg-white shadow-sm ring-1 ring-slate-200 rounded-lg p-4 cursor-pointer hover:bg-slate-50 hover:shadow-md transition-shadow duration-150">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-semibold text-primary-600">{rma.id}</p>
                    <p className="text-sm text-slate-500">{rma.creationDate ? new Date(rma.creationDate).toLocaleDateString() : 'N/A'}</p>
                  </div>
                  <ChevronRightIcon className="w-5 h-5 text-slate-400" />
                </div>
                 <div className="mt-3 border-t border-slate-200 pt-3">
                   <p className="text-xs text-slate-500 mb-1">Device(s)</p>
                   {devices.length === 1 ? (
                     <>
                       <p className="font-medium text-slate-900 text-sm">{devices[0]?.model ?? 'N/A'}</p>
                       <p className="text-slate-500 text-sm font-mono">{devices[0]?.serialNumber ?? 'N/A'}</p>
                     </>
                   ) : (
                     <p className="font-medium text-slate-900 text-sm">{devices.length} Devices</p>
                   )}
                 </div>
                 <div className="mt-3">
                   <p className="text-xs text-slate-500 mb-1">Status</p>
                   <div className="flex flex-wrap gap-1">
                     {uniqueStatuses.map(status => <span key={status} className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${getStatusBadgeColor(status as RmaStatus)}`}>{status}</span>)}
                   </div>
                 </div>
              </div>
            );
          })}
        </div>
        
        {/* Desktop Table View for RMAs */}
        <div className="hidden md:block bg-white shadow-sm ring-1 ring-slate-200 rounded-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200"><thead className="bg-slate-50"><tr><th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-slate-900 sm:pl-6">RMA #</th><th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">Device(s)</th><th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">Status</th><th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">Created Date</th><th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6"><span className="sr-only">View</span></th></tr></thead><tbody className="divide-y divide-slate-200 bg-white">{filteredRmas.map((rma) => {
                 if (!rma) return null;
                 const uniqueStatuses = [...new Set((rma.serviceCycles || []).map(cycle => cycle.status))];
                 const devices = rma.devices || [];
                return (
                  <tr key={rma.id} className="hover:bg-slate-50 cursor-pointer group" onClick={() => onSelectRma(rma.id)}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-primary-600 sm:pl-6">{rma.id}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                       {devices.length === 1 ? (
                         <>
                            <div className="font-medium text-slate-900">{devices[0]?.model ?? 'N/A'}</div>
                            <div className="text-slate-500 font-mono">{devices[0]?.serialNumber ?? 'N/A'}</div>
                         </>
                      ) : (
                         <div className="font-medium text-slate-900">{devices.length} Devices</div>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500"><div className="flex flex-wrap gap-1">{uniqueStatuses.map(status => <span key={status} className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${getStatusBadgeColor(status as RmaStatus)}`}>{status}</span>)}</div></td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">{rma.creationDate ? new Date(rma.creationDate).toLocaleDateString() : 'N/A'}</td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      <span className="text-primary-600 hover:text-primary-900">View</span>
                      <ChevronRightIcon className="w-5 h-5 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </td>
                  </tr>
                );
              })}</tbody></table>
        </div>

        {/* Fallback for no matching RMAs */}
        {filteredRmas.length === 0 && (
          <div className="text-center py-10 text-slate-500 bg-white md:bg-transparent rounded-lg">No RMAs found for this customer matching your criteria.</div>
        )}
      </div>
    </div>
  );
};

export default CustomerDetailView;
