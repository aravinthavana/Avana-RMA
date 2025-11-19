import React, { useState, useEffect, useRef } from 'react';
import { Rma, Customer, Device, ServiceCycle } from '../types';
import { XMarkIcon, PlusIcon } from './icons';


const hospitals = [
    "General Hospital",
    "City Clinic",
    "Sunrise Medical Center",
    "Westside Regional Hospital",
    "Community Health Services",
];

/**
 * Props for the RmaFormModal component.
 */
interface RmaFormModalProps {
  rma?: Rma; // The RMA object to edit. If undefined, the form is for creation.
  customers: Customer[]; // The list of all available customers.
  onClose: () => void; // Callback to close the modal.
  onSave: (rmaData: any, id?: string) => void; // Callback to save the RMA data.
  preselectedCustomerId?: string; // ID of a customer to pre-select, used when creating an RMA from a customer's page.
  onAddNewCustomer: () => void; // Callback to open the "Add New Customer" modal.
  lastCreatedCustomerId?: string | null; // ID of the most recently created customer, used to auto-select them.
}

/**
 * Data structure for a single device within the form.
 */
interface FormDeviceData {
  model: string;
  partNumber: string;
  serialNumber: string;
  quantity: number;
  issueDescription: string;
  accessoriesIncluded: string;
}

/**
 * The main data structure for the RMA form.
 */
interface FormData {
  customerId: string;
  dateOfIncident: string;
  dateOfReport: string;
  devices: FormDeviceData[];
}

/**
 * Shape of the validation errors object.
 */
interface Errors {
  customerId?: string;
  dateOfIncident?: string;
  dateOfReport?: string;
  devices?: { [index: number]: Partial<Record<keyof FormDeviceData, string>> };
}

/**
 * Shape of the touched fields object, to track which fields the user has interacted with.
 */
interface Touched {
    customerId?: boolean;
    dateOfIncident?: boolean;
    dateOfReport?: boolean;
    devices?: { [index: number]: Partial<Record<keyof FormDeviceData, boolean>> };
}

/**
 * A modal form for creating and editing RMAs.
 * It handles complex form state, validation, and dynamic device fields.
 */
