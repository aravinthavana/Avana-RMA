import React, { useState } from 'react';
import { Customer } from '../types';
import { PlusIcon, MagnifyingGlassIcon, ChevronRightIcon, PencilIcon, TrashIcon } from './icons';
import { motion } from 'framer-motion';
import { Skeleton } from '../src/components/ui/Skeleton';
import { DeleteCustomerModal } from './DeleteCustomerModal';

/**
 * Props for the CustomerListView component.
 */
interface CustomerListViewProps {
  customers: Customer[];
  rmas?: any[]; // For counting RMAs per customer
  onSelectCustomer: (id: string) => void;
  onAddCustomer: () => void;
  onEditCustomer: (customer: Customer) => void;
  onDeleteCustomer: (id: string, deleteRmas?: boolean) => Promise<void>;
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  isLoading?: boolean;
}

/**
 * Renders a list of customers with search, add, edit, and delete functionalities.
 */
const CustomerListView: React.FC<CustomerListViewProps> = ({ customers, rmas = [], onSelectCustomer, onAddCustomer, onEditCustomer, onDeleteCustomer, page, totalPages, onPageChange, isLoading = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; customer: Customer | null }>({ isOpen: false, customer: null });

  // Filtering based on active customer list (for current page)
  const filteredCustomers = customers.filter(c =>
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  /**
   * Handles the delete action for a customer, with a confirmation dialog.
   * @param e The mouse event, stopped to prevent row selection.
   * @param customer The customer to delete.
   */
  const handleDelete = (e: React.MouseEvent, customer: Customer) => {
    e.stopPropagation();
    setDeleteModal({ isOpen: true, customer });
  };

  const handleCancelDelete = () => {
    setDeleteModal({ isOpen: false, customer: null });
  };

  const handleDeleteCustomerOnly = async () => {
    if (deleteModal.customer) {
      await onDeleteCustomer(deleteModal.customer.id, false); // Don't delete RMAs
      setDeleteModal({ isOpen: false, customer: null });
    }
  };

  const handleDeleteCustomerAndRmas = async () => {
    if (deleteModal.customer) {
      await onDeleteCustomer(deleteModal.customer.id, true); // Delete RMAs too
      setDeleteModal({ isOpen: false, customer: null });
    }
  };

  /**
   * Handles the edit action for a customer.
   * @param e The mouse event, stopped to prevent row selection.
   * @param customer The customer object to edit.
   */
  const handleEdit = (e: React.MouseEvent, customer: Customer) => {
    e.stopPropagation();
    onEditCustomer(customer);
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 font-display">Customers</h1>
          <p className="mt-2 text-sm text-slate-600">A list of all customers in your account.</p>
        </div>
        <div className="shrink-0">
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="button" onClick={onAddCustomer} className="inline-flex w-full sm:w-auto justify-center items-center gap-x-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-500/30 hover:bg-primary-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 transition-all"><PlusIcon className="w-5 h-5" />New Customer</motion.button>
        </div>
      </div>

      {/* Search Input and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="relative grow group w-full">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><MagnifyingGlassIcon className="h-5 w-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" aria-hidden="true" /></div>
          <input type="search" placeholder="Search customers..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="block w-full rounded-lg border-0 py-2.5 pl-10 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary-500 sm:text-sm sm:leading-6 transition-shadow" />
        </div>
      </div>

      {/* Customer Table - Desktop */}
      <div className="hidden sm:block bg-white/70 backdrop-blur-sm shadow-xl ring-1 ring-black/5 sm:rounded-xl overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200/50">
          <thead className="bg-slate-50/50">
            <tr>
              <th scope="col" className="py-4 pl-4 pr-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500 sm:pl-6">Name</th>
              <th scope="col" className="px-3 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Contact Person</th>
              <th scope="col" className="px-3 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Contact Info</th>
              <th scope="col" className="relative py-4 pl-3 pr-4 sm:pr-6"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/30 bg-white/50">
            {isLoading ? (
              Array(5).fill(0).map((_, i) => (
                <tr key={i}>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 sm:pl-6"><Skeleton className="h-5 w-32" /></td>
                  <td className="whitespace-nowrap px-3 py-4"><Skeleton className="h-4 w-24" /></td>
                  <td className="whitespace-nowrap px-3 py-4 space-y-2"><Skeleton className="h-4 w-40" /><Skeleton className="h-3 w-32" /></td>
                  <td className="whitespace-nowrap px-3 py-4 text-right"><Skeleton className="h-6 w-6 inline-block rounded-full" /></td>
                </tr>
              ))
            ) : filteredCustomers.length > 0 ? (
              filteredCustomers.map((customer) => (
                <motion.tr
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  viewport={{ once: true }}
                  key={customer.id}
                  className="group hover:bg-slate-50/80 transition-colors cursor-pointer"
                  onClick={() => onSelectCustomer(customer.id)}
                >
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                    <div className="font-medium text-primary-600 group-hover:text-primary-800 font-display text-base">{customer.name ?? 'N/A'}</div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500 font-medium">{customer.contactPerson ?? 'N/A'}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                    <div className="flex flex-col gap-0.5">
                      <span>{customer.email ?? 'N/A'}</span>
                      <span className="text-xs text-slate-400">{customer.phone ?? 'N/A'}</span>
                    </div>
                  </td>
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                    <div className="flex items-center justify-end gap-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={(e) => handleEdit(e, customer)} className="text-slate-400 hover:text-primary-600 p-1.5 rounded-full hover:bg-white/80 transition-all shadow-sm ring-1 ring-transparent hover:ring-slate-200"><PencilIcon className="h-4 w-4" /><span className="sr-only">Edit</span></button>
                      <button onClick={(e) => handleDelete(e, customer)} className="text-slate-400 hover:text-red-600 p-1.5 rounded-full hover:bg-white/80 transition-all shadow-sm ring-1 ring-transparent hover:ring-red-100"><TrashIcon className="h-4 w-4" /><span className="sr-only">Delete</span></button>
                      <button onClick={() => onSelectCustomer(customer.id)} className="text-slate-400 hover:text-primary-600 p-1.5 rounded-full hover:bg-white/80 transition-all shadow-sm ring-1 ring-transparent hover:ring-slate-200"><ChevronRightIcon className="h-4 w-4" /><span className="sr-only">View</span></button>
                    </div>
                  </td>
                </motion.tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="text-center py-16">
                  <div className="flex flex-col items-center justify-center text-slate-500">
                    <MagnifyingGlassIcon className="h-12 w-12 text-slate-300 mb-3" />
                    <p className="text-lg font-medium text-slate-900">No customers found</p>
                    <p className="text-sm">Try adjusting your search terms.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Customer Cards - Mobile */}
      <div className="sm:hidden space-y-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-lg p-4 shadow-sm border border-slate-200">
              <Skeleton className="h-5 w-40 mb-3" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          ))
        ) : filteredCustomers.length > 0 ? (
          filteredCustomers.map((customer) => (
            <motion.div
              key={customer.id}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              viewport={{ once: true }}
              onClick={() => onSelectCustomer(customer.id)}
              className="bg-white rounded-lg p-4 shadow-sm border border-slate-200 active:bg-slate-50 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <p className="text-base font-bold text-primary-600 truncate">{customer.name}</p>
                </div>
                <div className="flex items-center gap-2 ml-2">
                  <button onClick={(e) => handleEdit(e, customer)} className="text-slate-400 hover:text-primary-600 p-1.5"><PencilIcon className="h-4 w-4" /></button>
                  <button onClick={(e) => handleDelete(e, customer)} className="text-slate-400 hover:text-red-600 p-1.5"><TrashIcon className="h-4 w-4" /></button>
                </div>
              </div>

              <div className="space-y-2">
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Contact Person</p>
                  <p className="text-sm font-medium text-slate-900">{customer.contactPerson ?? 'N/A'}</p>
                </div>

                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Contact Info</p>
                  <p className="text-sm text-slate-900 truncate">{customer.email ?? 'N/A'}</p>
                  <p className="text-xs text-slate-500 truncate">{customer.phone ?? 'N/A'}</p>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-100 flex justify-end">
                <button onClick={() => onSelectCustomer(customer.id)} className="text-primary-600 hover:text-primary-700 text-sm font-medium inline-flex items-center gap-1">
                  View Details <ChevronRightIcon className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="bg-white rounded-lg p-8 text-center">
            <MagnifyingGlassIcon className="h-12 w-12 text-slate-300 mb-3 mx-auto" />
            <p className="text-base font-medium text-slate-900 mb-1">No customers found</p>
            <p className="text-sm text-slate-500">Try adjusting your search terms.</p>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages && totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-200 bg-white/50 backdrop-blur-sm px-4 py-3 sm:px-6 mt-4 rounded-xl shadow-sm">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={() => onPageChange && page && onPageChange(Math.max(page - 1, 1))}
              disabled={page === 1}
              className="relative inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => onPageChange && page && onPageChange(Math.min(page + 1, totalPages))}
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
                  onClick={() => onPageChange && page && onPageChange(Math.max(page - 1, 1))}
                  disabled={page === 1}
                  className="relative inline-flex items-center rounded-l-md px-2 py-2 text-slate-400 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Previous</span>
                  <ChevronRightIcon className="h-5 w-5 rotate-180" aria-hidden="true" />
                </button>
                <button
                  onClick={() => onPageChange && page && onPageChange(Math.min(page + 1, totalPages))}
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

      {/* Delete Confirmation Modal */}
      <DeleteCustomerModal
        isOpen={deleteModal.isOpen}
        customerName={deleteModal.customer?.name || ''}
        rmaCount={deleteModal.customer ? rmas.filter(r => r.customer?.id === deleteModal.customer?.id).length : 0}
        onCancel={handleCancelDelete}
        onDeleteCustomerOnly={handleDeleteCustomerOnly}
        onDeleteCustomerAndRmas={handleDeleteCustomerAndRmas}
      />
    </motion.div>
  );
};

export default CustomerListView;
