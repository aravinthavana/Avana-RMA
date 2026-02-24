import React, { useState, useEffect, useRef } from 'react';
import { Rma, Customer, Device, ServiceCycle, RmaStatus } from '../types';
import { XMarkIcon, PlusIcon } from './icons';
import { API_BASE_URL } from '../config';
import { LoadingSpinner } from '../src/components/ui/LoadingSpinner';

const hospitals = [
  "General Hospital",
  "City Clinic",
  "Sunrise Medical Center",
  "Westside Regional Hospital",
  "Community Health Services",
];

interface RmaFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (rmaData: any, id?: string) => void;
  initialData?: Rma | null;
  customers: Customer[]; // Initial customers (current page)
  preselectedCustomerId?: string;
  onAddNewCustomer: () => void;
  lastCreatedCustomerId?: string | null;
}

interface FormDeviceData {
  articleNumber: string;
  serialNumber: string;
  quantity: number;
  issueDescription: string;
  accessoriesIncluded: string;
}

interface FormData {
  customerId: string;
  dateOfIncident: string;
  dateOfIncident: string;
  dateOfReport: string;
  isInjuryRelated: boolean;
  injuryDetails: string;
  devices: FormDeviceData[];
}

interface Errors {
  customerId?: string;
  dateOfIncident?: string;
  dateOfReport?: string;
  injuryDetails?: string;
  devices?: { [index: number]: Partial<Record<keyof FormDeviceData, string>> };
  customer?: string; // Legacy/Fallback
}

interface Touched {
  customerId?: boolean;
  dateOfIncident?: boolean;
  dateOfReport?: boolean;
  isInjuryRelated?: boolean;
  injuryDetails?: boolean;
  devices?: { [index: number]: Partial<Record<keyof FormDeviceData, boolean>> };
}

