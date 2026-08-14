const fs = require('fs');

// --- 1. RmaFormModal.tsx ---
let rfm = fs.readFileSync('frontend/components/RmaFormModal.tsx', 'utf8');

const oldSelect = `<select
                      id={\`articleNumber-\${index}\`}
                      value={device.articleNumber}
                      onChange={e => {
                        if (e.target.value === 'ADD_NEW') {
                          setActiveDeviceIndexForNewArticle(index);
                          setShowNewArticleModal(true);
                        } else {
                          handleDeviceChange(index, 'articleNumber', e.target.value);
                        }
                      }}
                      className={\`mt-2 \${getInputStyles(false)}\`}
                    >
                      <option value="" disabled>Select Article No</option>
                      {articles.map(a => <option key={a.id} value={a.articleNo}>{a.articleNo}</option>)}
                      <option value="ADD_NEW">+ Add New Article</option>
                    </select>`;

const newSelect = `<Select
                      value={device.articleNumber ? { value: device.articleNumber, label: device.articleNumber } : null}
                      onChange={option => {
                        if (option && option.value === 'ADD_NEW') {
                            setShowNewArticleModal(true);
                            setActiveDeviceIndexForNewArticle(index);
                        } else {
                            handleDeviceChange(index, 'articleNumber', option ? option.value : '');
                        }
                      }}
                      options={[
                        ...articles.map(a => ({ value: a.articleNo, label: \`\${a.articleNo} \${a.name ? '- ' + a.name : ''}\` })),
                        { value: 'ADD_NEW', label: '+ Add New Article' }
                      ]}
                      isDisabled={!!preselectedArticleNo}
                      className="mt-2 w-full"
                      classNames={{
                        control: () => \`border-slate-300 focus:border-primary-500 focus:ring-primary-500 sm:text-sm rounded-md shadow-sm\`,
                      }}
                      isClearable
                      placeholder="Search Article No..."
                    />`;

if (rfm.includes(oldSelect)) {
    rfm = rfm.replace(oldSelect, newSelect);
    fs.writeFileSync('frontend/components/RmaFormModal.tsx', rfm);
    console.log('RmaFormModal patched successfully.');
} else {
    console.error('Could not find the Article No select block in RmaFormModal.');
}

// --- 2. TestReportModal.tsx ---
let trm = fs.readFileSync('frontend/components/TestReportModal.tsx', 'utf8');

const equipmentRowOld = `<div className="flex-1">
                                            <label className={labelClass}>Equipment ID / Serial No.</label>
                                            <CreatableSelect
                                                value={eq.id ? { value: eq.id, label: eq.id } : null}
                                                onChange={(option) => {
                                                    updateEquipment(idx, 'id', option ? option.value : '');
                                                    if (option) {
                                                        const t = equipmentTemplates.find(t => t.equipmentId === option.value);
                                                        if (t) updateEquipment(idx, 'name', t.name);
                                                    }
                                                }}
                                                options={equipmentTemplates.map(t => ({ value: t.equipmentId, label: t.equipmentId + ' - ' + t.name }))}
                                                className="mt-1"
                                                classNames={{
                                                    control: () => \`border-slate-300 focus:border-primary-500 focus:ring-primary-500 sm:text-sm rounded-md shadow-sm min-h-[38px]\`,
                                                }}
                                                isClearable
                                                placeholder="Search or type custom ID..."
                                                formatCreateLabel={(inputValue) => \`Use custom ID: "\${inputValue}"\`}
                                            />
                                        </div>
                                        <div className="flex-[2]">
                                            <label className={labelClass}>Equipment Name / Description</label>
                                            <input 
                                                className={inputClass} 
                                                value={eq.name} 
                                                onChange={e => updateEquipment(idx, 'name', e.target.value)} 
                                                placeholder="e.g. Electrical Safety Analyser" 
                                            />
                                        </div>`;

