import React, { useRef, useMemo } from 'react';
import { Rma, RmaStatus, Device, ServiceCycle } from '../types';
import { XMarkIcon, PrintIcon, DownloadIcon } from './icons';

interface RmaPreviewModalProps {
  rma: Rma;
  onClose: () => void;
  deviceToPreview?: Device;
}

const InfoPair = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="py-2 sm:grid sm:grid-cols-3 sm:gap-4">
      <dt className="text-sm font-medium text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm text-slate-900 sm:mt-0 sm:col-span-2">{value}</dd>
    </div>
);

const DeviceServiceDetails = ({ device, cycle }: { device: Device, cycle?: ServiceCycle }) => (
    <div className="mt-6 border-t border-slate-200 pt-6">
        <h3 className="text-lg font-semibold text-slate-800">{device.model} - <span className="font-mono text-slate-600">{device.serialNumber}</span></h3>
        {cycle ? (
            <>
              <dl className="mt-2">
                 <InfoPair label="Accessories Included" value={cycle.accessoriesIncluded || 'N/A'} />
              </dl>
              <section className="mt-4">
                  <h4 className="text-md font-semibold text-slate-800 border-b border-slate-200 pb-1 mb-2">Reported Issue</h4>
                  <div className="p-3 bg-slate-50 rounded-md whitespace-pre-wrap text-sm">{cycle.issueDescription}</div>
              </section>
              
              {cycle.resolutionNotes && (
                   <section className="mt-4">
                      <h4 className="text-md font-semibold text-slate-800 border-b border-slate-200 pb-1 mb-2">Service Notes & Resolution</h4>
                      <div className="p-3 bg-blue-50 border-l-4 border-blue-300 rounded-r-md whitespace-pre-wrap text-sm">{cycle.resolutionNotes}</div>
                  </section>
              )}
            </>
        ) : (
            <p className="mt-2 text-sm text-slate-500">No service ticket has been created for this device on this RMA yet.</p>
        )}
    </div>
);

