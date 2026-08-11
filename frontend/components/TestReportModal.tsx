import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { testReportsApi, TestReport, TestEquipment, TestStep, CreateTestReportData } from '../src/api/test-reports.api';
import toast from 'react-hot-toast';

// --- Icons ---
const XMarkIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);
const PlusIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
);
const TrashIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
    </svg>
);
const DocumentArrowDownIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m.75 12 3 3m0 0 3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
    </svg>
);

interface Props {
    serviceCycleId: number;
    deviceSerialNumber: string;
    rmaId: string;
    existingReport?: TestReport | null;
    onClose: () => void;
    onSaved: (report: TestReport) => void;
}

const inputClass = 'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors';
const labelClass = 'block text-xs font-semibold text-slate-600 mb-1 uppercase tracking-wide';

const defaultSteps: TestStep[] = [
    { stepNo: 1, name: 'Visual Inspection', criterion: 'No physical damage', unit: '-', result: '', isOk: true },
    { stepNo: 2, name: 'Power On Test', criterion: 'Device powers on normally', unit: '-', result: '', isOk: true },
    { stepNo: 3, name: 'Functional Test', criterion: 'All functions operate correctly', unit: '-', result: '', isOk: true },
    { stepNo: 4, name: 'Alarm Test', criterion: 'All alarms trigger correctly', unit: '-', result: '', isOk: true },
];

const defaultEquipment: TestEquipment[] = [
    { id: '', name: '' },
];

