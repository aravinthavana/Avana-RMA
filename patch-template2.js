const fs = require('fs');

let content = fs.readFileSync('frontend/src/pages/TemplateManagement.tsx', 'utf8');

// Replace state
content = content.replace(
  `const [newStep, setNewStep] = useState({ name: '', criterion: '' });`,
  `const [newStep, setNewStep] = useState({ name: '', question: '', criterion: '' });`
);

// Add Question header
content = content.replace(
  `<th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Test Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Question / Criterion</th>`,
  `<th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Test Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Question</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Criterion (Result type)</th>`
);

// Replace Inputs
content = content.replace(
  `<input className="flex-[2] rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" placeholder="Test Name / Instruction" value={newStep.name} onChange={e => setNewStep({...newStep, name: e.target.value})} />
                            <input className="flex-[3] rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" placeholder="Question / Criterion" value={newStep.criterion} onChange={e => setNewStep({...newStep, criterion: e.target.value})} />`,
  `<input className="flex-1 rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" placeholder="Test Name" value={newStep.name} onChange={e => setNewStep({...newStep, name: e.target.value})} />
                            <input className="flex-[2] rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" placeholder="Question" value={newStep.question} onChange={e => setNewStep({...newStep, question: e.target.value})} />
                            <input className="flex-1 rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" placeholder="Criterion (e.g. Yes/No)" value={newStep.criterion} onChange={e => setNewStep({...newStep, criterion: e.target.value})} />`
);

// Replace Table cells
content = content.replace(
  `<td className="px-6 py-4 text-sm text-slate-900 whitespace-pre-line">
                                                {editingId === s.id ? <input className="rounded-md border-slate-300 w-full" value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})} /> : s.name}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-500">
                                                {editingId === s.id ? <input className="rounded-md border-slate-300 w-full" value={editData.criterion} onChange={e => setEditData({...editData, criterion: e.target.value})} /> : s.criterion}
                                            </td>`,
  `<td className="px-6 py-4 text-sm text-slate-900 whitespace-pre-line">
                                                {editingId === s.id ? <input className="rounded-md border-slate-300 w-full" value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})} /> : s.name}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-900 whitespace-pre-line">
                                                {editingId === s.id ? <input className="rounded-md border-slate-300 w-full" value={editData.question} onChange={e => setEditData({...editData, question: e.target.value})} /> : s.question}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-500">
                                                {editingId === s.id ? <input className="rounded-md border-slate-300 w-full" value={editData.criterion} onChange={e => setEditData({...editData, criterion: e.target.value})} /> : s.criterion}
                                            </td>`
);

// Replace colspan
content = content.replace(
  `{steps.length === 0 && <tr><td colSpan={4} className="px-6 py-4 text-center text-slate-500">No steps found</td></tr>}`,
  `{steps.length === 0 && <tr><td colSpan={5} className="px-6 py-4 text-center text-slate-500">No steps found</td></tr>}`
);


fs.writeFileSync('frontend/src/pages/TemplateManagement.tsx', content);
