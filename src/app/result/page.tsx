'use client';

import React, { useState } from 'react';
import { useSeatPlan, AllocatedStudent, Room } from '@/context/SeatPlanContext';
import { 
  Printer, 
  ChevronLeft, 
  LayoutGrid, 
  FileText, 
  CheckSquare, 
  Eye, 
  Calendar, 
  MapPin, 
  BookOpen,
  Users
} from 'lucide-react';
import Link from 'next/link';

type ViewMode = 'slips' | 'visual' | 'notice' | 'attendance';

// Palette for different classes in visual room layout
const CLASS_COLORS = [
  { bg: '#e0e7ff', border: '#6366f1', text: '#312e81' }, // Indigo
  { bg: '#dcfce7', border: '#22c55e', text: '#14532d' }, // Green
  { bg: '#fef3c7', border: '#f59e0b', text: '#78350f' }, // Amber
  { bg: '#fee2e2', border: '#ef4444', text: '#7f1d1d' }, // Red
  { bg: '#e0f2fe', border: '#0ea5e9', text: '#0c4a6e' }, // Sky
  { bg: '#f3e8ff', border: '#a855f7', text: '#581c87' }, // Purple
  { bg: '#ffedd5', border: '#f97316', text: '#7c2d12' }, // Orange
  { bg: '#ccfbf1', border: '#14b8a6', text: '#134e4a' }, // Teal
];