const RmaPreviewContent: React.FC<{ rma: Rma, deviceToPreview?: Device }> = ({ rma, deviceToPreview }) => {
    
    const getStatusColor = (status: RmaStatus) => {
        switch (status) {
          case RmaStatus.PENDING: return 'border-yellow-500';
          case RmaStatus.RECEIVED: return 'border-blue-500';
          case RmaStatus.IN_REPAIR: return 'border-indigo-500';
          case RmaStatus.REPAIRED: return 'border-purple-500';
          case RmaStatus.SHIPPED: return 'border-green-500';
          case RmaStatus.CLOSED: return 'border-slate-500';
          default: return 'border-slate-300';
        }
    };
    
    const content = deviceToPreview ? (
        // Mode 1: Detailed Device Service Report
        <>
            <header className="flex justify-between items-start pb-4 border-b-2 border-slate-200">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Device Service Report</h1>
                    <p className="text-lg text-slate-600 mt-1">RMA #{rma.id}</p>
                </div>
                <div className="text-right text-xs">
                    <p className="font-semibold text-slate-900">AVANA TECHNOLOGY SERVICES PRIVATE LIMITED</p>
                    <p className="text-slate-500">91, GROUND FLOOR SUNDAR NAGAR 4TH AVENUE</p>
                    <p className="text-slate-500">Ekkaduthangal Chennai Tamil Nadu India 600032</p>
                </div>
            </header>
            {(() => {
                const latestCycle = [...rma.serviceCycles]
                    .filter(c => c.deviceSerialNumber === deviceToPreview.serialNumber)
                    .sort((a, b) => new Date(b.statusDate).getTime() - new Date(a.statusDate).getTime())[0];

                return (
                    <>
                        {latestCycle && (
                            <section className={`mt-8 p-4 border-l-4 ${getStatusColor(latestCycle.status)} bg-slate-50 rounded-r-md`}>
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-sm font-medium text-slate-600">Current Status</p>
                                        <p className="text-lg font-semibold text-slate-800">{latestCycle.status}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-slate-600">Last Updated: <span className="font-medium text-slate-800">{new Date(latestCycle.statusDate).toLocaleString()}</span></p>
                                    </div>
                                </div>
                            </section>
                        )}
                        
                        <section className="mt-8">
                            <h2 className="text-xl font-semibold text-slate-800 border-b border-slate-200 pb-2 mb-3">Customer Information</h2>
                            <dl>
                                <InfoPair label="Facility/Customer Name" value={rma.customer.name} />
                                <InfoPair label="Contact Person" value={rma.customer.contactPerson} />
                            </dl>
                        </section>
                        
                        <section className="mt-8">
                            <h2 className="text-xl font-semibold text-slate-800 border-b border-slate-200 pb-2 mb-3">Service Details</h2>
                            <DeviceServiceDetails device={deviceToPreview} cycle={latestCycle} />
                        </section>
                    </>
                );
            })()}
        </>
    ) : (
        // Mode 2: Return Authorization Form (for customer packing slip)
        <>
            <header className="flex justify-between items-start pb-4 border-b-2 border-slate-200">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Return Authorization Form</h1>
                    <p className="text-lg text-primary-600 mt-1 font-semibold">RMA #{rma.id}</p>
                </div>
                <div className="text-right text-xs">
                    <p className="font-semibold text-slate-900">Ship To: AVANA TECHNOLOGY SERVICES PRIVATE LIMITED</p>
                    <p className="text-slate-500">91, GROUND FLOOR SUNDAR NAGAR 4TH AVENUE</p>
                    <p className="text-slate-500">Ekkaduthangal Chennai Tamil Nadu India 600032</p>
                </div>
            </header>

            <section className="mt-8">
                <h2 className="text-xl font-semibold text-slate-800 border-b border-slate-200 pb-2 mb-3">Customer Information</h2>
                <dl>
                    <InfoPair label="Facility/Customer Name" value={rma.customer.name} />
                    <InfoPair label="Address" value={<div className="whitespace-pre-line">{rma.customer.address}</div>} />
                </dl>
            </section>

            <section className="mt-8">
                <h2 className="text-xl font-semibold text-slate-800 border-b border-slate-200 pb-2 mb-3">Authorized Devices for Return</h2>
                {rma.devices.map(device => {
                    const initialCycle = rma.serviceCycles
                        .filter(c => c.deviceSerialNumber === device.serialNumber)
                        .sort((a, b) => new Date(a.creationDate).getTime() - new Date(b.creationDate).getTime())[0];
                    return (
                        <div key={device.serialNumber} className="mt-6 border-t border-slate-200 pt-6">
                            <h3 className="text-lg font-semibold text-slate-800">{device.model} - <span className="font-mono text-slate-600">{device.serialNumber}</span></h3>
                            <dl className="mt-2">
                                <InfoPair label="Accessories to Include" value={initialCycle?.accessoriesIncluded || 'N/A'} />
                            </dl>
                            <section className="mt-4">
                                <h4 className="text-md font-semibold text-slate-800">Reported Issue</h4>
                                <div className="p-3 bg-slate-50 rounded-md whitespace-pre-wrap text-sm text-slate-700">{initialCycle?.issueDescription || 'Not specified.'}</div>
                            </section>
                        </div>
                    );
                })}
            </section>

            <section className="mt-10 p-4 border border-dashed border-slate-400 bg-slate-50 rounded-md">
                <h2 className="text-lg font-semibold text-slate-800">Shipping Instructions</h2>
                <ol className="list-decimal list-inside mt-2 space-y-1 text-sm text-slate-700">
                    <li>Securely pack the device(s) listed above to prevent damage during transit.</li>
                    <li>Include a printed copy of this document inside the shipment.</li>
                    <li className="font-semibold">Write the RMA number clearly on the outside of the shipping container: <span className="font-bold text-xl text-primary-600 tracking-wider">{rma.id}</span></li>
                </ol>
            </section>
        </>
    );

    return (
        <div className="p-10 bg-white text-slate-800 font-sans h-full flex flex-col">
            <div className="flex-grow">
                {content}
            </div>
            <footer className="mt-12 pt-6 border-t border-slate-200 text-center text-xs text-slate-500">
                <p>If you have any questions, please contact our support team at 1-800-555-HELP.</p>
                <p className="mt-2">&copy; {new Date().getFullYear()} Avana Medical. All rights reserved.</p>
            </footer>
        </div>
    );
};


