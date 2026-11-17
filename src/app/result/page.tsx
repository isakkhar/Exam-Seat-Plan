'use client';

import React, { useState } from 'react';
import { useSeatPlan, AllocatedStudent, GALA_CLASSES } from '@/context/SeatPlanContext';
import * as XLSX from 'xlsx';
import { 
  Printer, 
  ChevronLeft, 
  LayoutGrid, 
  FileText, 
  CheckSquare, 
  Eye, 
  Download, 
  Search, 
  X,
  CreditCard,
  ArrowLeftRight,
  Sparkles,
  Award,
  Clock,
  ClipboardList,
  CheckCircle2
} from 'lucide-react';
import Link from 'next/link';

type ViewMode = 'slips' | 'admit' | 'visual' | 'notice' | 'attendance' | 'evaluation';

const CLASS_COLORS: Record<string, { bg: string; border: string; text: string; badge: string }> = {
  'Class 1': { bg: '#eff6ff', border: '#3b82f6', text: '#1d4ed8', badge: '#dbeafe' },
  'Class 2': { bg: '#f0fdfa', border: '#14b8a6', text: '#0f766e', badge: '#ccfbf1' },
  'Class 3': { bg: '#ecfdf5', border: '#10b981', text: '#047857', badge: '#d1fae5' },
  'Class 4': { bg: '#fefce8', border: '#eab308', text: '#a16207', badge: '#fef9c3' },
  'Class 5': { bg: '#fff7ed', border: '#f97316', text: '#c2410c', badge: '#ffedd5' },
  'Class 6': { bg: '#fdf2f8', border: '#ec4899', text: '#be185d', badge: '#fce7f3' },
  'Class 7': { bg: '#faf5ff', border: '#a855f7', text: '#7e22ce', badge: '#f3e8ff' },
  'Class 8': { bg: '#eef2ff', border: '#6366f1', text: '#4338ca', badge: '#e0e7ff' },
  'Class 9/10': { bg: '#f0f9ff', border: '#0284c7', text: '#0369a1', badge: '#e0f2fe' },
  'Class 11/12': { bg: '#f5f3ff', border: '#8b5cf6', text: '#6d28d9', badge: '#ede9fe' },
  'Polytechnic': { bg: '#fff1f2', border: '#f43f5e', text: '#be123c', badge: '#ffe4e6' },
  'Non-Engineering': { bg: '#f8fafc', border: '#64748b', text: '#334155', badge: '#f1f5f9' },
  'Engineering': { bg: '#fef2f2', border: '#ef4444', text: '#b91c1c', badge: '#fee2e2' },
};

const DEFAULT_COLOR = { bg: '#f8fafc', border: '#004b99', text: '#004b99', badge: '#e0f2fe' };

