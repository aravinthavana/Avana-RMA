import React, { useState, useMemo } from 'react';
import { Customer, Rma, RmaStatus } from '../types';
import { ArrowLeftIcon, FilterIcon, PlusIcon, ChevronRightIcon, ExclamationTriangleIcon } from './icons';
import { getStatusBadgeColor } from './RmaList';
import { motion, AnimatePresence } from 'framer-motion';

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
      <div className="text-center py-20 bg-white/50 backdrop-blur-sm rounded-xl border border-slate-200 shadow-sm">
        <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-slate-400" />
        <h3 className="mt-2 text-lg font-semibold text-slate-900 font-display">Customer Not Found</h3>
        <p className="mt-1 text-sm text-slate-500">The requested customer could not be loaded or does not exist.</p>
        <div className="mt-6">
          <button onClick={onBack} className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 transition-all">
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
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

      {/* Customer Information Panel */}
      <div className="bg-white/80 backdrop-blur-md shadow-lg ring-1 ring-black/5 rounded-xl p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-100 rounded-bl-full -mr-10 -mt-10 opacity-50 blur-2xl"></div>

        <div className="relative z-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 font-display mb-6">{name ?? 'Unknown Customer'}</h1>
          <div className="border-t border-slate-200/60 pt-6">
            <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">Contact Person</dt>
                <dd className="mt-1 text-base font-medium text-slate-900">{contactPerson ?? 'N/A'}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">Email</dt>
                <dd className="mt-1 text-base font-medium text-slate-900">{email ?? 'N/A'}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">Phone</dt>
                <dd className="mt-1 text-base font-medium text-slate-900">{phone ?? 'N/A'}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">Address</dt>
                <dd className="mt-1 text-base font-medium text-slate-900 whitespace-pre-line">{address ?? 'N/A'}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* Associated RMAs Section */}
      <div className="mt-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-900 font-display">Associated RMAs</h2>
          <div className="flex items-center gap-3">
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="button" onClick={() => onNewRma(id)} className="inline-flex items-center gap-x-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-primary-500/20 hover:bg-primary-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 transition-all"><PlusIcon className="w-5 h-5" /> New RMA</motion.button>
            <button onClick={() => setShowFilters(!showFilters)} className={`inline-flex items-center gap-x-2 rounded-lg px-4 py-2 text-sm font-semibold shadow-sm ring-1 ring-inset ring-slate-300 transition-all ${showFilters ? 'bg-primary-50 text-primary-700 ring-primary-500' : 'bg-white text-slate-700 hover:bg-slate-50'}`}><FilterIcon className="w-5 h-5" /> Filter</button>
          </div>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mb-6">
              <div className="bg-white/50 backdrop-blur-sm p-6 rounded-xl border border-slate-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <label className={labelStyles}>Status</label>
                    <div className="mt-2 space-y-2">{Object.values(RmaStatus).map(status => <div key={status} className="flex items-center"><input id={`cust-status-${status}`} type="checkbox" checked={filters.statuses.includes(status)} onChange={() => handleStatusChange(status)} className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500" /><label htmlFor={`cust-status-${status}`} className="ml-3 text-sm text-slate-600">{status}</label></div>)}</div>
                  </div>
                  <div><label htmlFor="cust-dateFrom" className={labelStyles}>Created After</label><input type="date" id="cust-dateFrom" value={filters.dateFrom} onChange={e => setFilters({ ...filters, dateFrom: e.target.value })} className={`mt-2 ${inputStyles}`} /></div>
                  <div><label htmlFor="cust-dateTo" className={labelStyles}>Created Before</label><input type="date" id="cust-dateTo" value={filters.dateTo} onChange={e => setFilters({ ...filters, dateTo: e.target.value })} className={`mt-2 ${inputStyles}`} /></div>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-200 flex justify-end"><button onClick={clearFilters} className="text-sm font-semibold text-primary-600 hover:text-primary-500">Clear Filters</button></div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Card View for RMAs */}
        <div className="md:hidden space-y-4">
          {filteredRmas.map((rma) => {
            if (!rma) return null;
            const uniqueStatuses = [...new Set((rma.serviceCycles || []).map(cycle => cycle.status))];
            const devices = rma.devices || [];
            return (
              <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} key={rma.id} onClick={() => onSelectRma(rma.id)} className="bg-white shadow-sm ring-1 ring-slate-200 rounded-xl p-4 cursor-pointer hover:bg-slate-50 hover:shadow-md transition-all duration-200">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-semibold text-primary-600">#{rma.id}</p>
                    <p className="text-xs text-slate-500 mt-1">{rma.creationDate ? new Date(rma.creationDate).toLocaleDateString() : 'N/A'}</p>
                  </div>
                  <ChevronRightIcon className="w-5 h-5 text-slate-400" />
                </div>
                <div className="mt-3 border-t border-slate-100 pt-3">
                  <p className="text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">Device(s)</p>
                  {devices.length === 1 ? (
                    <>
                      <p className="font-medium text-slate-900 text-sm">{devices[0]?.articleNumber || 'No Article Number'}</p>
                      <p className="text-slate-500 text-xs font-mono">S/N: {devices[0]?.serialNumber || 'N/A'}</p>
                    </>
                  ) : devices.length > 0 ? (
                    <p className="font-medium text-slate-900 text-sm">{devices.length} Devices</p>
                  ) : (
                    <p className="text-xs text-slate-400">No devices</p>
                  )}
                </div>
                <div className="mt-3">
                  <div className="flex flex-wrap gap-1">
                    {uniqueStatuses.map(status => <span key={status} className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${getStatusBadgeColor(status as RmaStatus)}`}>{status}</span>)}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Desktop Table View for RMAs */}
        <div className="hidden md:block bg-white/70 backdrop-blur-sm shadow-xl ring-1 ring-black/5 rounded-xl overflow-hidden">
          <table className="min-w-full divide-y divide-slate-200/50"><thead className="bg-slate-50/50"><tr><th scope="col" className="py-4 pl-4 pr-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500 sm:pl-6">RMA #</th><th scope="col" className="px-3 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Device(s)</th><th scope="col" className="px-3 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Status</th><th scope="col" className="px-3 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Created Date</th><th scope="col" className="relative py-4 pl-3 pr-4 sm:pr-6"><span className="sr-only">View</span></th></tr></thead><tbody className="divide-y divide-slate-200 bg-white/50">{filteredRmas.map((rma) => {
            if (!rma) return null;
            const uniqueStatuses = [...new Set((rma.serviceCycles || []).map(cycle => cycle.status))];
            const devices = rma.devices || [];
            return (
              <motion.tr initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} key={rma.id} className="hover:bg-slate-50/80 cursor-pointer group transition-colors" onClick={() => onSelectRma(rma.id)}>
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-primary-600 sm:pl-6 group-hover:text-primary-700">{rma.id}</td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                  {devices.length === 1 ? (
                    <>
                      <div className="font-medium text-slate-900">{devices[0]?.articleNumber || 'No Article Number'}</div>
                      <div className="text-slate-400 text-xs font-mono">S/N: {devices[0]?.serialNumber || 'N/A'}</div>
                    </>
                  ) : devices.length > 0 ? (
                    <div className="font-medium text-slate-900">{devices.length} Devices</div>
                  ) : (
                    <div className="text-xs text-slate-400">No devices</div>
                  )}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500"><div className="flex flex-wrap gap-1">{uniqueStatuses.map(status => <span key={status} className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${getStatusBadgeColor(status as RmaStatus)}`}>{status}</span>)}</div></td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">{rma.creationDate ? new Date(rma.creationDate).toLocaleDateString() : 'N/A'}</td>
                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                  <ChevronRightIcon className="w-5 h-5 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity" />
                </td>
              </motion.tr>
            );
          })}</tbody></table>
        </div>

        {/* Fallback for no matching RMAs */}
        {filteredRmas.length === 0 && (
          <div className="text-center py-16 bg-white/30 backdrop-blur-sm rounded-xl border border-dashed border-slate-300 mt-4">
            <p className="text-slate-500">No RMAs found for this customer matching your criteria.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default CustomerDetailView;
