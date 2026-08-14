const fs = require('fs');

// --- TestReportModal.tsx ---
let trm = fs.readFileSync('frontend/components/TestReportModal.tsx', 'utf8');

// Combine columns in TestReportModal
trm = trm.replace(
  `<div className="flex-1">
                                            <label className={labelClass}>Equipment ID / Serial No.</label>
                                            <Select
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
                                            />
                                        </div>
                                        <div className="flex-[2]">
                                            <label className={labelClass}>Equipment Name / Description</label>
                                            <input className={inputClass} value={eq.name} onChange={e => updateEquipment(idx, 'name', e.target.value)} placeholder="e.g. Electrical Safety Analyser" />
                                        </div>`,
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
                                        </div>`
);
fs.writeFileSync('frontend/components/TestReportModal.tsx', trm);

// --- RmaFormModal.tsx ---
let rfm = fs.readFileSync('frontend/components/RmaFormModal.tsx', 'utf8');

// Ensure Select is imported
if (!rfm.includes("import Select")) {
    rfm = rfm.replace("import React,", "import React, { useState, useEffect } from 'react';\nimport Select from 'react-select';\nimport");
    if (!rfm.includes("import Select")) {
        rfm = "import Select from 'react-select';\n" + rfm;
    }
}

// 1. Article No Dropdown
rfm = rfm.replace(
  `<select
                      value={device.articleNumber}
                      onChange={e => handleDeviceChange(index, 'articleNumber', e.target.value)}
                      required
                      className={\`\${getInputStyles(false)} w-full\`}
                      disabled={!!preselectedArticleNo}
                    >
                      <option value="" disabled>Select Article No</option>
                      {articles.map(a => <option key={a.id} value={a.articleNo}>{a.articleNo}</option>)}
                      <option value="ADD_NEW">+ Add New Article</option>
                    </select>`,
  `<Select
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
                      className="w-full mt-1"
                      classNames={{
                        control: () => \`border-slate-300 focus:border-primary-500 focus:ring-primary-500 sm:text-sm rounded-md shadow-sm\`,
                      }}
                      isClearable
                      placeholder="Search Article No..."
                    />`
);

// 2. Customer Dropdown
// We need to replace the entire combobox structure for customer.
// It starts from: `<div className="mt-2 flex items-center gap-2">`
// up to `</div>` before `{errors.customerId...`
const comboboxStart = rfm.indexOf('<div className="relative grow" ref={customerDropdownRef}>');
if (comboboxStart !== -1) {
    // Find the end of the customerDropdownRef div
    // It's a bit tricky. We'll use a regex to replace the whole block.
    // Let's just find the exact block and replace it.
    
    const blockToReplace = `<div className="relative grow" ref={customerDropdownRef}>
                  <input type="text" id="customer" placeholder="Search or select a customer" value={customerSearchTerm} onChange={handleCustomerSearchChange} onFocus={() => setIsCustomerDropdownOpen(true)} onBlur={() => setTouched(prev => ({ ...prev, customerId: true }))} disabled={!!preselectedCustomerId || !!initialData} required autoComplete="off" className={getInputStyles(!!errors.customerId && !!touched.customerId)} role="combobox" aria-expanded={isCustomerDropdownOpen} aria-controls="customer-listbox" aria-autocomplete="list" aria-invalid={!!errors.customerId && !!touched.customerId} />
                  {isCustomerDropdownOpen && !preselectedCustomerId && !initialData && (
                    <div id="customer-listbox" role="listbox" className="absolute z-20 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                      {isSearchingCustomers && (
                        <div className="px-4 py-3 text-sm text-slate-500 flex items-center gap-2">
                          <LoadingSpinner size="sm" />
                          <span>Searching customers...</span>
                        </div>
                      )}
                      {!isSearchingCustomers && filteredCustomers.length > 0 ? (
                        filteredCustomers.map(c => (
                          <div key={c.id} id={\`customer-option-\${c.id}\`} role="option" aria-selected={c.id === formData.customerId} onClick={() => handleSelectCustomer(c)} className="cursor-pointer select-none relative py-2 pl-3 pr-9 text-slate-900 hover:bg-primary-600 hover:text-white"><span className="block truncate">{c.name} {c.contactPerson ? \`(\${c.contactPerson})\` : ''}</span></div>
                        ))
                      ) : (
                        !isSearchingCustomers && <div className="px-4 py-2 text-sm text-slate-500">No customers found.</div>
                      )}
                    </div>
                  )}
                </div>`;
                
    const replacement = `<div className="relative grow">
                  <Select
                    inputId="customer"
                    value={formData.customerId ? { value: formData.customerId, label: customerSearchTerm || 'Selected Customer' } : null}
                    onChange={(option) => {
                        if (option) {
                            const c = customerOptions.find(cust => cust.id === option.value) || initialCustomersProp.find(cust => cust.id === option.value);
                            if (c) handleSelectCustomer(c);
                        } else {
                            setFormData(prev => ({ ...prev, customerId: '' }));
                            setCustomerSearchTerm('');
                        }
                    }}
                    onInputChange={(value, { action }) => {
                        if (action === 'input-change') {
                            setCustomerSearchTerm(value);
                        }
                    }}
                    options={customerOptions.map(c => ({ value: c.id, label: c.name + (c.contactPerson ? \` (\${c.contactPerson})\` : '') }))}
                    isDisabled={!!preselectedCustomerId || !!initialData}
                    isLoading={isSearchingCustomers}
                    className="w-full"
                    classNames={{
                        control: () => \`border-slate-300 focus:border-primary-500 focus:ring-primary-500 sm:text-sm rounded-md shadow-sm \${!!errors.customerId && !!touched.customerId ? 'border-red-300 ring-red-500' : ''}\`,
                    }}
                    isClearable
                    placeholder="Search or select a customer..."
                  />
                </div>`;
                
    rfm = rfm.replace(blockToReplace, replacement);
} else {
    console.log("Could not find comboboxStart");
}

fs.writeFileSync('frontend/components/RmaFormModal.tsx', rfm);