export default function ResultPage() {
  const { assignments, rooms, examInfo, swapSeats } = useSeatPlan();
  const [activeTab, setActiveTab] = useState<ViewMode>('slips');
  const [selectedRoomName, setSelectedRoomName] = useState<string>('101');
  const [visualSlotFilter, setVisualSlotFilter] = useState<'all' | 'Slot 1' | 'Slot 2'>('Slot 1');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Interactive seat swap state
  const [swapSelectedStudent, setSwapSelectedStudent] = useState<AllocatedStudent | null>(null);
  const [swapNotification, setSwapNotification] = useState<string | null>(null);

  const roomNames = Object.keys(assignments);

  const handlePrint = () => {
    window.print();
  };

  // Flatten all unique allocated students
  const allStudentsMap = new Map<string, AllocatedStudent>();
  Object.values(assignments).forEach(studentList => {
    studentList.forEach(s => {
      if (!allStudentsMap.has(s.id)) {
        allStudentsMap.set(s.id, s);
      }
    });
  });
  const allAllocatedStudents = Array.from(allStudentsMap.values());

  if (allAllocatedStudents.length === 0) {
    return (
      <div className="container" style={{ textAlign: 'center', paddingTop: '4rem' }}>
        <h2 style={{ color: 'var(--primary)' }}>কোন সিট প্ল্যান তৈরি করা হয়নি।</h2>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
          অনুগ্রহ করে ড্যাশবোর্ড থেকে "Load Season 3 Gala Preset" বাটনে ক্লিক করে সিট প্ল্যান জেনারেট করুন।
        </p>
        <Link href="/" className="button" style={{ marginTop: '1.5rem' }}>
          <ChevronLeft size={20} /> Back to Dashboard
        </Link>
      </div>
    );
  }

  // Chunk array into sizes of N (9 for slips, 2 for admits)
  const chunk = <T,>(arr: T[], size: number): T[][] => {
    const result: T[][] = [];
    for (let i = 0; i < arr.length; i += size) {
      result.push(arr.slice(i, i + size));
    }
    return result;
  };

  const getClassColor = (className: string) => {
    return CLASS_COLORS[className.trim()] || DEFAULT_COLOR;
  };

  const currentRoomObj = rooms.find(r => r.name === selectedRoomName) || rooms[0];

  // Search results
  const searchResults = searchQuery.trim()
    ? allAllocatedStudents.filter(s =>
        s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.className.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const handleSeatClick = (student: AllocatedStudent) => {
    if (!swapSelectedStudent) {
      setSwapSelectedStudent(student);
      setSwapNotification(`সিট সোয়াপের জন্য সিলেক্ট করা হয়েছে: ${student.name} (${student.id})। এবার অন্য কোনো সিটে ক্লিক করুন।`);
    } else {
      if (swapSelectedStudent.id === student.id) {
        setSwapSelectedStudent(null);
        setSwapNotification(null);
        return;
      }
      swapSeats(selectedRoomName, swapSelectedStudent.id, student.id);
      setSwapNotification(`সফলভাবে সিট সোয়াপ হয়েছে: ${swapSelectedStudent.name} ⇄ ${student.name}`);
      setSwapSelectedStudent(null);
      setTimeout(() => setSwapNotification(null), 4000);
    }
  };

  // Export Gala Data to Excel
  const handleExportExcel = () => {
    const excelData = allAllocatedStudents.map((s, idx) => ({
      'SL': idx + 1,
      'Candidate ID': s.id,
      'Candidate Name': s.name,
      'Category / Class': s.className,
      'Exam Group': s.group || 'Group A',
      'Written Hall': s.writtenRoom || 'Room 101',
      'Written Seat': s.writtenSeat || s.seatNumber,
      'Written Slot': s.writtenSlot || '09:00 AM - 09:50 AM',
      'Viva Venue': s.vivaRoom || 'Room 103',
      'Viva Board': s.vivaBoard || 'Board 1',
      'Viva Token': s.vivaToken || 1,
      'Viva Slot': s.vivaSlot || '10:05 AM - 10:55 AM',
    }));

    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Gala_Round_Allocations");
    XLSX.writeFile(wb, "ICT_Olympiad_Season3_Gala_SeatPlan.xlsx");
  };

  // Viva Boards grouping
  const vivaBoardsList = ['Board 1', 'Board 2', 'Board 3', 'Board 4', 'Board 5'];

  return (
    <main className="container" style={{ maxWidth: '1280px' }}>
      {/* Top Navbar & Controls */}
      <div className="no-print glass-card" style={{ marginBottom: '1.5rem', padding: '1rem 1.5rem', borderTop: '4px solid var(--primary)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link href="/" className="button button-secondary" style={{ background: 'transparent', border: '1.5px solid var(--primary)', color: 'var(--primary)', boxShadow: 'none', padding: '0.55rem 1rem' }}>
              <ChevronLeft size={18} /> Dashboard
            </Link>
            
            {/* Logo Badge in Navbar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#ffffff', padding: '0.3rem 0.6rem', borderRadius: '0.5rem', border: '1px solid var(--primary-border)' }}>
              <img src="/logo/logo.png" alt="Logo" style={{ height: '26px', width: 'auto' }} />
              <img src="/logo/tagline_1.png" alt="Tagline" style={{ height: '28px', width: 'auto', maxWidth: '85px' }} />
            </div>

            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--primary)' }}>
              মোট পরীক্ষার্থী: <span style={{ color: 'var(--accent)' }}>{allAllocatedStudents.length}</span> জন (১৩টি ক্লাস)
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <button 
              onClick={handleExportExcel} 
              className="button button-secondary" 
              style={{ background: '#0284c7', boxShadow: 'none', padding: '0.6rem 1.1rem' }}
            >
              <Download size={18} /> Export Excel
            </button>

            <button 
              onClick={handlePrint} 
              className="button"
              style={{ padding: '0.6rem 1.4rem', fontWeight: 800 }}
            >
              <Printer size={18} /> Print Now ({activeTab.toUpperCase()})
            </button>
          </div>
        </div>

        {/* View Mode Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem', borderTop: '1px dashed var(--primary-border)', paddingTop: '1rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveTab('slips')}
            style={{
              padding: '0.65rem 1.15rem',
              borderRadius: '0.5rem',
              fontWeight: 700,
              fontSize: '0.88rem',
              border: activeTab === 'slips' ? '2px solid var(--primary)' : '1px solid var(--primary-border)',
              background: activeTab === 'slips' ? 'var(--primary)' : 'var(--btn-unselected-bg)',
              color: activeTab === 'slips' ? '#fff' : 'var(--foreground)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem'
            }}
          >
            <LayoutGrid size={17} /> 🏷️ সিট স্লিপ (3x3 Grid)
          </button>

          <button
            onClick={() => setActiveTab('admit')}
            style={{
              padding: '0.65rem 1.15rem',
              borderRadius: '0.5rem',
              fontWeight: 700,
              fontSize: '0.88rem',
              border: activeTab === 'admit' ? '2px solid var(--primary)' : '1px solid var(--primary-border)',
              background: activeTab === 'admit' ? 'var(--primary)' : 'var(--btn-unselected-bg)',
              color: activeTab === 'admit' ? '#fff' : 'var(--foreground)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem'
            }}
          >
            <CreditCard size={17} /> 🪪 এডমিট কার্ড (Admit Card)
          </button>

          <button
            onClick={() => setActiveTab('visual')}
            style={{
              padding: '0.65rem 1.15rem',
              borderRadius: '0.5rem',
              fontWeight: 700,
              fontSize: '0.88rem',
              border: activeTab === 'visual' ? '2px solid var(--primary)' : '1px solid var(--primary-border)',
              background: activeTab === 'visual' ? 'var(--primary)' : 'var(--btn-unselected-bg)',
              color: activeTab === 'visual' ? '#fff' : 'var(--foreground)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem'
            }}
          >
            <Eye size={17} /> 🪑 রুম সিটিং গ্রিড (Visual Bench)
          </button>

          <button
            onClick={() => setActiveTab('notice')}
            style={{
              padding: '0.65rem 1.15rem',
              borderRadius: '0.5rem',
              fontWeight: 700,
              fontSize: '0.88rem',
              border: activeTab === 'notice' ? '2px solid var(--primary)' : '1px solid var(--primary-border)',
              background: activeTab === 'notice' ? 'var(--primary)' : 'var(--btn-unselected-bg)',
              color: activeTab === 'notice' ? '#fff' : 'var(--foreground)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem'
            }}
          >
            <FileText size={17} /> 🚪 দরজার নোটিশ চার্ট (Door Notice)
          </button>

          <button
            onClick={() => setActiveTab('attendance')}
            style={{
              padding: '0.65rem 1.15rem',
              borderRadius: '0.5rem',
              fontWeight: 700,
              fontSize: '0.88rem',
              border: activeTab === 'attendance' ? '2px solid var(--primary)' : '1px solid var(--primary-border)',
              background: activeTab === 'attendance' ? 'var(--primary)' : 'var(--btn-unselected-bg)',
              color: activeTab === 'attendance' ? '#fff' : 'var(--foreground)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem'
            }}
          >
            <CheckSquare size={17} /> 📝 উপস্থিতি তালিকা (Attendance)
          </button>

          <button
            onClick={() => setActiveTab('evaluation')}
            style={{
              padding: '0.65rem 1.15rem',
              borderRadius: '0.5rem',
              fontWeight: 700,
              fontSize: '0.88rem',
              border: activeTab === 'evaluation' ? '2px solid var(--primary)' : '1px solid var(--primary-border)',
              background: activeTab === 'evaluation' ? 'var(--primary)' : 'var(--btn-unselected-bg)',
              color: activeTab === 'evaluation' ? '#fff' : 'var(--foreground)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem'
            }}
          >
            <ClipboardList size={17} /> ⚖️ বিচারকদের ভাইভা শিট (Judges Sheet)
          </button>
        </div>

        {/* Search Bar */}
        <div style={{ marginTop: '1rem', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', background: 'var(--input-bg)', border: '1px solid var(--primary-border)', borderRadius: '0.5rem', padding: '0.4rem 0.85rem' }}>
            <Search size={18} color="var(--primary)" style={{ marginRight: '0.5rem' }} />
            <input 
              type="text" 
              placeholder="শিক্ষার্থীর নাম, রোল বা ক্লাস দিয়ে খুঁজুন..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', color: 'var(--foreground)', fontSize: '0.9rem' }}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={16} />
              </button>
            )}
          </div>

          {searchQuery && (
            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--card-bg)', border: '1.5px solid var(--primary)', borderRadius: '0.5rem', marginTop: '0.35rem', zIndex: 50, maxHeight: '280px', overflowY: 'auto', boxShadow: '0 8px 24px rgba(0,75,153,0.15)', padding: '0.5rem' }}>
              {searchResults.length === 0 ? (
                <div style={{ padding: '0.75rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  কোন পরীক্ষার্থী পাওয়া যায়নি
                </div>
              ) : (
                searchResults.map(s => (
                  <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.85rem', borderBottom: '1px solid var(--card-border)', fontSize: '0.85rem' }}>
                    <div>
                      <strong style={{ color: 'var(--primary)' }}>{s.name}</strong> ({s.className})
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Roll: {s.id} | {s.group}</div>
                    </div>
                    <div style={{ textAlign: 'right', fontSize: '0.78rem' }}>
                      <span style={{ color: 'var(--primary)', fontWeight: 700 }}>লিখিত: {s.writtenRoom} ({s.writtenSeat})</span><br />
                      <span style={{ color: 'var(--accent)', fontWeight: 700 }}>ভাইভা: {s.vivaRoom} ({s.vivaBoard} - #{s.vivaToken})</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Seat Swap Notification */}
      {swapNotification && (
        <div className="no-print" style={{ 
          background: 'linear-gradient(135deg, #004b99, #00a3e0)', 
          color: '#ffffff', 
          padding: '0.85rem 1.25rem', 
          borderRadius: '0.5rem', 
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 4px 12px rgba(0, 75, 153, 0.25)',
          fontWeight: 700,
          fontSize: '0.9rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <ArrowLeftRight size={20} color="#ff7a00" />
            <span>{swapNotification}</span>
          </div>
          <button 
            onClick={() => setSwapNotification(null)}
            style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* ========================================================= */}
      {/* 1. SEAT SLIPS (3x3 Grid with Cutting Margin)              */}
      {/* ========================================================= */}
      {activeTab === 'slips' && (
        <div id="printable-area">
          {(() => {
            const slipChunks = chunk(allAllocatedStudents, 9);

            return slipChunks.map((slipChunk, chunkIndex) => (
              <div 
                key={`slip-page-${chunkIndex}`} 
                className={chunkIndex > 0 ? "print-page-break" : ""} 
                style={{ marginBottom: '2rem' }}
              >
                <div style={{ padding: '0.5rem', border: '1px solid #dbeafe', borderRadius: '0.8rem', background: 'white' }}>
                  <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.85rem', color: 'var(--primary)', fontWeight: 800 }}>
                    <span>ICT Olympiad Bangladesh - Desk Slips (Page {chunkIndex + 1} of {slipChunks.length})</span>
                    <span>৯টি স্লিপ প্রতি A4 পাতা (কাটার জন্য ৭মিমি মার্জিন সহ)</span>
                  </div>
                  
                  {/* 3x3 Grid */}
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(3, 1fr)', 
                    gridTemplateRows: 'repeat(3, 1fr)',
                    gap: '7mm', 
                    width: '100%',
                    minHeight: '27.7cm',
                    boxSizing: 'border-box'
                  }}>
                    {slipChunk.map((student) => {
                      const colStyle = getClassColor(student.className);

                      return (
                        <div 
                          key={student.id} 
                          style={{ 
                            border: '1.8px solid #004b99', 
                            borderRadius: '0.45rem',
                            padding: '0.65rem 0.75rem', 
                            display: 'flex', 
                            flexDirection: 'column', 
                            justifyContent: 'space-between',
                            position: 'relative',
                            height: '8.8cm', 
                            backgroundColor: '#ffffff',
                            boxSizing: 'border-box',
                            boxShadow: '0 2px 6px rgba(0, 75, 153, 0.08)'
                          }}
                        >
                          {/* Card Header with Dual Logos */}
                          <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            borderBottom: '1.5px solid #004b99',
                            paddingBottom: '0.4rem',
                            marginBottom: '0.4rem'
                          }}>
                            <img src="/logo/logo.png" alt="Logo" style={{ height: '24px', width: 'auto', objectFit: 'contain' }} />
                            <div style={{ textAlign: 'center' }}>
                              <span style={{ fontSize: '0.62rem', fontWeight: 900, color: '#004b99', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                GALA ROUND 2026
                              </span>
                            </div>
                            <img src="/logo/tagline_1.png" alt="Tagline" style={{ height: '26px', width: 'auto', maxWidth: '80px', objectFit: 'contain' }} />
                          </div>

                          {/* Candidate Identity */}
                          <div style={{ 
                            background: '#f4f8fc', 
                            padding: '0.5rem 0.6rem', 
                            borderRadius: '0.35rem', 
                            border: '1px solid #bfdbfe',
                            marginBottom: '0.4rem'
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#004b99', background: '#dbeafe', padding: '0.1rem 0.35rem', borderRadius: '0.2rem' }}>
                                {student.group || 'Group A'}
                              </span>
                              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#004b99', fontFamily: 'monospace' }}>
                                {student.id}
                              </span>
                            </div>
                            <div style={{ fontSize: '1rem', fontWeight: 900, color: '#0b1a30', margin: '0.2rem 0', lineHeight: '1.2' }}>
                              {student.name}
                            </div>
                            <div style={{ fontSize: '0.78rem', fontWeight: 800, color: colStyle.text }}>
                              Category: {student.className}
                            </div>
                          </div>

                          {/* Parallel Exam Schedules */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                            {/* Written Box */}
                            <div style={{ 
                              border: '1px solid #bfdbfe', 
                              borderRadius: '0.3rem', 
                              padding: '0.35rem 0.5rem',
                              background: '#eff6ff',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}>
                              <div>
                                <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#004b99' }}>📝 লিখিত পরীক্ষা:</span>
                                <div style={{ fontSize: '0.62rem', color: '#475569' }}>{student.writtenSlot || '09:00 - 09:50 AM'}</div>
                              </div>
                              <div style={{ textAlign: 'right' }}>
                                <span style={{ fontSize: '0.72rem', fontWeight: 900, color: '#004b99' }}>{student.writtenRoom || 'Room 101'}</span>
                                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#0284c7' }}>{student.writtenSeat || student.seatNumber}</div>
                              </div>
                            </div>

                            {/* Viva Box */}
                            <div style={{ 
                              border: '1px solid #fed7aa', 
                              borderRadius: '0.3rem', 
                              padding: '0.35rem 0.5rem',
                              background: '#fff7ed',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}>
                              <div>
                                <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#c2410c' }}>🎤 ভাইভা পরীক্ষা:</span>
                                <div style={{ fontSize: '0.62rem', color: '#7c2d12' }}>{student.vivaSlot || '10:05 - 10:55 AM'}</div>
                              </div>
                              <div style={{ textAlign: 'right' }}>
                                <span style={{ fontSize: '0.72rem', fontWeight: 900, color: '#c2410c' }}>{student.vivaRoom || 'Room 103'}</span>
                                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#ea580c' }}>{student.vivaBoard} #{student.vivaToken}</div>
                              </div>
                            </div>
                          </div>

                          {/* Footer Cutting line note */}
                          <div style={{ textAlign: 'center', marginTop: '0.3rem', paddingTop: '0.2rem', borderTop: '1px dashed #cbd5e1', fontSize: '0.6rem', color: '#64748b' }}>
                            ICT Olympiad Bangladesh • Season 3
                          </div>
                        </div>
                      );
                    })}

                    {/* Fill empty cells to maintain grid */}
                    {Array.from({ length: 9 - slipChunk.length }).map((_, i) => (
                      <div key={`empty-${i}`} style={{ border: '1px dashed #e2e8f0', borderRadius: '0.45rem' }}></div>
                    ))}
                  </div>
                </div>
              </div>
            ));
          })()}
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. ADMIT CARD (Modern Gala Round Edition - 2 per Page)    */}
      {/* ========================================================= */}
      {activeTab === 'admit' && (
        <div id="printable-area">
          {(() => {
            const admitPairs = chunk(allAllocatedStudents, 2);

            return admitPairs.map((pair, pIdx) => (
              <div 
                key={`admit-page-${pIdx}`} 
                className={pIdx > 0 ? "print-page-break" : ""}
                style={{ marginBottom: '2.5rem' }}
              >
                <div style={{ maxWidth: '210mm', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.2cm', minHeight: '27.7cm', justifyContent: 'center' }}>
                  {pair.map((student) => {
                    const colStyle = getClassColor(student.className);

                    return (
                      <div 
                        key={student.id} 
                        style={{ 
                          border: '2.5px solid #004b99', 
                          borderRadius: '0.75rem', 
                          padding: '1.25rem 1.5rem', 
                          background: '#ffffff',
                          position: 'relative',
                          boxShadow: '0 4px 16px rgba(0, 75, 153, 0.12)',
                          boxSizing: 'border-box'
                        }}
                      >
                        {/* Top Decorative Color Bar */}
                        <div style={{ position: 'absolute', top: 0, left: '10%', right: '10%', height: '4px', background: 'linear-gradient(to right, #004b99, #00a3e0, #ff7a00)', borderBottomLeftRadius: '4px', borderBottomRightRadius: '4px' }} />

                        {/* Top Header with Dual Logos & Photo Box */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #004b99', paddingBottom: '0.75rem', marginBottom: '0.85rem', gap: '1rem' }}>
                          {/* Main Logo */}
                          <div style={{ background: '#ffffff', padding: '4px 8px', borderRadius: '6px', border: '1px solid #bfdbfe', flexShrink: 0 }}>
                            <img 
                              src="/logo/logo.png" 
                              alt="Logo" 
                              style={{ height: '42px', width: 'auto', maxWidth: '140px', objectFit: 'contain' }} 
                            />
                          </div>

                          {/* Center Institution Info */}
                          <div style={{ textAlign: 'center', flexGrow: 1 }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#004b99', margin: 0, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                              ICT OLYMPIAD BANGLADESH
                            </h2>
                            <div style={{ fontSize: '0.85rem', color: '#0284c7', fontWeight: 800, marginTop: '0.1rem' }}>
                              SEASON 3 GALA ROUND • GRAND FINALE 2026
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                              National Technology & Coding Olympiad
                            </div>
                          </div>

                          {/* Tagline Graphic */}
                          <div style={{ background: '#ffffff', padding: '3px 8px', borderRadius: '6px', border: '1px solid #bfdbfe', flexShrink: 0 }}>
                            <img 
                              src="/logo/tagline_1.png" 
                              alt="Tagline" 
                              style={{ height: '44px', width: 'auto', maxWidth: '120px', objectFit: 'contain' }} 
                            />
                          </div>

                          {/* Candidate Photo Box */}
                          <div style={{ 
                            width: '75px', 
                            height: '90px', 
                            border: '1.5px dashed #004b99', 
                            borderRadius: '0.35rem', 
                            display: 'flex', 
                            flexDirection: 'column',
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            textAlign: 'center',
                            fontSize: '0.62rem',
                            color: '#004b99',
                            background: '#f4f8fc',
                            padding: '0.2rem',
                            flexShrink: 0
                          }}>
                            <span>Affix Passport Size Photo</span>
                          </div>
                        </div>

                        {/* Admit Card Badge Ribbon */}
                        <div style={{ textAlign: 'center', marginTop: '-1.45rem', marginBottom: '0.75rem' }}>
                          <span style={{ 
                            background: 'linear-gradient(135deg, #004b99, #0284c7)', 
                            color: '#ffffff', 
                            padding: '0.3rem 1.6rem', 
                            borderRadius: '1rem', 
                            fontWeight: 900, 
                            fontSize: '0.85rem', 
                            letterSpacing: '0.6px', 
                            boxShadow: '0 2px 6px rgba(0,75,153,0.3)',
                            border: '1px solid #ffffff'
                          }}>
                            OFFICIAL ADMIT CARD • প্রবেশপত্র
                          </span>
                        </div>

                        {/* Candidate Details Grid */}
                        <div style={{ 
                          display: 'grid', 
                          gridTemplateColumns: 'repeat(4, 1fr)', 
                          gap: '0.6rem', 
                          background: '#f4f8fc', 
                          padding: '0.85rem', 
                          borderRadius: '0.5rem', 
                          border: '1px solid #bfdbfe', 
                          marginBottom: '0.75rem', 
                          fontSize: '0.88rem' 
                        }}>
                          <div style={{ gridColumn: 'span 2' }}>
                            <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>Candidate Full Name:</span>
                            <strong style={{ color: '#0b1a30', fontSize: '1rem' }}>{student.name}</strong>
                          </div>
                          <div>
                            <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>Candidate ID / Roll:</span>
                            <strong style={{ color: '#004b99', fontFamily: 'monospace', fontSize: '1rem' }}>{student.id}</strong>
                          </div>
                          <div>
                            <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>Exam Group:</span>
                            <strong style={{ color: '#ff7a00', fontSize: '0.95rem' }}>{student.group || 'Group A'}</strong>
                          </div>
                          <div style={{ gridColumn: 'span 2' }}>
                            <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>Category / Class:</span>
                            <span style={{ color: colStyle.text, fontWeight: 800 }}>{student.className}</span>
                          </div>
                          <div style={{ gridColumn: 'span 2' }}>
                            <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>Evaluation Track:</span>
                            <strong style={{ color: '#0b1a30' }}>ICT Olympiad Season 3 Gala Final</strong>
                          </div>
                        </div>

                        {/* Parallel Exam Schedule Matrix Box */}
                        <div style={{ marginBottom: '0.75rem' }}>
                          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', margin: 0 }}>
                            <thead>
                              <tr style={{ background: '#004b99', color: '#ffffff' }}>
                                <th style={{ padding: '0.4rem 0.6rem', border: '1px solid #004b99', textAlign: 'left', color: '#fff' }}>পরীক্ষার ধাপ (Stage)</th>
                                <th style={{ padding: '0.4rem 0.6rem', border: '1px solid #004b99', textAlign: 'center', color: '#fff' }}>ভেন্যু / হল</th>
                                <th style={{ padding: '0.4rem 0.6rem', border: '1px solid #004b99', textAlign: 'center', color: '#fff' }}>সিট / বোর্ড নং</th>
                                <th style={{ padding: '0.4rem 0.6rem', border: '1px solid #004b99', textAlign: 'center', color: '#fff' }}>উপস্থিতির সময়</th>
                                <th style={{ padding: '0.4rem 0.6rem', border: '1px solid #004b99', textAlign: 'center', color: '#fff' }}>পরীক্ষার সময়কাল</th>
                              </tr>
                            </thead>
                            <tbody>
                              {/* Written Row */}
                              <tr style={{ background: '#eff6ff' }}>
                                <td style={{ padding: '0.45rem 0.6rem', border: '1px solid #bfdbfe', fontWeight: 800, color: '#004b99' }}>
                                  📝 লিখিত পরীক্ষা (Written Exam)
                                </td>
                                <td style={{ padding: '0.45rem 0.6rem', border: '1px solid #bfdbfe', textAlign: 'center', fontWeight: 800, color: '#004b99' }}>
                                  {student.writtenRoom || 'Room 101'}
                                </td>
                                <td style={{ padding: '0.45rem 0.6rem', border: '1px solid #bfdbfe', textAlign: 'center', fontWeight: 800, color: '#0284c7' }}>
                                  {student.writtenSeat || student.seatNumber}
                                </td>
                                <td style={{ padding: '0.45rem 0.6rem', border: '1px solid #bfdbfe', textAlign: 'center' }}>
                                  {student.group === 'Group A' ? '০৮:৪৫ AM' : '০৯:৫০ AM'}
                                </td>
                                <td style={{ padding: '0.45rem 0.6rem', border: '1px solid #bfdbfe', textAlign: 'center', fontWeight: 800 }}>
                                  {student.writtenSlot || '09:00 AM - 09:50 AM'}
                                </td>
                              </tr>

                              {/* Viva Row */}
                              <tr style={{ background: '#fff7ed' }}>
                                <td style={{ padding: '0.45rem 0.6rem', border: '1px solid #fed7aa', fontWeight: 800, color: '#c2410c' }}>
                                  🎤 মৌখিক / ভাইভা (Viva Voce)
                                </td>
                                <td style={{ padding: '0.45rem 0.6rem', border: '1px solid #fed7aa', textAlign: 'center', fontWeight: 800, color: '#c2410c' }}>
                                  {student.vivaRoom || 'Room 103'}
                                </td>
                                <td style={{ padding: '0.45rem 0.6rem', border: '1px solid #fed7aa', textAlign: 'center', fontWeight: 800, color: '#ea580c' }}>
                                  {student.vivaBoard} (টোকেন #{student.vivaToken})
                                </td>
                                <td style={{ padding: '0.45rem 0.6rem', border: '1px solid #fed7aa', textAlign: 'center' }}>
                                  {student.group === 'Group A' ? '০৯:৫৫ AM' : '০৮:৪৫ AM'}
                                </td>
                                <td style={{ padding: '0.45rem 0.6rem', border: '1px solid #fed7aa', textAlign: 'center', fontWeight: 800 }}>
                                  {student.vivaSlot || '10:05 AM - 10:55 AM'}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>

                        {/* Instructions */}
                        <div style={{ fontSize: '0.72rem', color: '#475569', marginBottom: '1.25rem', lineHeight: '1.35', background: '#f8fafc', padding: '0.45rem 0.65rem', borderRadius: '0.35rem', border: '1px solid #e2e8f0' }}>
                          <strong>পরীক্ষার্থীর জরুরি নির্দেশনাবলী:</strong> {examInfo.instructions || '১. প্রবেশপত্র ছাড়া পরীক্ষা কক্ষে প্রবেশ নিষেধ। ২. লিখিত পরীক্ষা ও ভাইভায় নিজ নিজ সময়ে উপস্থিত থাকতে হবে। ৩. মোবাইল বা কোনো ডিজিটাল ডিভাইস হলে আনা সম্পূর্ণ নিষিদ্ধ।'}
                        </div>

                        {/* Signatures */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: '0.75rem', borderTop: '1px dashed #cbd5e1' }}>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ borderTop: '1.5px solid #004b99', width: '160px', paddingTop: '0.2rem', fontSize: '0.75rem', fontWeight: 700, color: '#004b99' }}>
                              ক্যান্ডিডেট স্বাক্ষর
                            </div>
                          </div>

                          <div style={{ textAlign: 'center' }}>
                            <div style={{ borderTop: '1.5px solid #004b99', width: '180px', paddingTop: '0.2rem', fontSize: '0.75rem', fontWeight: 700, color: '#004b99' }}>
                              আহ্বায়ক, আইসিটি অলিম্পিয়াড
                            </div>
                          </div>

                          <div style={{ textAlign: 'center' }}>
                            <div style={{ borderTop: '1.5px solid #004b99', width: '180px', paddingTop: '0.2rem', fontSize: '0.75rem', fontWeight: 700, color: '#004b99' }}>
                              পরীক্ষা নিয়ন্ত্রক
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ));
          })()}
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. VISUAL BENCH GRID (with Interactive Seat Swapping)     */}
      {/* ========================================================= */}
      {activeTab === 'visual' && (
        <div className="glass-card" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, color: 'var(--primary)' }}>
                <Eye size={24} color="var(--primary)" /> লিখিত পরীক্ষা রুমের লাইভ সিট গ্রিড (Room Layout)
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0.2rem 0 0 0' }}>
                শিক্ষার্থীর কার্ডে ক্লিক করে সহজেই একে অপরের সিট অদলবদল (Swap) করুন।
              </p>
            </div>

            {/* Room & Slot Selector */}
            <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', gap: '0.35rem' }}>
                {['101', '102'].map(rName => (
                  <button
                    key={rName}
                    onClick={() => setSelectedRoomName(rName)}
                    style={{
                      padding: '0.45rem 0.85rem',
                      borderRadius: '0.4rem',
                      fontWeight: 800,
                      fontSize: '0.82rem',
                      border: selectedRoomName === rName ? '2px solid var(--primary)' : '1px solid var(--primary-border)',
                      background: selectedRoomName === rName ? 'var(--primary)' : 'var(--btn-unselected-bg)',
                      color: selectedRoomName === rName ? '#fff' : 'var(--foreground)',
                      cursor: 'pointer'
                    }}
                  >
                    Room {rName}
                  </button>
                ))}
              </div>

              {/* Slot Filter */}
              <div style={{ display: 'flex', gap: '0.35rem', background: 'var(--primary-tint)', padding: '0.2rem', borderRadius: '0.45rem', border: '1px solid var(--primary-border)' }}>
                {(['Slot 1', 'Slot 2'] as const).map(slotName => (
                  <button
                    key={slotName}
                    onClick={() => setVisualSlotFilter(slotName)}
                    style={{
                      padding: '0.35rem 0.65rem',
                      borderRadius: '0.3rem',
                      fontWeight: 700,
                      fontSize: '0.78rem',
                      border: 'none',
                      background: visualSlotFilter === slotName ? 'var(--primary)' : 'transparent',
                      color: visualSlotFilter === slotName ? '#fff' : 'var(--foreground)',
                      cursor: 'pointer'
                    }}
                  >
                    {slotName} ({slotName === 'Slot 1' ? 'Group A: 9:00-9:50 AM' : 'Group B: 10:05-10:55 AM'})
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Teacher's Podium */}
          <div style={{ 
            textAlign: 'center', 
            background: 'linear-gradient(135deg, #004b99, #0284c7)', 
            color: '#fff', 
            padding: '0.55rem', 
            borderRadius: '0.4rem', 
            fontWeight: 800, 
            letterSpacing: '1px', 
            marginBottom: '1.5rem',
            width: '60%',
            margin: '0 auto 1.5rem auto',
            boxShadow: '0 2px 6px rgba(0, 75, 153, 0.25)'
          }}>
            🎓 BLACKBOARD / TEACHER&apos;S PODIUM (সামনের দিক)
          </div>

          {/* Grid Layout */}
          {(() => {
            const rawRoomStudents = assignments[selectedRoomName] || [];
            const roomStudents = rawRoomStudents.filter(s => 
              visualSlotFilter === 'all' || (s.writtenSlot && s.writtenSlot.includes(visualSlotFilter))
            );

            const rRows = currentRoomObj?.rows || 8;
            const rCols = currentRoomObj?.cols || 5;

            return (
              <div style={{ overflowX: 'auto', padding: '1rem 0' }}>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: `repeat(${rCols}, minmax(160px, 1fr))`, 
                  gap: '0.85rem',
                  maxWidth: '1050px',
                  margin: '0 auto'
                }}>
                  {Array.from({ length: rRows }).map((_, rIdx) => {
                    const rowNumber = rIdx + 1;
                    return Array.from({ length: rCols }).map((_, cIdx) => {
                      const colNumber = cIdx + 1;
                      const seatCode = `R${rowNumber}-C${colNumber}`;
                      
                      const student = roomStudents.find(s => 
                        s.writtenSeat === seatCode || s.seatNumber?.startsWith(seatCode) || 
                        (s.row === rowNumber && s.col === colNumber)
                      );

                      const colStyle = student ? getClassColor(student.className) : null;
                      const isSelectedForSwap = swapSelectedStudent?.id === student?.id && student !== undefined;

                      return (
                        <div 
                          key={seatCode}
                          onClick={() => student && handleSeatClick(student)}
                          style={{
                            border: isSelectedForSwap 
                              ? '3px solid #ff7a00' 
                              : student 
                              ? `2px solid ${colStyle?.border}` 
                              : '1.5px dashed var(--primary-border)',
                            background: isSelectedForSwap ? '#fff7ed' : student ? colStyle?.bg : 'var(--glass-bg)',
                            borderRadius: '0.5rem',
                            padding: '0.75rem',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            minHeight: '110px',
                            boxShadow: isSelectedForSwap ? '0 0 10px rgba(255, 122, 0, 0.5)' : student ? '0 2px 6px rgba(0,75,153,0.06)' : 'none',
                            position: 'relative',
                            cursor: student ? 'pointer' : 'default',
                            transform: isSelectedForSwap ? 'scale(1.02)' : 'none',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          {/* Seat identifier */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--primary)', background: '#fff', padding: '0.1rem 0.4rem', borderRadius: '0.2rem', border: '1px solid var(--primary-border)' }}>
                              {seatCode}
                            </span>
                            {student && (
                              <span style={{ fontSize: '0.7rem', fontWeight: 800, color: colStyle?.text }}>
                                {student.className}
                              </span>
                            )}
                          </div>

                          {student ? (
                            <div>
                              <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0b1a30', lineHeight: '1.2', marginBottom: '0.2rem' }}>
                                {student.name}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: '#475569' }}>
                                Roll: <strong>{student.id}</strong> ({student.group})
                              </div>
                            </div>
                          ) : (
                            <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.75rem', margin: 'auto' }}>
                              (ফাঁকা সিট)
                            </div>
                          )}

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.35rem', paddingTop: '0.25rem', borderTop: '1px dashed rgba(0,0,0,0.08)' }}>
                            <span style={{ fontSize: '0.62rem', color: '#64748b' }}>১ জন/চেয়ার</span>
                            {student && (
                              <span style={{ fontSize: '0.62rem', color: 'var(--primary)', fontWeight: 700 }}>
                                ⇄ সোয়াপ
                              </span>
                            )}
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
      {/* 4. NOTICE BOARD / DOOR NOTICES                            */}
      {/* ========================================================= */}
      {activeTab === 'notice' && (
        <div id="printable-area" style={{ background: '#fff', padding: '2rem', borderRadius: '0.5rem', border: '2px solid #004b99' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '3px solid #004b99', paddingBottom: '1rem', marginBottom: '1.5rem', gap: '1rem' }}>
            <img src="/logo/logo.png" alt="Logo" style={{ height: '42px', width: 'auto' }} />
            <div style={{ textAlign: 'center', flexGrow: 1 }}>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#004b99', margin: 0 }}>
                ICT OLYMPIAD BANGLADESH - SEASON 3
              </h1>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ff7a00' }}>
                GALA ROUND GRAND FINALE • DOOR NOTICE & SEATING DIRECTORY
              </div>
              <div style={{ fontSize: '0.85rem', color: '#475569' }}>
                পরীক্ষার সময়কাল: সকাল ০৯:০০ AM - ১১:০০ AM (প্যারালাল সেশন)
              </div>
            </div>
            <img src="/logo/tagline_1.png" alt="Tagline" style={{ height: '45px', width: 'auto', maxWidth: '130px' }} />
          </div>

          {/* Section 1: Written Examination Halls */}
          <h3 style={{ color: '#004b99', borderBottom: '2px solid #004b99', paddingBottom: '0.4rem', marginBottom: '1rem' }}>
            📝 লিখিত পরীক্ষা হল বণ্টন (Written Examination Halls)
          </h3>

          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2rem', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ background: '#004b99', color: '#fff' }}>
                <th style={{ padding: '0.6rem', border: '1px solid #bfdbfe', textAlign: 'center', color: '#fff' }}>রুম নং</th>
                <th style={{ padding: '0.6rem', border: '1px solid #bfdbfe', textAlign: 'center', color: '#fff' }}>স্লট ১ (০৯:০০ - ০৯:৫০ AM)</th>
                <th style={{ padding: '0.6rem', border: '1px solid #bfdbfe', textAlign: 'center', color: '#fff' }}>স্লট ২ (১০:০৫ - ১০:৫৫ AM)</th>
                <th style={{ padding: '0.6rem', border: '1px solid #bfdbfe', textAlign: 'center', color: '#fff' }}>মোট আসন</th>
              </tr>
            </thead>
            <tbody>
              {['101', '102'].map(rName => {
                const rStudents = assignments[rName] || [];
                const slot1Students = rStudents.filter(s => s.group === 'Group A');
                const slot2Students = rStudents.filter(s => s.group === 'Group B');

                return (
                  <tr key={rName}>
                    <td style={{ border: '1px solid #bfdbfe', padding: '0.75rem', textAlign: 'center', fontWeight: 900, fontSize: '1.1rem', color: '#004b99' }}>
                      Room {rName}
                    </td>
                    <td style={{ border: '1px solid #bfdbfe', padding: '0.75rem' }}>
                      <strong>Group A (৩৫ জন):</strong> Class 1 to 7<br />
                      <span style={{ fontSize: '0.78rem', color: '#475569' }}>
                        Roll: {slot1Students[0]?.id} - {slot1Students[slot1Students.length - 1]?.id}
                      </span>
                    </td>
                    <td style={{ border: '1px solid #bfdbfe', padding: '0.75rem' }}>
                      <strong>Group B (৩০ জন):</strong> Class 8 to Engineering<br />
                      <span style={{ fontSize: '0.78rem', color: '#475569' }}>
                        Roll: {slot2Students[0]?.id} - {slot2Students[slot2Students.length - 1]?.id}
                      </span>
                    </td>
                    <td style={{ border: '1px solid #bfdbfe', padding: '0.75rem', textAlign: 'center', fontWeight: 800 }}>
                      ৪০টি সিঙ্গেল চেয়ার
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Section 2: Viva Voce Boards */}
          <h3 style={{ color: '#c2410c', borderBottom: '2px solid #ea580c', paddingBottom: '0.4rem', marginBottom: '1rem' }}>
            🎤 মৌখিক / ভাইভা বোর্ড বণ্টন (Viva Voce Boards)
          </h3>

          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2rem', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ background: '#ea580c', color: '#fff' }}>
                <th style={{ padding: '0.6rem', border: '1px solid #fed7aa', textAlign: 'center', color: '#fff' }}>ভাইভা বোর্ড</th>
                <th style={{ padding: '0.6rem', border: '1px solid #fed7aa', textAlign: 'center', color: '#fff' }}>রুম নং</th>
                <th style={{ padding: '0.6rem', border: '1px solid #fed7aa', textAlign: 'center', color: '#fff' }}>স্লট ১ (০৯:০০ - ০৯:৫০ AM)</th>
                <th style={{ padding: '0.6rem', border: '1px solid #fed7aa', textAlign: 'center', color: '#fff' }}>স্লট ২ (১০:০৫ - ১০:৫৫ AM)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ border: '1px solid #fed7aa', padding: '0.65rem', fontWeight: 800, textAlign: 'center' }}>Board 1</td>
                <td style={{ border: '1px solid #fed7aa', padding: '0.65rem', fontWeight: 800, textAlign: 'center' }}>Room 103</td>
                <td style={{ border: '1px solid #fed7aa', padding: '0.65rem' }}>Class 8 (১০ জন)</td>
                <td style={{ border: '1px solid #fed7aa', padding: '0.65rem' }}>Class 1 & Class 2 (২০ জন)</td>
              </tr>
              <tr>
                <td style={{ border: '1px solid #fed7aa', padding: '0.65rem', fontWeight: 800, textAlign: 'center' }}>Board 2</td>
                <td style={{ border: '1px solid #fed7aa', padding: '0.65rem', fontWeight: 800, textAlign: 'center' }}>Room 103</td>
                <td style={{ border: '1px solid #fed7aa', padding: '0.65rem' }}>Class 9/10 (১০ জন)</td>
                <td style={{ border: '1px solid #fed7aa', padding: '0.65rem' }}>Class 3 & Class 4 (২০ জন)</td>
              </tr>
              <tr>
                <td style={{ border: '1px solid #fed7aa', padding: '0.65rem', fontWeight: 800, textAlign: 'center' }}>Board 3</td>
                <td style={{ border: '1px solid #fed7aa', padding: '0.65rem', fontWeight: 800, textAlign: 'center' }}>Room 104</td>
                <td style={{ border: '1px solid #fed7aa', padding: '0.65rem' }}>Class 11/12 (১০ জন)</td>
                <td style={{ border: '1px solid #fed7aa', padding: '0.65rem' }}>Class 5 (১০ জন)</td>
              </tr>
              <tr>
                <td style={{ border: '1px solid #fed7aa', padding: '0.65rem', fontWeight: 800, textAlign: 'center' }}>Board 4</td>
                <td style={{ border: '1px solid #fed7aa', padding: '0.65rem', fontWeight: 800, textAlign: 'center' }}>Room 104</td>
                <td style={{ border: '1px solid #fed7aa', padding: '0.65rem' }}>Polytechnic (১০ জন)</td>
                <td style={{ border: '1px solid #fed7aa', padding: '0.65rem' }}>Class 6 (১০ জন)</td>
              </tr>
              <tr>
                <td style={{ border: '1px solid #fed7aa', padding: '0.65rem', fontWeight: 800, textAlign: 'center' }}>Board 5</td>
                <td style={{ border: '1px solid #fed7aa', padding: '0.65rem', fontWeight: 800, textAlign: 'center' }}>Room 105</td>
                <td style={{ border: '1px solid #fed7aa', padding: '0.65rem' }}>Non-Eng & Engineering (২০ জন)</td>
                <td style={{ border: '1px solid #fed7aa', padding: '0.65rem' }}>Class 7 (১০ জন)</td>
              </tr>
            </tbody>
          </table>

          {/* Footer Signatures */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3.5rem', padding: '0 2rem' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ borderTop: '1.5px solid #000', width: '180px', paddingTop: '0.3rem', fontWeight: 700 }}>
                পরীক্ষা নিয়ন্ত্রক
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ borderTop: '1.5px solid #000', width: '180px', paddingTop: '0.3rem', fontWeight: 700 }}>
                কনভেনর, আইসিটি অলিম্পিয়াড
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. ATTENDANCE SHEET                                       */}
      {/* ========================================================= */}
      {activeTab === 'attendance' && (
        <div id="printable-area">
          {['101', '102'].map((roomName, rIndex) => {
            const roomStudents = assignments[roomName] || [];

            return (
              <div 
                key={`att-${roomName}`} 
                className={rIndex > 0 ? "print-page-break" : ""} 
                style={{ background: '#fff', padding: '1.5rem', borderRadius: '0.5rem', border: '2px solid #004b99', marginBottom: '2rem' }}
              >
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2.5px solid #004b99', paddingBottom: '0.85rem', marginBottom: '1rem', gap: '1rem' }}>
                  <img src="/logo/logo.png" alt="Logo" style={{ height: '36px', width: 'auto' }} />
                  <div style={{ textAlign: 'center', flexGrow: 1 }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#004b99', textTransform: 'uppercase' }}>
                      ICT OLYMPIAD BANGLADESH - SEASON 3
                    </div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0.15rem 0', color: '#0b1a30' }}>
                      WRITTEN EXAM ATTENDANCE & SIGNATURE SHEET
                    </h2>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0284c7' }}>
                      GALA ROUND 2026 • ROOM {roomName}
                    </div>
                  </div>
                  <img src="/logo/tagline_1.png" alt="Tagline" style={{ height: '40px', width: 'auto', maxWidth: '110px' }} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.82rem', color: '#444' }}>
                  <span><strong>Room:</strong> Room {roomName}</span>
                  <span><strong>Total Candidates:</strong> {roomStudents.length} Students</span>
                  <span><strong>Date:</strong> Saturday, 9:00 - 11:00 AM</span>
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse', color: '#000', fontSize: '0.82rem' }}>
                  <thead>
                    <tr style={{ background: '#eff6ff', borderBottom: '2px solid #004b99' }}>
                      <th style={{ border: '1px solid #bfdbfe', padding: '0.45rem', width: '40px', textAlign: 'center', color: '#004b99' }}>SL</th>
                      <th style={{ border: '1px solid #bfdbfe', padding: '0.45rem', width: '85px', textAlign: 'center', color: '#004b99' }}>Seat No</th>
                      <th style={{ border: '1px solid #bfdbfe', padding: '0.45rem', width: '90px', textAlign: 'center', color: '#004b99' }}>Roll / ID</th>
                      <th style={{ border: '1px solid #bfdbfe', padding: '0.45rem', textAlign: 'left', color: '#004b99' }}>Student Name</th>
                      <th style={{ border: '1px solid #bfdbfe', padding: '0.45rem', width: '90px', textAlign: 'center', color: '#004b99' }}>Class</th>
                      <th style={{ border: '1px solid #bfdbfe', padding: '0.45rem', width: '70px', textAlign: 'center', color: '#004b99' }}>Group</th>
                      <th style={{ border: '1px solid #bfdbfe', padding: '0.45rem', width: '140px', textAlign: 'center', color: '#004b99' }}>Student Signature</th>
                      <th style={{ border: '1px solid #bfdbfe', padding: '0.45rem', width: '100px', textAlign: 'center', color: '#004b99' }}>Script / Khata No</th>
                    </tr>
                  </thead>
                  <tbody>
                    {roomStudents.map((student, idx) => (
                      <tr key={student.id} style={{ height: '34px', borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ border: '1px solid #bfdbfe', textAlign: 'center' }}>{idx + 1}</td>
                        <td style={{ border: '1px solid #bfdbfe', textAlign: 'center', fontWeight: 800, color: '#004b99' }}>
                          {student.writtenSeat || student.seatNumber}
                        </td>
                        <td style={{ border: '1px solid #bfdbfe', textAlign: 'center', fontWeight: 700 }}>{student.id}</td>
                        <td style={{ border: '1px solid #bfdbfe', paddingLeft: '0.5rem' }}>{student.name}</td>
                        <td style={{ border: '1px solid #bfdbfe', textAlign: 'center' }}>{student.className}</td>
                        <td style={{ border: '1px solid #bfdbfe', textAlign: 'center', fontWeight: 700 }}>{student.group}</td>
                        <td style={{ border: '1px solid #bfdbfe' }}></td>
                        <td style={{ border: '1px solid #bfdbfe' }}></td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3rem', padding: '0 1rem' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ borderTop: '1.5px solid #000', width: '180px', paddingTop: '0.25rem', fontSize: '0.8rem', fontWeight: 700 }}>
                      Invigilator 1 Signature
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ borderTop: '1.5px solid #000', width: '180px', paddingTop: '0.25rem', fontSize: '0.8rem', fontWeight: 700 }}>
                      Invigilator 2 Signature
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================= */}
      {/* 6. JUDGES VIVA EVALUATION SHEET                           */}
      {/* ========================================================= */}
      {activeTab === 'evaluation' && (
        <div id="printable-area">
          {vivaBoardsList.map((boardName, bIdx) => {
            const boardCandidates = allAllocatedStudents.filter(s => s.vivaBoard?.includes(boardName));

            return (
              <div 
                key={boardName}
                className={bIdx > 0 ? "print-page-break" : ""}
                style={{ background: '#fff', padding: '1.5rem', borderRadius: '0.5rem', border: '2px solid #ea580c', marginBottom: '2rem' }}
              >
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2.5px solid #ea580c', paddingBottom: '0.85rem', marginBottom: '1rem', gap: '1rem' }}>
                  <img src="/logo/logo.png" alt="Logo" style={{ height: '36px', width: 'auto' }} />
                  <div style={{ textAlign: 'center', flexGrow: 1 }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#004b99', textTransform: 'uppercase' }}>
                      ICT OLYMPIAD BANGLADESH - SEASON 3
                    </div>
                    <h2 style={{ fontSize: '1.3rem', fontWeight: 900, margin: '0.15rem 0', color: '#c2410c' }}>
                      VIVA VOCE EVALUATION & SCORE SHEET
                    </h2>
                    <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0b1a30' }}>
                      {boardName} ({boardCandidates[0]?.vivaRoom || 'Room 103'}) • Total Candidates: {boardCandidates.length}
                    </div>
                  </div>
                  <img src="/logo/tagline_1.png" alt="Tagline" style={{ height: '40px', width: 'auto', maxWidth: '110px' }} />
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse', color: '#000', fontSize: '0.82rem' }}>
                  <thead>
                    <tr style={{ background: '#fff7ed', borderBottom: '2px solid #ea580c' }}>
                      <th style={{ border: '1px solid #fed7aa', padding: '0.45rem', width: '45px', textAlign: 'center', color: '#c2410c' }}>Token</th>
                      <th style={{ border: '1px solid #fed7aa', padding: '0.45rem', width: '90px', textAlign: 'center', color: '#c2410c' }}>Roll ID</th>
                      <th style={{ border: '1px solid #fed7aa', padding: '0.45rem', textAlign: 'left', color: '#c2410c' }}>Candidate Name</th>
                      <th style={{ border: '1px solid #fed7aa', padding: '0.45rem', width: '90px', textAlign: 'center', color: '#c2410c' }}>Category</th>
                      <th style={{ border: '1px solid #fed7aa', padding: '0.45rem', width: '90px', textAlign: 'center', color: '#c2410c' }}>Slot Time</th>
                      <th style={{ border: '1px solid #fed7aa', padding: '0.45rem', width: '70px', textAlign: 'center', color: '#c2410c' }}>Tech (15)</th>
                      <th style={{ border: '1px solid #fed7aa', padding: '0.45rem', width: '70px', textAlign: 'center', color: '#c2410c' }}>Pres (10)</th>
                      <th style={{ border: '1px solid #fed7aa', padding: '0.45rem', width: '70px', textAlign: 'center', color: '#c2410c' }}>Prob (15)</th>
                      <th style={{ border: '1px solid #fed7aa', padding: '0.45rem', width: '70px', textAlign: 'center', color: '#c2410c' }}>Total (40)</th>
                      <th style={{ border: '1px solid #fed7aa', padding: '0.45rem', width: '100px', textAlign: 'center', color: '#c2410c' }}>Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {boardCandidates.map((student) => (
                      <tr key={student.id} style={{ height: '34px', borderBottom: '1px solid #fed7aa' }}>
                        <td style={{ border: '1px solid #fed7aa', textAlign: 'center', fontWeight: 900, color: '#ea580c' }}>
                          #{student.vivaToken}
                        </td>
                        <td style={{ border: '1px solid #fed7aa', textAlign: 'center', fontWeight: 700 }}>{student.id}</td>
                        <td style={{ border: '1px solid #fed7aa', paddingLeft: '0.5rem' }}>{student.name}</td>
                        <td style={{ border: '1px solid #fed7aa', textAlign: 'center' }}>{student.className}</td>
                        <td style={{ border: '1px solid #fed7aa', textAlign: 'center', fontSize: '0.72rem' }}>
                          {student.group === 'Group B' ? 'Slot 1' : 'Slot 2'}
                        </td>
                        <td style={{ border: '1px solid #fed7aa' }}></td>
                        <td style={{ border: '1px solid #fed7aa' }}></td>
                        <td style={{ border: '1px solid #fed7aa' }}></td>
                        <td style={{ border: '1px solid #fed7aa' }}></td>
                        <td style={{ border: '1px solid #fed7aa' }}></td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3.5rem', padding: '0 1rem' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ borderTop: '1.5px solid #000', width: '180px', paddingTop: '0.25rem', fontSize: '0.8rem', fontWeight: 700 }}>
                      Judge 1 Signature
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ borderTop: '1.5px solid #000', width: '180px', paddingTop: '0.25rem', fontSize: '0.8rem', fontWeight: 700 }}>
                      Judge 2 Signature
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
