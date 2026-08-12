import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { RmaStatus, ServiceCycle, StatusHistoryEvent } from '../types';
import StatusUpdateModal from './StatusUpdateModal';
import { RmaPreviewModal } from './RmaPreviewModal';
import NewCycleModal from './NewCycleModal';
import TestReportModal from './TestReportModal';
import TestReportPdfDocument from './TestReportPdfDocument';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { ArrowLeftIcon, PencilSquareIcon, PlusIcon, EyeIcon, ClockIcon, TrashIcon } from './icons';
import { useRmaContext } from '../src/context/RmaContext';
import { motion } from 'framer-motion';
import { getStatusBadgeColor } from './RmaList';
import { testReportsApi, TestReport } from '../src/api/test-reports.api';

/**
 * A detailed status badge component that shows the current status and the date of the last update.
 */
const StatusBadge: React.FC<{ status: RmaStatus; date: string }> = ({ status, date }) => {
  const statusConfig = {
    [RmaStatus.PENDING]: { text: 'Pending', color: 'bg-slate-100 text-slate-800', icon: <ClockIcon className="w-4 h-4" /> },
    [RmaStatus.RECEIVED]: { text: 'Device Received', color: 'bg-blue-100 text-blue-800', icon: <EyeIcon className="w-4 h-4" /> },
    [RmaStatus.IN_REPAIR]: { text: 'In Repair', color: 'bg-yellow-100 text-yellow-800', icon: <PencilSquareIcon className="w-4 h-4" /> },
    [RmaStatus.WAITING_APPROVAL]: { text: 'Waiting for Customer Approval', color: 'bg-orange-100 text-orange-800', icon: <PencilSquareIcon className="w-4 h-4" /> },
    [RmaStatus.PAYMENT_PROCESSING]: { text: 'Payment Under Process', color: 'bg-purple-100 text-purple-800', icon: <PencilSquareIcon className="w-4 h-4" /> },
    [RmaStatus.CLOSED]: { text: 'Closed', color: 'bg-gray-100 text-gray-800', icon: <PencilSquareIcon className="w-4 h-4" /> },
    [RmaStatus.CUSTOM]: { text: 'Custom', color: 'bg-teal-100 text-teal-800', icon: <PencilSquareIcon className="w-4 h-4" /> },
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
  if (!history || history.length === 0) {
    return (
      <div className="mt-4 pl-4 border-l-2 border-slate-200/60">
        <p className="text-sm text-slate-500 italic">No history logged for this service ticket.</p>
      </div>
    );
  }

  // Sort history from newest to oldest
  const sortedHistory = history.slice().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="mt-6 relative">
      {/* Continuous vertical line */}
      <div className="absolute left-2.5 top-0 bottom-0 w-0.5 bg-slate-200/60 -z-10"></div>

      <div className="space-y-6">
        {sortedHistory.map((event, index) => {
          const badgeColor = getStatusBadgeColor(event.status as RmaStatus);

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="relative pl-8"
            >
              {/* Timeline Dot */}
              <div className={`absolute left-0 top-1.5 h-5 w-5 rounded-full border-4 border-white shadow-sm ring-1 ring-slate-200 ${['PENDING', 'RECEIVED'].includes(event.status) ? 'bg-slate-400' : 'bg-primary-500'}`}></div>

              <div className="bg-white/60 p-3 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-1 mb-2">
                  <p className="text-sm font-semibold text-slate-800">
                    Status changed to <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${badgeColor} ml-1`}>{event.status}</span>
                  </p>
                  <time className="text-xs text-slate-400 font-mono">{new Date(event.date).toLocaleString([], { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</time>
                </div>
                {event.notes && (
                  <p className="text-sm text-slate-600 leading-relaxed bg-slate-50/50 p-2 rounded-lg border border-slate-200/50">
                    {event.notes}
                  </p>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  );
};

/**
 * Displays the details of a single RMA, including its customer information, devices, and service cycles.
 * Provides functionality to update the status of a service cycle and to initiate the creation of a new cycle.
 */
const RmaDetailView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { rmas, updateStatus, updateRma } = useRmaContext();

  const rma = rmas.find(r => r.id === id);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNewCycleModalOpen, setIsNewCycleModalOpen] = useState(false);
  const [isHistoryVisible, setIsHistoryVisible] = useState<Record<string, boolean>>({});
  const [cycleToUpdate, setCycleToUpdate] = useState<ServiceCycle | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Test Report state
  const [testReports, setTestReports] = useState<Record<number, TestReport | null>>({});
  const [testReportModalCycle, setTestReportModalCycle] = useState<ServiceCycle | null>(null);
  const [previewTestReport, setPreviewTestReport] = useState<{ device: Device, cycle: ServiceCycle, report: TestReport } | null>(null);

  // Fetch test reports for each service cycle
  useEffect(() => {
    if (!rma) return;
    rma.serviceCycles.forEach(async (cycle: any) => {
      if (!cycle.id) return;
      try {
        const res = await testReportsApi.getByServiceCycleId(cycle.id);
        setTestReports(prev => ({ ...prev, [cycle.id]: (res as any).data || null }));
      } catch {
        setTestReports(prev => ({ ...prev, [cycle.id]: null }));
      }
    });
  }, [rma?.id]);

  if (!rma) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold text-slate-700">RMA Not Found</h2>
        <button
          onClick={() => navigate('/rmas')}
          className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
        >
          Back to List
        </button>
      </div>
    );
  }

  const handleOpenModal = (cycle: ServiceCycle) => {
    setCycleToUpdate(cycle);
    setIsModalOpen(true);
  };

  const handleUpdate = (newStatus: RmaStatus, notes: string) => {
    if (cycleToUpdate) {
      updateStatus(rma.id, cycleToUpdate.deviceSerialNumber, newStatus, notes);
      setIsModalOpen(false);
      setCycleToUpdate(null);
    }
  };

  const handleSaveNewCycle = async (rmaId: string, deviceSerialNumber: string, issueDescription: string, accessoriesIncluded: string) => {
    // Logic refactored from App.tsx
    const now = new Date().toISOString();
    const newCycle: ServiceCycle = {
      deviceSerialNumber,
      status: RmaStatus.PENDING,
      statusDate: now,
      creationDate: now,
      issueDescription,
      accessoriesIncluded,
      history: [{
        status: RmaStatus.PENDING,
        date: now,
        notes: issueDescription || 'New service ticket created.'
      }]
    };

    const updatedRma = {
      ...rma,
      lastUpdateDate: now,
      serviceCycles: [...rma.serviceCycles, newCycle]
    };

    await updateRma(rmaId, updatedRma);
    setIsNewCycleModalOpen(false);
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
          <div className="flex items-start gap-4">
            <button onClick={() => navigate('/rmas')} className="mt-1 p-1 hover:bg-slate-100 rounded-full transition-colors">
              <ArrowLeftIcon className="w-6 h-6 text-slate-500" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">{rma.id}</h1>
              <div className="mt-2 text-sm text-slate-500">
                <p><span className="font-semibold">Customer:</span> {rma.customer.name}</p>
                <p><span className="font-semibold">Contact:</span> {rma.customer.contactPerson} ({rma.customer.email})</p>
              </div>
            </div>
          </div>
          <div className="text-right">
            <button onClick={() => setIsPreviewOpen(true)} className="inline-flex items-center gap-x-2 rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50">
              <EyeIcon className="w-4 h-4 text-slate-500" /> Preview & Print
            </button>
            <p className="text-xs text-slate-400 mt-1">Created: {new Date(rma.creationDate).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Safety Incident Section */}
        {rma.isInjuryRelated && (
          <div className="mt-2 mb-8 bg-red-50 border border-red-200 rounded-lg p-5">
            <h2 className="text-xl font-semibold text-red-900 border-b border-red-200 pb-2 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              Safety Incident Report
            </h2>
            <div className="mt-4 text-sm text-red-800">
              <p className="font-semibold mb-1">Details recorded regarding patient, user, or third-party injury:</p>
              <p className="bg-white/60 p-3 rounded-md border border-red-100 mt-2 whitespace-pre-wrap">{rma.injuryDetails}</p>
            </div>
          </div>
        )}

        {/* Section for Devices and their Service Cycles */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-slate-800 border-b pb-2">Devices & Service History</h2>
          {rma.devices.map(device => (
            <div key={device.serialNumber} className="py-4 border-b last:border-none">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-bold text-lg text-primary-600">{device.articleNumber || 'No Article Number'}</p>
                  <p className="text-sm text-slate-500">S/N: {device.serialNumber}</p>
                </div>
                <button onClick={() => setIsNewCycleModalOpen(true)} className="inline-flex items-center gap-x-2 rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50">
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
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <button onClick={() => toggleHistory(cycle.creationDate)} className="text-sm text-primary-600 hover:text-primary-800 font-medium">
                        {isHistoryVisible[cycle.creationDate] ? 'Hide History' : 'Show History'}
                      </button>
                      {/* Test Report buttons */}
                      {(cycle as any).id && (
                        <>
                          <span className="text-slate-300">|</span>
                          <button
                            onClick={() => setTestReportModalCycle(cycle)}
                            className={`text-sm font-medium px-3 py-1 rounded-md border transition-colors ${
                              testReports[(cycle as any).id]
                                ? 'border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100'
                                : 'border-slate-200 text-slate-600 bg-white hover:bg-slate-100'
                            }`}
                          >
                            {testReports[(cycle as any).id] ? '📋 View / Edit Test Report' : '+ Create Test Report'}
                          </button>
                          {testReports[(cycle as any).id] && (
                            <>
                              <button
                                onClick={() => {
                                  setPreviewTestReport({ device, cycle, report: testReports[(cycle as any).id]! });
                                  setIsPreviewOpen(true);
                                }}
                                className="text-sm font-medium px-3 py-1 rounded-md border border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors"
                              >
                                👁 Preview PDF
                              </button>
                              <PDFDownloadLink
                                document={
                                  <TestReportPdfDocument
                                    report={testReports[(cycle as any).id]!}
                                    deviceSerialNumber={cycle.deviceSerialNumber}
                                    rmaId={rma.id}
                                  />
                                }
                                fileName={`TestReport-${rma.id}-${cycle.deviceSerialNumber}.pdf`}
                                className="text-sm font-medium px-3 py-1 rounded-md border border-green-200 text-green-700 bg-green-50 hover:bg-green-100 transition-colors"
                              >
                                {({ loading }) => loading ? 'Preparing...' : '⬇ Download PDF'}
                              </PDFDownloadLink>
                              <button
                                onClick={async () => {
                                  if (window.confirm('Are you sure you want to delete this test report? This action cannot be undone.')) {
                                    try {
                                      await testReportsApi.delete(testReports[(cycle as any).id]!.id);
                                      setTestReports(prev => ({ ...prev, [cycle.id]: null }));
                                    } catch (err) {
                                      console.error('Failed to delete test report', err);
                                      alert('Failed to delete test report. Please try again.');
                                    }
                                  }
                                }}
                                className="p-1.5 rounded-md border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                                title="Delete Test Report"
                              >
                                <TrashIcon className="w-5 h-5" />
                              </button>
                            </>
                          )}
                        </>
                      )}
                    </div>
                    {isHistoryVisible[cycle.creationDate] && <HistoryLog history={cycle.history} />}
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
          onSave={handleUpdate}
          onClose={() => setIsModalOpen(false)}
        />
      )}
      {isPreviewOpen && (
        <RmaPreviewModal
          rma={rma}
          testReports={testReports as Record<number, TestReport>}
          initialView={previewTestReport ? 'test_report' : 'main'}
          initialSelectedTestReport={previewTestReport}
          onClose={() => {
            setIsPreviewOpen(false);
            setPreviewTestReport(null);
          }}
        />
      )}
      {isNewCycleModalOpen && (
        <NewCycleModal
          rma={rma}
          onSave={handleSaveNewCycle}
          onClose={() => setIsNewCycleModalOpen(false)}
        />
      )}
      {testReportModalCycle && (
        <TestReportModal
          serviceCycleId={(testReportModalCycle as any).id}
          deviceSerialNumber={testReportModalCycle.deviceSerialNumber}
          rmaId={rma.id}
          initialDeviceType={rma.devices.find(d => d.serialNumber === testReportModalCycle.deviceSerialNumber)?.articleNumber || ''}
          existingReport={testReports[(testReportModalCycle as any).id] ?? null}
          onClose={() => setTestReportModalCycle(null)}
          onSaved={(saved) => {
            setTestReports(prev => ({ ...prev, [(testReportModalCycle as any).id]: saved }));
            setTestReportModalCycle(null);
          }}
        />
      )}
    </>
  );
};

export default RmaDetailView;
