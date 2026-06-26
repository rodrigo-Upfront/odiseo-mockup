const fs = require('fs');

function fixFile(filePath, importOld, importNew, blockOld, blockNew) {
  let c = fs.readFileSync(filePath, 'utf8');
  if (c.includes(importOld)) {
    c = c.replace(importOld, importNew);
  } else if (!c.includes('ArrowLeft')) {
    // If there's no existing lucide-react import, add one after react-router-dom import
    c = c.replace(
      'import { useNavigate, useParams } from "react-router-dom";',
      'import { useNavigate, useParams } from "react-router-dom";\nimport { ArrowLeft } from "lucide-react";'
    );
    c = c.replace(
      'import { useNavigate } from "react-router-dom";',
      'import { useNavigate } from "react-router-dom";\nimport { ArrowLeft } from "lucide-react";'
    );
  }
  if (c.includes(blockOld)) {
    c = c.replace(blockOld, blockNew);
  }
  fs.writeFileSync(filePath, c, 'utf8');
  console.log('Done: ' + filePath);
}

const files = [
  {
    path: 'c:/Users/ronal/OneDrive/Documents/Amcor_F2/src/modules/clients/pages/ClientCreatePage.tsx',
    importOld: 'import { AlertCircle, Download, Upload } from "lucide-react";',
    importNew: 'import { AlertCircle, ArrowLeft, Download, Upload } from "lucide-react";',
    blockOld: '    <div className="w-full max-w-none bg-[#f6f8fb]">\r\n      <form onSubmit={handleSubmit}>',
    blockNew: '    <div className="w-full max-w-none bg-[#f6f8fb]">\r\n      <button\r\n        type="button"\r\n        onClick={() => navigate("/clients")}\r\n        className="mb-3 flex items-center gap-1.5 px-1 text-sm font-semibold text-slate-600 hover:text-brand-primary transition-colors"\r\n      >\r\n        <ArrowLeft size={16} />\r\n        Atrás\r\n      </button>\r\n\r\n      <form onSubmit={handleSubmit}>'
  },
  {
    path: 'c:/Users/ronal/OneDrive/Documents/Amcor_F2/src/modules/clients/pages/ClientDetailPage.tsx',
    importOld: 'PLACEHOLDER_NO_LUCIDE',
    importNew: 'PLACEHOLDER_NO_LUCIDE',
    blockOld: '    <div className="w-full max-w-none bg-[#f6f8fb]">\r\n      <div className="grid min-h-[calc(100vh-230px)] grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(380px,0.5fr)] p-5">',
    blockNew: '    <div className="w-full max-w-none bg-[#f6f8fb]">\r\n      <button\r\n        type="button"\r\n        onClick={() => navigate("/clients")}\r\n        className="mb-3 flex items-center gap-1.5 px-1 text-sm font-semibold text-slate-600 hover:text-brand-primary transition-colors"\r\n      >\r\n        <ArrowLeft size={16} />\r\n        Atrás\r\n      </button>\r\n\r\n      <div className="grid min-h-[calc(100vh-230px)] grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(380px,0.5fr)] p-5">'
  },
  {
    path: 'c:/Users/ronal/OneDrive/Documents/Amcor_F2/src/modules/clients/pages/ClientEditPage.tsx',
    importOld: 'PLACEHOLDER_NO_LUCIDE',
    importNew: 'PLACEHOLDER_NO_LUCIDE',
    blockOld: '    <div className="w-full max-w-none bg-[#f6f8fb]">\r\n      <form onSubmit={handleSubmit}>',
    blockNew: '    <div className="w-full max-w-none bg-[#f6f8fb]">\r\n      <button\r\n        type="button"\r\n        onClick={() => navigate("/clients")}\r\n        className="mb-3 flex items-center gap-1.5 px-1 text-sm font-semibold text-slate-600 hover:text-brand-primary transition-colors"\r\n      >\r\n        <ArrowLeft size={16} />\r\n        Atrás\r\n      </button>\r\n\r\n      <form onSubmit={handleSubmit}>'
  },
  {
    path: 'c:/Users/ronal/OneDrive/Documents/Amcor_F2/src/modules/users/pages/UserCreatePage.tsx',
    importOld: 'import { AlertCircle, Download, Upload } from "lucide-react";',
    importNew: 'import { AlertCircle, ArrowLeft, Download, Upload } from "lucide-react";',
    blockOld: '    <div className="w-full max-w-none bg-[#f6f8fb]">\r\n      <form onSubmit={handleSubmit}>',
    blockNew: '    <div className="w-full max-w-none bg-[#f6f8fb]">\r\n      <button\r\n        type="button"\r\n        onClick={() => navigate("/users")}\r\n        className="mb-3 flex items-center gap-1.5 px-1 text-sm font-semibold text-slate-600 hover:text-brand-primary transition-colors"\r\n      >\r\n        <ArrowLeft size={16} />\r\n        Atrás\r\n      </button>\r\n\r\n      <form onSubmit={handleSubmit}>'
  },
  {
    path: 'c:/Users/ronal/OneDrive/Documents/Amcor_F2/src/modules/users/pages/UserDetailPage.tsx',
    importOld: 'PLACEHOLDER_NO_LUCIDE',
    importNew: 'PLACEHOLDER_NO_LUCIDE',
    blockOld: '    <div className="w-full max-w-none bg-[#f6f8fb]">\r\n      <div className="grid min-h-[calc(100vh-230px)] grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(380px,0.5fr)] p-5">',
    blockNew: '    <div className="w-full max-w-none bg-[#f6f8fb]">\r\n      <button\r\n        type="button"\r\n        onClick={() => navigate("/users")}\r\n        className="mb-3 flex items-center gap-1.5 px-1 text-sm font-semibold text-slate-600 hover:text-brand-primary transition-colors"\r\n      >\r\n        <ArrowLeft size={16} />\r\n        Atrás\r\n      </button>\r\n\r\n      <div className="grid min-h-[calc(100vh-230px)] grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(380px,0.5fr)] p-5">'
  },
  {
    path: 'c:/Users/ronal/OneDrive/Documents/Amcor_F2/src/modules/users/pages/UserEditPage.tsx',
    importOld: 'PLACEHOLDER_NO_LUCIDE',
    importNew: 'PLACEHOLDER_NO_LUCIDE',
    blockOld: '    <div className="w-full max-w-none bg-[#f6f8fb]">\r\n      <form onSubmit={handleSubmit}>',
    blockNew: '    <div className="w-full max-w-none bg-[#f6f8fb]">\r\n      <button\r\n        type="button"\r\n        onClick={() => navigate("/users")}\r\n        className="mb-3 flex items-center gap-1.5 px-1 text-sm font-semibold text-slate-600 hover:text-brand-primary transition-colors"\r\n      >\r\n        <ArrowLeft size={16} />\r\n        Atrás\r\n      </button>\r\n\r\n      <form onSubmit={handleSubmit}>'
  }
];

files.forEach(f => fixFile(f.path, f.importOld, f.importNew, f.blockOld, f.blockNew));