const equipmentRowNew = `{\`
                                        // Self-invoking function to determine if known
                                        (() => {
                                            const knownTpl = equipmentTemplates.find(t => t.equipmentId === eq.id);
                                            const isKnown = !!knownTpl;
                                            return (
                                                <>
                                                    <div className="flex-[1.5]">
                                                        <label className={labelClass}>Equipment ID / Serial No.</label>
                                                        <CreatableSelect
                                                            value={eq.id ? { value: eq.id, label: isKnown ? \`\${eq.id} - \${knownTpl.name}\` : eq.id } : null}
                                                            onChange={(option) => {
                                                                updateEquipment(idx, 'id', option ? option.value : '');
                                                                if (option) {
                                                                    const t = equipmentTemplates.find(t => t.equipmentId === option.value);
                                                                    if (t) updateEquipment(idx, 'name', t.name);
                                                                    else updateEquipment(idx, 'name', '');
                                                                }
                                                            }}
                                                            options={equipmentTemplates.map(t => ({ value: t.equipmentId, label: t.equipmentId + ' - ' + t.name }))}
                                                            className="mt-1"
                                                            classNames={{
                                                                control: () => \`border-slate-300 focus:border-primary-500 focus:ring-primary-500 sm:text-sm rounded-md shadow-sm min-h-[38px]\`,
                                                            }}
                                                            isClearable
                                                            placeholder="Search or type custom ID..."
                                                            formatCreateLabel={(inputValue) => \`Use custom ID: "\${inputValue}"\`}
                                                        />
                                                    </div>
                                                    {!isKnown && eq.id && (
                                                        <div className="flex-[2] flex gap-2">
                                                            <div className="flex-1">
                                                                <label className={labelClass}>Equipment Name / Description</label>
                                                                <input 
                                                                    className={inputClass} 
                                                                    value={eq.name} 
                                                                    onChange={e => updateEquipment(idx, 'name', e.target.value)} 
                                                                    placeholder="e.g. Electrical Safety Analyser" 
                                                                />
                                                            </div>
                                                            <div className="flex items-end mb-[2px]">
                                                                <button 
                                                                    type="button" 
                                                                    onClick={async () => {
                                                                        if (!eq.name) return alert('Please enter a name');
                                                                        try {
                                                                            await apiClient.post('/api/templates/equipment', { equipmentId: eq.id, name: eq.name });
                                                                            const res = await apiClient.get('/api/templates/equipment');
                                                                            setEquipmentTemplates((res.data as any).data || res.data || []);
                                                                            alert('Saved to Master Data successfully!');
                                                                        } catch (err) {
                                                                            console.error(err);
                                                                            alert('Failed to save to Master Data.');
                                                                        }
                                                                    }}
                                                                    className="bg-green-600 text-white px-3 py-1.5 rounded text-sm hover:bg-green-700 whitespace-nowrap h-[38px]"
                                                                >
                                                                    Save to Master
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </>
                                            );
                                        })()
                                        \`.replace(/^\\s+|\\s+$/g, '')}
                                        `;

// Using a slightly different approach for TestReportModal because JSX inside template literals in string replace is messy.
// Let's do it safely.

let trmReplace = trm.replace(equipmentRowOld, `
                                        {(() => {
                                            const knownTpl = equipmentTemplates.find(t => t.equipmentId === eq.id);
                                            const isKnown = !!knownTpl;
                                            return (
                                                <>
                                                    <div className="flex-[1.5]">
                                                        <label className={labelClass}>Equipment ID / Serial No.</label>
                                                        <CreatableSelect
                                                            value={eq.id ? { value: eq.id, label: isKnown ? \`\${eq.id} - \${knownTpl.name}\` : eq.id } : null}
                                                            onChange={(option) => {
                                                                updateEquipment(idx, 'id', option ? option.value : '');
                                                                if (option) {
                                                                    const t = equipmentTemplates.find(t => t.equipmentId === option.value);
                                                                    if (t) updateEquipment(idx, 'name', t.name);
                                                                    else updateEquipment(idx, 'name', '');
                                                                }
                                                            }}
                                                            options={equipmentTemplates.map(t => ({ value: t.equipmentId, label: t.equipmentId + ' - ' + t.name }))}
                                                            className="mt-1"
                                                            classNames={{
                                                                control: () => \`border-slate-300 focus:border-primary-500 focus:ring-primary-500 sm:text-sm rounded-md shadow-sm min-h-[38px]\`,
                                                            }}
                                                            isClearable
                                                            placeholder="Search or type custom ID..."
                                                            formatCreateLabel={(inputValue) => \`Use custom ID: "\${inputValue}"\`}
                                                        />
                                                    </div>
                                                    {!isKnown && eq.id && (
                                                        <div className="flex-[2] flex gap-2">
                                                            <div className="flex-1">
                                                                <label className={labelClass}>Equipment Name / Description</label>
                                                                <input 
                                                                    className={inputClass} 
                                                                    value={eq.name} 
                                                                    onChange={e => updateEquipment(idx, 'name', e.target.value)} 
                                                                    placeholder="e.g. Electrical Safety Analyser" 
                                                                />
                                                            </div>
                                                            <div className="flex items-end">
                                                                <button 
                                                                    type="button" 
                                                                    onClick={async () => {
                                                                        if (!eq.name) return alert('Please enter a name');
                                                                        try {
                                                                            await apiClient.post('/api/templates/equipment', { equipmentId: eq.id, name: eq.name });
                                                                            const res = await apiClient.get('/api/templates/equipment');
                                                                            setEquipmentTemplates((res.data as any).data || res.data || []);
                                                                            alert('Saved to Master Data successfully!');
                                                                        } catch (err) {
                                                                            console.error(err);
                                                                            alert('Failed to save to Master Data.');
                                                                        }
                                                                    }}
                                                                    className="bg-green-600 text-white px-3 py-1.5 rounded text-sm hover:bg-green-700 whitespace-nowrap h-[38px]"
                                                                >
                                                                    Save to Master
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </>
                                            );
                                        })()}
`);

if (trm !== trmReplace) {
    fs.writeFileSync('frontend/components/TestReportModal.tsx', trmReplace);
    console.log('TestReportModal patched successfully.');
} else {
    console.error('Could not find the equipment row block in TestReportModal.');
}
