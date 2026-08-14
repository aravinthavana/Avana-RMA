const fs = require('fs');

let content = fs.readFileSync('frontend/src/pages/TemplateManagement.tsx', 'utf8');

// Add edit states
content = content.replace(
  `    const [newStep, setNewStep] = useState({ name: '', criterion: '' });`,
  `    const [newStep, setNewStep] = useState({ name: '', criterion: '' });\n    const [editingId, setEditingId] = useState<string | null>(null);\n    const [editData, setEditData] = useState<any>({});`
);

// Add PencilIcon
const pencilIcon = `
const PencilIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
    </svg>
);
`;
content = content.replace(`const TrashIcon`, pencilIcon + `\nconst TrashIcon`);

// Add Edit Handlers
const editHandlers = `
    const handleEditStart = (item: any) => {
        setEditingId(item.id);
        setEditData({ ...item });
    };

    const handleEditSave = async (type: 'article' | 'equipment' | 'step') => {
        try {
            setIsLoading(true);
            if (type === 'article') {
                await apiClient.put(\`/api/articles/\${editingId}\`, editData);
                toast.success('Updated Article');
                fetchArticles();
            } else if (type === 'equipment') {
                await apiClient.put(\`/api/templates/equipment/\${editingId}\`, editData);
                toast.success('Updated Equipment');
                fetchEquipment();
            } else if (type === 'step') {
                await apiClient.put(\`/api/templates/test-steps/\${editingId}\`, editData);
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
`;

content = content.replace(`    const handleAddArticle = async () => {`, editHandlers + `\n    const handleAddArticle = async () => {`);

// Replace Article Row
content = content.replace(
  `                                <tr key={a.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{a.articleNo}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{a.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => handleDeleteArticle(a.id)} className="text-red-600 hover:text-red-900"><TrashIcon className="w-5 h-5"/></button>
                                    </td>
                                </tr>`,
  `                                <tr key={a.id}>
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
                                </tr>`
);

// Replace Step Row
content = content.replace(
  `                                        <tr key={s.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{s.stepNo}</td>
                                            <td className="px-6 py-4 text-sm text-slate-900 whitespace-pre-line">{s.name}</td>
                                            <td className="px-6 py-4 text-sm text-slate-500">{s.criterion}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button onClick={() => handleDeleteStep(s.id)} className="text-red-600 hover:text-red-900"><TrashIcon className="w-5 h-5"/></button>
                                            </td>
                                        </tr>`,
  `                                        <tr key={s.id}>
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
                                        </tr>`
);

// Replace Equipment Row
content = content.replace(
  `                                <tr key={e.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{e.equipmentId}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{e.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => handleDeleteEquipment(e.id)} className="text-red-600 hover:text-red-900"><TrashIcon className="w-5 h-5"/></button>
                                    </td>
                                </tr>`,
  `                                <tr key={e.id}>
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
                                </tr>`
);

fs.writeFileSync('frontend/src/pages/TemplateManagement.tsx', content);
