import React, { useState } from 'react';
import { PDFViewer, PDFDownloadLink } from '@react-pdf/renderer';
import { Rma, Device, ServiceCycle, RmaStatus } from '../types';
import { TestReport } from '../src/api/test-reports.api';
import { XMarkIcon, DownloadIcon, EyeIcon } from './icons';
import { ReturnAuthorizationDocument, ServiceReportDocument } from './RmaPdfDocument';
import TestReportPdfDocument from './TestReportPdfDocument';

interface RmaPreviewModalProps {
    rma: Rma | null | undefined;
    testReports?: Record<number, TestReport>;
    onClose: () => void;
}

const SelectReportView: React.FC<{
    rma: Rma,
    testReports: Record<number, TestReport>,
    onSelectServiceReport: (device: Device, cycle: ServiceCycle) => void,
    onSelectTestReport: (device: Device, cycle: ServiceCycle, report: TestReport) => void,
    onBack: () => void
}> = ({ rma, testReports, onSelectServiceReport, onSelectTestReport, onBack }) => {
    const closedCycles = rma.serviceCycles.filter(cycle => cycle.history.some(h => h.status === RmaStatus.CLOSED));

    return (
        <div className="p-8 h-full overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Select Document to Preview</h2>
            <p className="text-sm text-slate-600 mb-6">Select a Service Report or Test Report to preview.</p>
            
            <h3 className="font-bold text-slate-800 mb-2">Service Reports</h3>
            <div className="space-y-4 mb-8">
                {closedCycles.length > 0 ? closedCycles.map(cycle => {
                    const device = rma.devices.find(d => d.serialNumber === cycle.deviceSerialNumber);
                    const report = cycle.history.find(h => h.status === RmaStatus.CLOSED);
                    if (!device || !report) return null;

                    return (
                        <button key={`sr-${cycle.creationDate}`} onClick={() => onSelectServiceReport(device, cycle)} className="w-full text-left p-4 border rounded-lg hover:bg-slate-50 flex justify-between items-center transition-colors">
                            <div>
                                <p className="font-bold text-primary-700">{device.articleNumber || 'No Article Number'} (S/N: {device.serialNumber})</p>
                                <p className="text-sm text-slate-500">Report from: {new Date(report.date).toLocaleDateString()}</p>
                            </div>
                            <EyeIcon className="w-5 h-5 text-slate-400" />
                        </button>
                    )
                }) : <p className="text-sm text-slate-500 italic">No closed service reports available.</p>}
            </div>

            <h3 className="font-bold text-slate-800 mb-2">Test Reports</h3>
            <div className="space-y-4 mb-6">
                {rma.serviceCycles.filter(c => testReports[c.id as any]).length > 0 ? rma.serviceCycles.filter(c => testReports[c.id as any]).map(cycle => {
                    const device = rma.devices.find(d => d.serialNumber === cycle.deviceSerialNumber);
                    const report = testReports[cycle.id as any];
                    if (!device || !report) return null;

                    return (
                        <button key={`tr-${cycle.creationDate}`} onClick={() => onSelectTestReport(device, cycle, report)} className="w-full text-left p-4 border rounded-lg hover:bg-slate-50 flex justify-between items-center transition-colors">
                            <div>
                                <p className="font-bold text-green-700">{device.articleNumber || 'No Article Number'} (S/N: {device.serialNumber})</p>
                                <p className="text-sm text-slate-500">Test Date: {new Date(report.testDate).toLocaleDateString()} | Result: {report.overallResult}</p>
                            </div>
                            <EyeIcon className="w-5 h-5 text-slate-400" />
                        </button>
                    )
                }) : <p className="text-sm text-slate-500 italic">No test reports available.</p>}
            </div>

            <button onClick={onBack} className="mt-4 text-sm font-semibold text-primary-600 hover:text-primary-800 transition-colors">← Back to RMA Document</button>
        </div>
    )
}

