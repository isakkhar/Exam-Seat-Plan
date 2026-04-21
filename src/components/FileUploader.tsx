'use client';

import React, { useCallback } from 'react';
import { useSeatPlan } from '@/context/SeatPlanContext';
import * as XLSX from 'xlsx';
import { Upload, FileSpreadsheet } from 'lucide-react';

export default function FileUploader() {
  const { setStudents } = useSeatPlan();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];

      // Assuming: Column 0 = ID, Column 1 = Name, Column 2 = Class
      const parsedStudents = data.slice(1) // Skip header
        .filter(row => row.length >= 3)
        .map(row => ({
          id: String(row[0]),
          name: String(row[1]),
          className: String(row[2])
        }));

      setStudents(parsedStudents);
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="glass-card">
      <h2 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <FileSpreadsheet size={24} /> Upload Students Data
      </h2>
      
      <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
        Upload an Excel or CSV file. Columns must be: <strong>ID, Name, Class</strong>
      </p>

      <div style={{ position: 'relative', height: '100px', border: '2px dashed var(--glass-border)', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyItems: 'center', cursor: 'pointer' }}>
        <input 
          type="file" 
          accept=".xlsx, .xls, .csv" 
          onChange={handleFileUpload} 
          style={{ position: 'absolute', opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }}
        />
        <div style={{ width: '100%', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Upload size={32} style={{ display: 'block', margin: '0 auto 0.5rem' }} />
          Click or Drag file to upload
        </div>
      </div>
    </div>
  );
}