const RmaPreviewModal: React.FC<RmaPreviewModalProps> = ({ rma, onClose, deviceToPreview }) => {
  const previewRef = useRef<HTMLDivElement>(null);
  
  const modalTitle = deviceToPreview ? `Service Report: ${deviceToPreview.serialNumber}` : `Preview: Return Authorization Form`;
  const pdfFileName = deviceToPreview ? `ServiceReport-${rma.id}-${deviceToPreview.serialNumber}.pdf` : `ReturnAuth-${rma.id}.pdf`;

  const handlePrint = () => {
    const content = previewRef.current;
    if (content) {
      const printWindow = window.open('', '', 'height=800,width=800');
      if (printWindow) {
        printWindow.document.write('<html><head><title>RMA Document</title>');
        printWindow.document.write('<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">');
        printWindow.document.write('<script src="https://cdn.tailwindcss.com"></script>');
        printWindow.document.write('<script>tailwind.config = { theme: { extend: { fontFamily: { sans: ["Inter", "sans-serif"] }, colors: { slate: { 50: "#f8fafc", 100: "#f1f5f9", 200: "#e2e8f0", 300: "#cbd5e1", 400: "#94a3b8", 500: "#64748b", 600: "#475569", 700: "#334155", 800: "#1e293b", 900: "#0f172a", }, blue: { 50: "#eff6ff", 300: "#93c5fd" }, primary: { 600: "#0d9488" } } } } }</script>');
        printWindow.document.write(`
          <style>
            @media print {
              body { margin: 0; }
              @page {
                size: A4;
                margin: 0;
              }
            }
          </style>
        `);
        printWindow.document.write('</head><body class="font-sans">');
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

  const handleExportPdf = () => {
    const content = previewRef.current;
    if (content) {
      // @ts-ignore
      const { jsPDF } = window.jspdf;
      // @ts-ignore
      html2canvas(content, { scale: 2, windowWidth: content.scrollWidth, windowHeight: content.scrollHeight }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const canvasAspectRatio = canvasWidth / canvasHeight;

        // Using the A4 page aspect ratio to determine final image dimensions
        const pageAspectRatio = pdfWidth / pdfHeight;
        
        let finalCanvasWidth, finalCanvasHeight;

        if (canvasAspectRatio > pageAspectRatio) {
            finalCanvasWidth = pdfWidth;
            finalCanvasHeight = finalCanvasWidth / canvasAspectRatio;
        } else {
            finalCanvasHeight = pdfHeight;
            finalCanvasWidth = finalCanvasHeight * canvasAspectRatio;
        }

        pdf.addImage(imgData, 'PNG', 0, 0, finalCanvasWidth, finalCanvasHeight);
        pdf.save(pdfFileName);
      });
    }
  };


  return (
    <div className="fixed inset-0 bg-slate-800 bg-opacity-75 flex items-center justify-center z-50 p-4 modal-enter" aria-labelledby="preview-modal-title" role="dialog" aria-modal="true">
      <div className="bg-slate-50 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col modal-content-enter">
        <header className="sticky top-0 bg-white border-b border-slate-200 px-6 py-3 flex justify-between items-center z-10 flex-shrink-0">
          <h2 id="preview-modal-title" className="text-lg font-semibold text-slate-800 truncate pr-4">{modalTitle}</h2>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={handlePrint} className="inline-flex items-center gap-x-2 rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50">
                <PrintIcon className="w-4 h-4 text-slate-500"/> Print
            </button>
            <button onClick={handleExportPdf} className="inline-flex items-center gap-x-2 rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50">
                <DownloadIcon className="w-4 h-4 text-slate-500"/> PDF
            </button>
            <button onClick={onClose} className="p-2 text-slate-500 hover:text-slate-800 rounded-full hover:bg-slate-100" aria-label="Close modal">
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </header>
        <div className="overflow-y-auto bg-slate-200 p-4 sm:p-8">
            <div 
              ref={previewRef}
              className="w-[210mm] min-h-[297mm] mx-auto bg-white shadow-xl"
            >
              <RmaPreviewContent rma={rma} deviceToPreview={deviceToPreview} />
            </div>
        </div>
      </div>
    </div>
  );
};

export default RmaPreviewModal;