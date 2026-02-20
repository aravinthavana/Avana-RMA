import React, { useState, useEffect, useRef } from 'react';
import { XMarkIcon } from './icons';
import { Rma } from '../types';

/**
 * Props for the NewCycleModal component.
 */
interface NewCycleModalProps {
  rma: Rma;
  onClose: () => void;
  onSave: (rmaId: string, deviceSerialNumber: string, issueDescription: string, accessoriesIncluded: string) => void;
}

/**
 * The data structure for the new service cycle form.
 */
interface FormData {
  selectedDeviceSn: string;
  issueDescription: string;
  accessoriesIncluded: string;
}

/**
 * Shape of the validation errors object for the form.
 */
interface Errors {
  selectedDeviceSn?: string;
  issueDescription?: string;
}

/**
 * A modal form for creating a new service ticket (ServiceCycle) for a device within an existing RMA.
 */
const NewCycleModal: React.FC<NewCycleModalProps> = ({ rma, onClose, onSave }) => {
  // State for form data, pre-populating the first device if available.
  const [formData, setFormData] = useState<FormData>({
    selectedDeviceSn: rma.devices[0]?.serialNumber || '',
    issueDescription: '',
    accessoriesIncluded: ''
  });
  const [errors, setErrors] = useState<Errors>({});
  const firstInputRef = useRef<HTMLSelectElement>(null);

  // Effect to auto-focus the first input field when the modal opens.
  useEffect(() => {
    firstInputRef.current?.focus();
  }, []);

  /**
   * Validates the form data.
   * @returns An `Errors` object containing any validation messages.
   */
  const validate = (): Errors => {
    const newErrors: Errors = {};
    if (!formData.selectedDeviceSn) newErrors.selectedDeviceSn = 'A device must be selected.';
    if (!formData.issueDescription.trim()) newErrors.issueDescription = 'Issue description is required.';
    else if (formData.issueDescription.trim().length < 10) newErrors.issueDescription = 'Description must be at least 10 characters long.';
    return newErrors;
  }

  /**
   * Generic change handler for form inputs.
   * Updates form state and clears any existing error for the field.
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
    if (errors[id as keyof Errors]) {
      setErrors(prev => ({ ...prev, [id]: undefined }));
    }
  };

  /**
   * Handles form submission.
   * Validates the form and calls the onSave callback if successful.
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    onSave(rma.id, formData.selectedDeviceSn, formData.issueDescription, formData.accessoriesIncluded);
  };

  const inputStyles = "block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6";
  const errorInputStyles = "ring-red-500 focus:ring-red-600";
  const labelStyles = "block text-sm font-medium leading-6 text-slate-900";
  const errorTextStyles = "mt-2 text-sm text-red-600";

  return (
    <div className="fixed inset-0 bg-slate-800 bg-opacity-75 flex items-center justify-center z-50 p-4 modal-enter" aria-labelledby="new-cycle-title" role="dialog" aria-modal="true">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg modal-content-enter">
        <header className="px-6 py-4 flex justify-between items-center border-b border-slate-200">
          <h2 id="new-cycle-title" className="text-xl font-semibold text-slate-800">Start New Service Ticket</h2>
          <button onClick={onClose} className="p-2 rounded-full text-slate-500 hover:text-slate-800 hover:bg-slate-100" aria-label="Close modal">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </header>
        <form onSubmit={handleSubmit} className="p-6 space-y-6" noValidate>
          <p className="text-sm text-slate-600">Creating a ticket for #{rma.id}</p>
          <div>
            <label htmlFor="selectedDeviceSn" className={labelStyles}>Device <span className="text-red-500">*</span></label>
            <select
              id="selectedDeviceSn"
              value={formData.selectedDeviceSn}
              onChange={handleChange}
              ref={firstInputRef}
              className={`mt-2 ${inputStyles} ${errors.selectedDeviceSn ? errorInputStyles : ''}`}
              required
              aria-invalid={!!errors.selectedDeviceSn}
              aria-describedby={errors.selectedDeviceSn ? "device-error" : undefined}
            >
              <option value="" disabled>Select a device</option>
              {rma.devices.map(d => (
                <option key={d.serialNumber} value={d.serialNumber}>
                  {d.articleNumber || 'Device'} - {d.serialNumber}
                </option>
              ))}
            </select>
            {errors.selectedDeviceSn && <p id="device-error" className={errorTextStyles} role="alert">{errors.selectedDeviceSn}</p>}
          </div>
          <div>
            <label htmlFor="issueDescription" className={labelStyles}>Detailed Description of New Issue <span className="text-red-500">*</span></label>
            <div className="mt-2">
              <textarea
                id="issueDescription"
                value={formData.issueDescription}
                onChange={handleChange}
                required
                className={`${inputStyles} ${errors.issueDescription ? errorInputStyles : ''}`}
                rows={5}
                aria-invalid={!!errors.issueDescription}
                aria-describedby={errors.issueDescription ? "issue-error" : undefined}
              />
            </div>
            {errors.issueDescription && <p id="issue-error" className={errorTextStyles} role="alert">{errors.issueDescription}</p>}
          </div>
          <div>
            <label htmlFor="accessoriesIncluded" className={labelStyles}>Accessories Included with this Return</label>
            <div className="mt-2">
              <textarea
                id="accessoriesIncluded"
                value={formData.accessoriesIncluded}
                onChange={handleChange}
                placeholder="e.g., Main unit only"
                className={inputStyles}
                rows={2}
              />
            </div>
          </div>
          <div className="flex justify-end gap-4 pt-4 border-t border-slate-200">
            <button type="button" onClick={onClose} className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50">Cancel</button>
            <button type="submit" className="rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 disabled:opacity-50 disabled:cursor-not-allowed">
              Create Ticket
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewCycleModal;
