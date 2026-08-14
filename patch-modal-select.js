const fs = require('fs');

let content = fs.readFileSync('frontend/components/TestReportModal.tsx', 'utf8');

if (!content.includes("import Select")) {
    content = content.replace("import React,", "import React, { useState, useEffect } from 'react';\nimport Select from 'react-select';\nimport");
    if (!content.includes("import Select")) {
        content = "import Select from 'react-select';\n" + content;
    }
}

// 1. Make Mains Connection Optional
content = content.replace(
  `<input className={inputClass} required value={form.mainsConnection} onChange={e => setForm({ ...form, mainsConnection: e.target.value })} placeholder="e.g. 220V / 50Hz" />`,
  `<input className={inputClass} value={form.mainsConnection} onChange={e => setForm({ ...form, mainsConnection: e.target.value })} placeholder="e.g. 220V / 50Hz (Optional)" />`
);
content = content.replace(
  `<label className={labelClass}>Mains connection *</label>`,
  `<label className={labelClass}>Mains connection</label>`
);


// 2. Change Equipment ID to Select
content = content.replace(
  `<input 
                                                className={inputClass} 
                                                value={eq.id} 
                                                onChange={e => updateEquipment(idx, 'id', e.target.value)} 
                                                placeholder="e.g. FLUKE-ESA620-001" 
                                                list="equipment-templates-list"
                                            />`,
  `<Select
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
                                                placeholder="Search equipment ID..."
                                            />`
);

// We should also remove the datalist if we want, but it's harmless to leave it.
content = content.replace(
  `<datalist id="equipment-templates-list">
                                {equipmentTemplates.map(t => (
                                    <option key={t.id} value={t.equipmentId}>{t.name}</option>
                                ))}
                            </datalist>`,
  ``
);

fs.writeFileSync('frontend/components/TestReportModal.tsx', content);
