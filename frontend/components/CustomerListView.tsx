import React, { useState } from 'react';
import { Customer } from '../types';
import { PlusIcon, MagnifyingGlassIcon, ChevronRightIcon } from './icons';

interface CustomerListViewProps {
  customers: Customer[];
  onSelectCustomer: (id: string) => void;
  onAddCustomer: () => void;
}

const CustomerListView: React.FC<CustomerListViewProps> = ({ customers, onSelectCustomer, onAddCustomer }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCustomers = customers.filter(customer => 
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Customers</h1>
          <p className="mt-1 text-sm text-slate-600">A list of all customers in your account.</p>
        </div>
        <div className="flex-shrink-0">
          <button
            type="button"
            onClick={onAddCustomer}
            className="inline-flex w-full sm:w-auto justify-center items-center gap-x-2 rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
          >
            <PlusIcon className="w-5 h-5" />
            New Customer
          </button>
        </div>
      </div>

       <div className="mt-4 mb-4">
        <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <MagnifyingGlassIcon className="h-5 w-5 text-slate-400" aria-hidden="true" />
            </div>
            <input
              type="search"
              placeholder="Search by customer or contact name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full rounded-md border-0 py-1.5 pl-10 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
            />
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {filteredCustomers.map(customer => (
          <div key={customer.id} onClick={() => onSelectCustomer(customer.id)} onKeyDown={(e) => e.key === 'Enter' && onSelectCustomer(customer.id)} tabIndex={0} className="bg-white shadow-sm ring-1 ring-slate-200 rounded-lg p-4 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500 hover:bg-slate-50 hover:shadow-md transition-shadow duration-150">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-base font-semibold text-primary-600">{customer.name}</p>
                <p className="text-sm text-slate-800">{customer.contactPerson}</p>
              </div>
               <ChevronRightIcon className="w-5 h-5 text-slate-400" />
            </div>
            <div className="mt-3 border-t border-slate-200 pt-3 text-sm text-slate-500">
              <p>{customer.email}</p>
              <p>{customer.phone}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white shadow-sm ring-1 ring-slate-200 rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-slate-900 sm:pl-6">Name</th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">Contact Person</th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">Contact Info</th>
              <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6"><span className="sr-only">View</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {filteredCustomers.map((customer) => (
              <tr key={customer.id} className="hover:bg-slate-50 cursor-pointer group" onClick={() => onSelectCustomer(customer.id)} onKeyDown={(e) => e.key === 'Enter' && onSelectCustomer(customer.id)} tabIndex={0} aria-label={`View details for ${customer.name}`}>
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-primary-600 sm:pl-6">{customer.name}</td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">{customer.contactPerson}</td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                    <div>{customer.email}</div>
                    <div>{customer.phone}</div>
                </td>
                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                  <span className="text-primary-600 hover:text-primary-900">View</span>
                   <ChevronRightIcon className="w-5 h-5 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
       {filteredCustomers.length === 0 && (
         <div className="text-center py-10 text-slate-500 bg-white md:bg-transparent rounded-lg">No customers found.</div>
       )}
    </div>
  );
};

export default CustomerListView;