export default function ResultPage() {
  const { assignments, rooms, examInfo } = useSeatPlan();
  const [activeTab, setActiveTab] = useState<ViewMode>('slips');
  const [selectedRoomName, setSelectedRoomName] = useState<string>(
    Object.keys(assignments)[0] || ''
  );

  const roomNames = Object.keys(assignments);

  const handlePrint = () => {
    window.print();
  };

  if (roomNames.length === 0) {
    return (
      <div className="container" style={{ textAlign: 'center', paddingTop: '4rem' }}>
        <h2>কোন সিট প্ল্যান তৈরি করা হয়নি।</h2>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
          অনুগ্রহ করে ড্যাশবোর্ড থেকে রুম এবং শিক্ষার্থী ডেটা দিয়ে সিট প্ল্যান জেনারেট করুন।
        </p>
        <Link href="/" className="button" style={{ marginTop: '1.5rem' }}>
          <ChevronLeft size={20} /> Back to Dashboard
        </Link>
      </div>
    );
  }

  // Chunk array into sizes of N (9 for A4 3x3 grid)
  const chunk = <T,>(arr: T[], size: number): T[][] => {
    const result: T[][] = [];
    for (let i = 0; i < arr.length; i += size) {
      result.push(arr.slice(i, i + size));
    }
    return result;
  };

  // Class color mapper
  const distinctClasses = Array.from(
    new Set(
      Object.values(assignments)
        .flat()
        .map(s => s.className.trim())
    )
  );

  const getClassColor = (className: string) => {
    const idx = distinctClasses.indexOf(className.trim());
    if (idx === -1) return CLASS_COLORS[0];
    return CLASS_COLORS[idx % CLASS_COLORS.length];
  };

  const currentRoomObj = rooms.find(r => r.name === selectedRoomName) || rooms[0];

  return (
    <main className="container">
      {/* Top action bar - Hidden when printing */}
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <Link href="/" className="button" style={{ background: 'transparent', border: '1px solid var(--primary)', color: 'var(--primary)' }}>
          <ChevronLeft size={20} /> Dashboard
        </Link>

        {/* View Mode Tabs */}
        <div style={{ display: 'flex', background: 'var(--card-bg)', padding: '0.3rem', borderRadius: '0.6rem', border: '1px solid var(--card-border)', gap: '0.3rem' }}>
          <button
            onClick={() => setActiveTab('slips')}
            style={{
              padding: '0.5rem 0.9rem',
              borderRadius: '0.4rem',
              border: 'none',
              background: activeTab === 'slips' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'slips' ? '#fff' : 'var(--foreground)',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <LayoutGrid size={16} /> Seat Slips (3x3)
          </button>

          <button
            onClick={() => setActiveTab('visual')}
            style={{
              padding: '0.5rem 0.9rem',
              borderRadius: '0.4rem',
              border: 'none',
              background: activeTab === 'visual' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'visual' ? '#fff' : 'var(--foreground)',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <Eye size={16} /> রুমের রো-কলাম লেআউট
          </button>

          <button
            onClick={() => setActiveTab('notice')}
            style={{
              padding: '0.5rem 0.9rem',
              borderRadius: '0.4rem',
              border: 'none',
              background: activeTab === 'notice' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'notice' ? '#fff' : 'var(--foreground)',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <FileText size={16} /> নোটিশ বোর্ড সামারি
          </button>

          <button
            onClick={() => setActiveTab('attendance')}
            style={{
              padding: '0.5rem 0.9rem',
              borderRadius: '0.4rem',
              border: 'none',
              background: activeTab === 'attendance' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'attendance' ? '#fff' : 'var(--foreground)',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <CheckSquare size={16} /> হাজিরা শিট
          </button>
        </div>

        <button onClick={handlePrint} className="button" style={{ background: '#10b981' }}>
          <Printer size={20} /> Print Current View
        </button>
      </div>

      {/* ========================================================= */}
      {/* 1. SEAT SLIPS (3x3 Grid Layout)                           */}
      {/* ========================================================= */}
      {activeTab === 'slips' && (
        <div id="printable-area">
          {roomNames.map((roomName) => {
            const roomStudents = assignments[roomName];
            const chunks = chunk(roomStudents, 9); // 9 seats per A4 page

            return chunks.map((seatChunk, chunkIndex) => (
              <div 
                key={`${roomName}-${chunkIndex}`} 
                className={chunkIndex > 0 || roomNames.indexOf(roomName) > 0 ? "print-page-break" : ""} 
                style={{ marginBottom: '2.5rem' }}
              >
                <div style={{ padding: '0.5rem', border: '1px solid #eee', borderRadius: '0.5rem', background: 'white' }}>
                  <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    <strong>Room: {roomName} — Page {chunkIndex + 1} of {chunks.length}</strong>
                    <span>({seatChunk.length} Slips on this page)</span>
                  </div>
                  
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(3, 1fr)', 
                    gridTemplateRows: 'repeat(3, 1fr)',
                    gap: '0', 
                    border: '1px solid #000',
                    width: '100%',
                    maxWidth: '210mm',
                    minHeight: '27.7cm', // Fit A4
                    margin: '0 auto'
                  }}>
                    {seatChunk.map((student) => (
                      <div key={student.id} style={{ 
                        border: '1.2px solid #000', 
                        padding: '0.65rem', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        justifyContent: 'space-between',
                        position: 'relative',
                        height: '9.2cm', 
                        backgroundColor: 'white',
                        boxSizing: 'border-box'
                      }}>
                        {/* Header with Logos */}
                        <div>
                          <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            marginBottom: '0.4rem',
                            width: '100%',
                            padding: '0 2px'
                          }}>
                            <div style={{ flexShrink: 0 }}>
                              <img src="/logo/logo.png" alt="Logo" style={{ height: '26px', width: 'auto' }} />
                            </div>
                            <div style={{ flexGrow: 1, display: 'flex', justifyContent: 'flex-end' }}>
                              <img src="/logo/tagline_1.png" alt="Tagline" style={{ height: '36px', width: 'auto', maxWidth: '140px' }} />
                            </div>
                          </div>

                          {/* Exam Title if available */}
                          {examInfo.title && (
                            <div style={{ 
                              textAlign: 'center', 
                              fontSize: '0.78rem', 
                              fontWeight: 700, 
                              color: '#1e293b', 
                              borderBottom: '1px solid #cbd5e1', 
                              paddingBottom: '0.25rem',
                              marginBottom: '0.4rem'
                            }}>
                              {examInfo.title}
                              {examInfo.subject && ` • ${examInfo.subject}`}
                            </div>
                          )}
                        </div>
                        
                        {/* Student & Seat Info */}
                        <div style={{ 
                          display: 'flex', 
                          flexDirection: 'column', 
                          gap: '0.35rem',
                          textAlign: 'left',
                          paddingLeft: '0.6rem',
                          borderLeft: '3px solid #1a365d'
                        }}>
                          <div style={{ fontSize: '1.05rem', color: '#000', lineHeight: '1.2' }}>
                            <span style={{ fontWeight: '400', color: '#555', fontSize: '0.9rem' }}>Name: </span>
                            <strong style={{ fontWeight: '700' }}>{student.name}</strong>
                          </div>
                          <div style={{ fontSize: '1.05rem', color: '#000' }}>
                            <span style={{ fontWeight: '400', color: '#555', fontSize: '0.9rem' }}>Class: </span>
                            <strong style={{ fontWeight: '700' }}>{student.className}</strong>
                          </div>
                          <div style={{ fontSize: '1.05rem', color: '#000' }}>
                            <span style={{ fontWeight: '400', color: '#555', fontSize: '0.9rem' }}>Roll / ID: </span>
                            <strong style={{ fontWeight: '700' }}>{student.id}</strong>
                          </div>
                        </div>

                        {/* Room & Seat Footer Badge */}
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center',
                          marginTop: '0.4rem',
                          paddingTop: '0.35rem',
                          borderTop: '1px dashed #94a3b8',
                          fontSize: '0.85rem'
                        }}>
                          <div>
                            <span style={{ color: '#64748b' }}>Room: </span>
                            <strong style={{ fontSize: '0.95rem' }}>{roomName}</strong>
                          </div>
                          <div style={{ background: '#f1f5f9', padding: '0.15rem 0.5rem', borderRadius: '0.25rem', border: '1px solid #cbd5e1' }}>
                            <span style={{ color: '#475569' }}>Seat: </span>
                            <strong style={{ color: '#0f172a' }}>{student.seatNumber || 'N/A'}</strong>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Fill empty cells to maintain 3x3 grid */}
                    {Array.from({ length: 9 - seatChunk.length }).map((_, i) => (
                      <div key={`empty-${i}`} style={{ border: '1px solid #eee', background: '#fafafa' }} />
                    ))}
                  </div>
                </div>
              </div>
            ));
          })}
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. VISUAL ROOM BENCH LAYOUT (রুমের রো-কলাম ভিউ)           */}
      {/* ========================================================= */}
      {activeTab === 'visual' && (
        <div className="glass-card" style={{ padding: '1.5rem', background: '#fff' }}>
          {/* Room Selector Filter */}
          <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>
                Room {selectedRoomName} - Classroom Bench Seating Map
              </h2>
              <p style={{ color: '#64748b', fontSize: '0.85rem' }}>
                বেঞ্চ প্রতি ১ জন পরীক্ষার্থী (1 Student per Bench / Single-seat Grid)
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>রুম বেছে নিন:</span>
              <select
                className="input"
                style={{ width: 'auto', padding: '0.4rem 0.8rem', background: '#fff', color: '#000' }}
                value={selectedRoomName}
                onChange={e => setSelectedRoomName(e.target.value)}
              >
                {roomNames.map(name => (
                  <option key={name} value={name}>Room {name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Class Legend */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', marginBottom: '1.5rem', padding: '0.75rem', background: '#f8fafc', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', alignSelf: 'center' }}>
              ক্লাস কালার কোড (Class Color Legend):
            </span>
            {distinctClasses.map(cls => {
              const col = getClassColor(cls);
              return (
                <span 
                  key={cls}
                  style={{ 
                    background: col.bg, 
                    border: `1.5px solid ${col.border}`, 
                    color: col.text, 
                    padding: '0.2rem 0.6rem', 
                    borderRadius: '0.3rem', 
                    fontSize: '0.8rem', 
                    fontWeight: 700 
                  }}
                >
                  {cls}
                </span>
              );
            })}
          </div>

          {/* Teacher's Podium / Blackboard */}
          <div style={{ 
            textAlign: 'center', 
            background: '#1e293b', 
            color: '#fff', 
            padding: '0.6rem', 
            borderRadius: '0.4rem', 
            fontWeight: 700, 
            letterSpacing: '1px', 
            marginBottom: '1.5rem',
            width: '60%',
            margin: '0 auto 1.5rem auto'
          }}>
            🎓 BLACKBOARD / TEACHER&apos;S PODIUM (সামনের দিক)
          </div>

          {/* Room Bench Grid */}
          {(() => {
            const roomStudents = assignments[selectedRoomName] || [];
            const rRows = currentRoomObj?.rows || Math.ceil((currentRoomObj?.capacity || 20) / 4);
            const rCols = currentRoomObj?.cols || 4;

            return (
              <div style={{ overflowX: 'auto', padding: '1rem 0' }}>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: `repeat(${rCols}, minmax(160px, 1fr))`, 
                  gap: '1rem',
                  maxWidth: '1000px',
                  margin: '0 auto'
                }}>
                  {Array.from({ length: rRows }).map((_, rIdx) => {
                    const rowNumber = rIdx + 1;
                    return Array.from({ length: rCols }).map((_, cIdx) => {
                      const colNumber = cIdx + 1;
                      const seatCode = `R${rowNumber}-C${colNumber}`;
                      
                      // Find student assigned to this seat
                      const student = roomStudents.find(s => 
                        s.seatNumber?.startsWith(seatCode) || 
                        (s.row === rowNumber && s.col === colNumber)
                      );

                      const colStyle = student ? getClassColor(student.className) : null;

                      return (
                        <div 
                          key={seatCode}
                          style={{
                            border: student ? `2px solid ${colStyle?.border}` : '1.5px dashed #cbd5e1',
                            background: student ? colStyle?.bg : '#f8fafc',
                            borderRadius: '0.5rem',
                            padding: '0.85rem',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            minHeight: '110px',
                            boxShadow: student ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                            position: 'relative'
                          }}
                        >
                          {/* Seat identifier */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#475569', background: '#ffffff', padding: '0.1rem 0.35rem', borderRadius: '0.2rem', border: '1px solid #e2e8f0' }}>
                              {seatCode}
                            </span>
                            {student && (
                              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: colStyle?.text }}>
                                {student.className}
                              </span>
                            )}
                          </div>

                          {student ? (
                            <div>
                              <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a', lineHeight: '1.2', marginBottom: '0.2rem' }}>
                                {student.name}
                              </div>
                              <div style={{ fontSize: '0.8rem', color: '#334155' }}>
                                Roll: <strong>{student.id}</strong>
                              </div>
                            </div>
                          ) : (
                            <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.8rem', margin: 'auto' }}>
                              (খালি সিট)
                            </div>
                          )}

                          <div style={{ fontSize: '0.65rem', color: '#64748b', marginTop: '0.3rem', textAlign: 'right' }}>
                            ১ম বেঞ্চ
                          </div>
                        </div>
                      );
                    });
                  })}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. NOTICE BOARD SUMMARY (নোটিশ বোর্ড চার্ট)               */}
      {/* ========================================================= */}
      {activeTab === 'notice' && (
        <div id="printable-area" style={{ background: '#fff', padding: '2rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', borderBottom: '2px solid #0f172a', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              EXAMINATION SEAT ALLOCATION NOTICE
            </h1>
            <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#334155', marginTop: '0.25rem' }}>
              {examInfo.title || 'Seat Plan Notice'}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '0.5rem', fontSize: '0.9rem', color: '#64748b' }}>
              {examInfo.subject && <span><strong>Subject:</strong> {examInfo.subject}</span>}
              {examInfo.date && <span><strong>Date:</strong> {examInfo.date}</span>}
              <span><strong>Seating Rule:</strong> ১ জন / বেঞ্চ (Single Seat)</span>
            </div>
          </div>

          {/* Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', color: '#000' }}>
            <thead>
              <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #334155' }}>
                <th style={{ border: '1px solid #cbd5e1', padding: '0.75rem', textAlign: 'center' }}>রুম নম্বর</th>
                <th style={{ border: '1px solid #cbd5e1', padding: '0.75rem', textAlign: 'center' }}>লেআউট (Row × Col)</th>
                <th style={{ border: '1px solid #cbd5e1', padding: '0.75rem', textAlign: 'left' }}>অন্তর্ভুক্ত ক্লাসসমূহ</th>
                <th style={{ border: '1px solid #cbd5e1', padding: '0.75rem', textAlign: 'left' }}>শিক্ষার্থী আইডি / রোল রেঞ্জ</th>
                <th style={{ border: '1px solid #cbd5e1', padding: '0.75rem', textAlign: 'center' }}>মোট পরীক্ষার্থী</th>
              </tr>
            </thead>
            <tbody>
              {roomNames.map(roomName => {
                const roomStudents = assignments[roomName] || [];
                const roomObj = rooms.find(r => r.name === roomName);
                
                // Group students by class for roll breakdown
                const classGroups: Record<string, string[]> = {};
                roomStudents.forEach(s => {
                  if (!classGroups[s.className]) classGroups[s.className] = [];
                  classGroups[s.className].push(s.id);
                });

                const classSummaries = Object.entries(classGroups).map(([cls, ids]) => {
                  const sorted = [...ids].sort();
                  const range = sorted.length > 1 ? `${sorted[0]} - ${sorted[sorted.length - 1]}` : sorted[0];
                  return `${cls} (${ids.length} জন): [${range}]`;
                });

                return (
                  <tr key={roomName} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ border: '1px solid #cbd5e1', padding: '0.75rem', textAlign: 'center', fontWeight: 800, fontSize: '1.1rem' }}>
                      Room {roomName}
                    </td>
                    <td style={{ border: '1px solid #cbd5e1', padding: '0.75rem', textAlign: 'center' }}>
                      {roomObj?.rows || Math.ceil((roomObj?.capacity || 20) / 4)} × {roomObj?.cols || 4}
                    </td>
                    <td style={{ border: '1px solid #cbd5e1', padding: '0.75rem' }}>
                      {Object.keys(classGroups).join(', ')}
                    </td>
                    <td style={{ border: '1px solid #cbd5e1', padding: '0.75rem', fontSize: '0.85rem' }}>
                      {classSummaries.map((s, idx) => (
                        <div key={idx} style={{ marginBottom: '0.2rem' }}>{s}</div>
                      ))}
                    </td>
                    <td style={{ border: '1px solid #cbd5e1', padding: '0.75rem', textAlign: 'center', fontWeight: 700, fontSize: '1rem' }}>
                      {roomStudents.length} / {roomObj?.capacity || roomStudents.length}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Footer Signatures */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4rem', padding: '0 2rem' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ borderTop: '1px solid #000', width: '180px', paddingTop: '0.3rem', fontWeight: 600 }}>
                পরীক্ষা নিয়ন্ত্রক
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ borderTop: '1px solid #000', width: '180px', paddingTop: '0.3rem', fontWeight: 600 }}>
                অধ্যক্ষ / প্রধান শিক্ষক
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. ATTENDANCE SHEET (হাজিরা শিট)                          */}
      {/* ========================================================= */}
      {activeTab === 'attendance' && (
        <div id="printable-area">
          {roomNames.map((roomName, rIndex) => {
            const roomStudents = assignments[roomName] || [];
            const roomObj = rooms.find(r => r.name === roomName);

            return (
              <div 
                key={roomName} 
                className={rIndex > 0 ? "print-page-break" : ""} 
                style={{ background: '#fff', padding: '1.5rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', marginBottom: '2rem' }}
              >
                <div style={{ textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: '#000' }}>
                    EXAM ATTENDANCE / SIGNATURE SHEET
                  </h2>
                  <div style={{ fontSize: '1rem', fontWeight: 600, color: '#333', marginTop: '0.2rem' }}>
                    {examInfo.title || 'Exam Attendance Sheet'}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.85rem', color: '#444' }}>
                    <span><strong>Room:</strong> Room {roomName} ({roomStudents.length} Students)</span>
                    {examInfo.subject && <span><strong>Subject:</strong> {examInfo.subject}</span>}
                    {examInfo.date && <span><strong>Date:</strong> {examInfo.date}</span>}
                  </div>
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse', color: '#000', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '2px solid #000' }}>
                      <th style={{ border: '1px solid #94a3b8', padding: '0.5rem', width: '50px', textAlign: 'center' }}>SL</th>
                      <th style={{ border: '1px solid #94a3b8', padding: '0.5rem', width: '90px', textAlign: 'center' }}>Seat No</th>
                      <th style={{ border: '1px solid #94a3b8', padding: '0.5rem', width: '100px', textAlign: 'center' }}>Roll / ID</th>
                      <th style={{ border: '1px solid #94a3b8', padding: '0.5rem', textAlign: 'left' }}>Student Name</th>
                      <th style={{ border: '1px solid #94a3b8', padding: '0.5rem', width: '100px', textAlign: 'center' }}>Class</th>
                      <th style={{ border: '1px solid #94a3b8', padding: '0.5rem', width: '160px', textAlign: 'center' }}>Student Sign</th>
                      <th style={{ border: '1px solid #94a3b8', padding: '0.5rem', width: '120px', textAlign: 'center' }}>Script / Khata No</th>
                    </tr>
                  </thead>
                  <tbody>
                    {roomStudents.map((student, idx) => (
                      <tr key={student.id} style={{ height: '38px', borderBottom: '1px solid #cbd5e1' }}>
                        <td style={{ border: '1px solid #94a3b8', textAlign: 'center' }}>{idx + 1}</td>
                        <td style={{ border: '1px solid #94a3b8', textAlign: 'center', fontWeight: 700 }}>
                          {student.seatNumber || `Seat ${idx + 1}`}
                        </td>
                        <td style={{ border: '1px solid #94a3b8', textAlign: 'center', fontWeight: 600 }}>{student.id}</td>
                        <td style={{ border: '1px solid #94a3b8', paddingLeft: '0.5rem' }}>{student.name}</td>
                        <td style={{ border: '1px solid #94a3b8', textAlign: 'center' }}>{student.className}</td>
                        <td style={{ border: '1px solid #94a3b8' }}></td>
                        <td style={{ border: '1px solid #94a3b8' }}></td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3rem', padding: '0 1rem' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ borderTop: '1px solid #000', width: '200px', paddingTop: '0.3rem', fontSize: '0.85rem', fontWeight: 600 }}>
                      Invigilator 1 Signature
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ borderTop: '1px solid #000', width: '200px', paddingTop: '0.3rem', fontSize: '0.85rem', fontWeight: 600 }}>
                      Invigilator 2 Signature
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Global Print Styles */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 0;
          }
          body {
            background: white !important;
            margin: 0;
            padding: 0;
          }
          .print-page-break {
            page-break-before: always !important;
            break-before: page !important;
            padding: 0 !important;
            margin: 0 !important;
            height: 297mm;
          }
          .container {
            width: 210mm !important;
            height: auto !important;
            max-width: none !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .no-print {
            display: none !important;
          }
          #printable-area {
            width: 210mm;
            margin: 0 auto;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>
    </main>
  );
}