const RmaFormModal: React.FC<RmaFormModalProps> = ({ rma, customers, onClose, onSave, preselectedCustomerId, onAddNewCustomer, lastCreatedCustomerId }) => {
    // Initialize the state for the devices section based on whether we are editing or creating.
    const initialDevices = rma ? rma.devices.map(d => {
      const cycle = rma.serviceCycles.find(sc => sc.deviceSerialNumber === d.serialNumber);
      return {
          model: d.model,
          partNumber: d.partNumber,
          serialNumber: d.serialNumber,
          quantity: d.quantity,
          issueDescription: cycle?.issueDescription || '',
          accessoriesIncluded: cycle?.accessoriesIncluded || '',
      }
  }) : [{
    model: '', 
    partNumber: '',
    serialNumber: '',
    quantity: 1,
    issueDescription: '', 
    accessoriesIncluded: '',
   }];

  // Main state for the form data.
  const [formData, setFormData] = useState<FormData>({ 
    customerId: rma?.customer.id || preselectedCustomerId || '',
    dateOfIncident: (rma?.dateOfIncident || new Date().toISOString()).split('T')[0],
    dateOfReport: (rma?.dateOfReport || new Date().toISOString()).split('T')[0],
    devices: initialDevices
  });

  // State for validation errors and touched fields.
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Touched>({});
  const [isFormValid, setIsFormValid] = useState(false);
  
  // State for handling file attachments.
  const [attachment, setAttachment] = useState<File | null>(null);
  const [existingAttachment, setExistingAttachment] = useState(rma?.attachment || '');
  
  // State for the customer search/selection dropdown.
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);
  const customerDropdownRef = useRef<HTMLDivElement>(null);
  const [hospital, setHospital] = useState(rma?.customer.name || '');


  /**
   * Validates a single field.
   * @param name The name of the field to validate.
   * @param value The value of the field.
   * @returns An error message string if invalid, otherwise undefined.
   */
  const validateField = (name: keyof FormData | `devices.${number}.${keyof FormDeviceData}`, value: any): string | undefined => {
    const parts = name.split('.');
    
    if (parts[0] === 'devices') {
        const [, indexStr, field] = parts;
        const index = parseInt(indexStr);
        const device = formData.devices[index];
        if (!device) return undefined;

        switch (field as keyof FormDeviceData) {
            case 'model': return value.trim() ? undefined : 'Device model is required.';
            case 'serialNumber': return value.trim() ? undefined : 'Serial number is required.';
            case 'issueDescription': return value.trim() ? undefined : 'Failure description is required.';
            case 'quantity':
                if (typeof value !== 'number' || isNaN(value)) return 'Quantity must be a number.';
                if (value < 1) return 'Quantity must be at least 1.';
                return undefined;
            default: return undefined;
        }
    } else {
        switch (name as keyof Omit<FormData, 'devices'>) {
            case 'customerId': return value.trim() ? undefined : 'A customer must be selected.';
            case 'dateOfIncident': return value ? undefined : 'Date of incident is required.';
            case 'dateOfReport':
                if (!value) return 'Date of report is required.';
                if (new Date(formData.dateOfIncident) > new Date(value)) return 'Report date cannot be earlier than incident date.';
                return undefined;
            default: return undefined;
        }
    }
};

  /**
   * Validates the entire form.
   * @param data The current form data.
   * @returns An `Errors` object containing any validation messages.
   */
  const validateForm = (data: FormData): Errors => {
    const newErrors: Errors = {};
    // Validate root fields
    Object.keys(data).forEach(key => {
        if (key !== 'devices') {
            const error = validateField(key as keyof FormData, data[key as keyof FormData]);
            if (error) newErrors[key as keyof Errors] = error;
        }
    });
    // Validate each device
    const deviceErrors: Errors['devices'] = {};
    data.devices.forEach((device, index) => {
        const singleDeviceErrors: Partial<Record<keyof FormDeviceData, string>> = {};
        (Object.keys(device) as Array<keyof FormDeviceData>).forEach(field => {
            const error = validateField(`devices.${index}.${field}`, device[field]);
            if (error) singleDeviceErrors[field] = error;
        });
        if (Object.keys(singleDeviceErrors).length > 0) deviceErrors[index] = singleDeviceErrors;
    });
    if (Object.keys(deviceErrors).length > 0) newErrors.devices = deviceErrors;

    return newErrors;
  }

  // Effect to re-evaluate form validity whenever the data changes.
  useEffect(() => {
    setIsFormValid(Object.keys(validateForm(formData)).length === 0);
  }, [formData]);

  // Effect to auto-select a customer if they were just created.
  useEffect(() => {
    if (lastCreatedCustomerId) {
        const newCustomer = customers.find(c => c.id === lastCreatedCustomerId);
        if(newCustomer) handleSelectCustomer(newCustomer);
    }
  }, [lastCreatedCustomerId, customers]);

  // Effect to populate the customer search input when a customer is selected.
  useEffect(() => {
    const selectedCustomer = customers.find(c => c.id === formData.customerId);
    if (selectedCustomer) {
      setCustomerSearchTerm(selectedCustomer.name);
    }
  }, [formData.customerId, customers]);

  // Effect to handle closing the customer dropdown when clicking outside.
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (customerDropdownRef.current && !customerDropdownRef.current.contains(event.target as Node)) {
        setIsCustomerDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  /**
   * Generic change handler for top-level form fields.
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target as { id: keyof Omit<FormData, 'devices'>, value: string };
    setFormData(prev => ({ ...prev, [id]: value }));
    // Re-validate on change if the field has been touched.
    if (touched[id]) {
      const error = validateField(id, value);
      setErrors(prev => ({ ...prev, [id]: error }));
    }
  };

  /**
   * Change handler for fields within a device.
   */
  const handleDeviceChange = (index: number, field: keyof FormDeviceData, value: string | number) => {
    const newDevices = [...formData.devices];
    (newDevices[index] as any)[field] = value;
    setFormData(prev => ({ ...prev, devices: newDevices }));
    // Re-validate on change if the field has been touched.
    if (touched.devices?.[index]?.[field]) {
      const error = validateField(`devices.${index}.${field}`, value);
      setErrors(prev => {
          const newDeviceErrors = { ...(prev.devices || {}) };
          if (!newDeviceErrors[index]) newDeviceErrors[index] = {};
          (newDeviceErrors[index] as any)[field] = error;
          if (!error) delete (newDeviceErrors[index] as any)[field];
          if (Object.keys(newDeviceErrors[index]!).length === 0) delete newDeviceErrors[index];
          return { ...prev, devices: newDeviceErrors };
      });
    }
  };
  
  /**
   * Generic blur handler to mark fields as touched and trigger validation.
   */
  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { id, value } = e.target as { id: keyof FormData, value: string };
      setTouched(prev => ({ ...prev, [id]: true }));
      const error = validateField(id, value);
      setErrors(prev => ({ ...prev, [id]: error }));
  };
  
  /**
   * Blur handler for fields within a device.
   */
  const handleDeviceBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>, index: number, field: keyof FormDeviceData) => {
      const { value } = e.target;
      setTouched(prev => {
          const newTouched = { ...prev };
          if (!newTouched.devices) newTouched.devices = {};
          if (!newTouched.devices[index]) newTouched.devices[index] = {};
          (newTouched.devices[index] as any)[field] = true;
          return newTouched;
      });
      const error = validateField(`devices.${index}.${field}`, value);
      setErrors(prev => {
          const newDeviceErrors = { ...(prev.devices || {}) };
          if (!newDeviceErrors[index]) newDeviceErrors[index] = {};
          (newDeviceErrors[index] as any)[field] = error;
          if (!error) delete (newDeviceErrors[index] as any)[field];
          if (Object.keys(newDeviceErrors[index]!).length === 0) delete newDeviceErrors[index];
          return { ...prev, devices: newDeviceErrors };
      });
  }

  /** Adds a new, empty device to the form. */
  const addDevice = () => {
    setFormData(prev => ({ ...prev, devices: [...prev.devices, { model: '', partNumber: '', serialNumber: '', quantity: 1, issueDescription: '', accessoriesIncluded: '' }] }));
  };

  /** Removes a device from the form. */
  const removeDevice = (index: number) => {
    if (formData.devices.length > 1) {
      setFormData(prev => ({ ...prev, devices: prev.devices.filter((_, i) => i !== index) }));
    }
  };

  /** Handles changes to the customer search input. */
  const handleCustomerSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomerSearchTerm(e.target.value);
    setFormData(prev => ({ ...prev, customerId: '' })); // Clear selection when searching
    setIsCustomerDropdownOpen(true);
    setTouched(prev => ({ ...prev, customerId: true }));
    const error = validateField('customerId', '');
    setErrors(prev => ({...prev, customerId: error}));
  };
  
  /** Handles selecting a customer from the dropdown. */
  const handleSelectCustomer = (customer: Customer) => {
    setFormData(prev => ({ ...prev, customerId: customer.id }));
    setCustomerSearchTerm(customer.name);
    setIsCustomerDropdownOpen(false);
    const error = validateField('customerId', customer.id);
    setErrors(prev => ({...prev, customerId: error}));
  };

  /**
   * Handles the form submission.
   * It triggers final validation and calls the `onSave` callback if valid.
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateForm(formData);
    setErrors(validationErrors);
    // Mark all fields as touched to show errors on submit.
    const fullTouched: Touched = {
        customerId: true, dateOfIncident: true, dateOfReport: true, 
        devices: formData.devices.map(() => ({ model: true, serialNumber: true, issueDescription: true }))
    };
    setTouched(fullTouched);

    if (Object.keys(validationErrors).length > 0) {
        console.log('Validation failed', validationErrors);
        return;
    }
    
    // Prepare data for saving.
    const customer = customers.find(c => c.id === formData.customerId);
    const rmaDevices: Device[] = formData.devices.map(d => ({ model: d.model, partNumber: d.partNumber, serialNumber: d.serialNumber, quantity: d.quantity }));
    
    let serviceCyclesData;
    if (rma) {
        // If editing, preserve existing service cycles and update descriptions from form
        serviceCyclesData = rma.serviceCycles.map(cycle => {
            const formDevice = formData.devices.find(d => d.serialNumber === cycle.deviceSerialNumber);
            return {
                ...cycle,
                issueDescription: formDevice?.issueDescription || cycle.issueDescription,
                accessoriesIncluded: formDevice?.accessoriesIncluded || cycle.accessoriesIncluded,
            };
        });
    } else {
        // If creating, build new service cycles from form data
        serviceCyclesData = formData.devices.map(d => ({ 
            issueDescription: d.issueDescription, 
            accessoriesIncluded: d.accessoriesIncluded,
            deviceSerialNumber: d.serialNumber
        }));
    }

    // Call the parent onSave handler.
    onSave({
      customer: {
        ...customer,
        name: hospital,
    },
      devices: rmaDevices,
      serviceCycles: serviceCyclesData,
      dateOfIncident: formData.dateOfIncident,
      dateOfReport: formData.dateOfReport,
      attachment: attachment ? attachment.name : existingAttachment
    }, rma?.id);
  };

  // Memoized list of customers filtered by the search term.
  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(customerSearchTerm.toLowerCase())
  );

  // Utility function to get dynamic input styles based on error state.
  const getInputStyles = (isError: boolean) => 
    `block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset placeholder:text-slate-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 ${isError ? 'ring-red-500 text-red-900 focus:ring-red-500' : 'ring-slate-300 focus:ring-primary-600'}`;

  const labelStyles = "block text-sm font-medium leading-6 text-slate-900";
  const errorTextStyles = "mt-1 text-sm text-red-600";

  return (
    <div className="fixed inset-0 bg-slate-800 bg-opacity-75 flex items-center justify-center z-50 p-4 modal-enter" aria-labelledby="rma-modal-title" role="dialog" aria-modal="true">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col modal-content-enter">
        <header className="px-6 py-4 flex justify-between items-center border-b border-slate-200 shrink-0">
          <h2 id="rma-modal-title" className="text-xl font-semibold text-slate-800">{rma ? 'Edit RMA' : 'Create New RMA'}</h2>
          <button onClick={onClose} className="p-2 rounded-full text-slate-500 hover:text-slate-800 hover:bg-slate-100" aria-label="Close modal"><XMarkIcon className="w-6 h-6" /></button>
        </header>
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto" noValidate>
            {/* Customer Information Section */}
            <section>
                <h3 className="text-lg font-medium text-slate-900 border-b pb-2 mb-4">Customer Information</h3>
                <div>
                <label htmlFor="customer" className={labelStyles}>Customer <span className="text-red-500">*</span></label>
                <div className="mt-2 flex items-center gap-2">
                    <div className="relative grow" ref={customerDropdownRef}>
                    <input type="text" id="customer" placeholder="Search or select a customer" value={customerSearchTerm} onChange={handleCustomerSearchChange} onFocus={() => setIsCustomerDropdownOpen(true)} onBlur={() => setTouched(prev => ({...prev, customerId: true}))} disabled={!!preselectedCustomerId || !!rma} required autoComplete="off" className={getInputStyles(!!errors.customerId && touched.customerId)} role="combobox" aria-expanded={isCustomerDropdownOpen} aria-controls="customer-listbox" aria-autocomplete="list" aria-invalid={!!errors.customerId && touched.customerId} />
                    {isCustomerDropdownOpen && !preselectedCustomerId && !rma && (
                        <div id="customer-listbox" role="listbox" className="absolute z-20 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                        {filteredCustomers.length > 0 ? (
                            filteredCustomers.map(c => (
                            <div key={c.id} id={`customer-option-${c.id}`} role="option" aria-selected={c.id === formData.customerId} onClick={() => handleSelectCustomer(c)} className="cursor-pointer select-none relative py-2 pl-3 pr-9 text-slate-900 hover:bg-primary-600 hover:text-white"><span className="block truncate">{c.name}</span></div>
                            ))
                        ) : (
                            <div className="px-4 py-2 text-sm text-slate-500">No customers found.</div>
                        )}
                        </div>
                    )}
                    </div>
                    {!preselectedCustomerId && !rma && (<button type="button" onClick={onAddNewCustomer} title="Add New Customer" className="inline-flex items-center gap-x-2 rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50"><PlusIcon className="h-5 w-5 text-slate-500"/> New</button>)}
                </div>
                {errors.customerId && touched.customerId && <p className={errorTextStyles}>{errors.customerId}</p>}
            </div>
            {rma && (
                <div className="mt-4">
                    <label htmlFor="hospital" className={labelStyles}>Hospital</label>
                    <select id="hospital" value={hospital} onChange={e => setHospital(e.target.value)} className={`mt-2 ${getInputStyles(false)}`}>
                        <option value="" disabled>Select a hospital</option>
                        {hospitals.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                </div>
            )}
            </section>

            {/* Dynamic Device Information Sections */}
            {formData.devices.map((device, index) => (
                <section key={index} className={`border rounded-lg p-4 relative ${Object.keys(errors.devices?.[index] || {}).length > 0 && Object.values(touched.devices?.[index] || {}).some(t => t) ? 'border-red-400 bg-red-50/50' : 'border-slate-200'}`}>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium text-slate-900">Device Information #{index + 1}</h3>
                        {formData.devices.length > 1 && !rma && (<button type="button" onClick={() => removeDevice(index)} className="text-sm font-medium text-red-600 hover:text-red-500">Remove</button>)}
                    </div>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div>
                            <label htmlFor={`model-${index}`} className={labelStyles}>Device Model <span className="text-red-500">*</span></label>
                            <input type="text" id={`model-${index}`} value={device.model} onChange={e => handleDeviceChange(index, 'model', e.target.value)} onBlur={e => handleDeviceBlur(e, index, 'model')} required className={`mt-2 ${getInputStyles(!!errors.devices?.[index]?.model && !!touched.devices?.[index]?.model)}`} />
                            {errors.devices?.[index]?.model && touched.devices?.[index]?.model && <p className={errorTextStyles}>{errors.devices[index]?.model}</p>}
                        </div>
                        <div>
                            <label htmlFor={`partNumber-${index}`} className={labelStyles}>Part Number</label>
                            <input type="text" id={`partNumber-${index}`} value={device.partNumber} onChange={e => handleDeviceChange(index, 'partNumber', e.target.value)} className={`mt-2 ${getInputStyles(false)}`} />
                        </div>
                        <div>
                            <label htmlFor={`serialNumber-${index}`} className={labelStyles}>Serial / Lot Number <span className="text-red-500">*</span></label>
                            <input type="text" id={`serialNumber-${index}`} value={device.serialNumber} onChange={e => handleDeviceChange(index, 'serialNumber', e.target.value)} onBlur={e => handleDeviceBlur(e, index, 'serialNumber')} required className={`mt-2 ${getInputStyles(!!errors.devices?.[index]?.serialNumber && !!touched.devices?.[index]?.serialNumber)}`} />
                            {errors.devices?.[index]?.serialNumber && touched.devices?.[index]?.serialNumber && <p className={errorTextStyles}>{errors.devices[index]?.serialNumber}</p>}
                        </div>
                        <div>
                            <label htmlFor={`quantity-${index}`} className={labelStyles}>Quantity <span className="text-red-500">*</span></label>
                            <input type="number" id={`quantity-${index}`} value={device.quantity} onChange={e => handleDeviceChange(index, 'quantity', Number(e.target.value))} onBlur={e => handleDeviceBlur(e, index, 'quantity')} min={1} required className={`mt-2 ${getInputStyles(!!errors.devices?.[index]?.quantity && !!touched.devices?.[index]?.quantity)}`} />
                            {errors.devices?.[index]?.quantity && touched.devices?.[index]?.quantity && <p className={errorTextStyles}>{errors.devices[index]?.quantity}</p>}
                        </div>
                        <div className="sm:col-span-2">
                            <label htmlFor={`issueDescription-${index}`} className={labelStyles}>Failure Description/Details <span className="text-red-500">*</span></label>
                            <textarea id={`issueDescription-${index}`} value={device.issueDescription} onChange={e => handleDeviceChange(index, 'issueDescription', e.target.value)} onBlur={e => handleDeviceBlur(e, index, 'issueDescription')} required className={`mt-2 ${getInputStyles(!!errors.devices?.[index]?.issueDescription && !!touched.devices?.[index]?.issueDescription)}`} rows={3} />
                            {errors.devices?.[index]?.issueDescription && touched.devices?.[index]?.issueDescription && <p className={errorTextStyles}>{errors.devices[index]?.issueDescription}</p>}
                        </div>
                        <div className="sm:col-span-2">
                            <label htmlFor={`accessoriesIncluded-${index}`} className={labelStyles}>Accessories Included</label>
                            <textarea id={`accessoriesIncluded-${index}`} value={device.accessoriesIncluded} onChange={e => handleDeviceChange(index, 'accessoriesIncluded', e.target.value)} placeholder="e.g., Main unit, power cord, 2 batteries" className={`mt-2 ${getInputStyles(false)}`} rows={2} />
                        </div>
                    </div>
                </section>
            ))}
            
            {!rma && (<div className="pt-2"><button type="button" onClick={addDevice} className="inline-flex items-center gap-x-2 rounded-md bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 hover:bg-slate-200 w-full justify-center"><PlusIcon className="h-5 w-5 text-slate-500"/> Add Another Device</button></div>)}

            {/* Additional Information Section */}
            <section className="border border-slate-200 rounded-lg p-4 relative">
                <h3 className="text-lg font-medium text-slate-900">Additional Information</h3>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 mt-4">
                    <div>
                        <label htmlFor="dateOfIncident" className={labelStyles}>Date of Incident <span className="text-red-500">*</span></label>
                        <input type="date" id="dateOfIncident" value={formData.dateOfIncident} onChange={handleChange} onBlur={handleBlur} required className={`mt-2 ${getInputStyles(!!errors.dateOfIncident && !!touched.dateOfIncident)}`} />
                        {errors.dateOfIncident && touched.dateOfIncident && <p className={errorTextStyles}>{errors.dateOfIncident}</p>}
                    </div>
                    <div>
                        <label htmlFor="dateOfReport" className={labelStyles}>Date of Report <span className="text-red-500">*</span></label>
                        <input type="date" id="dateOfReport" value={formData.dateOfReport} onChange={handleChange} onBlur={handleBlur} required className={`mt-2 ${getInputStyles(!!errors.dateOfReport && !!touched.dateOfReport)}`} />
                        {errors.dateOfReport && touched.dateOfReport && <p className={errorTextStyles}>{errors.dateOfReport}</p>}
                    </div>
                    <div className="sm:col-span-2">
                        <label htmlFor="attachment" className={labelStyles}>Attachment Proof (optional)</label>
                        <input type="file" id="attachment" onChange={e => setAttachment(e.target.files ? e.target.files[0] : null)} className="mt-2 block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"/>
                    </div>
                </div>
            </section>

            {/* Form Actions */}
            <div className="flex justify-end gap-4 pt-6 border-t border-slate-200 shrink-0">
                <button type="button" onClick={onClose} className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={!isFormValid} className="rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 disabled:bg-slate-400 disabled:cursor-not-allowed">
                {rma ? 'Save Changes' : 'Create RMA'}
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default RmaFormModal;