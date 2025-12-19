import React, { useRef, ReactNode, useState } from 'react';
import { PDFViewer, PDFDownloadLink } from '@react-pdf/renderer';
import { Rma, RmaStatus, Device, ServiceCycle, StatusHistoryEvent } from '../types';
import { XMarkIcon, PrintIcon, DownloadIcon, EyeIcon } from './icons';
import { ReturnAuthorizationDocument, ServiceReportDocument } from './RmaPdfDocument';

interface RmaPreviewModalProps {
    rma: Rma | null | undefined;
    onClose: () => void;
}

const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
};

const SafeData: React.FC<{ data: any; children: ReactNode; fallback?: ReactNode }> = ({ data, children, fallback }) => {
    if (!data || (Array.isArray(data) && data.length === 0)) {
        return <>{fallback || <div className="p-4 text-sm text-slate-500 bg-slate-100 rounded-md">Data not available.</div>}</>;
    }
    return <>{children}</>;
};

const Page = React.forwardRef<HTMLDivElement, { children: React.ReactNode, isLastPage?: boolean }>(({ children, isLastPage }, ref) => (
    <div ref={ref} className={`page w-[210mm] min-h-[297mm] bg-white shadow-xl mx-auto my-4 p-8 font-serif text-black flex flex-col ${!isLastPage ? 'page-break-after' : ''}`}>
        {children}
    </div>
));

const RmaFormHeader = ({ rma, pageNumber, totalPages }: { rma: Rma, pageNumber: number, totalPages: number }) => (
    <header className="flex justify-between items-start pb-4 mb-4 border-b-4 border-black">
        <div>
            <h1 className="text-3xl font-bold text-black">Return Authorization Form</h1>
            <p className="text-xl text-black mt-1">RMA #<span className="font-bold">{rma.id ?? 'N/A'}</span></p>
        </div>
        <div className="text-right text-xs text-gray-600">
            <p className="font-bold text-black">Recipient: AVANA TECHNOLOGY SERVICES</p>
            <p>91, GROUND FLOOR SUNDAR NAGAR 4TH AVENUE</p>
            <p>Ekkaduthangal, Chennai, Tamil Nadu, 600032</p>
            {totalPages > 1 && <p className="text-sm text-black mt-4 font-bold">Page {pageNumber} of {totalPages}</p>}
        </div>
    </header>
);

const RmaFormFooter = () => (
    <footer className="mt-auto pt-4 border-t-2 border-black text-center text-xs text-gray-500">
        <p>If you have any questions, please contact our support team at 1-800-555-HELP.</p>
        <p className="mt-1">&copy; {new Date().getFullYear()} Avana Medical. All rights reserved.</p>
    </footer>
);

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <section className="mb-6">
        <h2 className="text-lg font-bold border-b-2 border-black pb-2 mb-4 text-black">{title}</h2>
        {children}
    </section>
);

const InfoTable = ({ data }: { data: { label: string; value: React.ReactNode }[] }) => (
    <table className="w-full text-sm">
        <tbody>
            {data.map(({ label, value }, index) => (
                <tr key={index} className="border-b border-gray-200 last:border-b-0">
                    <td className="py-2 pr-4 font-semibold text-gray-700 w-1/3">{label}</td>
                    <td className="py-2 text-black">{value ?? 'N/A'}</td>
                </tr>
            ))}
        </tbody>
    </table>
);

const DeviceTable = ({ devices, rma }: { devices: Device[], rma: Rma }) => (
    <table className="w-full text-sm border-collapse border border-gray-300">
        <thead className="bg-gray-100 text-black">
            <tr>
                <th className="border p-2 text-left">Article No.</th>
                <th className="border p-2 text-left">Serial / Lot No.</th>
                <th className="border p-2 text-left">Qty</th>
                <th className="border p-2 text-left">Failure Description</th>
            </tr>
        </thead>
        <tbody>
            <SafeData data={devices} fallback={<tr><td colSpan={4} className="p-4 text-center text-slate-500">No devices listed for this RMA.</td></tr>}>
                {devices.map(device => {
                    const mostRecentCycle = [...(rma.serviceCycles || [])]
                        .filter(c => c.deviceSerialNumber === device.serialNumber)
                        .sort((a, b) => new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime())[0];
                    return (
                        <tr key={device.serialNumber} className="border-b">
                            <td className="border p-2">{device.articleNumber ?? 'N/A'}</td>
                            <td className="border p-2 font-mono">{device.serialNumber ?? 'N/A'}</td>
                            <td className="border p-2">{device.quantity ?? 'N/A'}</td>
                            <td className="border p-2 text-xs">{mostRecentCycle?.issueDescription || 'N/A'}</td>
                        </tr>
                    );
                })}
            </SafeData>
        </tbody>
    </table>
);

const ServiceReportContent: React.FC<{ rma: Rma; device: Device; serviceCycle: ServiceCycle }> = ({ rma, device, serviceCycle }) => {
    const finalReportEvent = serviceCycle.history.find(h => h.status === RmaStatus.CLOSED || h.status === RmaStatus.REPAIRED) || serviceCycle.history[serviceCycle.history.length - 1];

    return (
        <Page>
            <header className="flex justify-between items-start pb-4 mb-8 border-b-4 border-black">
                <div>
                    <h1 className="text-3xl font-bold text-black">Device Service Report</h1>
                    <p className="text-lg text-gray-700 mt-1">RMA #{rma.id ?? 'N/A'}</p>
                </div>
                <div className="text-right text-xs text-gray-600">
                    <p className="font-bold text-black">AVANA TECHNOLOGY SERVICES</p>
                    <p>91, GROUND FLOOR SUNDAR NAGAR 4TH AVENUE</p>
                    <p>Ekkaduthangal, Chennai, Tamil Nadu, 600032</p>
                </div>
            </header>
            <Section title="Recipient">
                <SafeData data={rma.customer} fallback={<p className="text-sm text-slate-500">Customer information is not available.</p>}>
                    <InfoTable data={[
                        { label: "Facility/Customer Name", value: rma.customer?.name },
                        { label: "Contact Person", value: rma.customer?.contactPerson },
                    ]} />
                </SafeData>
            </Section>
            <Section title="Service Details">
                <h3 className="text-base font-bold text-black mt-4">{device.articleNumber || 'No Article Number'}</h3>
                <p className="text-sm text-gray-600 mb-2">S/N: {device.serialNumber ?? 'N/A'}</p>
                <InfoTable data={[
                    { label: "Article Number", value: device.articleNumber },
                    { label: "Quantity", value: String(device.quantity) },
                    { label: "Accessories Included", value: serviceCycle.accessoriesIncluded },
                    { label: "Service Ticket Date", value: formatDate(serviceCycle.creationDate) },
                    { label: "Service Report Date", value: finalReportEvent ? formatDate(finalReportEvent.date) : 'N/A' },
                ]} />
                <div className="mt-4">
                    <h4 className="font-bold text-black">Failure Description/Details</h4>
                    <p className="text-sm text-black mt-1 p-2 border border-gray-200 bg-gray-50 rounded-sm">{serviceCycle.issueDescription}</p>
                </div>
            </Section>
            <Section title="Service Resolution">
                {finalReportEvent ? (
                    <div className="bg-slate-50 border border-slate-200 rounded-md p-4">
                        <p className="text-xs text-slate-500 font-medium">{new Date(finalReportEvent.date).toLocaleString()}</p>
                        <p className="text-sm font-semibold text-slate-700">Final Status: "{finalReportEvent.status}"</p>
                        <p className="text-sm text-slate-600 mt-2 whitespace-pre-wrap">{finalReportEvent.notes}</p>
                    </div>
                ) : (
                    <p className="text-sm text-slate-500 italic">No final resolution has been logged for this service ticket.</p>
                )}
            </Section>
            <RmaFormFooter />
        </Page>
    );
};


const ReturnAuthContent: React.FC<{ rma: Rma }> = ({ rma }) => {
    const devices = rma.devices || [];
    const MAX_DEVICES_FIRST_PAGE = 8;
    const MAX_DEVICES_SUBSEQUENT_PAGE = 15;
    const deviceChunks: Device[][] = [];

    if (devices.length > MAX_DEVICES_FIRST_PAGE) {
        deviceChunks.push(devices.slice(0, MAX_DEVICES_FIRST_PAGE));
        let remaining = devices.slice(MAX_DEVICES_FIRST_PAGE);
        while (remaining.length > 0) {
            deviceChunks.push(remaining.slice(0, MAX_DEVICES_SUBSEQUENT_PAGE));
            remaining = remaining.slice(MAX_DEVICES_SUBSEQUENT_PAGE);
        }
    } else {
        deviceChunks.push(devices);
    }
    const totalPages = deviceChunks.length;

    return (
        <>
            {deviceChunks.map((chunk, pageIndex) => (
                <Page key={pageIndex} isLastPage={pageIndex === totalPages - 1}>
                    <RmaFormHeader rma={rma} pageNumber={pageIndex + 1} totalPages={totalPages} />
                    {pageIndex === 0 && (
                        <Section title="Customer Information">
                            <SafeData data={rma.customer} fallback={<p className="text-sm text-slate-500">Customer information is not available.</p>}>
                                <InfoTable data={[
                                    { label: "Facility/Customer Name", value: rma.customer?.name },
                                    { label: "Address", value: <div className="whitespace-pre-line">{rma.customer?.address}</div> },
                                    { label: "Date of Incident", value: formatDate(rma.dateOfIncident) },
                                    { label: "Date of Report", value: formatDate(rma.dateOfReport) },
                                    { label: "Attachment Proof", value: rma.attachment ? "Proof Attached" : 'N/A' },
                                ]} />
                            </SafeData>
                        </Section>
                    )}
                    <Section title={pageIndex === 0 ? "Authorized Devices for Return" : "Authorized Devices for Return (continued)"}>
                        <DeviceTable devices={chunk} rma={rma} />
                    </Section>
                    {pageIndex === totalPages - 1 && (
                        <Section title="Shipping Instructions">
                            <div className="border border-black p-4">
                                <ol className="list-decimal list-inside space-y-2 text-sm text-black">
                                    <li>Securely pack the device(s) listed above to prevent damage.</li>
                                    <li>Include a printed copy of this document inside the shipment.</li>
                                    <li className="font-bold">Write the RMA number clearly on the outside of the container: <span className="text-2xl font-bold tracking-wider">{rma.id ?? 'N/A'}</span></li>
                                </ol>
                            </div>
                        </Section>
                    )}
                    <RmaFormFooter />
                </Page>
            ))}
        </>
    );
};

const SelectReportView: React.FC<{ rma: Rma, onSelect: (device: Device, cycle: ServiceCycle) => void, onBack: () => void }> = ({ rma, onSelect, onBack }) => {
    const closedCycles = rma.serviceCycles.filter(cycle => cycle.history.some(h => h.status === RmaStatus.CLOSED));

    return (
        <div className="p-8">
            <h2 className="text-xl font-bold mb-4">Select Service Report</h2>
            <p className="text-sm text-slate-600 mb-6">Multiple service reports are available for this RMA. Please select which one you would like to view or print.</p>
            <div className="space-y-4">
                {closedCycles.length > 0 ? closedCycles.map(cycle => {
                    const device = rma.devices.find(d => d.serialNumber === cycle.deviceSerialNumber);
                    const report = cycle.history.find(h => h.status === RmaStatus.CLOSED);
                    if (!device || !report) return null;

                    return (
                        <button key={cycle.creationDate} onClick={() => onSelect(device, cycle)} className="w-full text-left p-4 border rounded-lg hover:bg-slate-100 flex justify-between items-center">
                            <div>
                                <p className="font-bold">{device.articleNumber || 'No Article Number'} (S/N: {device.serialNumber})</p>
                                <p className="text-sm text-slate-500">Report from: {new Date(report.date).toLocaleDateString()}</p>
                            </div>
                            <EyeIcon className="w-5 h-5 text-slate-500" />
                        </button>
                    )
                }) : <p className="text-slate-500">No closed service reports found for this RMA.</p>}
            </div>
            <button onClick={onBack} className="mt-6 text-sm font-semibold text-primary-600 hover:text-primary-800">Back to Main RMA</button>
        </div>
    )
}

export const RmaPreviewModal: React.FC<RmaPreviewModalProps> = ({ rma, onClose }) => {
    const previewRef = useRef<HTMLDivElement>(null);
    const [view, setView] = useState('main'); // 'main', 'select_report', 'service_report'
    const [selectedReport, setSelectedReport] = useState<{ device: Device, cycle: ServiceCycle } | null>(null);

    if (!rma) {
        return (
            <div className="fixed inset-0 bg-slate-800 bg-opacity-75 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col p-8">
                    <h2 className="text-xl font-semibold text-slate-800">Loading Preview...</h2>
                    <p className="text-slate-500 mt-2">The data for this RMA could not be loaded. Please close this window and try again.</p>
                    <button onClick={onClose} className="mt-4 ml-auto rounded-md bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50">Close</button>
                </div>
            </div>
        );
    }

    const handlePrint = () => {
        const content = previewRef.current;
        if (content) {
            const printWindow = window.open('', '', 'height=800,width=800');
            if (printWindow) {
                printWindow.document.write('<html><head><title>RMA Document</title>');
                printWindow.document.write('<script src="https://cdn.tailwindcss.com"></script>');
                printWindow.document.write(`<style>body { font-family: serif; -webkit-print-color-adjust: exact; } @page { size: A4; margin: 20mm; } .page { box-shadow: none !important; margin: 0 !important; padding: 0 !important; } .page-break-after { page-break-after: always; }</style>`);
                printWindow.document.write('</head><body>');
                printWindow.document.write(content.innerHTML);
                printWindow.document.write('</body></html>');
                printWindow.document.close();
                printWindow.focus();
                setTimeout(() => { printWindow.print(); printWindow.close(); }, 500);
            }
        }
    };

    const getModalTitleAndPdfName = () => {
        if (view === 'service_report' && selectedReport) {
            return {
                title: `Service Report: ${selectedReport.device.serialNumber}`,
                fileName: `ServiceReport-${rma.id}-${selectedReport.device.serialNumber}-${selectedReport.cycle.creationDate}.pdf`
            }
        }
        if (view === 'select_report') {
            return { title: 'Select Service Report', fileName: '' }
        }
        return {
            title: `Return Authorization: ${rma.id}`,
            fileName: `ReturnAuth-${rma.id}.pdf`
        }
    }

    const { title: modalTitle, fileName: pdfFileName } = getModalTitleAndPdfName();

    const PdfDownloadButton = () => {
        if (!pdfFileName) return null;

        const document = view === 'service_report' && selectedReport
            ? <ServiceReportDocument rma={rma} device={selectedReport.device} cycle={selectedReport.cycle} />
            : <ReturnAuthorizationDocument rma={rma} />;

        return (
            <PDFDownloadLink document={document} fileName={pdfFileName}>
                {({ loading }) => (
                    <button className="inline-flex items-center gap-x-2 rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 disabled:opacity-50" disabled={loading}>
                        <DownloadIcon className="w-4 h-4 text-slate-500" />
                        {loading ? 'Loading...' : 'PDF'}
                    </button>
                )}
            </PDFDownloadLink>
        );
    };

    const renderContent = () => {
        switch (view) {
            case 'select_report':
                return <SelectReportView rma={rma} onSelect={(device, cycle) => { setSelectedReport({ device, cycle }); setView('service_report'); }} onBack={() => setView('main')} />;
            case 'service_report':
                return selectedReport ? <ServiceReportContent rma={rma} device={selectedReport.device} serviceCycle={selectedReport.cycle} /> : <p>Report not found.</p>;
            case 'main':
            default:
                return <ReturnAuthContent rma={rma} />;
        }
    }

    return (
        <div className="fixed inset-0 bg-slate-800 bg-opacity-75 flex items-center justify-center z-50 p-4 modal-enter" aria-labelledby="preview-modal-title" role="dialog" aria-modal="true">
            <div className="bg-slate-50 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col modal-content-enter">
                <header className="sticky top-0 bg-white border-b border-slate-200 px-6 py-3 flex justify-between items-center z-10 shrink-0">
                    <h2 id="preview-modal-title" className="text-lg font-semibold text-slate-800 truncate pr-4">{modalTitle}</h2>
                    <div className="flex items-center gap-2 shrink-0">
                        {view !== 'select_report' &&
                            <button onClick={handlePrint} className="inline-flex items-center gap-x-2 rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50">
                                <PrintIcon className="w-4 h-4 text-slate-500" /> Print
                            </button>
                        }
                        <PdfDownloadButton />
                        <button onClick={() => setView('select_report')} className="inline-flex items-center gap-x-2 rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50">Service Reports</button>
                        <button onClick={onClose} className="p-2 text-slate-500 hover:text-slate-800 rounded-full hover:bg-slate-100" aria-label="Close modal">
                            <XMarkIcon className="w-6 h-6" />
                        </button>
                    </div>
                </header>
                <div className="overflow-y-auto bg-slate-200 p-4 sm:p-8">
                    <div ref={previewRef}>
                        {renderContent()}
                    </div>
                </div>
            </div>
        </div>
    );
};
