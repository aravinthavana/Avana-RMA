import React, { useState, useRef, useEffect } from 'react';
import { Rma, RmaStatus, ServiceCycle, Device } from '../types';
import { ArrowLeftIcon, PencilSquareIcon, PlusIcon, EyeIcon, ChatBubbleLeftEllipsisIcon, ChevronDownIcon, ClockIcon, PaperClipIcon } from './icons';
import RmaPreviewModal from './RmaPreviewModal';
import StatusUpdateModal from './StatusUpdateModal';
import { getStatusBadgeColor } from './RmaList';


interface RmaDetailViewProps {
  rma: Rma;
  onBack: () => void;
  onStatusUpdate: (rmaId: string, cycleCreationDate: string, deviceSerialNumber: string, newStatus: RmaStatus, notes: string) => void;
  onNewCycle: (rma: Rma) => void;
}

const InfoPair = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="py-2.5 sm:grid sm:grid-cols-3 sm:gap-4">
      <dt className="text-sm font-medium text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm text-slate-900 sm:mt-0 sm:col-span-2">{value}</dd>
    </div>
);

const ServiceHistoryTimeline = ({ cycle }: { cycle: ServiceCycle }) => {
  
    const parseAndSortHistory = (cycle: ServiceCycle) => {
        const history: { status: RmaStatus; timestamp: string; notes: React.ReactNode; isInitial: boolean }[] = [];

        // Add initial report as the first event
        history.push({
            status: RmaStatus.PENDING, // for color consistency
            timestamp: new Date(cycle.creationDate).toLocaleString(),
            notes: (
                <>
                    <p className="font-semibold text-slate-800">Failure Description/Details</p>
                    <p className="mt-1 whitespace-pre-wrap">{cycle.issueDescription}</p>
                    {cycle.accessoriesIncluded && <p className="mt-2 text-xs text-slate-500">Accessories Included: {cycle.accessoriesIncluded}</p>}
                </>
            ),
            isInitial: true,
        });

        // Parse resolution notes for subsequent events
        if (cycle.resolutionNotes) {
            const noteEntries = cycle.resolutionNotes.split('\n\n');
            const regex = /\[(.*?) - (.*?)\]\s*([\s\S]*)/;

            noteEntries.forEach(entry => {
                const match = entry.match(regex);
                if (match) {
                    history.push({
                        status: match[1].trim() as RmaStatus,
                        timestamp: new Date(match[2].trim()).toLocaleString(), // Re-format for consistency
                        notes: <p className="whitespace-pre-wrap">{match[3].trim()}</p>,
                        isInitial: false,
                    });
                }
            });
        }

        // Sort by timestamp descending
        return history.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    };

    const timeline = parseAndSortHistory(cycle);

    return (
        <div className="flow-root">
            <ul role="list" className="-mb-8">
                {timeline.map((item, itemIdx) => (
                    <li key={itemIdx}>
                        <div className="relative pb-8">
                            {itemIdx !== timeline.length - 1 ? (
                                <span className="absolute left-5 top-5 -ml-px h-full w-0.5 bg-slate-200" aria-hidden="true" />
                            ) : null}
                            <div className="relative flex items-start space-x-4">
                                <div>
                                     <div className={`h-10 w-10 rounded-full flex items-center justify-center ring-8 ring-white ${item.isInitial ? 'bg-slate-400' : getStatusBadgeColor(item.status).split(' ')[0] }`}>
                                        {item.isInitial ? (
                                            <ChatBubbleLeftEllipsisIcon className="h-5 w-5 text-white" aria-hidden="true" />
                                        ) : (
                                            <ClockIcon className={`h-5 w-5 ${getStatusBadgeColor(item.status).split(' ')[1]}`} aria-hidden="true" />
                                        )}
                                     </div>
                                </div>
                                <div className="min-w-0 flex-1 pt-2">
                                    <div className="flex justify-between items-center flex-wrap gap-2">
                                         <div className="text-sm text-slate-700">
                                            {!item.isInitial && (
                                                <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${getStatusBadgeColor(item.status)}`}>
                                                    {item.status}
                                                </span>
                                            )}
                                        </div>
                                        <time dateTime={new Date(item.timestamp).toISOString()} className="whitespace-nowrap text-right text-sm text-slate-500">
                                            {item.timestamp}
                                        </time>
                                    </div>
                                    <div className="mt-2 text-sm text-slate-600">{item.notes}</div>
                                </div>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};


const RmaDetailView: React.FC<RmaDetailViewProps> = ({ rma, onBack, onStatusUpdate, onNewCycle }) => {
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [deviceToPreview, setDeviceToPreview] = useState<Device | undefined>(undefined);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedCycleInfo, setSelectedCycleInfo] = useState<{ creationDate: string, deviceSerialNumber: string, currentStatus: RmaStatus } | null>(null);

  const [isPreviewDropdownOpen, setIsPreviewDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsPreviewDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const openStatusModal = (cycle: ServiceCycle) => {
    setSelectedCycleInfo({
        creationDate: cycle.creationDate,
        deviceSerialNumber: cycle.deviceSerialNumber,
        currentStatus: cycle.status
    });
    setIsStatusModalOpen(true);
  };
  
  const handleOpenPreview = (device?: Device) => {
    setDeviceToPreview(device);
    setIsPreviewModalOpen(true);
    setIsPreviewDropdownOpen(false);
  };

  const handleSaveStatus = (newStatus: RmaStatus, notes: string) => {
    if (selectedCycleInfo) {
      onStatusUpdate(rma.id, selectedCycleInfo.creationDate, selectedCycleInfo.deviceSerialNumber, newStatus, notes);
    }
    setIsStatusModalOpen(false);
    setSelectedCycleInfo(null);
  };
  
  const getLatestCycleForDevice = (serialNumber: string) => {
      const cyclesForDevice = rma.serviceCycles.filter(c => c.deviceSerialNumber === serialNumber);
      if (cyclesForDevice.length === 0) return null;
      return cyclesForDevice.sort((a,b) => new Date(b.statusDate).getTime() - new Date(a.statusDate).getTime())[0];
  }
  
  const devicesWithClosedCycles = rma.devices.filter(device => 
    rma.serviceCycles.some(cycle => cycle.deviceSerialNumber === device.serialNumber && cycle.status === RmaStatus.CLOSED)
  );

  return (
    <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
            <button onClick={onBack} className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 self-start">
                <ArrowLeftIcon className="w-5 h-5" />
                Back
            </button>
            <div className="flex items-center gap-3 self-end sm:self-center w-full sm:w-auto">
                 <button
                    type="button"
                    onClick={() => onNewCycle(rma)}
                    className="inline-flex w-full sm:w-auto justify-center items-center gap-x-2 rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
                >
                    <PlusIcon className="w-4 h-4 text-slate-500"/> New Service Ticket
                </button>
                <div className="relative w-full sm:w-auto" ref={dropdownRef}>
                  <button
                      type="button"
                      onClick={() => setIsPreviewDropdownOpen(!isPreviewDropdownOpen)}
                      aria-haspopup="true"
                      aria-expanded={isPreviewDropdownOpen}
                      className="inline-flex w-full sm:w-auto justify-center items-center gap-x-2 rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-700"
                  >
                      <EyeIcon className="w-4 h-4"/> Preview/Print
                      <ChevronDownIcon className={`w-5 h-5 transition-transform ${isPreviewDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isPreviewDropdownOpen && (
                    <div className="absolute right-0 z-10 mt-2 w-72 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none" role="menu" aria-orientation="vertical" tabIndex={-1}>
                      <div className="py-1" role="none">
                        <a href="#" onClick={(e) => { e.preventDefault(); handleOpenPreview(); }} className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 font-medium" role="menuitem" tabIndex={-1}>
                          Return Authorization Form
                        </a>
                        {devicesWithClosedCycles.length > 0 && (
                          <>
                            <div className="border-t border-slate-200 my-1"></div>
                            <div className="px-4 pt-2 pb-1 text-xs font-semibold text-slate-500 uppercase tracking-wider">Device Service Reports</div>
                            {devicesWithClosedCycles.map(device => (
                              <a href="#" key={device.serialNumber} onClick={(e) => { e.preventDefault(); handleOpenPreview(device); }} className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100" role="menuitem" tabIndex={-1}>
                                {device.model} - {device.serialNumber}
                              </a>
                            ))}
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
            </div>
        </div>

        <div className="bg-white shadow-sm ring-1 ring-slate-200 rounded-lg p-4 sm:p-6">
            <header className="pb-4 border-b border-slate-200">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">RMA #{rma.id}</h1>
                <p className="text-sm sm:text-md text-slate-600 mt-1">
                    Created: {new Date(rma.creationDate).toLocaleDateString()} | Last Updated: {new Date(rma.lastUpdateDate).toLocaleString()}
                </p>
            </header>
            
            <section className="mt-6">
                <h2 className="text-lg font-semibold text-slate-800 border-b border-slate-200 pb-2 mb-3">Recipient:</h2>
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
                    <InfoPair label="Facility/Customer Name" value={rma.customer.name} />
                    <InfoPair label="Contact Person" value={rma.customer.contactPerson} />
                    <InfoPair label="Email & Phone" value={`${rma.customer.email} / ${rma.customer.phone}`} />
                    <InfoPair label="Address" value={<div className="whitespace-pre-line">{rma.customer.address}</div>} />
                    <InfoPair label="Date of Incident" value={new Date(rma.dateOfIncident).toLocaleDateString()} />
                    <InfoPair label="Date of Report" value={new Date(rma.dateOfReport).toLocaleDateString()} />
                    <InfoPair 
                        label="Attachment Proof" 
                        value={
                            rma.attachment ? (
                                <a href={`/attachments/${rma.attachment}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium">
                                    <PaperClipIcon className="h-4 w-4" />
                                    {rma.attachment}
                                </a>
                            ) : 'N/A'
                        }
                    />
                </dl>
            </section>
            
            <section className="mt-6">
                <h2 className="text-lg font-semibold text-slate-800 border-b border-slate-200 pb-2 mb-3">Devices in this RMA</h2>
                 {/* Mobile Card View */}
                 <div className="sm:hidden space-y-3">
                   {rma.devices.map((device) => {
                     const latestCycle = getLatestCycleForDevice(device.serialNumber);
                     return (
                       <div key={device.serialNumber} className="p-3 border border-slate-200 rounded-lg">
                         <p className="font-medium text-slate-900">{device.model}</p>
                         <p className="text-sm text-slate-500">Part #: {device.partNumber}</p>
                         <p className="text-sm text-slate-500 font-mono">{device.serialNumber}</p>
                         <p className="text-sm text-slate-500">Quantity: {device.quantity}</p>
                         <div className="mt-2 pt-2 border-t border-slate-100">
                           {latestCycle ? (
                             <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${getStatusBadgeColor(latestCycle.status)}`}>
                               {latestCycle.status}
                             </span>
                           ) : (
                             <span className="text-slate-400 italic text-xs">No service yet</span>
                           )}
                         </div>
                       </div>
                     )
                   })}
                 </div>

                {/* Desktop Table View */}
                <div className="hidden sm:block flow-root">
                  <div className="-mx-6 -my-2 overflow-x-auto">
                    <div className="inline-block min-w-full py-2 align-middle sm:px-6">
                      <table className="min-w-full divide-y divide-slate-300">
                        <thead>
                          <tr>
                            <th scope="col" className="py-3.5 pl-6 pr-3 text-left text-sm font-semibold text-slate-900">Model</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">Part Number</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">Serial / Lot Number</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">Quantity</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">Current Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {rma.devices.map((device) => {
                            const latestCycle = getLatestCycleForDevice(device.serialNumber);
                            return (
                              <tr key={device.serialNumber}>
                                <td className="whitespace-nowrap py-4 pl-6 pr-3 text-sm font-medium text-slate-900">{device.model}</td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">{device.partNumber}</td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500 font-mono">{device.serialNumber}</td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">{device.quantity}</td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                                  {latestCycle ? (
                                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${getStatusBadgeColor(latestCycle.status)}`}>
                                      {latestCycle.status}
                                    </span>
                                  ) : (
                                    <span className="text-slate-400 italic">No service yet</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
            </section>
        </div>

        <section className="mt-8">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Service History by Device</h2>
            <div className="space-y-8">
                {rma.devices.map(device => {
                  const cyclesForDevice = rma.serviceCycles.filter(c => c.deviceSerialNumber === device.serialNumber).sort((a,b) => new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime());
                  return (
                    <div key={device.serialNumber}>
                      <h3 className="text-lg font-semibold text-slate-800 border-b-2 border-primary-200 pb-2 mb-4">
                        {device.model} - <span className="font-mono text-slate-600">{device.serialNumber}</span>
                      </h3>
                      {cyclesForDevice.length > 0 ? (
                        <div className="space-y-6">
                          {cyclesForDevice.map((cycle, index) => {
                            const isLatestCycle = index === 0;
                            return (
                              <div key={cycle.creationDate} className="bg-white shadow-sm ring-1 ring-slate-200 rounded-lg p-4 sm:p-5">
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                                  <div>
                                    <h4 className="text-base font-semibold text-slate-800">Service Ticket created on {new Date(cycle.creationDate).toLocaleDateString()}</h4>
                                    <p className="text-sm text-slate-500">Last update to this ticket: {new Date(cycle.statusDate).toLocaleString()}</p>
                                  </div>
                                  <div className="flex items-center gap-4 self-end sm:self-start flex-shrink-0">
                                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ring-1 ring-inset ${getStatusBadgeColor(cycle.status)}`}>
                                      {cycle.status}
                                    </span>
                                  </div>
                                </div>
                                {isLatestCycle && cycle.status !== RmaStatus.CLOSED && (
                                  <div className="mt-4 border-t border-slate-200 pt-4">
                                      <button onClick={() => openStatusModal(cycle)} className="inline-flex w-full sm:w-auto items-center justify-center gap-x-1.5 rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50">
                                        <PencilSquareIcon className="-ml-0.5 h-5 w-5 text-slate-500" aria-hidden="true" />
                                        Update Status
                                      </button>
                                  </div>
                                )}
                                <div className="mt-4 border-t border-slate-200 pt-4">
                                  <ServiceHistoryTimeline cycle={cycle} />
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-6 bg-white rounded-lg ring-1 ring-slate-200 text-slate-500">
                           No service history for this device on this RMA.
                        </div>
                      )}
                    </div>
                  )
                })}
            </div>
        </section>

      {isPreviewModalOpen && <RmaPreviewModal rma={rma} deviceToPreview={deviceToPreview} onClose={() => setIsPreviewModalOpen(false)} />}
      {isStatusModalOpen && selectedCycleInfo && (
        <StatusUpdateModal 
            currentStatus={selectedCycleInfo.currentStatus}
            onClose={() => setIsStatusModalOpen(false)}
            onSave={handleSaveStatus}
        />
      )}
    </div>
  );
};

export default RmaDetailView;
