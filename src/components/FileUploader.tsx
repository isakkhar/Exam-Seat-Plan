'use client';

import React, { useState } from 'react';
import { useSeatPlan } from '@/context/SeatPlanContext';
import * as XLSX from 'xlsx';
import { Upload, FileSpreadsheet, CheckCircle } from 'lucide-react';

export default function FileUploader() {
  const { setStudents } = useSeatPlan();
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [parsedCount, setParsedCount] = useState<number | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const rawData = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];

        if (rawData.length < 2) return;

        const headerRow = rawData[0].map(h => String(h || '').trim().toLowerCase());

        // Find column indices dynamically
        let idIndex = headerRow.findIndex(h => h === 'id' || h.includes('roll') || h.includes('student id') || h.includes('id no'));
        let nameIndex = headerRow.findIndex(h => h.includes('name') || h === 'student');
        let classIndex = headerRow.findIndex(h => h.includes('class') || h.includes('grade') || h.includes('sec'));

        // Fallback to 0, 1, 2 if headers not found
        if (idIndex === -1) idIndex = 0;
        if (nameIndex === -1) nameIndex = 1;
        if (classIndex === -1) classIndex = 2;

        const parsedStudents = rawData.slice(1)
          .filter(row => row && row[idIndex] !== undefined && row[idIndex] !== '')
          .map(row => ({
            id: String(row[idIndex] ?? '').trim(),
            name: String(row[nameIndex] ?? 'Student').trim(),
            className: String(row[classIndex] ?? 'General').trim()
          }))
          .filter(s => s.id.length > 0);

        setStudents(parsedStudents);
        setParsedCount(parsedStudents.length);
      } catch (err) {
        console.error('File parsing error:', err);
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="glass-card">
      <h2 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontSize: '1.3rem' }}>
        <FileSpreadsheet size={24} color="var(--primary)" /> Upload Students Data
      </h2>
      
      <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
        Upload an Excel or CSV file. Supported headers: <strong>Roll/ID, Name, Class</strong>
      </p>

      <div style={{ 
        position: 'relative', 
        height: '120px', 
        border: '2px dashed var(--primary-light)', 
        borderRadius: '0.5rem', 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center', 
        cursor: 'pointer',
        background: 'var(--primary-tint)',
        transition: 'all 0.2s ease'
      }}>
        <input 
          type="file" 
          accept=".xlsx, .xls, .csv" 
          onChange={handleFileUpload} 
          style={{ position: 'absolute', opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }}
        />
        <div style={{ width: '100%', textAlign: 'center', color: 'var(--text-muted)', padding: '0.5rem' }}>
          {parsedCount !== null ? (
            <div style={{ color: 'var(--primary-hover)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
              <CheckCircle size={32} color="var(--primary)" />
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                {uploadedFileName} ({parsedCount} জন শিক্ষার্থী লোড হয়েছে)
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                অন্য ফাইল আপলোড করতে পুনরায় ক্লিক করুন
              </div>
            </div>
          ) : (
            <>
              <Upload size={32} style={{ display: 'block', margin: '0 auto 0.4rem', color: 'var(--primary)' }} />
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--primary-hover)' }}>
                Click or Drag file to upload
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Excel (.xlsx, .xls) অথবা CSV (.csv)</div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
