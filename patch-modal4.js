const fs = require('fs');

let content = fs.readFileSync('frontend/components/TestReportModal.tsx', 'utf8');

content = content.replace(
  `                            criterion: s.criterion || 'Yes/No',`,
  `                            criterion: s.criterion && s.criterion !== 'Yes/No' ? s.criterion : '',`
);

fs.writeFileSync('frontend/components/TestReportModal.tsx', content);