const RmaFormModal: React.FC<RmaFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  customers: initialCustomersProp,
  preselectedCustomerId,
  onAddNewCustomer,
  lastCreatedCustomerId
}) => {
  // const API_BASE_URL = 'http://localhost:3001';

  // --- Initial Data Preparation ---
  const initialDevices: FormDeviceData[] = initialData ? initialData.devices.map(d => {
    const cycle = initialData.serviceCycles.find(sc => sc.deviceSerialNumber === d.serialNumber);
    return {
      articleNumber: d.articleNumber,
      serialNumber: d.serialNumber,
      quantity: d.quantity,
      issueDescription: cycle?.issueDescription || '',
      accessoriesIncluded: cycle?.accessoriesIncluded || '',
    };
  }) : [{
    articleNumber: '',
    serialNumber: '',
    quantity: 1,
    issueDescription: '',
    accessoriesIncluded: '',
  }];

  // --- State ---
  const [formData, setFormData] = useState<FormData>({
    customerId: initialData?.customer.id || preselectedCustomerId || '',
    dateOfIncident: (initialData?.dateOfIncident || new Date().toISOString()).split('T')[0],
    dateOfReport: (initialData?.dateOfReport || new Date().toISOString()).split('T')[0],
    isInjuryRelated: initialData?.isInjuryRelated || false,
    injuryDetails: initialData?.injuryDetails || '',
    devices: initialDevices
  });

  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Touched>({});
  const [isFormValid, setIsFormValid] = useState(false);
  const [attachment, setAttachment] = useState<File | null>(null);
  const [existingAttachment, setExistingAttachment] = useState(initialData?.attachment || '');

  // Customer Search State
  const [customerOptions, setCustomerOptions] = useState<Customer[]>(initialCustomersProp);
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);
  const [isSearchingCustomers, setIsSearchingCustomers] = useState(false);
  const customerDropdownRef = useRef<HTMLDivElement>(null);

  const [hospital, setHospital] = useState(initialData?.customer.name || '');

  // --- Effects ---

  // Reset form when opening/closing or changing initialData
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          customerId: initialData.customer.id,
          dateOfIncident: (initialData.dateOfIncident || new Date().toISOString()).split('T')[0],
          dateOfReport: (initialData.dateOfReport || new Date().toISOString()).split('T')[0],
          isInjuryRelated: initialData.isInjuryRelated || false,
          injuryDetails: initialData.injuryDetails || '',
          devices: initialData.devices.map(d => {
            const cycle = initialData.serviceCycles.find(sc => sc.deviceSerialNumber === d.serialNumber);
            return {
              articleNumber: d.articleNumber,
              serialNumber: d.serialNumber,
              quantity: d.quantity,
              issueDescription: cycle?.issueDescription || '',
              accessoriesIncluded: cycle?.accessoriesIncluded || '',
            };
          })
        });
        setExistingAttachment(initialData.attachment || '');
        setHospital(initialData.customer.name);
        if (initialData.customer) {
          setCustomerOptions(prev => {
            if (prev.find(c => c.id === initialData.customer!.id)) return prev;
            return [initialData.customer!, ...prev];
          });
          setCustomerSearchTerm(initialData.customer.name);
        }
      } else {
        // Reset for new RMA
        setFormData({
          customerId: preselectedCustomerId || '',
          dateOfIncident: new Date().toISOString().split('T')[0],
          dateOfReport: new Date().toISOString().split('T')[0],
          isInjuryRelated: false,
          injuryDetails: '',
          devices: [{ articleNumber: '', serialNumber: '', quantity: 1, issueDescription: '', accessoriesIncluded: '' }]
        });
        setCustomerSearchTerm('');
        setExistingAttachment('');
        setHospital('');
        if (preselectedCustomerId) {
          const preselected = initialCustomersProp.find(c => c.id === preselectedCustomerId);
          if (preselected) {
            setCustomerSearchTerm(preselected.name);
          }
        }
      }
      setErrors({});
      setTouched({});
    }
  }, [isOpen, initialData, preselectedCustomerId, initialCustomersProp]);

  // Debounced Search
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      // Only search if user explicitly typed sufficiently, to avoid spamming on initial load
      // But here we want to allow searching on any input.
      // We skip search if the term matches the currently selected customer name exactly (loaded from initial)
      // to prevent re-fetching list just because we populated the input.
      const currentCustomer = customerOptions.find(c => c.id === formData.customerId);
      if (customerSearchTerm && (!currentCustomer || currentCustomer.name !== customerSearchTerm)) {
        setIsSearchingCustomers(true);
        try {
          const response = await fetch(`${API_BASE_URL}/api/customers?search=${encodeURIComponent(customerSearchTerm)}&limit=20`);
          if (response.ok) {
            const data = await response.json();
            const results = data.data || [];
            setCustomerOptions(results);
          }
        } catch (error) {
          console.error("Failed to search customers:", error);
        } finally {
          setIsSearchingCustomers(false);
        }
      } else if (!customerSearchTerm) {
        // Reset to props if cleared
        let resetOptions = [...initialCustomersProp];
        if (formData.customerId) {
          // Keep selected customer in list if possible, but we might not have it if it was from a search.
          // ideally we keep the current one.
          const current = customerOptions.find(c => c.id === formData.customerId);
          if (current && !resetOptions.find(c => c.id === current.id)) {
            resetOptions = [current, ...resetOptions];
          }
        }
        setCustomerOptions(resetOptions);
      }
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [customerSearchTerm, formData.customerId]);


  useEffect(() => {
    setIsFormValid(Object.keys(validateForm(formData)).length === 0);
  }, [formData]);

  useEffect(() => {
    if (lastCreatedCustomerId) {
      // If a new customer was created, fetch them or find them?
      // Since we are not fetching here, we hope App passed the updated list.
      // But App fetches page 1. New customer might be there.
      const newCustomer = initialCustomersProp.find(c => c.id === lastCreatedCustomerId);
      if (newCustomer) {
        setCustomerOptions(prev => [newCustomer, ...prev]);
        handleSelectCustomer(newCustomer);
      }
    }
  }, [lastCreatedCustomerId, initialCustomersProp]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (customerDropdownRef.current && !customerDropdownRef.current.contains(event.target as Node)) {
        setIsCustomerDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  // --- Validation ---
  const validateField = (name: keyof FormData | `devices.${number}.${keyof FormDeviceData}`, value: any): string | undefined => {
    const parts = name.split('.');
    if (parts[0] === 'devices') {
      const [, indexStr, field] = parts;
      const index = parseInt(indexStr);
      const device = formData.devices[index];
      if (!device) return undefined;

      switch (field as keyof FormDeviceData) {
        case 'serialNumber': return value.trim() ? undefined : 'Serial number is required.';
        case 'issueDescription': return value.trim() ? undefined : 'Failure description is required.';
        case 'quantity':
          const numVal = Number(value);
          if (isNaN(numVal)) return 'Quantity must be a number.';
          if (numVal < 1) return 'Quantity must be at least 1.';
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
        case 'injuryDetails':
          return (formData.isInjuryRelated && !value.trim()) ? 'Please provide details about the injury.' : undefined;
        default: return undefined;
      }
    }
  };

  const validateForm = (data: FormData): Errors => {
    const newErrors: Errors = {};
    Object.keys(data).forEach(key => {
      if (key !== 'devices') {
        const error = validateField(key as keyof FormData, data[key as keyof FormData]);
        if (error) newErrors[key as keyof Errors] = error;
      }
    });
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
    if (data.isInjuryRelated && !data.injuryDetails.trim()) {
      newErrors.injuryDetails = 'Please provide details about the injury.';
    }
    return newErrors;
  }

  // --- Handlers ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target as { id: keyof Omit<FormData, 'devices'>, value: string };
    setFormData(prev => ({ ...prev, [id]: value }));
    if (touched[id]) {
      const error = validateField(id, value);
      setErrors(prev => ({ ...prev, [id]: error }));
    }
  };

  const handleDeviceChange = (index: number, field: keyof FormDeviceData, value: string | number) => {
    const newDevices = [...formData.devices];
    (newDevices[index] as any)[field] = value;
    setFormData(prev => ({ ...prev, devices: newDevices }));
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

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target as { id: keyof FormData, value: string };
    setTouched(prev => ({ ...prev, [id]: true }));
    const error = validateField(id, value);
    setErrors(prev => ({ ...prev, [id]: error }));
  };

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

  const addDevice = () => {
    setFormData(prev => ({ ...prev, devices: [...prev.devices, { articleNumber: '', serialNumber: '', quantity: 1, issueDescription: '', accessoriesIncluded: '' }] }));
  };

  const removeDevice = (index: number) => {
    if (formData.devices.length > 1) {
      setFormData(prev => ({ ...prev, devices: prev.devices.filter((_, i) => i !== index) }));
    }
  };

  const handleCustomerSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomerSearchTerm(e.target.value);
    setFormData(prev => ({ ...prev, customerId: '' }));
    setIsCustomerDropdownOpen(true);
    setTouched(prev => ({ ...prev, customerId: true }));
    const error = validateField('customerId', '');
    setErrors(prev => ({ ...prev, customerId: error }));
  };

  const handleSelectCustomer = (customer: Customer) => {
    setFormData(prev => ({ ...prev, customerId: customer.id }));
    setCustomerSearchTerm(customer.name);
    setIsCustomerDropdownOpen(false);
    const error = validateField('customerId', customer.id);
    setErrors(prev => ({ ...prev, customerId: error }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateForm(formData);
    setErrors(validationErrors);

    // Touch all fields
    const fullTouched: Touched = {
      customerId: true, dateOfIncident: true, dateOfReport: true,
      isInjuryRelated: true, injuryDetails: true,
      devices: formData.devices.reduce((acc, _, index) => {
        acc[index] = { serialNumber: true, issueDescription: true, quantity: true };
        return acc;
      }, {} as { [index: number]: any })
    };
    setTouched(fullTouched);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    const customer = customerOptions.find(c => c.id === formData.customerId) || initialCustomersProp.find(c => c.id === formData.customerId);
    if (!customer) {
      console.error("Selected customer not found in options");
      return; // Should be handled by validation 'customerId' check
    }

    const rmaDevices: Device[] = formData.devices.map(d => ({ articleNumber: d.articleNumber, serialNumber: d.serialNumber, quantity: d.quantity }));

    let serviceCyclesData;
    if (initialData) {
      serviceCyclesData = initialData.serviceCycles.map(cycle => {
        const formDevice = formData.devices.find(d => d.serialNumber === cycle.deviceSerialNumber);
        return {
          ...cycle,
          issueDescription: formDevice?.issueDescription || cycle.issueDescription,
          accessoriesIncluded: formDevice?.accessoriesIncluded || cycle.accessoriesIncluded,
        };
      });
      // Handle added devices? Current logic only maps existing cycles. 
      // If user added devices during Edit, we need new cycles. 
      // Implementation Plan: "Updates" currently only supporting updating existing structure or simple fields.
      // Logic for *adding* new devices to existing RMA during update is complex in backend (PUT replaces all).
      // So Frontend logic matches Backend logic: we send what we have.
      // If we added a device, we need a corresponding new Cycle?
      // For now, let's assume standard flow.
      formData.devices.forEach(d => {
        if (!serviceCyclesData.find(sc => sc.deviceSerialNumber === d.serialNumber)) {
          serviceCyclesData.push({
            issueDescription: d.issueDescription,
            accessoriesIncluded: d.accessoriesIncluded,
            deviceSerialNumber: d.serialNumber,
            // other fields handled by backend or defaults
          } as any);
        }
      });

    } else {
      serviceCyclesData = formData.devices.map(d => ({
        issueDescription: d.issueDescription,
        accessoriesIncluded: d.accessoriesIncluded,
        deviceSerialNumber: d.serialNumber,
        status: RmaStatus.RECEIVED, // Default status for new RMAs
        creationDate: new Date().toISOString(),
        statusDate: new Date().toISOString()
      }));
    }

    onSave({
      customer: {
        ...customer,
        name: hospital || customer.name, // Hospital override logic from original
      },
      devices: rmaDevices,
      serviceCycles: serviceCyclesData,
      dateOfIncident: formData.dateOfIncident,
      dateOfReport: formData.dateOfReport,
      isInjuryRelated: formData.isInjuryRelated,
      injuryDetails: formData.isInjuryRelated ? formData.injuryDetails : '',
      attachment: attachment ? attachment.name : existingAttachment
    }, initialData?.id);
  };

  const filteredCustomers = customerOptions; // Filtered by server, so we just show options.
  // Actually we need to display valid list.

  const getInputStyles = (isError: boolean) =>
    `block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset placeholder:text-slate-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 ${isError ? 'ring-red-500 text-red-900 focus:ring-red-500' : 'ring-slate-300 focus:ring-primary-600'}`;
  const labelStyles = "block text-sm font-medium leading-6 text-slate-900";
  const errorTextStyles = "mt-1 text-sm text-red-600";

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 modal-enter" aria-labelledby="rma-modal-title" role="dialog" aria-modal="true">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl ring-1 ring-slate-200/50 w-full max-w-3xl max-h-[90vh] flex flex-col modal-content-enter">
        <header className="px-6 py-5 flex justify-between items-center border-b border-slate-200/60 shrink-0 bg-gradient-to-r from-primary-50/50 to-transparent">
          <div>
            <h2 id="rma-modal-title" className="text-2xl font-bold text-slate-900 font-display">{initialData ? 'Edit RMA' : 'Create New RMA'}</h2>
            <p className="text-sm text-slate-500 mt-0.5">{initialData ? 'Update RMA details' : 'Register a new return merchandise authorization'}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all" aria-label="Close modal"><XMarkIcon className="w-6 h-6" /></button>
        </header>
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto" noValidate>
          {/* Customer Information */}
          <section>
            <h3 className="text-lg font-medium text-slate-900 border-b pb-2 mb-4">Customer Information</h3>
            <div>
              <label htmlFor="customer" className={labelStyles}>Customer <span className="text-red-500">*</span></label>
              <div className="mt-2 flex items-center gap-2">
                <div className="relative grow" ref={customerDropdownRef}>
                  <input type="text" id="customer" placeholder="Search or select a customer" value={customerSearchTerm} onChange={handleCustomerSearchChange} onFocus={() => setIsCustomerDropdownOpen(true)} onBlur={() => setTouched(prev => ({ ...prev, customerId: true }))} disabled={!!preselectedCustomerId || !!initialData} required autoComplete="off" className={getInputStyles(!!errors.customerId && !!touched.customerId)} role="combobox" aria-expanded={isCustomerDropdownOpen} aria-controls="customer-listbox" aria-autocomplete="list" aria-invalid={!!errors.customerId && !!touched.customerId} />
                  {isCustomerDropdownOpen && !preselectedCustomerId && !initialData && (
                    <div id="customer-listbox" role="listbox" className="absolute z-20 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                      {isSearchingCustomers && (
                        <div className="px-4 py-3 text-sm text-slate-500 flex items-center gap-2">
                          <LoadingSpinner size="sm" />
                          <span>Searching customers...</span>
                        </div>
                      )}
                      {!isSearchingCustomers && filteredCustomers.length > 0 ? (
                        filteredCustomers.map(c => (
                          <div key={c.id} id={`customer-option-${c.id}`} role="option" aria-selected={c.id === formData.customerId} onClick={() => handleSelectCustomer(c)} className="cursor-pointer select-none relative py-2 pl-3 pr-9 text-slate-900 hover:bg-primary-600 hover:text-white"><span className="block truncate">{c.name} {c.contactPerson ? `(${c.contactPerson})` : ''}</span></div>
                        ))
                      ) : (
                        !isSearchingCustomers && <div className="px-4 py-2 text-sm text-slate-500">No customers found.</div>
                      )}
                    </div>
                  )}
                </div>
                {!preselectedCustomerId && !initialData && (<button type="button" onClick={onAddNewCustomer} title="Add New Customer" className="inline-flex items-center gap-x-2 rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50"><PlusIcon className="h-5 w-5 text-slate-500" /> New</button>)}
              </div>
              {errors.customerId && touched.customerId && <p className={errorTextStyles}>{errors.customerId}</p>}
            </div>
            {initialData && (
              <div className="mt-4">
                <label htmlFor="hospital" className={labelStyles}>Hospital</label>
                <select id="hospital" value={hospital} onChange={e => setHospital(e.target.value)} className={`mt-2 ${getInputStyles(false)}`}>
                  <option value="" disabled>Select a hospital</option>
                  {hospitals.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
            )}
          </section>

          {/* Devices */}
          {formData.devices.map((device, index) => (
            <section key={index} className={`border rounded-lg p-4 relative ${Object.keys(errors.devices?.[index] || {}).length > 0 && Object.values(touched.devices?.[index] || {}).some(t => t) ? 'border-red-400 bg-red-50/50' : 'border-slate-200'}`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-slate-900">Device Information #{index + 1}</h3>
                {formData.devices.length > 1 && !initialData && (<button type="button" onClick={() => removeDevice(index)} className="text-sm font-medium text-red-600 hover:text-red-500">Remove</button>)}
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor={`articleNumber-${index}`} className={labelStyles}>Article Number</label>
                  <input type="text" id={`articleNumber-${index}`} value={device.articleNumber} onChange={e => handleDeviceChange(index, 'articleNumber', e.target.value)} className={`mt-2 ${getInputStyles(false)}`} />
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
          {!initialData && (<div className="pt-2"><button type="button" onClick={addDevice} className="inline-flex items-center gap-x-2 rounded-md bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 hover:bg-slate-200 w-full justify-center"><PlusIcon className="h-5 w-5 text-slate-500" /> Add Another Device</button></div>)}

          {/* Supplier Safety Compliance */}
          <section className="border border-red-200 bg-red-50/30 rounded-lg p-4 relative">
            <h3 className="text-lg font-medium text-red-900 border-b border-red-200 pb-2 mb-4 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              Safety Incident Reporting (Mandatory Supplier Compliance)
            </h3>
            <div className="grid grid-cols-1 gap-6 mt-4">
              <div>
                <span className={labelStyles}>Was the device involved in any patient, user or third-party injury? <span className="text-red-500">*</span></span>
                <div className="mt-3 flex items-center gap-6">
                  <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                    <input type="radio" name="isInjuryRelated" checked={formData.isInjuryRelated} onChange={() => setFormData(prev => ({ ...prev, isInjuryRelated: true }))} className="h-4 w-4 text-primary-600 focus:ring-primary-600 cursor-pointer" /> Yes
                  </label>
                  <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                    <input type="radio" name="isInjuryRelated" checked={!formData.isInjuryRelated} onChange={() => { setFormData(prev => ({ ...prev, isInjuryRelated: false, injuryDetails: '' })); setErrors(prev => ({ ...prev, injuryDetails: undefined })); }} className="h-4 w-4 text-primary-600 focus:ring-primary-600 cursor-pointer" /> No
                  </label>
                </div>
              </div>
              {formData.isInjuryRelated && (
                <div>
                  <label htmlFor="injuryDetails" className={labelStyles}>Who was injured and how? Please provide full details. <span className="text-red-500">*</span></label>
                  <textarea id="injuryDetails" value={formData.injuryDetails} onChange={handleChange} onBlur={handleBlur} required className={`mt-2 ${getInputStyles(!!errors.injuryDetails && !!touched.injuryDetails)}`} rows={3} placeholder="Please provide specific details about the incident, who was affected, and the nature of the injuries." />
                  {errors.injuryDetails && touched.injuryDetails && <p className={errorTextStyles}>{errors.injuryDetails}</p>}
                </div>
              )}
            </div>
          </section>

          {/* Additional Info */}
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
                <input type="file" id="attachment" onChange={e => setAttachment(e.target.files ? e.target.files[0] : null)} className="mt-2 block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100" />
              </div>
            </div>
          </section>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t border-slate-200/60 shrink-0">
            <button type="button" onClick={onClose} className="rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 hover:ring-slate-400 transition-all">Cancel</button>
            <button type="submit" disabled={!isFormValid} className="rounded-lg bg-gradient-to-r from-primary-600 to-primary-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-500/30 hover:shadow-primary-500/40 hover:from-primary-500 hover:to-primary-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 disabled:from-slate-400 disabled:to-slate-400 disabled:shadow-none disabled:cursor-not-allowed transition-all">
              {initialData ? 'Save Changes' : 'Create RMA'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RmaFormModal;