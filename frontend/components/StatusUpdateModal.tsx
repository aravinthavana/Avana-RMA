import React, { useState, useEffect, useRef } from 'react';
import { RmaStatus } from '../types';
import { XMarkIcon } from './icons';

interface StatusUpdateModalProps {
  currentStatus: RmaStatus;
  onClose: () => void;
  onSave: (newStatus: string, notes: string) => void;
}

interface FormData {
  newStatus: RmaStatus;
  customStatus: string;
  notes: string;
}

interface Errors {
  notes?: string;
  customStatus?: string;
}

const StatusUpdateModal: React.FC<StatusUpdateModalProps> = ({ currentStatus, onClose, onSave }) => {
  const [formData, setFormData] = useState<FormData>({
    newStatus: currentStatus,
    customStatus: '',
    notes: ''
  });
  const [errors, setErrors] = useState<Errors>({});
  const firstInputRef = useRef<HTMLSelectElement>(null);

  const isNotesRequired = formData.newStatus === RmaStatus.CLOSED;
  const isCustomStatus = formData.newStatus === RmaStatus.CUSTOM;

  useEffect(() => {
    firstInputRef.current?.focus();
  }, []);

  const validate = (): Errors => {
    const newErrors: Errors = {};
    if (isNotesRequired && !formData.notes.trim()) {
      newErrors.notes = 'Service notes are required to close a service ticket.';
    }
    if (isCustomStatus && !formData.customStatus.trim()) {
      newErrors.customStatus = 'Please enter a custom status.';
    }
    return newErrors;
  }

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLTextAreaElement | HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
    if (errors[id as keyof Errors]) {
      setErrors(prev => ({ ...prev, [id]: undefined }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    // If Custom, pass the custom text. Otherwise pass the enum value string.
    const statusToSave = isCustomStatus ? formData.customStatus.trim() : formData.newStatus;
    onSave(statusToSave, formData.notes);
  };

  // Exclude CUSTOM from dropdown since we handle it specially below
  const availableStatuses = Object.values(RmaStatus);

  const inputStyles = "form-input";
  const errorInputStyles = "form-input--error";
  const labelStyles = "form-label";
  const errorTextStyles = "form-error";

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

          {isCustomStatus && (
            <div>
              <label htmlFor="customStatus" className={labelStyles}>
                Custom Status <span className="text-red-500">*</span>
              </label>
              <div className="mt-2">
                <input
                  type="text"
                  id="customStatus"
                  value={formData.customStatus}
                  onChange={handleChange}
                  className={`${inputStyles} ${errors.customStatus ? errorInputStyles : ''}`}
                  placeholder="e.g., Awaiting spare parts from vendor..."
                  aria-invalid={!!errors.customStatus}
                />
              </div>
              {errors.customStatus && <p className={errorTextStyles} role="alert">{errors.customStatus}</p>}
            </div>
          )}

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
