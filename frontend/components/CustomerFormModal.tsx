import React, { useState } from 'react';
import { Customer } from '../types';
import { XMarkIcon } from './icons';

interface CustomerFormModalProps {
  customer?: Customer;
  onClose: () => void;
  onSave: (customerData: Omit<Customer, 'id'>, id?: string) => void;
}

const CustomerFormModal: React.FC<CustomerFormModalProps> = ({ customer, onClose, onSave }) => {
  const [name, setName] = useState(customer?.name || '');
  const [contactPerson, setContactPerson] = useState(customer?.contactPerson || '');
  const [email, setEmail] = useState(customer?.email || '');
  const [phone, setPhone] = useState(customer?.phone || '');
  const [address, setAddress] = useState(customer?.address || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !contactPerson.trim()) return;
    onSave({ name, contactPerson, email, phone, address }, customer?.id);
  };

  const isFormValid = name.trim() && contactPerson.trim() && email.trim() && phone.trim() && address.trim();

  const inputStyles = "block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6";
  const labelStyles = "block text-sm font-medium leading-6 text-slate-900";

  return (
    <div className="fixed inset-0 bg-slate-800 bg-opacity-75 flex items-center justify-center z-50 p-4 modal-enter" aria-labelledby="customer-modal-title" role="dialog" aria-modal="true">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg modal-content-enter">
        <div className="px-6 py-4 flex justify-between items-center border-b border-slate-200">
          <h2 id="customer-modal-title" className="text-xl font-semibold text-slate-800">{customer ? 'Edit Customer' : 'Add New Customer'}</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800" aria-label="Close modal">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label htmlFor="name" className={labelStyles}>Facility/Customer Name</label>
              <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} required className={`mt-2 ${inputStyles}`} />
            </div>
            <div>
              <label htmlFor="contactPerson" className={labelStyles}>Contact Person</label>
              <input type="text" id="contactPerson" value={contactPerson} onChange={e => setContactPerson(e.target.value)} required className={`mt-2 ${inputStyles}`} />
            </div>
            <div>
              <label htmlFor="email" className={labelStyles}>Email</label>
              <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} required className={`mt-2 ${inputStyles}`} />
            </div>
            <div>
              <label htmlFor="phone" className={labelStyles}>Phone</label>
              <input type="tel" id="phone" value={phone} onChange={e => setPhone(e.target.value)} required className={`mt-2 ${inputStyles}`} />
            </div>
            <div>
              <label htmlFor="address" className={labelStyles}>Address</label>
              <textarea id="address" value={address} onChange={e => setAddress(e.target.value)} required className={`mt-2 ${inputStyles}`} rows={3} />
            </div>
          </div>
          <div className="flex justify-end gap-4 pt-4 border-t border-slate-200">
            <button type="button" onClick={onClose} className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50">Cancel</button>
            <button type="submit" disabled={!isFormValid} className="rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 disabled:bg-slate-300 disabled:cursor-not-allowed">
              {customer ? 'Save Changes' : 'Create Customer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerFormModal;