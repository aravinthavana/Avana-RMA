import React, { useRef } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { Rma, RmaStatus, Device } from '../types';
import { XMarkIcon, PrintIcon, DownloadIcon } from './icons';
import RmaPdfDocument from './RmaPdfDocument';

interface RmaPreviewModalProps {
  rma: Rma;
  onClose: () => void;
  deviceToPreview?: Device;
}

// NOTE: The visual preview part of this component remains unchanged.
// We are only changing the PDF export functionality.

const Page = React.forwardRef<HTMLDivElement, { children: React.ReactNode, isLastPage?: boolean }>(({ children, isLastPage }, ref) => (
    <div
        ref={ref}
        className="page w-[210mm] min-h-[297mm] bg-white shadow-xl mx-auto my-4 p-8 font-serif text-black flex flex-col"
        style={!isLastPage ? { pageBreakAfter: 'always' } : {}}
    >
        {children}
    </div>
));

const RmaFormHeader = ({ rma, pageNumber, totalPages }: { rma: Rma, pageNumber: number, totalPages: number }) => (
    <header className="flex justify-between items-start pb-4 mb-4 border-b-4 border-black">
        <div>
            <h1 className="text-3xl font-bold text-black">Return Authorization Form</h1>
            <p className="text-xl text-black mt-1">RMA #<span className="font-bold">{rma.id}</span></p>
        </div>
        <div className="text-right">
            <div className="text-xs text-gray-600">
                <p className="font-bold text-black">Recipient: AVANA TECHNOLOGY SERVICES</p>
                <p>91, GROUND FLOOR SUNDAR NAGAR 4TH AVENUE</p>
                <p>Ekkaduthangal, Chennai, Tamil Nadu, 600032</p>
            </div>
            {totalPages > 1 && (
                <p className="text-sm text-black mt-4 font-bold">Page {pageNumber} of {totalPages}</p>
            )}
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
                    <td className="py-2 text-black">{value}</td>
                </tr>
            ))}
        </tbody>
    </table>
);

const DeviceTable = ({ devices, rma }: { devices: Device[], rma: Rma }) => (
    <table className="w-full text-sm border-collapse border border-gray-300">
        <thead className="bg-gray-100 text-black">
            <tr>
                <th className="border p-2 text-left">Device Model</th>
                <th className="border p-2 text-left">Part No.</th>
                <th className="border p-2 text-left">Serial / Lot No.</th>
                <th className="border p-2 text-left">Qty</th>
                <th className="border p-2 text-left">Failure Description</th>
            </tr>
        </thead>
        <tbody>
            {devices.map(device => {
                const initialCycle = rma.serviceCycles.find(c => c.deviceSerialNumber === device.serialNumber);
                return (
                    <tr key={device.serialNumber} className="border-b">
                        <td className="border p-2">{device.model}</td>
                        <td className="border p-2">{device.partNumber}</td>
                        <td className="border p-2 font-mono">{device.serialNumber}</td>
                        <td className="border p-2">{device.quantity}</td>
                        <td className="border p-2 text-xs">{initialCycle?.issueDescription || 'N/A'}</td>
                    </tr>
                );
            })}
        </tbody>
    </table>
);

const RmaPreviewContent: React.FC<{ rma: Rma, deviceToPreview?: Device }> = ({ rma, deviceToPreview }) => {
    if (deviceToPreview) {
        const closedCycle = [...rma.serviceCycles]
            .filter(c => c.deviceSerialNumber === deviceToPreview.serialNumber && c.status === RmaStatus.CLOSED)
            .sort((a, b) => new Date(b.statusDate).getTime() - new Date(a.statusDate).getTime())[0];
        
        return (
            <Page>
                <header className="flex justify-between items-start pb-4 mb-8 border-b-4 border-black">
                    <div>
                        <h1 className="text-3xl font-bold text-black">Device Service Report</h1>
                        <p className="text-lg text-gray-700 mt-1">RMA #{rma.id}</p>
                    </div>
                    <div className="text-right text-xs text-gray-600">
                        <p className="font-bold text-black">AVANA TECHNOLOGY SERVICES</p>
                        <p>91, GROUND FLOOR SUNDAR NAGAR 4TH AVENUE</p>
                        <p>Ekkaduthangal, Chennai, Tamil Nadu, 600032</p>
                    </div>
                </header>
                <Section title="Recipient">
                    <InfoTable data={[
                        { label: "Facility/Customer Name", value: rma.customer.name },
                        { label: "Contact Person", value: rma.customer.contactPerson },
                    ]} />
                </Section>
                <Section title="Service Details">
                    <h3 className="text-base font-bold text-black mt-4">{deviceToPreview.model}</h3>
                    <p className="text-sm text-gray-600 mb-2">S/N: {deviceToPreview.serialNumber}</p>
                    {closedCycle ? (
                        <>
                            <InfoTable data={[
                                { label: "Part Number", value: deviceToPreview.partNumber || 'N/A' },
                                { label: "Quantity", value: deviceToPreview.quantity },
                                { label: "Accessories Included", value: closedCycle.accessoriesIncluded || 'N/A' },
                            ]} />
                            <div className="mt-4">
                                <h4 className="font-bold text-black">Failure Description/Details</h4>
                                <p className="text-sm text-black mt-1 p-2 border border-gray-200 bg-gray-50 rounded-sm">{closedCycle.issueDescription}</p>
                            </div>
                            {closedCycle.resolutionNotes && (
                                <div className="mt-4">
                                    <h4 className="font-bold text-black">Service Notes & Resolution</h4>
                                    <div className="text-sm text-black mt-1 p-2 border border-gray-300 bg-gray-100 rounded-sm whitespace-pre-wrap">{closedCycle.resolutionNotes}</div>
                                </div>
                            )}
                        </>
                    ) : <p className="text-sm text-gray-500">No closed service ticket for this device.</p>}
                </Section>
                <RmaFormFooter />
            </Page>
        );
    }

    const MAX_DEVICES_FIRST_PAGE = 8;
    const MAX_DEVICES_SUBSEQUENT_PAGE = 15;

    const deviceChunks: Device[][] = [];
    if (rma.devices.length > MAX_DEVICES_FIRST_PAGE) {
        deviceChunks.push(rma.devices.slice(0, MAX_DEVICES_FIRST_PAGE));
        let remaining = rma.devices.slice(MAX_DEVICES_FIRST_PAGE);
        while (remaining.length > 0) {
            deviceChunks.push(remaining.slice(0, MAX_DEVICES_SUBSEQUENT_PAGE));
            remaining = remaining.slice(MAX_DEVICES_SUBSEQUENT_PAGE);
        }
    } else {
        deviceChunks.push(rma.devices);
    }
    const totalPages = deviceChunks.length;

    return (
        <>
            {deviceChunks.map((chunk, pageIndex) => (
                <Page key={pageIndex} isLastPage={pageIndex === totalPages - 1}>
                    <RmaFormHeader rma={rma} pageNumber={pageIndex + 1} totalPages={totalPages} />
                    
                    {pageIndex === 0 && (
                        <Section title="Customer Information">
                            <InfoTable data={[
                                { label: "Facility/Customer Name", value: rma.customer.name },
                                { label: "Address", value: <div className="whitespace-pre-line">{rma.customer.address}</div> },
                                { label: "Date of Incident", value: new Date(rma.dateOfIncident).toLocaleDateString() },
                                { label: "Date of Report", value: new Date(rma.dateOfReport).toLocaleDateString() },
                                { label: "Attachment Proof", value: rma.attachment ? "Proof Attached" : 'N/A' },
                            ]} />
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
                                    <li className="font-bold">Write the RMA number clearly on the outside of the container: <span className="text-2xl font-bold tracking-wider">{rma.id}</span></li>
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

const RmaPreviewModal: React.FC<RmaPreviewModalProps> = ({ rma, onClose, deviceToPreview }) => {
  const previewRef = useRef<HTMLDivElement>(null);
  
  const modalTitle = deviceToPreview ? `Service Report: ${deviceToPreview.serialNumber}` : `Preview: Return Authorization Form`;
  const pdfFileName = (deviceToPreview ? `ServiceReport-${rma.id}-${deviceToPreview.serialNumber}` : `ReturnAuth-${rma.id}`) + '.pdf';

  const handlePrint = () => {
    const content = previewRef.current;
    if (content) {
      const printWindow = window.open('', '', 'height=800,width=800');
      if (printWindow) {
        printWindow.document.write('<html><head><title>RMA Document</title>');
        // It is important to include Tailwind for the print view
        printWindow.document.write('<script src="https://cdn.tailwindcss.com"></script>');
        printWindow.document.write(`
          <style>
            body { font-family: serif; -webkit-print-color-adjust: exact; }
            @page { size: A4; margin: 20mm; }
            @media print {
              .page {
                min-height: 0 !important;
                height: auto !important;
                box-shadow: none !important;
                margin: 0 !important;
                padding: 0 !important;
                page-break-after: always;
              }
              .page:last-child {
                page-break-after: auto;
              }
            }
          </style>
        `);
        printWindow.document.write('</head><body>');
        printWindow.document.write(content.innerHTML);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 500);
      }
    }
  };

  const PdfDownloadButton = () => (
    <PDFDownloadLink
      document={<RmaPdfDocument rma={rma} deviceToPreview={deviceToPreview} />}
      fileName={pdfFileName}
    >
      {({ loading }) => (
        <button
          className="inline-flex items-center gap-x-2 rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 disabled:opacity-50"
          disabled={loading}
        >
          <DownloadIcon className="w-4 h-4 text-slate-500"/>
          {loading ? 'Loading...' : 'PDF'}
        </button>
      )}
    </PDFDownloadLink>
  );

  return (
    <div className="fixed inset-0 bg-slate-800 bg-opacity-75 flex items-center justify-center z-50 p-4 modal-enter" aria-labelledby="preview-modal-title" role="dialog" aria-modal="true">
      <div className="bg-slate-50 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col modal-content-enter">
        <header className="sticky top-0 bg-white border-b border-slate-200 px-6 py-3 flex justify-between items-center z-10 flex-shrink-0">
          <h2 id="preview-modal-title" className="text-lg font-semibold text-slate-800 truncate pr-4">{modalTitle}</h2>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={handlePrint} className="inline-flex items-center gap-x-2 rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50">
                <PrintIcon className="w-4 h-4 text-slate-500"/> Print
            </button>
            <PdfDownloadButton />
            <button onClick={onClose} className="p-2 text-slate-500 hover:text-slate-800 rounded-full hover:bg-slate-100" aria-label="Close modal">
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </header>
        <div className="overflow-y-auto bg-slate-200 p-4 sm:p-8">
            <div ref={previewRef}>
              <RmaPreviewContent rma={rma} deviceToPreview={deviceToPreview} />
            </div>
        </div>
      </div>
    </div>
  );
};

export default RmaPreviewModal;
