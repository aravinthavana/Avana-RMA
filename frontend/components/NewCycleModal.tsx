import React, { useState } from 'react';
import { XMarkIcon } from './icons';
import { Rma } from '../types';

interface NewCycleModalProps {
  rma: Rma;
  onClose: () => void;
  onSave: (rmaId: string, deviceSerialNumber: string, issueDescription: string, accessoriesIncluded: string) => void;
}

const NewCycleModal: React.FC<NewCycleModalProps> = ({ rma, onClose, onSave }) => {
  const [issueDescription, setIssueDescription] = useState('');
  const [accessoriesIncluded, setAccessoriesIncluded] = useState('');
  const [selectedDeviceSn, setSelectedDeviceSn] = useState(rma.devices[0]?.serialNumber || '');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (issueDescription.trim() && selectedDeviceSn) {
      onSave(rma.id, selectedDeviceSn, issueDescription, accessoriesIncluded);
    }
  };

  const inputStyles = "block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6";
  const labelStyles = "block text-sm font-medium leading-6 text-slate-900";

  return (
    <div className="fixed inset-0 bg-slate-800 bg-opacity-75 flex items-center justify-center z-50 p-4 modal-enter" aria-labelledby="new-cycle-title" role="dialog" aria-modal="true">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg modal-content-enter">
        <div className="px-6 py-4 flex justify-between items-center border-b border-slate-200">
          <h2 id="new-cycle-title" className="text-xl font-semibold text-slate-800">Start New Service Ticket</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800" aria-label="Close modal">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <p className="text-sm text-slate-600">Creating a ticket for RMA #{rma.id}</p>
          <div>
            <label htmlFor="device" className={labelStyles}>Device</label>
            <select
                id="device"
                value={selectedDeviceSn}
                onChange={e => setSelectedDeviceSn(e.target.value)}
                className={`mt-2 ${inputStyles}`}
                required
            >
                <option value="" disabled>Select a device</option>
                {rma.devices.map(d => (
                    <option key={d.serialNumber} value={d.serialNumber}>
                        {d.model} - {d.serialNumber}
                    </option>
                ))}
            </select>
          </div>
          <div>
            <label htmlFor="issueDescription" className={labelStyles}>Detailed Description of New Issue</label>
            <div className="mt-2">
              <textarea 
                id="issueDescription" 
                value={issueDescription} 
                onChange={e => setIssueDescription(e.target.value)} 
                required 
                className={inputStyles} 
                rows={5}
                autoFocus
              />
            </div>
          </div>
           <div>
            <label htmlFor="accessoriesIncluded" className={labelStyles}>Accessories Included with this Return</label>
            <div className="mt-2">
              <textarea 
                id="accessoriesIncluded" 
                value={accessoriesIncluded} 
                onChange={e => setAccessoriesIncluded(e.target.value)} 
                placeholder="e.g., Main unit only"
                className={inputStyles} 
                rows={2}
              />
            </div>
          </div>
          <div className="flex justify-end gap-4 pt-4 border-t border-slate-200">
            <button type="button" onClick={onClose} className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50">Cancel</button>
            <button type="submit" disabled={!issueDescription.trim() || !selectedDeviceSn} className="rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 disabled:bg-slate-300 disabled:cursor-not-allowed">
              Create Ticket
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewCycleModal;