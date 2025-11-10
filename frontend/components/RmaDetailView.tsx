import React, { useState } from 'react';
import { Rma, RmaStatus, ServiceCycle, StatusHistoryEvent } from '../types';
import StatusUpdateModal from './StatusUpdateModal';
import { RmaPreviewModal } from './RmaPreviewModal';
import { ArrowLeftIcon, PencilSquareIcon, PlusIcon, EyeIcon, ClockIcon } from './icons';

/**
 * Props for the RmaDetailView component.
 */
interface RmaDetailViewProps {
  rma: Rma;
  onBack: () => void;
  onStatusUpdate: (rmaId: string, cycleCreationDate: string, deviceSerialNumber: string, newStatus: RmaStatus, notes: string) => void;
  onNewCycle: (rma: Rma) => void;
}

/**
 * A detailed status badge component that shows the current status and the date of the last update.
 */
const StatusBadge: React.FC<{ status: RmaStatus; date: string }> = ({ status, date }) => {
  const statusConfig = {
    [RmaStatus.PENDING]: { text: 'Pending', color: 'bg-slate-100 text-slate-800', icon: <ClockIcon className="w-4 h-4" /> },
    [RmaStatus.RECEIVED]: { text: 'Device Received', color: 'bg-blue-100 text-blue-800', icon: <EyeIcon className="w-4 h-4" /> },
    [RmaStatus.IN_REPAIR]: { text: 'In Repair', color: 'bg-yellow-100 text-yellow-800', icon: <PencilSquareIcon className="w-4 h-4" /> },
    [RmaStatus.REPAIRED]: { text: 'Repaired', color: 'bg-green-100 text-green-800', icon: <PencilSquareIcon className="w-4 h-4" /> },
    [RmaStatus.SHIPPED]: { text: 'Shipped', color: 'bg-purple-100 text-purple-800', icon: <PencilSquareIcon className="w-4 h-4" /> },
    [RmaStatus.CLOSED]: { text: 'Closed', color: 'bg-gray-100 text-gray-800', icon: <PencilSquareIcon className="w-4 h-4" /> },
  };

  const { text, color, icon } = statusConfig[status] || statusConfig[RmaStatus.PENDING];

  return (
    <div className={`inline-flex items-center gap-x-2 rounded-md px-2.5 py-1 text-xs font-medium ${color}`}>
      {icon}
      <div className="flex flex-col">
          <span>{text}</span>
          <span className="text-xs opacity-70">{new Date(date).toLocaleDateString()}</span>
      </div>
    </div>
  );
};

/**
 * Displays the historical log of status updates for a given service cycle.
 */
const HistoryLog: React.FC<{ history: StatusHistoryEvent[] }> = ({ history }) => {
    // Guard against undefined or empty history arrays to prevent crashes.
    if (!history || history.length === 0) {
        return (
            <div className="mt-4 pl-4 border-l-2 border-slate-200">
                <p className="text-sm text-slate-500 italic">No history logged for this service ticket.</p>
            </div>
        );
    }
    
    return (
        <div className="mt-4 pl-4 border-l-2 border-slate-200">
            {/* Sort history from newest to oldest for display */}
            {history.slice().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((event, index) => (
                <div key={index} className="relative pb-4 last:pb-0">
                    {/* Timeline visual element */}
                    <div className="absolute -left-[calc(0.5rem+1px)] top-1 w-4 h-4 bg-slate-200 rounded-full"></div>
                    <p className="text-xs text-slate-500 font-medium">{new Date(event.date).toLocaleString()}</p>
                    <p className="text-sm font-semibold text-slate-700">Status changed to "{event.status}"</p>
                    <p className="text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-md p-2 mt-1">{event.notes}</p>
                </div>
            ))}
        </div>
    );
};

/**
 * Displays the details of a single RMA, including its customer information, devices, and service cycles.
 * Provides functionality to update the status of a service cycle and to initiate the creation of a new cycle.
 */
