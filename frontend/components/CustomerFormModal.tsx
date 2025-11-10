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
    <div className="fixed inset-0 bg-slate-800 bg-opacity-75 flex items-center justify-center z-50 p-4 modal-enter" aria-labelledby="customer-modal-title" role="dialog" aria-modal="true">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg modal-content-enter">
        <div className="px-6 py-4 flex justify-between items-center border-b border-slate-200">
          <h2 id="customer-modal-title" className="text-xl font-semibold text-slate-800">{customer ? 'Edit Customer' : 'Add New Customer'}</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800" aria-label="Close modal"><XMarkIcon className="w-6 h-6" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4" noValidate>
            <div>
              <label htmlFor="name" className={labelStyles}>Facility/Customer Name</label>
              <input type="text" id="name" value={formData.name} onChange={handleChange} onBlur={handleBlur} required className={`mt-1 ${getInputStyles('name')}`} />
              {errors.name && touched.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>
            <div>
              <label htmlFor="contactPerson" className={labelStyles}>Contact Person</label>
              <input type="text" id="contactPerson" value={formData.contactPerson} onChange={handleChange} onBlur={handleBlur} required className={`mt-1 ${getInputStyles('contactPerson')}`} />
              {errors.contactPerson && touched.contactPerson && <p className="mt-1 text-sm text-red-600">{errors.contactPerson}</p>}
            </div>
            <div>
              <label htmlFor="email" className={labelStyles}>Email</label>
              <input type="email" id="email" value={formData.email} onChange={handleChange} onBlur={handleBlur} required className={`mt-1 ${getInputStyles('email')}`} />
              {errors.email && touched.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>
            <div>
              <label htmlFor="phone" className={labelStyles}>Phone</label>
              <input type="tel" id="phone" value={formData.phone} onChange={handleChange} onBlur={handleBlur} required className={`mt-1 ${getInputStyles('phone')}`} />
              {errors.phone && touched.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
            </div>
            <div>
              <label htmlFor="address" className={labelStyles}>Address</label>
              <textarea id="address" value={formData.address} onChange={handleChange} onBlur={handleBlur} required className={`mt-1 ${getInputStyles('address')}`} rows={3} />
              {errors.address && touched.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
            </div>
          <div className="flex justify-end gap-4 pt-4 border-t border-slate-200">
            <button type="button" onClick={onClose} className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50">Cancel</button>
            <button type="submit" disabled={!isFormValid} className="rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 disabled:bg-slate-400 disabled:cursor-not-allowed">
              {customer ? 'Save Changes' : 'Create Customer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerFormModal;
