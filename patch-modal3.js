const fs = require('fs');

let content = fs.readFileSync('frontend/components/TestReportModal.tsx', 'utf8');

// Update initialization to combine name and question
content = content.replace(
  `                            stepNo: s.stepNo,
                            name: s.name,
                            question: s.question || '',
                            criterion: s.criterion || 'Yes/No',
                            unit: '',
                            result: '',
                            isOk: true`,
  `                            stepNo: s.stepNo,
                            name: s.question ? \`\${s.name}\\n\${s.question}\` : s.name,
                            criterion: s.criterion || 'Yes/No',
                            unit: '',
                            result: '',
                            isOk: true`
);

// Update addStep
content = content.replace(
  `const addStep = () => setSteps(prev => [...prev, { stepNo: prev.length + 1, name: '', question: '', criterion: 'Yes/No', unit: '', result: '', isOk: true }]);`,
  `const addStep = () => setSteps(prev => [...prev, { stepNo: prev.length + 1, name: '', criterion: '', unit: '', result: '', isOk: true }]);`
);

// Revert headers
content = content.replace(
  `<th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase w-48">Test Step</th>
                                            <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Question</th>
                                            <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase w-32">Criterion</th>`,
  `<th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Test Step</th>
                                            <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Criterion</th>`
);

// Revert table cells
content = content.replace(
  `                                                        <td className="px-3 py-1 pb-2 align-top text-sm font-medium">
                                                            <textarea
                                                                rows={2}
                                                                className="w-full resize-none bg-white border border-slate-200 hover:border-slate-300 focus:border-primary-400 focus:ring-1 focus:ring-primary-400 rounded px-2 py-1 outline-none transition-colors leading-tight"
                                                                value={step.name}
                                                                onChange={e => updateStep(idx, 'name', e.target.value)}
                                                                placeholder="Test Name"
                                                            />
                                                        </td>
                                                        <td className="px-3 py-1 pb-2 align-top text-sm">
                                                            <textarea
                                                                rows={2}
                                                                className="w-full resize-none bg-white border border-slate-200 hover:border-slate-300 focus:border-primary-400 focus:ring-1 focus:ring-primary-400 rounded px-2 py-1 outline-none transition-colors leading-tight"
                                                                value={(step as any).question || ''}
                                                                onChange={e => updateStep(idx, 'question', e.target.value)}
                                                                placeholder="Question"
                                                            />
                                                        </td>
                                                        <td className="px-3 py-1 pb-2 align-top">
                                                            <input
                                                                className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-primary-400 focus:ring-1 focus:ring-primary-400 rounded px-2 py-1 outline-none transition-colors"
                                                                value={step.criterion}
                                                                onChange={e => updateStep(idx, 'criterion', e.target.value)}
                                                                placeholder="Criterion (e.g. Yes/No)"
                                                            />
                                                        </td>`,
  `                                                        <td className="px-3 py-1 pb-2 align-top text-sm font-medium">
                                                            <textarea
                                                                rows={2}
                                                                className="w-full resize-none bg-white border border-slate-200 hover:border-slate-300 focus:border-primary-400 focus:ring-1 focus:ring-primary-400 rounded px-2 py-1 outline-none transition-colors leading-tight"
                                                                value={step.name}
                                                                onChange={e => updateStep(idx, 'name', e.target.value)}
                                                                placeholder="Test Name / Question"
                                                            />
                                                        </td>
                                                        <td className="px-3 py-1 pb-2 align-top">
                                                            <input
                                                                className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-primary-400 focus:ring-1 focus:ring-primary-400 rounded px-2 py-1 outline-none transition-colors"
                                                                value={step.criterion}
                                                                onChange={e => updateStep(idx, 'criterion', e.target.value)}
                                                                placeholder="Yes/No"
                                                            />
                                                        </td>`
);

fs.writeFileSync('frontend/components/TestReportModal.tsx', content);
