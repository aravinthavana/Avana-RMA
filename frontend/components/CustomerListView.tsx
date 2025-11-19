import React, { useState } from 'react';
import { Customer } from '../types';
import { PlusIcon, MagnifyingGlassIcon, ChevronRightIcon, PencilIcon, TrashIcon } from './icons';

/**
 * Props for the CustomerListView component.
 */
interface CustomerListViewProps {
  customers: Customer[];
  onSelectCustomer: (id: string) => void;
  onAddCustomer: () => void;
  onEditCustomer: (customer: Customer) => void;
  onDeleteCustomer: (id: string) => void;
}

/**
 * Renders a list of customers with search, add, edit, and delete functionalities.
 */
const CustomerListView: React.FC<CustomerListViewProps> = ({ customers, onSelectCustomer, onAddCustomer, onEditCustomer, onDeleteCustomer }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter customers based on the search term (name or contact person).
  const filteredCustomers = customers.filter(customer => 
    (customer.name?.toLowerCase() ?? '').includes(searchTerm.toLowerCase()) ||
    (customer.contactPerson?.toLowerCase() ?? '').includes(searchTerm.toLowerCase())
  );
  
  /**
   * Handles the delete action for a customer, with a confirmation dialog.
   * @param e The mouse event, stopped to prevent row selection.
   * @param customerId The ID of the customer to delete.
   */
  const handleDelete = (e: React.MouseEvent, customerId: string) => {
      e.stopPropagation();
      if(window.confirm('Are you sure you want to delete this customer? This action cannot be undone.')){
          onDeleteCustomer(customerId)
      }
  }
  
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
    <div>
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Customers</h1>
          <p className="mt-1 text-sm text-slate-600">A list of all customers in your account.</p>
        </div>
        <div className="shrink-0">
          <button type="button" onClick={onAddCustomer} className="inline-flex w-full sm:w-auto justify-center items-center gap-x-2 rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"><PlusIcon className="w-5 h-5" />New Customer</button>
        </div>
      </div>

      {/* Search Input */}
      <div className="mt-4 mb-4">
        <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><MagnifyingGlassIcon className="h-5 w-5 text-slate-400" aria-hidden="true" /></div>
            <input type="search" placeholder="Search by customer or contact name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="block w-full rounded-md border-0 py-1.5 pl-10 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6" />
        </div>
      </div>

      {/* Customer Table */}
      <div className="flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
              <table className="min-w-full divide-y divide-slate-300">
                <thead className="bg-slate-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-slate-900 sm:pl-6">Name</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">Contact Person</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">Contact Info</th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6"><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {filteredCustomers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-slate-50 group">
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                        <div className="font-medium text-primary-600 hover:text-primary-800 cursor-pointer" onClick={() => onSelectCustomer(customer.id)}>{customer.name ?? 'N/A'}</div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">{customer.contactPerson ?? 'N/A'}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                          <div>{customer.email ?? 'N/A'}</div>
                          <div>{customer.phone ?? 'N/A'}</div>
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <div className="flex items-center justify-end gap-x-4">
                            <button onClick={(e) => handleEdit(e, customer)} className="text-slate-500 hover:text-primary-600 p-1 rounded-full hover:bg-slate-100 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"><PencilIcon className="h-5 w-5" /><span className="sr-only">Edit</span></button>
                            <button onClick={(e) => handleDelete(e, customer.id)} className="text-slate-500 hover:text-red-600 p-1 rounded-full hover:bg-slate-100 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"><TrashIcon className="h-5 w-5" /><span className="sr-only">Delete</span></button>
                            <button onClick={() => onSelectCustomer(customer.id)} className="text-primary-600 hover:text-primary-900"><ChevronRightIcon className="h-6 w-6" /><span className="sr-only">View</span></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      
       {filteredCustomers.length === 0 && <div className="text-center py-10 text-slate-500 bg-white rounded-lg mt-4">No customers found.</div>}
    </div>
  );
};

export default CustomerListView;
