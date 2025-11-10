import React, { useState, useEffect, useRef } from 'react';
import { Rma, Customer, Device } from '../types';
import { XMarkIcon, PlusIcon } from './icons';

interface RmaFormModalProps {
  rma?: Rma;
  customers: Customer[];
  onClose: () => void;
  onSave: (rmaData: Omit<Rma, 'id' | 'creationDate' | 'lastUpdateDate' | 'serviceCycles'> & {serviceCycles: Omit<Rma['serviceCycles'][0], 'status' | 'statusDate' | 'creationDate' | 'deviceSerialNumber'>[]}, id?: string) => void;
  preselectedCustomerId?: string;
  onAddNewCustomer: () => void;
  lastCreatedCustomerId?: string | null;
}

type FormDevice = {
  model: string;
  partNumber: string, 
  serialNumber: string;
  quantity: number;
  issueDescription: string;
  accessoriesIncluded: string;
  dateOfIncident: string, 
  dateOfReport: string
}

const RmaFormModal: React.FC<RmaFormModalProps> = ({ rma, customers, onClose, onSave, preselectedCustomerId, onAddNewCustomer, lastCreatedCustomerId }) => {
  const [customerId, setCustomerId] = useState(rma?.customer.id || preselectedCustomerId || '');
  
  const initialDevices: FormDevice[] = rma ? rma.devices.map(d => {
      const cycle = rma.serviceCycles.find(sc => sc.deviceSerialNumber === d.serialNumber);
      return {
          model: d.model,
          partNumber: d.partNumber,
          serialNumber: d.serialNumber,
          quantity: d.quantity,
          issueDescription: cycle?.issueDescription || '',
          accessoriesIncluded: cycle?.accessoriesIncluded || '',
          dateOfIncident: rma.dateOfIncident,
          dateOfReport: rma.dateOfReport
      }
  }) : [{
    model: '', 
    partNumber: '',
    serialNumber: '',
    quantity: 1,
    issueDescription: '', 
    accessoriesIncluded: '',
    dateOfIncident: new Date().toISOString().split('T')[0],
    dateOfReport: new Date().toISOString().split('T')[0]
   }];
  
  const [devices, setDevices] = useState<FormDevice[]>(initialDevices);
  const [attachment, setAttachment] = useState<File | null>(null);
  const [existingAttachment, setExistingAttachment] = useState(rma?.attachment || '');

  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);
  const customerDropdownRef = useRef<HTMLDivElement>(null);
  
  const handleDeviceChange = (index: number, field: keyof FormDevice, value: string | number) => {
    const newDevices = [...devices];
    (newDevices[index] as any)[field] = value;
    setDevices(newDevices);
  };

  const addDevice = () => {
    setDevices([...devices, {
      model: '', 
      partNumber: '',
      serialNumber: '',
      quantity: 1,
      issueDescription: '', 
      accessoriesIncluded: '',
      dateOfIncident: new Date().toISOString().split('T')[0],
      dateOfReport: new Date().toISOString().split('T')[0]
     }]);
  };

  const removeDevice = (index: number) => {
    if (devices.length > 1) {
      setDevices(devices.filter((_, i) => i !== index));
    }
  };


  useEffect(() => {
    if (lastCreatedCustomerId) {
        setCustomerId(lastCreatedCustomerId);
    }
  }, [lastCreatedCustomerId]);

  useEffect(() => {
    const selectedCustomer = customers.find(c => c.id === customerId);
    if (selectedCustomer) {
      setCustomerSearchTerm(selectedCustomer.name);
    } else {
      setCustomerSearchTerm('');
    }
  }, [customerId, customers]);

  // Handle clicks outside the dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (customerDropdownRef.current && !customerDropdownRef.current.contains(event.target as Node)) {
        setIsCustomerDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleCustomerSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomerSearchTerm(e.target.value);
    setCustomerId(''); // Clear selection when user is typing
    setIsCustomerDropdownOpen(true);
  };
  
  const handleSelectCustomer = (customer: Customer) => {
    setCustomerId(customer.id);
    setCustomerSearchTerm(customer.name);
    setIsCustomerDropdownOpen(false);
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(customerSearchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const customer = customers.find(c => c.id === customerId);
    if (!customer || devices.some(d => !d.model.trim() || !d.serialNumber.trim() || !d.issueDescription.trim())) {
      return;
    }

    const rmaDevices: Device[] = devices.map(d => ({ 
      model: d.model, 
      partNumber: d.partNumber, 
      serialNumber: d.serialNumber, 
      quantity: d.quantity 
    }));
    const serviceCyclesData = devices.map(d => ({ issueDescription: d.issueDescription, accessoriesIncluded: d.accessoriesIncluded }));

    onSave({
      customer,
      devices: rmaDevices,
      serviceCycles: serviceCyclesData,
      dateOfIncident: devices[0].dateOfIncident,
      dateOfReport: devices[0].dateOfReport,
      attachment: attachment ? attachment.name : existingAttachment
    }, rma?.id);
  };

  const isFormValid = customerId && devices.every(d => d.model.trim() && d.serialNumber.trim() && d.issueDescription.trim());

  const inputStyles = "block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6";
  const labelStyles = "block text-sm font-medium leading-6 text-slate-900";

  return (
    <div className="fixed inset-0 bg-slate-800 bg-opacity-75 flex items-center justify-center z-50 p-4 modal-enter" aria-labelledby="rma-modal-title" role="dialog" aria-modal="true">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col modal-content-enter">
        <div className="px-6 py-4 flex justify-between items-center border-b border-slate-200">
          <h2 id="rma-modal-title" className="text-xl font-semibold text-slate-800">{rma ? 'Edit RMA' : 'Create New RMA'}</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800" aria-label="Close modal">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto">
          <section>
            <h3 className="text-lg font-medium text-slate-900 border-b pb-2 mb-4">Customer Information</h3>
            <div className="sm:col-span-2">
                <label htmlFor="customer" className={labelStyles}>Customer</label>
                <div className="mt-2 flex items-center gap-2">
                    <div className="relative flex-grow" ref={customerDropdownRef}>
                      <input
                        type="text"
                        id="customer"
                        placeholder="Search or select a customer"
                        value={customerSearchTerm}
                        onChange={handleCustomerSearchChange}
                        onFocus={() => setIsCustomerDropdownOpen(true)}
                        disabled={!!preselectedCustomerId || !!rma}
                        required
                        autoComplete="off"
                        className={`${inputStyles}`}
                        role="combobox"
                        aria-expanded={isCustomerDropdownOpen}
                        aria-controls="customer-listbox"
                        aria-autocomplete="list"
                      />
                      {isCustomerDropdownOpen && !preselectedCustomerId && !rma && (
                        <div id="customer-listbox" role="listbox" className="absolute z-20 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                          {filteredCustomers.length > 0 ? (
                            filteredCustomers.map(c => (
                              <div
                                key={c.id}
                                id={`customer-option-${c.id}`}
                                role="option"
                                aria-selected={c.id === customerId}
                                onClick={() => handleSelectCustomer(c)}
                                className="cursor-pointer select-none relative py-2 pl-3 pr-9 text-slate-900 hover:bg-primary-600 hover:text-white"
                              >
                                <span className="block truncate">{c.name}</span>
                              </div>
                            ))
                          ) : (
                            <div className="px-4 py-2 text-sm text-slate-500">No customers found.</div>
                          )}
                        </div>
                      )}
                    </div>
                    {!preselectedCustomerId && !rma && (
                        <button type="button" onClick={onAddNewCustomer} title="Add New Customer" className="inline-flex items-center gap-x-2 rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50">
                            <PlusIcon className="h-5 w-5 text-slate-500"/> New
                        </button>
                    )}
                </div>
              </div>
          </section>

          {devices.map((device, index) => (
            <section key={index} className="border border-slate-200 rounded-lg p-4 relative">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-slate-900">Device Information #{index + 1}</h3>
                    {devices.length > 1 && !rma && (
                        <button type="button" onClick={() => removeDevice(index)} className="text-sm font-medium text-red-600 hover:text-red-500">Remove</button>
                    )}
                </div>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                        <label htmlFor={`model-${index}`} className={labelStyles}>Device Model</label>
                        <input type="text" id={`model-${index}`} value={device.model} onChange={e => handleDeviceChange(index, 'model', e.target.value)} required className={`mt-2 ${inputStyles}`} disabled={!!rma} />
                    </div>
                    <div>
                        <label htmlFor={`partNumber-${index}`} className={labelStyles}>Part Number</label>
                        <input type="text" id={`partNumber-${index}`} value={device.partNumber} onChange={e => handleDeviceChange(index, 'partNumber', e.target.value)} required className={`mt-2 ${inputStyles}`} disabled={!!rma} />
                    </div>
                    <div>
                        <label htmlFor={`serial-${index}`} className={labelStyles}>Serial / Lot Number</label>
                        <input type="text" id={`serial-${index}`} value={device.serialNumber} onChange={e => handleDeviceChange(index, 'serialNumber', e.target.value)} required className={`mt-2 ${inputStyles}`} disabled={!!rma} />
                    </div>
                    <div>
                        <label htmlFor={`quantity-${index}`} className={labelStyles}>Quantity</label>
                        <input type="number" id={`quantity-${index}`} value={device.quantity} onChange={e => handleDeviceChange(index, 'quantity', e.target.value)} required className={`mt-2 ${inputStyles}`} disabled={!!rma} />
                    </div>
                    <div className="sm:col-span-2">
                        <label htmlFor={`issue-${index}`} className={labelStyles}>Failure Description/Details</label>
                        <textarea id={`issue-${index}`} value={device.issueDescription} onChange={e => handleDeviceChange(index, 'issueDescription', e.target.value)} required className={`mt-2 ${inputStyles}`} rows={3} disabled={!!rma} />
                    </div>
                    <div className="sm:col-span-2">
                        <label htmlFor={`accessories-${index}`} className={labelStyles}>Accessories Included</label>
                        <textarea id={`accessories-${index}`} value={device.accessoriesIncluded} onChange={e => handleDeviceChange(index, 'accessoriesIncluded', e.target.value)} placeholder="e.g., Main unit, power cord, 2 batteries" className={`mt-2 ${inputStyles}`} rows={2} disabled={!!rma} />
                    </div>
                </div>
            </section>
          ))}
          
          {!rma && (
            <div className="pt-2">
                <button type="button" onClick={addDevice} className="inline-flex items-center gap-x-2 rounded-md bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 hover:bg-slate-200 w-full justify-center">
                    <PlusIcon className="h-5 w-5 text-slate-500"/> Add Another Device
                </button>
            </div>
          )}

          <section className="border border-slate-200 rounded-lg p-4 relative">
              <h3 className="text-lg font-medium text-slate-900">Additional Information</h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 mt-4">
                  <div>
                      <label htmlFor="dateOfIncident" className={labelStyles}>Date of Incident</label>
                      <input type="date" id="dateOfIncident" value={devices[0].dateOfIncident} onChange={e => handleDeviceChange(0, 'dateOfIncident', e.target.value)} required className={`mt-2 ${inputStyles}`} />
                  </div>
                  <div>
                      <label htmlFor="dateOfReport" className={labelStyles}>Date of Report</label>
                      <input type="date" id="dateOfReport" value={devices[0].dateOfReport} onChange={e => handleDeviceChange(0, 'dateOfReport', e.target.value)} required className={`mt-2 ${inputStyles}`} />
                  </div>
                  <div className="sm:col-span-2">
                      <label htmlFor="attachment" className={labelStyles}>Attachment Proof (optional)</label>
                      <input type="file" id="attachment" onChange={e => setAttachment(e.target.files ? e.target.files[0] : null)} className="mt-2 block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"/>
                  </div>
              </div>
          </section>


          <div className="flex justify-end gap-4 pt-6 border-t border-slate-200">
            <button type="button" onClick={onClose} className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50">Cancel</button>
            <button type="submit" disabled={!isFormValid} className="rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 disabled:bg-slate-300 disabled:cursor-not-allowed">
              {rma ? 'Save Changes' : 'Create RMA'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RmaFormModal;