const TestReportModal: React.FC<Props> = ({
    serviceCycleId,
    deviceSerialNumber,
    rmaId,
    existingReport,
    onClose,
    onSaved,
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [form, setForm] = useState({
        testDate: new Date().toISOString().split('T')[0],
        deviceType: '',
        mainsConnection: '',
        manufacturer: 'Avana Technology Services',
        performedBy: '',
        testerName: '',
        kindOfTest: 'Safety & Functional Test',
        overallAssessment: '',
        overallResult: 'Passed',
        copyPrintedBy: '',
        reportNo: '',
    });
    const [equipment, setEquipment] = useState<TestEquipment[]>(defaultEquipment);
    const [steps, setSteps] = useState<TestStep[]>(defaultSteps);

    useEffect(() => {
        if (existingReport) {
            setForm({
                testDate: new Date(existingReport.testDate).toISOString().split('T')[0],
                deviceType: existingReport.deviceType,
                mainsConnection: existingReport.mainsConnection,
                manufacturer: existingReport.manufacturer,
                performedBy: existingReport.performedBy,
                testerName: existingReport.testerName,
                kindOfTest: existingReport.kindOfTest,
                overallAssessment: existingReport.overallAssessment || '',
                overallResult: existingReport.overallResult,
                copyPrintedBy: existingReport.copyPrintedBy || '',
                reportNo: existingReport.reportNo || '',
            });
            setEquipment(existingReport.equipmentUsed || defaultEquipment);
            setSteps(existingReport.testSteps || defaultSteps);
        }
    }, [existingReport]);

    // --- Equipment handlers ---
    const addEquipment = () => setEquipment(prev => [...prev, { id: '', name: '' }]);
    const removeEquipment = (idx: number) => setEquipment(prev => prev.filter((_, i) => i !== idx));
    const updateEquipment = (idx: number, field: keyof TestEquipment, value: string) => {
        setEquipment(prev => prev.map((e, i) => i === idx ? { ...e, [field]: value } : e));
    };

    // --- Step handlers ---
    const addStep = () => setSteps(prev => [...prev, { stepNo: prev.length + 1, name: '', criterion: '', unit: '', result: '', isOk: true }]);
    const removeStep = (idx: number) => {
        setSteps(prev => prev.filter((_, i) => i !== idx).map((s, i) => ({ ...s, stepNo: i + 1 })));
    };
    const updateStep = (idx: number, field: keyof TestStep, value: string | boolean | number) => {
        setSteps(prev => prev.map((s, i) => i === idx ? { ...s, [field]: value } : s));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const payload: CreateTestReportData = {
                ...form,
                testDate: new Date(form.testDate).toISOString(),
                serviceCycleId,
                equipmentUsed: equipment.filter(e => e.name.trim() !== ''),
                testSteps: steps,
            };

            let report: TestReport;
            if (existingReport) {
                const res = await testReportsApi.update(existingReport.id, payload);
                report = (res as any).data;
                toast.success('Test report updated!');
            } else {
                const res = await testReportsApi.create(payload);
                report = (res as any).data;
                toast.success('Test report created!');
            }
            onSaved(report);
            onClose();
        } catch (err: any) {
            toast.error(err?.response?.data?.error || 'Failed to save test report');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[60] bg-slate-900/50 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto">
                <motion.div
                    initial={{ opacity: 0, y: -20, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.97 }}
                    transition={{ duration: 0.2 }}
                    className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl my-8 overflow-hidden"
                >
                    {/* Header */}
                    <header className="px-6 py-5 bg-gradient-to-r from-primary-600 to-primary-700 flex justify-between items-center">
                        <div>
                            <div className="flex items-center gap-2">
                                <DocumentArrowDownIcon className="w-6 h-6 text-primary-200" />
                                <h2 className="text-xl font-bold text-white">
                                    {existingReport ? 'Edit Test Report' : 'Create Test Report'}
                                </h2>
                            </div>
                            <p className="text-sm text-primary-200 mt-0.5">
                                RMA {rmaId} · Device S/N: {deviceSerialNumber}
                            </p>
                        </div>
                        <button onClick={onClose} className="p-2 rounded-full text-primary-200 hover:text-white hover:bg-primary-500 transition-colors">
                            <XMarkIcon className="w-5 h-5" />
                        </button>
                    </header>

                    <form onSubmit={handleSubmit} className="p-6 space-y-8 overflow-y-auto max-h-[80vh]">

                        {/* --- Section 1: General Info --- */}
                        <section>
                            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold">1</span>
                                Report Information
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div>
                                    <label className={labelClass}>Report No.</label>
                                    <input className={inputClass} value={form.reportNo} onChange={e => setForm({ ...form, reportNo: e.target.value })} placeholder="e.g. TR-001" />
                                </div>
                                <div>
                                    <label className={labelClass}>Test Date *</label>
                                    <input type="date" className={inputClass} required value={form.testDate} onChange={e => setForm({ ...form, testDate: e.target.value })} />
                                </div>
                                <div>
                                    <label className={labelClass}>Kind of Test *</label>
                                    <input className={inputClass} required value={form.kindOfTest} onChange={e => setForm({ ...form, kindOfTest: e.target.value })} placeholder="e.g. Safety & Functional Test" />
                                </div>
                                <div>
                                    <label className={labelClass}>Device Type *</label>
                                    <input className={inputClass} required value={form.deviceType} onChange={e => setForm({ ...form, deviceType: e.target.value })} placeholder="e.g. Infusion Pump" />
                                </div>
                                <div>
                                    <label className={labelClass}>Mains Connection *</label>
                                    <input className={inputClass} required value={form.mainsConnection} onChange={e => setForm({ ...form, mainsConnection: e.target.value })} placeholder="e.g. 220V / 50Hz" />
                                </div>
                                <div>
                                    <label className={labelClass}>Manufacturer *</label>
                                    <input className={inputClass} required value={form.manufacturer} onChange={e => setForm({ ...form, manufacturer: e.target.value })} />
                                </div>
                                <div>
                                    <label className={labelClass}>Performed By *</label>
                                    <input className={inputClass} required value={form.performedBy} onChange={e => setForm({ ...form, performedBy: e.target.value })} placeholder="Engineer name or dept." />
                                </div>
                                <div>
                                    <label className={labelClass}>Tester Name *</label>
                                    <input className={inputClass} required value={form.testerName} onChange={e => setForm({ ...form, testerName: e.target.value })} placeholder="Name of tester" />
                                </div>
                                <div>
                                    <label className={labelClass}>Copy Printed By</label>
                                    <input className={inputClass} value={form.copyPrintedBy} onChange={e => setForm({ ...form, copyPrintedBy: e.target.value })} placeholder="Name of person printing" />
                                </div>
                            </div>
                        </section>

                        <div className="border-t border-slate-100" />

                        {/* --- Section 2: Equipment Used --- */}
                        <section>
                            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold">2</span>
                                Test Equipment Used
                            </h3>
                            <div className="space-y-3">
                                {equipment.map((eq, idx) => (
                                    <div key={idx} className="flex gap-3 items-center">
                                        <div className="flex-1">
                                            <label className={labelClass}>Equipment ID / Serial No.</label>
                                            <input className={inputClass} value={eq.id} onChange={e => updateEquipment(idx, 'id', e.target.value)} placeholder="e.g. FLUKE-ESA620-001" />
                                        </div>
                                        <div className="flex-[2]">
                                            <label className={labelClass}>Equipment Name / Description</label>
                                            <input className={inputClass} value={eq.name} onChange={e => updateEquipment(idx, 'name', e.target.value)} placeholder="e.g. Electrical Safety Analyser" />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeEquipment(idx)}
                                            className="mt-5 p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={addEquipment}
                                    className="flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-800 font-medium"
                                >
                                    <PlusIcon className="w-4 h-4" /> Add Equipment
                                </button>
                            </div>
                        </section>

                        <div className="border-t border-slate-100" />

                        {/* --- Section 3: Test Steps --- */}
                        <section>
                            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold">3</span>
                                Test Steps & Results
                            </h3>
                            <div className="rounded-xl border border-slate-200 overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-50 border-b border-slate-200">
                                        <tr>
                                            <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase w-10">No.</th>
                                            <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Test Name</th>
                                            <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Criterion / Limit</th>
                                            <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase w-24">Unit</th>
                                            <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase w-32">Result</th>
                                            <th className="px-3 py-3 text-center text-xs font-semibold text-slate-500 uppercase w-16">OK?</th>
                                            <th className="px-3 py-3 w-10"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {steps.map((step, idx) => (
                                            <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-3 py-2 text-slate-500 text-center font-mono text-xs">{step.stepNo}</td>
                                                <td className="px-3 py-2">
                                                    <input
                                                        className="w-full bg-transparent focus:bg-white focus:ring-1 focus:ring-primary-400 rounded px-1 py-0.5 outline-none"
                                                        value={step.name}
                                                        onChange={e => updateStep(idx, 'name', e.target.value)}
                                                        placeholder="Test name"
                                                    />
                                                </td>
                                                <td className="px-3 py-2">
                                                    <input
                                                        className="w-full bg-transparent focus:bg-white focus:ring-1 focus:ring-primary-400 rounded px-1 py-0.5 outline-none"
                                                        value={step.criterion}
                                                        onChange={e => updateStep(idx, 'criterion', e.target.value)}
                                                        placeholder="Pass criterion"
                                                    />
                                                </td>
                                                <td className="px-3 py-2">
                                                    <input
                                                        className="w-full bg-transparent focus:bg-white focus:ring-1 focus:ring-primary-400 rounded px-1 py-0.5 outline-none"
                                                        value={step.unit}
                                                        onChange={e => updateStep(idx, 'unit', e.target.value)}
                                                        placeholder="Unit"
                                                    />
                                                </td>
                                                <td className="px-3 py-2">
                                                    <input
                                                        className="w-full bg-transparent focus:bg-white focus:ring-1 focus:ring-primary-400 rounded px-1 py-0.5 outline-none"
                                                        value={step.result}
                                                        onChange={e => updateStep(idx, 'result', e.target.value)}
                                                        placeholder="Measured value"
                                                    />
                                                </td>
                                                <td className="px-3 py-2 text-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => updateStep(idx, 'isOk', !step.isOk)}
                                                        className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-colors ${step.isOk
                                                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                            : 'bg-red-100 text-red-700 hover:bg-red-200'
                                                            }`}
                                                    >
                                                        {step.isOk ? '✓' : '✗'}
                                                    </button>
                                                </td>
                                                <td className="px-3 py-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => removeStep(idx)}
                                                        className="p-1 text-slate-300 hover:text-red-500 transition-colors"
                                                    >
                                                        <TrashIcon className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <div className="px-4 py-3 bg-slate-50 border-t border-slate-200">
                                    <button
                                        type="button"
                                        onClick={addStep}
                                        className="flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-800 font-medium"
                                    >
                                        <PlusIcon className="w-4 h-4" /> Add Test Step
                                    </button>
                                </div>
                            </div>
                        </section>

                        <div className="border-t border-slate-100" />

                        {/* --- Section 4: Assessment --- */}
                        <section>
                            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold">4</span>
                                Overall Assessment
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClass}>Overall Result *</label>
                                    <select className={inputClass} required value={form.overallResult} onChange={e => setForm({ ...form, overallResult: e.target.value })}>
                                        <option value="Passed">✓ Passed</option>
                                        <option value="Failed">✗ Failed</option>
                                        <option value="Conditional Pass">⚠ Conditional Pass</option>
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClass}>Assessment / Remarks</label>
                                    <textarea
                                        className={`${inputClass} resize-none`}
                                        rows={3}
                                        value={form.overallAssessment}
                                        onChange={e => setForm({ ...form, overallAssessment: e.target.value })}
                                        placeholder="Any additional remarks or observations..."
                                    />
                                </div>
                            </div>
                        </section>

                        {/* --- Footer / Actions --- */}
                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 sticky bottom-0 bg-white pb-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-5 py-2.5 rounded-lg text-sm font-medium text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow-sm"
                            >
                                {isLoading ? 'Saving...' : existingReport ? 'Update Report' : 'Create Report'}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default TestReportModal;
