import React, { useState, useEffect, useRef } from 'react';
import { RmaStatus } from '../types';
import { XMarkIcon } from './icons';

/**
 * Props for the StatusUpdateModal component.
 */
interface StatusUpdateModalProps {
  currentStatus: RmaStatus; // The current status of the service cycle.
  onClose: () => void; // Callback to close the modal.
  onSave: (newStatus: RmaStatus, notes: string) => void; // Callback to save the status update.
}

/**
 * The data structure for the status update form.
 */
interface FormData {
    newStatus: RmaStatus;
    notes: string;
}

/**
 * Shape of the validation errors object for the form.
 */
interface Errors {
    notes?: string;
}

/**
 * A modal form for updating the status of a service cycle and adding service notes.
 */
const StatusUpdateModal: React.FC<StatusUpdateModalProps> = ({ currentStatus, onClose, onSave }) => {
  // State for form data, initialized with the current status.
  const [formData, setFormData] = useState<FormData>({ newStatus: currentStatus, notes: '' });
  const [errors, setErrors] = useState<Errors>({});
  const firstInputRef = useRef<HTMLSelectElement>(null);

  // Service notes are only required if the user is moving the status to "CLOSED".
  const isNotesRequired = formData.newStatus === RmaStatus.CLOSED;

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
      if (isNotesRequired && !formData.notes.trim()) {
          newErrors.notes = 'Service notes are required to close a service ticket.';
      }
      return newErrors;
  }

  /**
   * Generic change handler for form inputs.
   * Updates form state and clears any existing error for the field.
   */
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
    if (id === 'notes' && errors.notes) {
        setErrors(prev => ({...prev, notes: undefined }))
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
    onSave(formData.newStatus, formData.notes);
  };
  
  // Defines the list of statuses available in the dropdown.
  const availableStatuses = Object.values(RmaStatus);

  const inputStyles = "block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6";
  const errorInputStyles = "ring-red-500 focus:ring-red-600";
  const labelStyles = "block text-sm font-medium leading-6 text-slate-900";
  const errorTextStyles = "mt-2 text-sm text-red-600";

  return (
    <div className="fixed inset-0 bg-slate-800 bg-opacity-75 flex items-center justify-center z-50 p-4 modal-enter" aria-labelledby="status-update-title" role="dialog" aria-modal="true">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg modal-content-enter">
        <header className="px-6 py-4 flex justify-between items-center border-b border-slate-200">
          <h2 id="status-update-title" className="text-xl font-semibold text-slate-800">Update Service Status</h2>
          <button onClick={onClose} className="p-2 rounded-full text-slate-500 hover:text-slate-800 hover:bg-slate-100" aria-label="Close modal">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </header>
        <form onSubmit={handleSubmit} className="p-6 space-y-6" noValidate>
          <div>
            <label htmlFor="newStatus" className={labelStyles}>New Status</label>
            <div className="mt-2">
              <select
                id="newStatus"
                value={formData.newStatus}
                onChange={handleChange}
                ref={firstInputRef}
                className={inputStyles}
              >
                {availableStatuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="notes" className={labelStyles}>Service Notes {isNotesRequired && <span className="text-red-500">*</span>}</label>
            <p className="text-xs text-slate-500">These notes will be added to the service history.</p>
            <div className="mt-2">
              <textarea
                id="notes"
                value={formData.notes}
                onChange={handleChange}
                required={isNotesRequired}
                className={`${inputStyles} ${errors.notes ? errorInputStyles : ''}`}
                rows={4}
                placeholder="e.g., Replaced mainboard, device passed diagnostics."
                aria-invalid={!!errors.notes}
                aria-describedby={errors.notes ? "notes-error" : undefined}
              />
            </div>
            {errors.notes && <p id="notes-error" className={errorTextStyles} role="alert">{errors.notes}</p>}
          </div>
          <div className="flex justify-end gap-4 pt-4 border-t border-slate-200">
            <button type="button" onClick={onClose} className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50">Cancel</button>
            <button type="submit" className="rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 disabled:opacity-50 disabled:cursor-not-allowed">
              Save Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StatusUpdateModal;
