'use client';

import React from 'react';
import Link from 'next/link';
import { useSeatPlan } from '@/context/SeatPlanContext';
import RoomManager from '@/components/RoomManager';
import FileUploader from '@/components/FileUploader';
import { LayoutGrid, Printer, Users, Trash2, Download } from 'lucide-react';

export default function Dashboard() {
  const { students, rooms, generatePlan, clearAll } = useSeatPlan();

  const handleGenerate = () => {
    generatePlan();
    window.location.href = '/result';
  };

  const handleDownloadSample = () => {
    const csvContent = "data:text/csv;charset=utf-8,ID,Name,Class\n101,John Doe,Class 9\n102,Jane Smith,Class 10\n103,Rahim Ali,Class 9\n104,Karim Mia,Class 8";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "sample_students.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <main className="container">
      <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', background: 'linear-gradient(to right, var(--primary), var(--secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Exam Seat Plan Maker
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>Arrange students across rooms with strict mixed seating logic.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={handleDownloadSample} className="button button-secondary" style={{ background: 'transparent', border: '1px solid var(--secondary)', color: 'var(--secondary)' }}>
            <Download size={18} /> Sample CSV
          </button>
          <button onClick={clearAll} className="button" style={{ background: '#ef4444' }}>
            <Trash2 size={18} /> Reset All
          </button>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
        <RoomManager />
        <FileUploader />
      </div>

      {students.length > 0 && (
        <div className="glass-card" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users size={24} /> Uploaded Students ({students.length})
            </h2>
            <button onClick={handleGenerate} className="button" disabled={rooms.length === 0}>
              <LayoutGrid size={20} /> Generate Seat Plan
            </button>
          </div>
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Class</th>
                </tr>
              </thead>
              <tbody>
                {students.slice(0, 10).map((s, idx) => (
                  <tr key={`${s.id}-${idx}`}>
                    <td>{s.id}</td>
                    <td>{s.name}</td>
                    <td>{s.className}</td>
                  </tr>
                ))}
                {students.length > 10 && (
                  <tr>
                    <td colSpan={3} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                      and {students.length - 10} more students...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {rooms.length > 0 && students.length === 0 && (
        <div style={{ textAlign: 'center', padding: '4rem', opacity: 0.5 }}>
          <Users size={64} style={{ margin: '0 auto 1rem', display: 'block' }} />
          <h3>Upload student data to proceed</h3>
        </div>
      )}
    </main>
  );
}