export const RmaPreviewModal: React.FC<RmaPreviewModalProps> = ({ rma, testReports = {}, onClose }) => {
    const [view, setView] = useState<'main' | 'select_report' | 'service_report' | 'test_report'>('main');
    const [selectedServiceReport, setSelectedServiceReport] = useState<{ device: Device, cycle: ServiceCycle } | null>(null);
    const [selectedTestReport, setSelectedTestReport] = useState<{ device: Device, cycle: ServiceCycle, report: TestReport } | null>(null);

    if (!rma) return null;

    const getDocument = () => {
        if (view === 'service_report' && selectedServiceReport) {
            return <ServiceReportDocument rma={rma} device={selectedServiceReport.device} cycle={selectedServiceReport.cycle} />;
        }
        if (view === 'test_report' && selectedTestReport) {
            return <TestReportPdfDocument report={selectedTestReport.report} deviceSerialNumber={selectedTestReport.device.serialNumber} rmaId={rma.id} />;
        }
        return <ReturnAuthorizationDocument rma={rma} />;
    };

    const getModalTitleAndPdfName = () => {
        if (view === 'service_report' && selectedServiceReport) {
            return {
                title: `Service Report: ${selectedServiceReport.device.serialNumber}`,
                fileName: `ServiceReport-${rma.id}-${selectedServiceReport.device.serialNumber}.pdf`
            }
        }
        if (view === 'test_report' && selectedTestReport) {
            return {
                title: `Test Report: ${selectedTestReport.device.serialNumber}`,
                fileName: `TestReport-${rma.id}-${selectedTestReport.device.serialNumber}.pdf`
            }
        }
        if (view === 'select_report') {
            return { title: 'Select Document', fileName: '' }
        }
        return {
            title: `Return Authorization: ${rma.id}`,
            fileName: `ReturnAuth-${rma.id}.pdf`
        }
    }

    const { title: modalTitle, fileName: pdfFileName } = getModalTitleAndPdfName();

    return (
        <div className="fixed inset-0 bg-slate-900/75 backdrop-blur-sm flex items-center justify-center z-50 p-4 sm:p-6" aria-labelledby="preview-modal-title" role="dialog" aria-modal="true">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl h-full max-h-[95vh] flex flex-col overflow-hidden ring-1 ring-black/5">
                
                {/* Header */}
                <header className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
                    <h2 id="preview-modal-title" className="text-xl font-bold text-slate-800 truncate">{modalTitle}</h2>
                    <div className="flex flex-wrap items-center gap-2">
                        {pdfFileName && (
                            <PDFDownloadLink document={getDocument()} fileName={pdfFileName}>
                                {({ loading }) => (
                                    <button className="inline-flex items-center gap-x-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 disabled:opacity-50 transition-colors" disabled={loading}>
                                        <DownloadIcon className="w-4 h-4" />
                                        {loading ? 'Preparing...' : 'Download PDF'}
                                    </button>
                                )}
                            </PDFDownloadLink>
                        )}
                        <button onClick={() => setView('select_report')} className="inline-flex items-center gap-x-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 transition-colors">
                            Other Reports
                        </button>
                        <button onClick={onClose} className="p-2 ml-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-full transition-colors" aria-label="Close modal">
                            <XMarkIcon className="w-6 h-6" />
                        </button>
                    </div>
                </header>
                
                {/* Body */}
                <div className="flex-1 overflow-hidden bg-slate-200 relative">
                    {view === 'select_report' ? (
                        <div className="absolute inset-0 bg-white">
                            <SelectReportView 
                                rma={rma} 
                                testReports={testReports}
                                onSelectServiceReport={(device, cycle) => { setSelectedServiceReport({ device, cycle }); setView('service_report'); }} 
                                onSelectTestReport={(device, cycle, report) => { setSelectedTestReport({ device, cycle, report }); setView('test_report'); }}
                                onBack={() => setView('main')} 
                            />
                        </div>
                    ) : (
                        <PDFViewer width="100%" height="100%" className="border-0">
                            {getDocument()}
                        </PDFViewer>
                    )}
                </div>

            </div>
        </div>
    );
};
