const fs = require('fs');

let trm = fs.readFileSync('frontend/components/TestReportModal.tsx', 'utf8');

// Ensure CreatableSelect is imported
if (!trm.includes("import CreatableSelect")) {
    trm = trm.replace("import Select from 'react-select';", "import Select from 'react-select';\nimport CreatableSelect from 'react-select/creatable';");
}

// Fix equipment fetch
trm = trm.replace(
  `setEquipmentTemplates((res.data as any).data || []);`,
  `setEquipmentTemplates((res.data as any).data || res.data || []);`
);

// Restore the two columns
trm = trm.replace(
  `<div className="flex-1">
                                            <label className={labelClass}>Test Equipment</label>
                                            <Select
                                                value={eq.id ? { value: eq.id, label: eq.name ? \`\${eq.id} - \${eq.name}\` : eq.id } : null}
                                                onChange={(option) => {
                                                    updateEquipment(idx, 'id', option ? option.value : '');
                                                    if (option) {
                                                        const t = equipmentTemplates.find(t => t.equipmentId === option.value);
                                                        if (t) updateEquipment(idx, 'name', t.name);
                                                    } else {
                                                        updateEquipment(idx, 'name', '');
                                                    }
                                                }}
                                                options={equipmentTemplates.map(t => ({ value: t.equipmentId, label: \`\${t.equipmentId} - \${t.name}\` }))}
                                                className="mt-1"
                                                classNames={{
                                                    control: () => \`border-slate-300 focus:border-primary-500 focus:ring-primary-500 sm:text-sm rounded-md shadow-sm min-h-[38px]\`,
                                                }}
                                                isClearable
                                                placeholder="Search and select equipment..."
                                            />
                                        </div>`,
  `<div className="flex-1">
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
                                        </div>`
);

fs.writeFileSync('frontend/components/TestReportModal.tsx', trm);
