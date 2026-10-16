import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../src/context/AuthContext';
import { deviationsApi } from '../src/api/deviations.api';
import { ValidationDeviation, ProtocolPortionType, DeviationStatusType } from '../types';
import { XMarkIcon } from './icons';
import toast from 'react-hot-toast';

interface DeviationFormModalProps {
    isOpen: boolean;
    deviationToEdit?: ValidationDeviation;
    onClose: () => void;
    onSuccess: (saved: ValidationDeviation) => void;
}

export const DeviationFormModal: React.FC<DeviationFormModalProps> = ({
    isOpen,
    deviationToEdit,
    onClose,
    onSuccess,
}) => {
    const { user } = useAuth();
    const isEdit = !!deviationToEdit;

    // Form state
    const [deviationNumber, setDeviationNumber] = useState('');
    const [documentNumber] = useState('FORM-SH001');
    const [version] = useState('1.0');
    const [effectiveDate] = useState('10-Oct-2022');
    const [protocolPortion, setProtocolPortion] = useState<ProtocolPortionType>('IQ');
    const [protocolPortionCustom, setProtocolPortionCustom] = useState('');
    const [testSection, setTestSection] = useState('');

    const [description, setDescription] = useState('');
    const [observedByName, setObservedByName] = useState('');
    const [observedBySignature, setObservedBySignature] = useState<string | null>(null);
    const [dateObserved, setDateObserved] = useState('');

    const [investigationImpact, setInvestigationImpact] = useState('');
    const [correctiveAction, setCorrectiveAction] = useState('');
    const [attachments, setAttachments] = useState<string[]>([]);
    const [isResolved, setIsResolved] = useState(false);
    const [status, setStatus] = useState<DeviationStatusType>('DRAFT');

    // Signatures
    const [completedByName, setCompletedByName] = useState('');
    const [completedBySignature, setCompletedBySignature] = useState<string | null>(null);
    const [completedDate, setCompletedDate] = useState('');

    const [validationApproverName, setValidationApproverName] = useState('');
    const [validationApproverSignature, setValidationApproverSignature] = useState<string | null>(null);
    const [validationApprovalDate, setValidationApprovalDate] = useState('');

    const [smeApproverName, setSmeApproverName] = useState('');
    const [smeApproverSignature, setSmeApproverSignature] = useState<string | null>(null);
    const [smeApprovalDate, setSmeApprovalDate] = useState('');

    const [approverName, setApproverName] = useState('');
    const [approverSignature, setApproverSignature] = useState<string | null>(null);
    const [approvalDate, setApprovalDate] = useState('');

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    // Initialize or reset form
    useEffect(() => {
        if (!isOpen) return;

        if (deviationToEdit) {
            setDeviationNumber(deviationToEdit.deviationNumber);
            setProtocolPortion(deviationToEdit.protocolPortion);
            setProtocolPortionCustom(deviationToEdit.protocolPortionCustom || '');
            setTestSection(deviationToEdit.testSection);
            setDescription(deviationToEdit.description);
            setObservedByName(deviationToEdit.observedByName);
            setObservedBySignature(deviationToEdit.observedBySignature || null);
            setDateObserved(deviationToEdit.dateObserved ? deviationToEdit.dateObserved.slice(0, 10) : '');
            setInvestigationImpact(deviationToEdit.investigationImpact || '');
            setCorrectiveAction(deviationToEdit.correctiveAction || '');
            setAttachments(deviationToEdit.attachments || []);
            setIsResolved(deviationToEdit.isResolved);
            setStatus(deviationToEdit.status);

            setCompletedByName(deviationToEdit.completedByName || '');
            setCompletedBySignature(deviationToEdit.completedBySignature || null);
            setCompletedDate(deviationToEdit.completedDate ? deviationToEdit.completedDate.slice(0, 10) : '');

            setValidationApproverName(deviationToEdit.validationApproverName || '');
            setValidationApproverSignature(deviationToEdit.validationApproverSignature || null);
            setValidationApprovalDate(deviationToEdit.validationApprovalDate ? deviationToEdit.validationApprovalDate.slice(0, 10) : '');

            setSmeApproverName(deviationToEdit.smeApproverName || '');
            setSmeApproverSignature(deviationToEdit.smeApproverSignature || null);
            setSmeApprovalDate(deviationToEdit.smeApprovalDate ? deviationToEdit.smeApprovalDate.slice(0, 10) : '');

            setApproverName(deviationToEdit.approverName || '');
            setApproverSignature(deviationToEdit.approverSignature || null);
            setApprovalDate(deviationToEdit.approvalDate ? deviationToEdit.approvalDate.slice(0, 10) : '');
        } else {
            // New deviation default setup
            deviationsApi.getNextNumber().then(nextNum => {
                setDeviationNumber(nextNum);
            }).catch(() => {
                setDeviationNumber(`DEV-${new Date().getFullYear()}-0001`);
            });

            setProtocolPortion('IQ');
            setProtocolPortionCustom('');
            setTestSection('');
            setDescription('');
            setObservedByName(user?.name || '');
            setObservedBySignature(user?.signatureUrl || null);
            setDateObserved(new Date().toISOString().slice(0, 10));
            setInvestigationImpact('');
            setCorrectiveAction('');
            setAttachments([]);
            setIsResolved(false);
            setStatus('DRAFT');

            setCompletedByName('');
            setCompletedBySignature(null);
            setCompletedDate('');
            setValidationApproverName('');
            setValidationApproverSignature(null);
            setValidationApprovalDate('');
            setSmeApproverName('');
            setSmeApproverSignature(null);
            setSmeApprovalDate('');
            setApproverName('');
            setApproverSignature(null);
            setApprovalDate('');
        }
    }, [isOpen, deviationToEdit, user]);

    // Handle File Upload
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setIsUploading(true);
        try {
            const uploadPromises = Array.from(files).map(f => deviationsApi.uploadAttachment(f));
            const uploadedUrls = await Promise.all(uploadPromises);
            setAttachments(prev => [...prev, ...uploadedUrls]);
            toast.success('File(s) attached successfully');
        } catch (error: any) {
            toast.error(error.message || 'Failed to upload attachment');
        } finally {
            setIsUploading(false);
            e.target.value = '';
        }
    };

    const removeAttachment = (index: number) => {
        setAttachments(prev => prev.filter((_, idx) => idx !== index));
    };

    // Quick Sign helper using current user signature
    const handleQuickSign = (role: 'OBSERVER' | 'COMPLETED' | 'VALIDATION' | 'SME' | 'APPROVAL') => {
        if (!user?.name) {
            toast.error('User information not available');
            return;
        }
        if (!user.signatureUrl) {
            toast.error('No saved signature found on your user profile. Please upload one under Profile Settings.');
            return;
        }

        const today = new Date().toISOString().slice(0, 10);

        switch (role) {
            case 'OBSERVER':
                setObservedByName(user.name);
                setObservedBySignature(user.signatureUrl);
                setDateObserved(today);
                break;
            case 'COMPLETED':
                setCompletedByName(user.name);
                setCompletedBySignature(user.signatureUrl);
                setCompletedDate(today);
                break;
            case 'VALIDATION':
                setValidationApproverName(user.name);
                setValidationApproverSignature(user.signatureUrl);
                setValidationApprovalDate(today);
                break;
            case 'SME':
                setSmeApproverName(user.name);
                setSmeApproverSignature(user.signatureUrl);
                setSmeApprovalDate(today);
                break;
            case 'APPROVAL':
                setApproverName(user.name);
                setApproverSignature(user.signatureUrl);
                setApprovalDate(today);
                setStatus('APPROVED');
                break;
        }
        toast.success(`Signed as ${user.name}`);
    };

    // Save/Submit Form
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!deviationNumber.trim()) {
            toast.error('Deviation Number is required');
            return;
        }
        if (!testSection.trim()) {
            toast.error('Test Section is required');
            return;
        }
        if (!description.trim()) {
            toast.error('Deviation Description is required');
            return;
        }
        if (!observedByName.trim()) {
            toast.error('Observed By name is required');
            return;
        }

        setIsSubmitting(true);
        try {
            const payload: any = {
                deviationNumber: deviationNumber.trim(),
                documentNumber,
                version,
                effectiveDate,
                protocolPortion,
                protocolPortionCustom: protocolPortion === 'OTHER' ? protocolPortionCustom : undefined,
                testSection: testSection.trim(),
                description: description.trim(),
                observedByName: observedByName.trim(),
                observedBySignature,
                dateObserved: dateObserved || new Date().toISOString(),
                investigationImpact: investigationImpact.trim(),
                correctiveAction: correctiveAction.trim(),
                attachments,
                isResolved,
                status,

                completedByName: completedByName.trim() || undefined,
                completedBySignature: completedBySignature || undefined,
                completedDate: completedDate || undefined,

                validationApproverName: validationApproverName.trim() || undefined,
                validationApproverSignature: validationApproverSignature || undefined,
                validationApprovalDate: validationApprovalDate || undefined,

                smeApproverName: smeApproverName.trim() || undefined,
                smeApproverSignature: smeApproverSignature || undefined,
                smeApprovalDate: smeApprovalDate || undefined,

                approverName: approverName.trim() || undefined,
                approverSignature: approverSignature || undefined,
                approvalDate: approvalDate || undefined,
            };

            let res;
            if (isEdit) {
                res = await deviationsApi.update(deviationToEdit.id, payload);
                toast.success('Deviation updated successfully');
            } else {
                res = await deviationsApi.create(payload);
                toast.success('Deviation created successfully');
            }

            onSuccess(res.data);
            onClose();
        } catch (error: any) {
            toast.error(error.message || 'Failed to save deviation');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 15 }}
                    className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200"
                >
                    {/* Header Banner */}
                    <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-primary-950 to-slate-900 text-white flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <img src="/avana-logo.png" alt="Avana" className="h-7 w-auto object-contain bg-white/10 rounded px-1.5 py-0.5" />
                            <div>
                                <h2 className="text-base font-bold flex items-center gap-2">
                                    Validation Deviation Form
                                    <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-primary-500/20 text-primary-200 border border-primary-400/30">
                                        FORM-SH001 (v1.0)
                                    </span>
                                </h2>
                                <p className="text-xs text-slate-300">
                                    {isEdit ? `Editing ${deviationToEdit.deviationNumber}` : 'Record a new protocol deviation and corrective action'}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
                        >
                            <XMarkIcon className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Scrollable Form Body */}
                    <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                        {/* Section: Header / Tracking */}
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                    Deviation Number *
                                </label>
                                <input
                                    type="text"
                                    value={deviationNumber}
                                    onChange={e => setDeviationNumber(e.target.value)}
                                    placeholder="e.g. DEV-2026-0001"
                                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary-500 font-mono font-bold"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                    Protocol Portion (IQ, OQ, PQ) *
                                </label>
                                <select
                                    value={protocolPortion}
                                    onChange={e => setProtocolPortion(e.target.value as ProtocolPortionType)}
                                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary-500 font-semibold"
                                >
                                    <option value="IQ">IQ (Installation Qualification)</option>
                                    <option value="OQ">OQ (Operational Qualification)</option>
                                    <option value="PQ">PQ (Performance Qualification)</option>
                                    <option value="OTHER">Other / Custom</option>
                                </select>
                                {protocolPortion === 'OTHER' && (
                                    <input
                                        type="text"
                                        placeholder="Specify portion..."
                                        value={protocolPortionCustom}
                                        onChange={e => setProtocolPortionCustom(e.target.value)}
                                        className="mt-2 w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                                        required
                                    />
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                    Test Section *
                                </label>
                                <input
                                    type="text"
                                    value={testSection}
                                    onChange={e => setTestSection(e.target.value)}
                                    placeholder="e.g. Section 4.2 Leak Test"
                                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary-500"
                                    required
                                />
                            </div>
                        </div>

                        {/* Section 1: Describe the Deviation */}
                        <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                            <div className="bg-slate-100/90 px-4 py-2 border-b border-slate-200">
                                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                                    1. Describe the Deviation
                                </h3>
                                <p className="text-[11px] text-slate-500 italic">
                                    Describe in detail the deviation. Be specific, including references to the protocol section, the difference between expected and actual results, etc.
                                </p>
                            </div>
                            <div className="p-4 space-y-4">
                                <textarea
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    rows={4}
                                    placeholder="Enter full deviation description..."
                                    className="w-full p-3 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 resize-y"
                                    required
                                />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                                            Observed By (Print/Sign) *
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="text"
                                                value={observedByName}
                                                onChange={e => setObservedByName(e.target.value)}
                                                placeholder="Observer Full Name"
                                                className="flex-1 px-3 py-1.5 text-sm border border-slate-300 rounded-lg"
                                                required
                                            />
                                            {observedBySignature ? (
                                                <div className="relative group">
                                                    <img src={observedBySignature} alt="Sign" className="h-8 max-w-[90px] object-contain border border-slate-200 rounded bg-slate-50 px-1" />
                                                    <button
                                                        type="button"
                                                        onClick={() => setObservedBySignature(null)}
                                                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 text-[10px]"
                                                        title="Remove Signature"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() => handleQuickSign('OBSERVER')}
                                                    className="px-2.5 py-1.5 text-xs font-medium text-primary-700 bg-primary-50 rounded-lg hover:bg-primary-100 border border-primary-200 whitespace-nowrap"
                                                >
                                                    Sign
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                                            Date Observed *
                                        </label>
                                        <input
                                            type="date"
                                            value={dateObserved}
                                            onChange={e => setDateObserved(e.target.value)}
                                            className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Investigation and impact */}
                        <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                            <div className="bg-slate-100/90 px-4 py-2 border-b border-slate-200">
                                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                                    2. Investigation and impact
                                </h3>
                                <p className="text-[11px] text-slate-500 italic">
                                    Give an explanation of how and why the deviation occurred and describe what impact, if any, the deviation has on the validity of the protocol. Reference additional evidence as needed.
                                </p>
                            </div>
                            <div className="p-4">
                                <textarea
                                    value={investigationImpact}
                                    onChange={e => setInvestigationImpact(e.target.value)}
                                    rows={4}
                                    placeholder="Enter root cause analysis, investigation details, and impact evaluation..."
                                    className="w-full p-3 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 resize-y"
                                />
                            </div>
                        </div>

                        {/* Section 3: Correction / Corrective Action / Resolution */}
                        <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                            <div className="bg-slate-100/90 px-4 py-2 border-b border-slate-200">
                                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                                    3. Correction / Corrective Action / Resolution
                                </h3>
                                <p className="text-[11px] text-slate-500 italic">
                                    State all specific actions to address the deviation and its associated risks, e.g. Protocol document clarification, test re-execution, additional testing, etc. Include reference to any initiated NCR/Deviation/CAPA and whether an update to a risk management file is needed. If no further action is required, provide justification. Attach any supporting data as necessary.
                                </p>
                            </div>
                            <div className="p-4 space-y-4">
                                <textarea
                                    value={correctiveAction}
                                    onChange={e => setCorrectiveAction(e.target.value)}
                                    rows={4}
                                    placeholder="Enter corrective action, remediation steps, CAPA reference..."
                                    className="w-full p-3 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 resize-y"
                                />

                                {/* Attachments */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="text-xs font-semibold text-slate-700">
                                            Supporting Attachments & Data Files (Optional)
                                        </label>
                                        <label className="cursor-pointer text-xs font-medium text-primary-600 hover:text-primary-800 bg-primary-50 px-2.5 py-1 rounded border border-primary-200">
                                            {isUploading ? 'Uploading...' : '+ Attach File'}
                                            <input
                                                type="file"
                                                multiple
                                                onChange={handleFileUpload}
                                                disabled={isUploading}
                                                className="hidden"
                                            />
                                        </label>
                                    </div>
                                    {attachments.length > 0 ? (
                                        <div className="flex flex-wrap gap-2">
                                            {attachments.map((att, idx) => (
                                                <div key={idx} className="flex items-center gap-1.5 px-2.5 py-1 text-xs bg-slate-100 text-slate-700 rounded-lg border border-slate-200">
                                                    <span className="truncate max-w-[200px]">{att.split('/').pop()}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeAttachment(idx)}
                                                        className="text-slate-400 hover:text-red-500"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-xs text-slate-400 italic">No files attached</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Section 4: Verification & Approvals */}
                        <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                            <div className="bg-slate-100/90 px-4 py-2 border-b border-slate-200 flex items-center justify-between">
                                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                                    4. Verification & Approvals
                                </h3>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-slate-600 font-medium">Status:</span>
                                    <select
                                        value={status}
                                        onChange={e => setStatus(e.target.value as DeviationStatusType)}
                                        className="text-xs font-semibold px-2.5 py-1 border border-slate-300 rounded bg-white"
                                    >
                                        <option value="DRAFT">Draft</option>
                                        <option value="UNDER_INVESTIGATION">Under Investigation</option>
                                        <option value="PENDING_APPROVAL">Pending Approval</option>
                                        <option value="APPROVED">Approved</option>
                                        <option value="CLOSED">Closed</option>
                                    </select>
                                </div>
                            </div>

                            <div className="p-4 space-y-4">
                                {/* Resolution Checkbox */}
                                <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-lg flex items-center justify-between">
                                    <span className="text-xs font-bold text-amber-950">
                                        All actions were satisfactorily resolved. Deviation Closed?
                                    </span>
                                    <div className="flex items-center gap-4">
                                        <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="isResolvedRadio"
                                                checked={isResolved}
                                                onChange={() => {
                                                    setIsResolved(true);
                                                    setStatus('CLOSED');
                                                }}
                                                className="text-primary-600 focus:ring-primary-500"
                                            />
                                            Yes
                                        </label>
                                        <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="isResolvedRadio"
                                                checked={!isResolved}
                                                onChange={() => setIsResolved(false)}
                                                className="text-primary-600 focus:ring-primary-500"
                                            />
                                            No
                                        </label>
                                    </div>
                                </div>

                                {/* 4 Signature Blocks */}
                                <div className="space-y-3 pt-2">
                                    {/* 1. Completed By */}
                                    <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-3">
                                        <div className="flex-1">
                                            <p className="text-xs font-bold text-slate-800">Completed By (Print/Sign):</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <input
                                                    type="text"
                                                    value={completedByName}
                                                    onChange={e => setCompletedByName(e.target.value)}
                                                    placeholder="Completed By Full Name"
                                                    className="px-2.5 py-1 text-xs border border-slate-300 rounded bg-white"
                                                />
                                                {completedBySignature ? (
                                                    <img src={completedBySignature} alt="Sign" className="h-6 max-w-[80px] object-contain border rounded px-1 bg-white" />
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleQuickSign('COMPLETED')}
                                                        className="px-2 py-1 text-xs text-primary-700 bg-primary-100 rounded hover:bg-primary-200"
                                                    >
                                                        Sign
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-[11px] font-semibold text-slate-600 block mb-0.5">Date:</label>
                                            <input
                                                type="date"
                                                value={completedDate}
                                                onChange={e => setCompletedDate(e.target.value)}
                                                className="px-2 py-1 text-xs border border-slate-300 rounded bg-white"
                                            />
                                        </div>
                                    </div>

                                    {/* 2. Validation or Designee Approval */}
                                    <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-3">
                                        <div className="flex-1">
                                            <p className="text-xs font-bold text-slate-800">Validation or Designee Approval (Print, Sign):</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <input
                                                    type="text"
                                                    value={validationApproverName}
                                                    onChange={e => setValidationApproverName(e.target.value)}
                                                    placeholder="Validation Lead Full Name"
                                                    className="px-2.5 py-1 text-xs border border-slate-300 rounded bg-white"
                                                />
                                                {validationApproverSignature ? (
                                                    <img src={validationApproverSignature} alt="Sign" className="h-6 max-w-[80px] object-contain border rounded px-1 bg-white" />
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleQuickSign('VALIDATION')}
                                                        className="px-2 py-1 text-xs text-primary-700 bg-primary-100 rounded hover:bg-primary-200"
                                                    >
                                                        Sign
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-[11px] font-semibold text-slate-600 block mb-0.5">Date:</label>
                                            <input
                                                type="date"
                                                value={validationApprovalDate}
                                                onChange={e => setValidationApprovalDate(e.target.value)}
                                                className="px-2 py-1 text-xs border border-slate-300 rounded bg-white"
                                            />
                                        </div>
                                    </div>

                                    {/* 3. Process Owner or SME Approval */}
                                    <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-3">
                                        <div className="flex-1">
                                            <p className="text-xs font-bold text-slate-800">Process Owner or SME Approval (Print, Sign):</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <input
                                                    type="text"
                                                    value={smeApproverName}
                                                    onChange={e => setSmeApproverName(e.target.value)}
                                                    placeholder="Process Owner / SME Full Name"
                                                    className="px-2.5 py-1 text-xs border border-slate-300 rounded bg-white"
                                                />
                                                {smeApproverSignature ? (
                                                    <img src={smeApproverSignature} alt="Sign" className="h-6 max-w-[80px] object-contain border rounded px-1 bg-white" />
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleQuickSign('SME')}
                                                        className="px-2 py-1 text-xs text-primary-700 bg-primary-100 rounded hover:bg-primary-200"
                                                    >
                                                        Sign
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-[11px] font-semibold text-slate-600 block mb-0.5">Date:</label>
                                            <input
                                                type="date"
                                                value={smeApprovalDate}
                                                onChange={e => setSmeApprovalDate(e.target.value)}
                                                className="px-2 py-1 text-xs border border-slate-300 rounded bg-white"
                                            />
                                        </div>
                                    </div>

                                    {/* 4. Approval (Print/Sign) */}
                                    <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-3">
                                        <div className="flex-1">
                                            <p className="text-xs font-bold text-slate-800">Approval (Print/Sign):</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <input
                                                    type="text"
                                                    value={approverName}
                                                    onChange={e => setApproverName(e.target.value)}
                                                    placeholder="Approver Full Name"
                                                    className="px-2.5 py-1 text-xs border border-slate-300 rounded bg-white"
                                                />
                                                {approverSignature ? (
                                                    <img src={approverSignature} alt="Sign" className="h-6 max-w-[80px] object-contain border rounded px-1 bg-white" />
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleQuickSign('APPROVAL')}
                                                        className="px-2 py-1 text-xs text-primary-700 bg-primary-100 rounded hover:bg-primary-200"
                                                    >
                                                        Sign
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-[11px] font-semibold text-slate-600 block mb-0.5">Date:</label>
                                            <input
                                                type="date"
                                                value={approvalDate}
                                                onChange={e => setApprovalDate(e.target.value)}
                                                className="px-2 py-1 text-xs border border-slate-300 rounded bg-white"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer Actions */}
                        <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3 sticky bottom-0 bg-white">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-300 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting || isUploading}
                                className="px-5 py-2 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg shadow-sm focus:ring-2 focus:ring-primary-500 disabled:opacity-50 transition-all flex items-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Saving...
                                    </>
                                ) : isEdit ? 'Update Deviation' : 'Create Deviation'}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default DeviationFormModal;
