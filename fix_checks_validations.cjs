const fs = require('fs');

function fixFile(filePath, navigatePath) {
  let c = fs.readFileSync(filePath, 'utf8');

  // Add ArrowLeft import if not present
  if (!c.includes('ArrowLeft')) {
    c = c.replace(
      'import { useNavigate, useParams } from "react-router-dom";',
      'import { useNavigate, useParams } from "react-router-dom";\r\nimport { ArrowLeft } from "lucide-react";'
    );
  }

  // Add back button after the main return div
  const divPattern = '    <div className="w-full max-w-none bg-[#f6f8fb]">';
  if (c.includes(divPattern) && !c.includes('navigate("' + navigatePath + '")') && c.includes('Atrás')) {
    // Already has a back button somewhere, skip
  } else if (c.includes(divPattern)) {
    const buttonBlock = '    <div className="w-full max-w-none bg-[#f6f8fb]">\r\n      <button\r\n        type="button"\r\n        onClick={() => navigate("' + navigatePath + '")}\r\n        className="mb-3 flex items-center gap-1.5 px-1 text-sm font-semibold text-slate-600 hover:text-brand-primary transition-colors"\r\n      >\r\n        <ArrowLeft size={16} />\r\n        Atrás\r\n      </button>';
    c = c.replace(divPattern, buttonBlock);
  }

  fs.writeFileSync(filePath, c, 'utf8');
  console.log('Done: ' + filePath);
}

fixFile(
  'c:/Users/ronal/OneDrive/Documents/Amcor_F2/src/modules/Checks/pages/ChecksDetailPage.tsx',
  '/checks'
);

fixFile(
  'c:/Users/ronal/OneDrive/Documents/Amcor_F2/src/modules/validaciones/pages/ValidationDetailPage.tsx',
  '/validaciones'
);
