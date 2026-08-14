const fs = require('fs');

let content = fs.readFileSync('frontend/components/RmaFormModal.tsx', 'utf8');

if (!content.includes("import Select")) {
    content = content.replace("import React,", "import React, { useState, useEffect } from 'react';\nimport Select from 'react-select';\nimport");
    // If "import React," wasn't matched (e.g. they only did import { ... } from 'react')
    if (!content.includes("import Select")) {
        content = "import Select from 'react-select';\n" + content;
    }
}

// 1. Hospital Searchable Dropdown
content = content.replace(
  `<select id="hospital" value={hospital} onChange={e => setHospital(e.target.value)} className={\`mt-2 \${getInputStyles(false)}\`}>
                  <option value="" disabled>Select a hospital</option>
                  {hospitals.map(h => <option key={h} value={h}>{h}</option>)}
                </select>`,
  `<Select
                  id="hospital"
                  value={hospital ? { value: hospital, label: hospital } : null}
                  onChange={option => setHospital(option ? option.value : '')}
                  options={hospitals.map(h => ({ value: h, label: h }))}
                  className="mt-2"
                  classNames={{
                    control: () => \`border-slate-300 focus:border-primary-500 focus:ring-primary-500 sm:text-sm rounded-md shadow-sm\`,
                  }}
                  isClearable
                  placeholder="Select or search a hospital..."
                />`
);

// 2. Article No Searchable Dropdown
// Wait, we need to find where Article No is!
content = content.replace(
  `<select id="articleNo" value={formData.articleNo} onChange={handleChange} onBlur={handleBlur} required className={\`mt-2 \${getInputStyles(!!errors.articleNo && !!touched.articleNo)}\`}>
                  <option value="" disabled>Select an article</option>
                  {articles.map(a => <option key={a.id} value={a.articleNo}>{a.articleNo} - {a.name}</option>)}
                </select>`,
  `<Select
                  id="articleNo"
                  value={formData.articleNo ? { value: formData.articleNo, label: \`\${formData.articleNo} - \${articles.find(a => a.articleNo === formData.articleNo)?.name || ''}\` } : null}
                  onChange={option => setFormData(prev => ({ ...prev, articleNo: option ? option.value : '' }))}
                  options={articles.map(a => ({ value: a.articleNo, label: \`\${a.articleNo} - \${a.name}\` }))}
                  className="mt-2"
                  classNames={{
                    control: () => \`border-slate-300 focus:border-primary-500 focus:ring-primary-500 sm:text-sm rounded-md shadow-sm \${!!errors.articleNo && !!touched.articleNo ? 'border-red-300 ring-red-500' : ''}\`,
                  }}
                  isClearable
                  placeholder="Select or search an article..."
                />`
);

fs.writeFileSync('frontend/components/RmaFormModal.tsx', content);
