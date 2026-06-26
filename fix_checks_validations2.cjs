const fs = require('fs');

function fixFile(filePath, navigatePath) {
  let c = fs.readFileSync(filePath, 'utf8');

  const divPattern = '    <div className="w-full max-w-none bg-[#f6f8fb] pb-12">';
  if (c.includes(divPattern) && !c.includes(navigatePath + '")') && c.includes('Atrás')) {
    // Already has a back button somewhere, skip
    console.log('Skipped: ' + filePath);
  } else if (c.includes(divPattern)) {
    const buttonBlock = '    <div className="w-full max-w-none bg-[#f6f8fb] pb-12">\r\n      <button\r\n        type="button"\r\n        onClick={() => navigate("' + navigatePath + '")}\r\n        className="mb-3 flex items-center gap-1.5 px-1 text-sm font-semibold text-slate-600 hover:text-brand-primary transition-colors"\r\n      >\r\n        <ArrowLeft size={16} />\r\n        Atrás\r\n      </button>';
    c = c.replace(divPattern, buttonBlock);
    fs.writeFileSync(filePath, c, 'utf8');
    console.log('Done: ' + filePath);
  } else {
    console.log('Pattern not found: ' + filePath);
  }
}

fixFile(
  'c:/Users/ronal/OneDrive/Documents/Amcor_F2/src/modules/Checks/pages/ChecksDetailPage.tsx',
  '/checks'
);

fixFile(
  'c:/Users/ronal/OneDrive/Documents/Amcor_F2/src/modules/validaciones/pages/ValidationDetailPage.tsx',
  '/validaciones'
);
