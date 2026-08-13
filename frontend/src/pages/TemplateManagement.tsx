import React, { useState, useEffect } from 'react';
import { useAuth } from '../../src/context/AuthContext';
import { apiClient } from '../../src/api/client';
import toast from 'react-hot-toast';

const PlusIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
);


const PencilIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
    </svg>
);

const TrashIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
    </svg>
);

export default function TemplateManagement() {
    const { user } = useAuth();
    
    // Check if user is admin (assumes isAdmin is available or role is ADMIN)
    const isAdmin = user?.isAdmin || user?.role === 'ADMIN';

    const [activeTab, setActiveTab] = useState<'articles' | 'steps' | 'equipment'>('articles');
    
    // Data states
    const [articles, setArticles] = useState<any[]>([]);
    const [equipment, setEquipment] = useState<any[]>([]);
    const [steps, setSteps] = useState<any[]>([]);
    const [selectedArticleNo, setSelectedArticleNo] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);

    // Form states
    const [newArticle, setNewArticle] = useState({ articleNo: '', name: '' });
    const [newEquipment, setNewEquipment] = useState({ equipmentId: '', name: '' });
    const [newStep, setNewStep] = useState({ name: '', criterion: '' });
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editData, setEditData] = useState<any>({});

    useEffect(() => {
        if (!isAdmin) return;
        fetchArticles();
        fetchEquipment();
    }, [isAdmin]);

    useEffect(() => {
        if (selectedArticleNo) {
            fetchSteps(selectedArticleNo);
        } else {
            setSteps([]);
        }
    }, [selectedArticleNo]);

    const fetchArticles = async () => {
        try {
            const res = await apiClient.get('/api/articles');
            setArticles(res.data || []);
        } catch (error) {
            toast.error('Failed to fetch articles');
        }
    };

    const fetchEquipment = async () => {
        try {
            const res = await apiClient.get('/api/templates/equipment');
            setEquipment(res.data || []);
        } catch (error) {
            toast.error('Failed to fetch equipment');
        }
    };

    const fetchSteps = async (articleNo: string) => {
        try {
            const res = await apiClient.get(`/api/templates/test-steps/${articleNo}`);
            setSteps(res.data || []);
        } catch (error) {
            toast.error('Failed to fetch test steps');
        }
    };

    // Handlers

    const handleEditStart = (item: any) => {
        setEditingId(item.id);
        setEditData({ ...item });
    };

    const handleEditSave = async (type: 'article' | 'equipment' | 'step') => {
        try {
            setIsLoading(true);
            if (type === 'article') {
                await apiClient.put(`/api/articles/${editingId}`, editData);
                toast.success('Updated Article');
                fetchArticles();
            } else if (type === 'equipment') {
                await apiClient.put(`/api/templates/equipment/${editingId}`, editData);
                toast.success('Updated Equipment');
                fetchEquipment();
            } else if (type === 'step') {
                await apiClient.put(`/api/templates/test-steps/${editingId}`, editData);
                toast.success('Updated Step');
                fetchSteps(selectedArticleNo);
            }
            setEditingId(null);
        } catch (err) {
            toast.error('Failed to update');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddArticle = async () => {
        if (!newArticle.articleNo) return toast.error('Article No is required');
        try {
            setIsLoading(true);
            await apiClient.post('/api/articles', newArticle);
            toast.success('Added Article');
            setNewArticle({ articleNo: '', name: '' });
            fetchArticles();
        } catch (err) {
            toast.error('Failed to add article');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteArticle = async (id: string) => {
        if (!confirm('Are you sure?')) return;
        try {
            await apiClient.delete(`/api/articles/${id}`);
            toast.success('Deleted');
            fetchArticles();
        } catch (err) {
            toast.error('Failed to delete');
        }
    };

    const handleAddEquipment = async () => {
        if (!newEquipment.equipmentId || !newEquipment.name) return toast.error('ID and Name required');
        try {
            setIsLoading(true);
            await apiClient.post('/api/templates/equipment', newEquipment);
            toast.success('Added Equipment');
            setNewEquipment({ equipmentId: '', name: '' });
            fetchEquipment();
        } catch (err) {
            toast.error('Failed to add equipment');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteEquipment = async (id: string) => {
        if (!confirm('Are you sure?')) return;
        try {
            await apiClient.delete(`/api/templates/equipment/${id}`);
            toast.success('Deleted');
            fetchEquipment();
        } catch (err) {
            toast.error('Failed to delete');
        }
    };

    const handleAddStep = async () => {
        if (!selectedArticleNo) return toast.error('Select an article first');
        if (!newStep.name) return toast.error('Step name required');
        try {
            setIsLoading(true);
            const stepNo = steps.length + 1;
            await apiClient.post('/api/templates/test-steps', { ...newStep, stepNo, articleNo: selectedArticleNo });
            toast.success('Added Step');
            setNewStep({ name: '', criterion: '' });
            fetchSteps(selectedArticleNo);
        } catch (err) {
            toast.error('Failed to add step');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteStep = async (id: string) => {
        if (!confirm('Are you sure?')) return;
        try {
            await apiClient.delete(`/api/templates/test-steps/${id}`);
            toast.success('Deleted');
            fetchSteps(selectedArticleNo);
        } catch (err) {
            toast.error('Failed to delete');
        }
    };

    if (!isAdmin) {
        return (
            <div className="p-8 text-center bg-white rounded-xl shadow-sm border border-slate-200">
                <h2 className="text-xl font-bold text-slate-800 mb-2">Access Denied</h2>
                <p className="text-slate-500">You must be an administrator to view this page.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-6xl mx-auto pb-12">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Master Data Management</h1>
                    <p className="text-slate-500 mt-1">Manage articles, test steps, and equipment templates.</p>
                </div>
            </div>

            <div className="flex border-b border-slate-200 gap-6">
                <button 
                    onClick={() => setActiveTab('articles')}
                    className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'articles' ? 'border-primary-500 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                    Articles (AR No)
                </button>
                <button 
                    onClick={() => setActiveTab('steps')}
                    className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'steps' ? 'border-primary-500 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                    Test Steps
                </button>
                <button 
                    onClick={() => setActiveTab('equipment')}
                    className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'equipment' ? 'border-primary-500 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                    Test Equipment
                </button>
            </div>

            {/* ARTICLES TAB */}
            {activeTab === 'articles' && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-5 border-b border-slate-200 bg-slate-50 flex gap-4">
                        <input className="flex-1 rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" placeholder="AR Number (e.g. AR-8330F)" value={newArticle.articleNo} onChange={e => setNewArticle({...newArticle, articleNo: e.target.value})} />
                        <input className="flex-[2] rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" placeholder="Name (e.g. Shaver Handpiece)" value={newArticle.name} onChange={e => setNewArticle({...newArticle, name: e.target.value})} />
                        <button onClick={handleAddArticle} disabled={isLoading} className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700">Add Article</button>
                    </div>
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">AR Number</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-right"></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {articles.map(a => (
                                <tr key={a.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                                        {editingId === a.id ? <input className="rounded-md border-slate-300 w-full" value={editData.articleNo} onChange={e => setEditData({...editData, articleNo: e.target.value})} /> : a.articleNo}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                        {editingId === a.id ? <input className="rounded-md border-slate-300 w-full" value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})} /> : a.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        {editingId === a.id ? (
                                            <div className="flex gap-2 justify-end">
                                                <button onClick={() => handleEditSave('article')} className="text-green-600 hover:text-green-900 text-xs">Save</button>
                                                <button onClick={() => setEditingId(null)} className="text-slate-500 hover:text-slate-700 text-xs">Cancel</button>
                                            </div>
                                        ) : (
                                            <div className="flex gap-2 justify-end">
                                                <button onClick={() => handleEditStart(a)} className="text-slate-400 hover:text-primary-600"><PencilIcon className="w-5 h-5"/></button>
                                                <button onClick={() => handleDeleteArticle(a.id)} className="text-red-600 hover:text-red-900"><TrashIcon className="w-5 h-5"/></button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {articles.length === 0 && <tr><td colSpan={3} className="px-6 py-4 text-center text-slate-500">No articles found</td></tr>}
                        </tbody>
                    </table>
                </div>
            )}

            {/* TEST STEPS TAB */}
            {activeTab === 'steps' && (
                <div className="space-y-6">
                    <div className="flex items-center gap-4">
                        <label className="text-sm font-medium text-slate-700">Select Article:</label>
                        <select className="rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" value={selectedArticleNo} onChange={e => setSelectedArticleNo(e.target.value)}>
                            <option value="">-- Select --</option>
                            {articles.map(a => <option key={a.id} value={a.articleNo}>{a.articleNo} - {a.name} ({a.stepCount || 0} steps)</option>)}
                        </select>
                    </div>

                    {selectedArticleNo && (
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="p-5 border-b border-slate-200 bg-slate-50 flex gap-4 items-end flex-wrap">
                                <div className="flex-[2] min-w-[200px]">
                                    <label className="block text-xs font-medium text-slate-700 mb-1">Test Name</label>
                                    <input type="text" className="w-full rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" value={newStep.name} onChange={e => setNewStep({...newStep, name: e.target.value})} placeholder="e.g. Visual Inspection" />
                                </div>
                                <div className="flex-[3] min-w-[300px]">
                                    <label className="block text-xs font-medium text-slate-700 mb-1">Question / Criterion</label>
                                    <input type="text" className="w-full rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" value={newStep.criterion} onChange={e => setNewStep({...newStep, criterion: e.target.value})} placeholder="e.g. No physical damage" />
                                </div>
                                <div className="w-auto pb-0.5">
                                    <button onClick={handleAddStep} disabled={isLoading} className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 whitespace-nowrap">Add Step</button>
                                </div>
                            </div>
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider w-16">No.</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Test Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Question / Criterion</th>
                                        <th className="px-6 py-3 text-right"></th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-200">
                                    {steps.map(s => (
                                        <tr key={s.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                                                {editingId === s.id ? <input type="number" className="rounded-md border-slate-300 w-16" value={editData.stepNo} onChange={e => setEditData({...editData, stepNo: parseInt(e.target.value) || 1})} /> : s.stepNo}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-900 whitespace-pre-line">
                                                {editingId === s.id ? <input className="rounded-md border-slate-300 w-full" value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})} /> : s.name}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-500">
                                                {editingId === s.id ? <input className="rounded-md border-slate-300 w-full" value={editData.criterion} onChange={e => setEditData({...editData, criterion: e.target.value})} /> : s.criterion}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                {editingId === s.id ? (
                                                    <div className="flex gap-2 justify-end">
                                                        <button onClick={() => handleEditSave('step')} className="text-green-600 hover:text-green-900 text-xs">Save</button>
                                                        <button onClick={() => setEditingId(null)} className="text-slate-500 hover:text-slate-700 text-xs">Cancel</button>
                                                    </div>
                                                ) : (
                                                    <div className="flex gap-2 justify-end">
                                                        <button onClick={() => handleEditStart(s)} className="text-slate-400 hover:text-primary-600"><PencilIcon className="w-5 h-5"/></button>
                                                        <button onClick={() => handleDeleteStep(s.id)} className="text-red-600 hover:text-red-900"><TrashIcon className="w-5 h-5"/></button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {steps.length === 0 && <tr><td colSpan={4} className="px-6 py-4 text-center text-slate-500">No steps found</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* EQUIPMENT TAB */}
            {activeTab === 'equipment' && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-5 border-b border-slate-200 bg-slate-50 flex gap-4">
                        <input className="flex-1 rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" placeholder="Equipment ID (e.g. FLUKE-001)" value={newEquipment.equipmentId} onChange={e => setNewEquipment({...newEquipment, equipmentId: e.target.value})} />
                        <input className="flex-[2] rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" placeholder="Name / Description (e.g. Safety Analyzer)" value={newEquipment.name} onChange={e => setNewEquipment({...newEquipment, name: e.target.value})} />
                        <button onClick={handleAddEquipment} disabled={isLoading} className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700">Add Equipment</button>
                    </div>
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Equipment ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name / Description</th>
                                <th className="px-6 py-3 text-right"></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {equipment.map(e => (
                                <tr key={e.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                                        {editingId === e.id ? <input className="rounded-md border-slate-300 w-full" value={editData.equipmentId} onChange={evt => setEditData({...editData, equipmentId: evt.target.value})} /> : e.equipmentId}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                        {editingId === e.id ? <input className="rounded-md border-slate-300 w-full" value={editData.name} onChange={evt => setEditData({...editData, name: evt.target.value})} /> : e.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        {editingId === e.id ? (
                                            <div className="flex gap-2 justify-end">
                                                <button onClick={() => handleEditSave('equipment')} className="text-green-600 hover:text-green-900 text-xs">Save</button>
                                                <button onClick={() => setEditingId(null)} className="text-slate-500 hover:text-slate-700 text-xs">Cancel</button>
                                            </div>
                                        ) : (
                                            <div className="flex gap-2 justify-end">
                                                <button onClick={() => handleEditStart(e)} className="text-slate-400 hover:text-primary-600"><PencilIcon className="w-5 h-5"/></button>
                                                <button onClick={() => handleDeleteEquipment(e.id)} className="text-red-600 hover:text-red-900"><TrashIcon className="w-5 h-5"/></button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {equipment.length === 0 && <tr><td colSpan={3} className="px-6 py-4 text-center text-slate-500">No equipment found</td></tr>}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
