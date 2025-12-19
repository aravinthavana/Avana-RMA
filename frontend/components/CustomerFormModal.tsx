import React, { useState, useEffect } from 'react';
import { Customer } from '../types';
import { XMarkIcon } from './icons';

/**
 * Props for the CustomerFormModal component.
 */
interface CustomerFormModalProps {
  customer?: Customer; // The customer object to edit. If undefined, the form is for creation.
  onClose: () => void; // Callback to close the modal.
  onSave: (customerData: Omit<Customer, 'id'>, id?: string) => void; // Callback to save the customer data.
}

/**
 * Shape of the validation errors object for the customer form.
 */
interface FormErrors {
  name?: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
}

/**
 * A modal form for creating and editing customer information.
 */
const CustomerFormModal: React.FC<CustomerFormModalProps> = ({ customer, onClose, onSave }) => {
  // State for the form data, initialized with existing customer data if in edit mode.
  const [formData, setFormData] = useState({
    name: customer?.name || '',
    contactPerson: customer?.contactPerson || '',
    email: customer?.email || '',
    phone: customer?.phone || '',
    address: customer?.address || '',
  });

  // State for validation errors, touched fields, and overall form validity.
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof FormErrors, boolean>>>({});
  const [isFormValid, setIsFormValid] = useState(false);

  /**
   * Validates a single field.
   * @param name The name of the field.
   * @param value The value of the field.
   * @returns An error message string if invalid, otherwise undefined.
   */
  const validateField = (name: keyof FormErrors, value: string): string | undefined => {
    switch (name) {
      case 'name':
        return value.trim() ? undefined : 'Customer name is required.';
      case 'contactPerson':
        return value.trim() ? undefined : 'Contact person is required.';
      case 'address':
        return value.trim() ? undefined : 'Address is required.';
      case 'email':
        if (!value.trim()) return 'Email is required.';
        if (!/\S+@\S+\.\S+/.test(value)) return 'Email is not valid.';
        return undefined;
      case 'phone':
        if (!value.trim()) return 'Phone number is required.';
        if (!/^[+]?[()\d\s-]{7,}$/.test(value)) return 'Phone number is not valid.';
        return undefined;
      default:
        return undefined;
    }
  };

  /**
   * Validates the entire form.
   * @param data The current form data.
   * @returns A `FormErrors` object containing any validation messages.
   */
  const validateForm = (data: typeof formData): FormErrors => {
    const newErrors: FormErrors = {};
    Object.keys(data).forEach(key => {
      const error = validateField(key as keyof FormErrors, data[key as keyof FormErrors]);
      if (error) {
        newErrors[key as keyof FormErrors] = error;
      }
    });
    return newErrors;
  }

  // Effect to check form validity whenever the form data changes.
  useEffect(() => {
    setIsFormValid(Object.keys(validateForm(formData)).length === 0);
  }, [formData]);

  /**
   * Generic change handler for form inputs.
   * Updates the form data and validates the field if it has been touched.
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target as { id: keyof FormErrors, value: string };
    setFormData(prev => ({ ...prev, [id]: value }));

    if (touched[id]) {
      const error = validateField(id, value);
      setErrors(prev => ({ ...prev, [id]: error }));
    }
  };

  /**
   * Generic blur handler to mark a field as touched and trigger validation.
   */
  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target as { id: keyof FormErrors, value: string };
    setTouched(prev => ({ ...prev, [id]: true }));
    const error = validateField(id, value);
    setErrors(prev => ({ ...prev, [id]: error }));
  };

  /**
   * Handles form submission.
   * Validates the entire form and calls the `onSave` callback if valid.
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateForm(formData);
    setErrors(validationErrors);
    // Mark all fields as touched to show errors on submit.
    setTouched({ name: true, contactPerson: true, email: true, phone: true, address: true });

    if (Object.keys(validationErrors).length === 0) {
      onSave(formData, customer?.id);
    }
  };

  /**
   * Gets dynamic input styles based on the field's validation state.
   */
  const getInputStyles = (field: keyof FormErrors) => {
    return `block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset placeholder:text-slate-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 ${errors[field] && touched[field] ? 'ring-red-500 text-red-900 focus:ring-red-500' : 'ring-slate-300 focus:ring-primary-600'}`;
  };

  const labelStyles = "block text-sm font-medium leading-6 text-slate-900";

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 modal-enter" aria-labelledby="customer-modal-title" role="dialog" aria-modal="true">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl ring-1 ring-slate-200/50 w-full max-w-lg modal-content-enter">
        <div className="px-6 py-5 flex justify-between items-center border-b border-slate-200/60 bg-gradient-to-r from-primary-50/50 to-transparent">
          <div>
            <h2 id="customer-modal-title" className="text-2xl font-bold text-slate-900 font-display">{customer ? 'Edit Customer' : 'Add New Customer'}</h2>
            <p className="text-sm text-slate-500 mt-0.5">{customer ? 'Update customer information' : 'Create a new customer record'}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all" aria-label="Close modal"><XMarkIcon className="w-6 h-6" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5" noValidate>
          <div>
            <label htmlFor="name" className={labelStyles}>Facility/Customer Name <span className="text-red-500">*</span></label>
            <input type="text" id="name" value={formData.name} onChange={handleChange} onBlur={handleBlur} required className={`mt-1.5 ${getInputStyles('name')}`} />
            {errors.name && touched.name && <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1"><span className="inline-block w-1 h-1 rounded-full bg-red-500"></span>{errors.name}</p>}
          </div>
          <div>
            <label htmlFor="contactPerson" className={labelStyles}>Contact Person <span className="text-red-500">*</span></label>
            <input type="text" id="contactPerson" value={formData.contactPerson} onChange={handleChange} onBlur={handleBlur} required className={`mt-1.5 ${getInputStyles('contactPerson')}`} />
            {errors.contactPerson && touched.contactPerson && <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1"><span className="inline-block w-1 h-1 rounded-full bg-red-500"></span>{errors.contactPerson}</p>}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label htmlFor="email" className={labelStyles}>Email <span className="text-red-500">*</span></label>
              <input type="email" id="email" value={formData.email} onChange={handleChange} onBlur={handleBlur} required className={`mt-1.5 ${getInputStyles('email')}`} />
              {errors.email && touched.email && <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1"><span className="inline-block w-1 h-1 rounded-full bg-red-500"></span>{errors.email}</p>}
            </div>
            <div>
              <label htmlFor="phone" className={labelStyles}>Phone <span className="text-red-500">*</span></label>
              <input type="tel" id="phone" value={formData.phone} onChange={handleChange} onBlur={handleBlur} required className={`mt-1.5 ${getInputStyles('phone')}`} />
              {errors.phone && touched.phone && <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1"><span className="inline-block w-1 h-1 rounded-full bg-red-500"></span>{errors.phone}</p>}
            </div>
          </div>
          <div>
            <label htmlFor="address" className={labelStyles}>Address <span className="text-red-500">*</span></label>
            <textarea id="address" value={formData.address} onChange={handleChange} onBlur={handleBlur} required className={`mt-1.5 ${getInputStyles('address')}`} rows={3} />
            {errors.address && touched.address && <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1"><span className="inline-block w-1 h-1 rounded-full bg-red-500"></span>{errors.address}</p>}
          </div>
          <div className="flex justify-end gap-3 pt-5 border-t border-slate-200/60">
            <button type="button" onClick={onClose} className="rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 hover:ring-slate-400 transition-all">Cancel</button>
            <button type="submit" disabled={!isFormValid} className="rounded-lg bg-gradient-to-r from-primary-600 to-primary-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-500/30 hover:shadow-primary-500/40 hover:from-primary-500 hover:to-primary-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 disabled:from-slate-400 disabled:to-slate-400 disabled:shadow-none disabled:cursor-not-allowed transition-all">
              {customer ? 'Save Changes' : 'Create Customer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerFormModal;
