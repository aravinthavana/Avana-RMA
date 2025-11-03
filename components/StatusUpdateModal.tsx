import React, { useState } from 'react';
import { RmaStatus } from '../types';
import { XMarkIcon } from './icons';

interface StatusUpdateModalProps {
  currentStatus: RmaStatus;
  onClose: () => void;
  onSave: (newStatus: RmaStatus, notes: string) => void;
}

const StatusUpdateModal: React.FC<StatusUpdateModalProps> = ({ currentStatus, onClose, onSave }) => {
  const [newStatus, setNewStatus] = useState(currentStatus);
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(newStatus, notes);
  };
  
  const availableStatuses = Object.values(RmaStatus);

  const inputStyles = "block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6";
  const labelStyles = "block text-sm font-medium leading-6 text-slate-900";

  return (
    <div className="fixed inset-0 bg-slate-800 bg-opacity-75 flex items-center justify-center z-50 p-4 modal-enter" aria-labelledby="status-update-title" role="dialog" aria-modal="true">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg modal-content-enter">
        <div className="px-6 py-4 flex justify-between items-center border-b border-slate-200">
          <h2 id="status-update-title" className="text-xl font-semibold text-slate-800">Update Service Status</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800" aria-label="Close modal">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label htmlFor="status" className={labelStyles}>New Status</label>
            <div className="mt-2">
              <select
                id="status"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as RmaStatus)}
                className={inputStyles}
              >
                {availableStatuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="notes" className={labelStyles}>Service Notes (optional)</label>
            <p className="text-xs text-slate-500">These notes will be added to the service history.</p>
            <div className="mt-2">
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className={inputStyles}
                rows={4}
                placeholder="e.g., Replaced mainboard, device passed diagnostics."
              />
            </div>
          </div>
          <div className="flex justify-end gap-4 pt-4 border-t border-slate-200">
            <button type="button" onClick={onClose} className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50">Cancel</button>
            <button type="submit" className="rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600">
              Save Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StatusUpdateModal;