const fs = require('fs');

// --- 1. TestReportModal.tsx ---
let trm = fs.readFileSync('frontend/components/TestReportModal.tsx', 'utf8');

const eqOld = `<div className="flex-1">
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

const eqNew = `<div className="flex-1">
                                            <label className={labelClass}>Test Equipment</label>
                                            <CreatableSelect
                                                value={eq.id ? { value: eq.id, label: eq.name ? \`\${eq.id} - \${eq.name}\` : eq.id } : null}
                                                onChange={(option) => {
                                                    if (option) {
                                                        updateEquipment(idx, 'id', option.value);
                                                        const t = equipmentTemplates.find(t => t.equipmentId === option.value);
                                                        if (t) updateEquipment(idx, 'name', t.name);
                                                        else updateEquipment(idx, 'name', option.value); // Use ID as name if unknown
                                                    } else {
                                                        updateEquipment(idx, 'id', '');
                                                        updateEquipment(idx, 'name', '');
                                                    }
                                                }}
                                                onCreateOption={async (inputValue) => {
                                                    updateEquipment(idx, 'id', inputValue);
                                                    updateEquipment(idx, 'name', inputValue);
                                                    try {
                                                        await apiClient.post('/api/templates/equipment', { equipmentId: inputValue, name: inputValue });
                                                        const res = await apiClient.get('/api/templates/equipment');
                                                        setEquipmentTemplates((res.data as any).data || res.data || []);
                                                    } catch (e) {
                                                        console.error('Failed to auto-save new equipment', e);
                                                    }
                                                }}
                                                options={equipmentTemplates.map(t => ({ value: t.equipmentId, label: \`\${t.equipmentId} - \${t.name}\` }))}
                                                className="mt-1"
                                                classNames={{
                                                    control: () => \`border-slate-300 focus:border-primary-500 focus:ring-primary-500 sm:text-sm rounded-md shadow-sm min-h-[38px]\`,
                                                }}
                                                isClearable
                                                placeholder="Search or add equipment..."
                                                formatCreateLabel={(inputValue) => \`+ Add "\${inputValue}"\`}
                                            />
                                        </div>`;

trm = trm.replace(eqOld, eqNew);
fs.writeFileSync('frontend/components/TestReportModal.tsx', trm);

// --- 2. RmaFormModal.tsx ---
let rfm = fs.readFileSync('frontend/components/RmaFormModal.tsx', 'utf8');

// Ensure CreatableSelect is imported
if (!rfm.includes("import CreatableSelect")) {
    rfm = rfm.replace("import Select from 'react-select';", "import Select from 'react-select';\nimport CreatableSelect from 'react-select/creatable';");
}

const articleOld = `<Select
                      inputId={\`articleNumber-\${index}\`}
                      value={device.articleNumber ? { value: device.articleNumber, label: device.articleNumber } : null}
                      onChange={option => {
                        if (option && option.value === 'ADD_NEW') {
                          setActiveDeviceIndexForNewArticle(index);
                          setShowNewArticleModal(true);
                        } else {
                          handleDeviceChange(index, 'articleNumber', option ? option.value : '');
                        }
                      }}
                      className="mt-2 w-full"
                      classNames={{
                        control: () => \`border-slate-300 focus:border-primary-500 focus:ring-primary-500 sm:text-sm rounded-md shadow-sm min-h-[38px]\`,
                      }}
                      options={[
                        ...articles.map(a => ({ value: a.articleNo, label: \`\${a.articleNo}\${a.name ? \` - \${a.name}\` : ''}\` })),
                        { value: 'ADD_NEW', label: '+ Add New Article' }
                      ]}
                      isClearable
                      placeholder="Search Article No..."
                    />`;

const articleNew = `<CreatableSelect
                      inputId={\`articleNumber-\${index}\`}
                      value={device.articleNumber ? { value: device.articleNumber, label: device.articleNumber } : null}
                      onChange={option => {
                        handleDeviceChange(index, 'articleNumber', option ? option.value : '');
                      }}
                      onCreateOption={async (inputValue) => {
                        handleDeviceChange(index, 'articleNumber', inputValue);
                        try {
                            const res = await apiClient.post('/api/articles', { articleNo: inputValue });
                            const savedArticle = (res as any).data?.data || (res as any).data || { articleNo: inputValue };
                            setArticles(prev => [...prev, savedArticle]);
                        } catch (e) {
                            console.error('Failed to auto-save new article', e);
                        }
                      }}
                      className="mt-2 w-full"
                      classNames={{
                        control: () => \`border-slate-300 focus:border-primary-500 focus:ring-primary-500 sm:text-sm rounded-md shadow-sm min-h-[38px]\`,
                      }}
                      options={articles.map(a => ({ value: a.articleNo, label: \`\${a.articleNo}\${a.name ? \` - \${a.name}\` : ''}\` }))}
                      isClearable
                      placeholder="Search or add Article No..."
                      formatCreateLabel={(inputValue) => \`+ Add "\${inputValue}"\`}
                    />`;

rfm = rfm.replace(articleOld, articleNew);

const custOld = `<Select
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
                  />`;

const custNew = `<CreatableSelect
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
                    onCreateOption={async (inputValue) => {
                        try {
                            const res = await apiClient.post('/api/customers', { name: inputValue });
                            const savedCust = (res as any).data?.data || (res as any).data || { id: inputValue, name: inputValue };
                            setCustomerOptions(prev => [savedCust, ...prev]);
                            handleSelectCustomer(savedCust);
                        } catch (e) {
                            console.error('Failed to auto-save new customer', e);
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
                    placeholder="Search or add a customer..."
                    formatCreateLabel={(inputValue) => \`+ Add "\${inputValue}"\`}
                  />`;

rfm = rfm.replace(custOld, custNew);

fs.writeFileSync('frontend/components/RmaFormModal.tsx', rfm);
console.log("Done");