const RmaDetailView: React.FC<RmaDetailViewProps> = ({ rma, onBack, onStatusUpdate, onNewCycle }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHistoryVisible, setIsHistoryVisible] = useState<Record<string, boolean>>({});
  const [cycleToUpdate, setCycleToUpdate] = useState<ServiceCycle | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handleOpenModal = (cycle: ServiceCycle) => {
    setCycleToUpdate(cycle);
    setIsModalOpen(true);
  };

  const handleUpdate = (newStatus: RmaStatus, notes: string) => {
    if (cycleToUpdate) {
      onStatusUpdate(rma.id, cycleToUpdate.creationDate, cycleToUpdate.deviceSerialNumber, newStatus, notes);
      setIsModalOpen(false);
      setCycleToUpdate(null);
    }
  };

  const toggleHistory = (cycleCreationDate: string) => {
    setIsHistoryVisible(prev => ({ ...prev, [cycleCreationDate]: !prev[cycleCreationDate] }));
  };
  
  // Group service cycles by device serial number for a more organized view.
  const cyclesByDevice = rma.serviceCycles.reduce((acc, cycle) => {
      if (!acc[cycle.deviceSerialNumber]) {
          acc[cycle.deviceSerialNumber] = [];
      }
      acc[cycle.deviceSerialNumber].push(cycle);
      // Sort cycles for each device by creation date, newest first
      acc[cycle.deviceSerialNumber].sort((a, b) => new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime());
      return acc;
  }, {} as Record<string, ServiceCycle[]>);

  return (
    <>
      <div className="bg-white shadow-md rounded-lg p-6">
        {/* Header section with back button, RMA ID, and customer details */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <button onClick={onBack} className="flex items-center text-sm text-slate-600 hover:text-slate-900 mb-2">
              <ArrowLeftIcon className="w-5 h-5 mr-1" /> Back
            </button>
            <h1 className="text-3xl font-bold text-slate-900">RMA #{rma.id}</h1>
            <div className="mt-2 text-sm text-slate-500">
              <p><span className="font-semibold">Customer:</span> {rma.customer.name}</p>
              <p><span className="font-semibold">Contact:</span> {rma.customer.contactPerson} ({rma.customer.email})</p>
            </div>
          </div>
          <div className="text-right">
            <button onClick={() => setIsPreviewOpen(true)} className="inline-flex items-center gap-x-2 rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50">
                <EyeIcon className="w-4 h-4 text-slate-500"/> Preview & Print
            </button>
            <p className="text-xs text-slate-400 mt-1">Created: {new Date(rma.creationDate).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Section for Devices and their Service Cycles */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-slate-800 border-b pb-2">Devices & Service History</h2>
          {rma.devices.map(device => (
            <div key={device.serialNumber} className="py-4 border-b last:border-none">
                <div className="flex justify-between items-center">
                    <div>
                        <p className="font-bold text-lg text-primary-600">{device.model}</p>
                        <p className="text-sm text-slate-500">S/N: {device.serialNumber}</p>
                    </div>
                    <button onClick={() => onNewCycle(rma)} className="inline-flex items-center gap-x-2 rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50">
                        <PlusIcon className="-ml-0.5 h-5 w-5 text-slate-500" /> New Ticket
                    </button>
                </div>
                
                <div className="mt-4 space-y-4">
                    {(cyclesByDevice[device.serialNumber] || []).map(cycle => (
                        <div key={cycle.creationDate} className="bg-slate-50 rounded-lg p-4">
                             <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-semibold text-slate-800">Ticket from {new Date(cycle.creationDate).toLocaleDateString()}</p>
                                    <p className="text-sm text-slate-600 mt-1">Issue: {cycle.issueDescription}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <StatusBadge status={cycle.status} date={cycle.statusDate} />
                                    <button onClick={() => handleOpenModal(cycle)} className="p-2 text-slate-500 hover:text-slate-800 rounded-full hover:bg-slate-200">
                                        <PencilSquareIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                            <div className="mt-2">
                                <button onClick={() => toggleHistory(cycle.creationDate)} className="text-sm text-primary-600 hover:text-primary-800 font-medium">
                                    {isHistoryVisible[cycle.creationDate] ? 'Hide History' : 'Show History'}
                                </button>
                                {isHistoryVisible[cycle.creationDate] && <HistoryLog history={cycle.history} />}
                            </div>
                        </div>
                    ))}
                    {(!cyclesByDevice[device.serialNumber] || cyclesByDevice[device.serialNumber].length === 0) && (
                        <p className="text-sm text-slate-500 text-center py-4">No service tickets have been created for this device.</p>
                    )}
                </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modals for status updates and previews */}
      {isModalOpen && cycleToUpdate && (
        <StatusUpdateModal
          currentStatus={cycleToUpdate.status}
          onSubmit={handleUpdate}
          onClose={() => setIsModalOpen(false)}
        />
      )}
      {isPreviewOpen && (
        <RmaPreviewModal 
          rma={rma} 
          onClose={() => setIsPreviewOpen(false)} 
        />
      )}
    </>
  );
};

export default RmaDetailView;
