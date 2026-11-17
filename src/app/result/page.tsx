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
  
  // Custom sub-filters
  const [doorNoticeFilter, setDoorNoticeFilter] = useState<'all' | '101' | '102' | 'viva' | 'master'>('all');
  const [attendanceFilter, setAttendanceFilter] = useState<string>('all');
  const [evaluationBoardFilter, setEvaluationBoardFilter] = useState<string>('all');

  // Helper for Viva Estimated Time
  const getVivaEstimatedTime = (slot: 'Slot 1' | 'Slot 2', tokenIndex: number, totalInSlot: number) => {
    const interval = Math.max(Math.floor(48 / Math.max(totalInSlot, 1)), 2);
    if (slot === 'Slot 1') {
      const totalMinutes = 9 * 60 + (tokenIndex * interval);
      const hrs = Math.floor(totalMinutes / 60);
      const mins = totalMinutes % 60;
      const period = hrs >= 12 ? 'PM' : 'AM';
      const displayHrs = hrs > 12 ? hrs - 12 : hrs;
      return `${String(displayHrs).padStart(2, '0')}:${String(mins).padStart(2, '0')} ${period}`;
    } else {
      const totalMinutes = 10 * 60 + 5 + (tokenIndex * interval);
      const hrs = Math.floor(totalMinutes / 60);
      const mins = totalMinutes % 60;
      const period = hrs >= 12 ? 'PM' : 'AM';
      const displayHrs = hrs > 12 ? hrs - 12 : hrs;
      return `${String(displayHrs).padStart(2, '0')}:${String(mins).padStart(2, '0')} ${period}`;
    }
  };

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
        s.className.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.institution && s.institution.toLowerCase().includes(searchQuery.toLowerCase()))
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
      'Institution / School': s.institution || 'N/A',
      'Gala Rank': s.rank || 'N/A',
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', background: '#ffffff', padding: '0.35rem 0.75rem', borderRadius: '0.5rem', border: '1px solid var(--primary-border)' }}>
              <img src="/logo/logo.png" alt="Logo" style={{ height: '30px', width: 'auto' }} />
              <img src="/logo/tagline_1.png" alt="Tagline" style={{ height: '42px', width: 'auto' }} />
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
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Roll: {s.id} | {s.group} {s.institution ? `• ${s.institution}` : ''}
                      </div>
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
                            <img src="/logo/logo.png" alt="Logo" style={{ height: '26px', width: 'auto', objectFit: 'contain' }} />
                            <div style={{ textAlign: 'center' }}>
                              <span style={{ fontSize: '0.65rem', fontWeight: 900, color: '#004b99', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                GALA ROUND 2026
                              </span>
                            </div>
                            <img src="/logo/tagline_1.png" alt="Tagline" style={{ height: '42px', width: 'auto', objectFit: 'contain' }} />
                          </div>

                          {/* Candidate Identity */}
                          <div style={{ 
                            background: '#f4f8fc', 
                            padding: '0.45rem 0.55rem', 
                            borderRadius: '0.35rem', 
                            border: '1px solid #bfdbfe',
                            marginBottom: '0.35rem'
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: '0.62rem', fontWeight: 800, color: '#004b99', background: '#dbeafe', padding: '0.1rem 0.35rem', borderRadius: '0.2rem' }}>
                                {student.group || 'Group A'}
                              </span>
                              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#004b99', fontFamily: 'monospace' }}>
                                {student.id}
                              </span>
                            </div>
                            <div style={{ fontSize: '0.92rem', fontWeight: 900, color: '#0b1a30', margin: '0.15rem 0', lineHeight: '1.2' }}>
                              {student.name}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.74rem' }}>
                              <span style={{ fontWeight: 800, color: colStyle.text }}>
                                {student.className}
                              </span>
                              {student.rank && (
                                <span style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 700 }}>
                                  Rank: #{student.rank}
                                </span>
                              )}
                            </div>
                            {student.institution && (
                              <div style={{ fontSize: '0.68rem', color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '0.12rem' }}>
                                🏫 {student.institution}
                              </div>
                            )}
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
                              style={{ height: '48px', width: 'auto', maxWidth: '160px', objectFit: 'contain' }} 
                            />
                          </div>

                          {/* Center Institution Info */}
                          <div style={{ textAlign: 'center', flexGrow: 1 }}>
                            <h2 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#004b99', margin: 0, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                              ICT OLYMPIAD BANGLADESH
                            </h2>
                            <div style={{ fontSize: '0.88rem', color: '#0284c7', fontWeight: 800, marginTop: '0.1rem' }}>
                              SEASON 3 GALA ROUND • GRAND FINALE 2026
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                              National Technology & Coding Olympiad
                            </div>
                          </div>

                          {/* Tagline Graphic */}
                          <div style={{ background: '#ffffff', padding: '4px 8px', borderRadius: '6px', border: '1px solid #bfdbfe', flexShrink: 0 }}>
                            <img 
                              src="/logo/tagline_1.png" 
                              alt="Tagline" 
                              style={{ height: '72px', width: 'auto', objectFit: 'contain' }} 
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
                            <strong style={{ color: '#0b1a30', fontSize: '1.05rem' }}>{student.name}</strong>
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
                            {student.rank && (
                              <span style={{ marginLeft: '0.5rem', background: '#dbeafe', color: '#004b99', fontSize: '0.72rem', padding: '0.1rem 0.45rem', borderRadius: '0.25rem', fontWeight: 700 }}>
                                Gala Rank: #{student.rank}
                              </span>
                            )}
                          </div>
                          <div style={{ gridColumn: 'span 2' }}>
                            <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>Institution / School:</span>
                            <strong style={{ color: '#0b1a30', fontSize: '0.88rem' }}>{student.institution || 'ICT Olympiad Bangladesh'}</strong>
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
                              <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#0b1a30', lineHeight: '1.2', marginBottom: '0.2rem' }}>
                                {student.name}
                              </div>
                              <div style={{ fontSize: '0.72rem', color: '#475569' }}>
                                Roll: <strong>{student.id}</strong> ({student.group})
                              </div>
                              {student.institution && (
                                <div style={{ fontSize: '0.68rem', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '0.15rem' }}>
                                  🏫 {student.institution}
                                </div>
                              )}
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
        <div>
          {/* Sub-tabs for Door Notice */}
          <div className="no-print glass-card" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', padding: '0.65rem 1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary)', marginRight: '0.5rem' }}>ফিল্টার করুন:</span>
            {[
              { id: 'all', label: '📄 সব নোটিশ (All Door Notices)' },
              { id: '101', label: '🚪 Room 101 Door Notice' },
              { id: '102', label: '🚪 Room 102 Door Notice' },
              { id: 'viva', label: '🎤 Viva Rooms (103, 104, 105)' },
              { id: 'master', label: '📋 Master Directory (সব ১৩টি ক্লাস)' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setDoorNoticeFilter(tab.id as any)}
                style={{
                  padding: '0.45rem 0.85rem',
                  borderRadius: '0.4rem',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  border: doorNoticeFilter === tab.id ? '2px solid var(--primary)' : '1px solid var(--primary-border)',
                  background: doorNoticeFilter === tab.id ? 'var(--primary)' : 'var(--btn-unselected-bg)',
                  color: doorNoticeFilter === tab.id ? '#fff' : 'var(--foreground)',
                  cursor: 'pointer'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div id="printable-area">
            {/* 1) Individual Written Hall Door Notices (Room 101 & Room 102) */}
            {['101', '102'].map((rName, rIdx) => {
              if (doorNoticeFilter !== 'all' && doorNoticeFilter !== rName) return null;

              const rStudents = assignments[rName] || [];
              const slot1Students = rStudents
                .filter(s => s.group === 'Group A')
                .sort((a, b) => (a.seatNumber || '').localeCompare(b.seatNumber || ''));
              const slot2Students = rStudents
                .filter(s => s.group === 'Group B')
                .sort((a, b) => (a.seatNumber || '').localeCompare(b.seatNumber || ''));

              return (
                <div 
                  key={`door-${rName}`} 
                  className={rIdx > 0 && doorNoticeFilter === 'all' ? "print-page-break" : ""}
                  style={{ 
                    background: '#fff', 
                    padding: '1.75rem', 
                    borderRadius: '0.5rem', 
                    border: '3px solid #004b99', 
                    marginBottom: '2.5rem',
                    boxShadow: '0 4px 16px rgba(0, 75, 153, 0.08)'
                  }}
                >
                  {/* Notice Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '3px solid #004b99', paddingBottom: '0.85rem', marginBottom: '1.25rem', gap: '1rem' }}>
                    <img src="/logo/logo.png" alt="Logo" style={{ height: '46px', width: 'auto' }} />
                    <div style={{ textAlign: 'center', flexGrow: 1 }}>
                      <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#004b99', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        ICT OLYMPIAD BANGLADESH - SEASON 3
                      </div>
                      <h1 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#0b1a30', margin: '0.15rem 0' }}>
                        HALL ROOM {rName} • OFFICIAL DOOR NOTICE & CANDIDATE SEATING
                      </h1>
                      <div style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 600 }}>
                        লিখিত পরীক্ষা হল • মোট আসন: ৪০টি সিঙ্গেল চেয়ার | পরীক্ষার্থী সংখ্যা: {rStudents.length} জন (২টি সেশন)
                      </div>
                    </div>
                    <img src="/logo/tagline_1.png" alt="Tagline" style={{ height: '70px', width: 'auto', objectFit: 'contain' }} />
                  </div>

                  {/* Section 1: Slot 1 Candidates (Group A) */}
                  <div style={{ marginBottom: '2rem' }}>
                    <div style={{ 
                      background: 'linear-gradient(135deg, #004b99, #0284c7)', 
                      color: '#ffffff', 
                      padding: '0.55rem 0.85rem', 
                      borderRadius: '0.35rem', 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      marginBottom: '0.75rem'
                    }}>
                      <span style={{ fontWeight: 900, fontSize: '0.95rem' }}>
                        📝 স্লট ১ (সকাল ০৯:০০ AM – ০৯:৫০ AM) : গ্রুপ A পরীক্ষার্থী তালিকা ({slot1Students.length} জন)
                      </span>
                      <span style={{ fontSize: '0.8rem', background: 'rgba(255,255,255,0.2)', padding: '0.15rem 0.6rem', borderRadius: '0.25rem' }}>
                        ক্যাটাগরি: Class 1 থেকে Class 7 | পরবর্তী ভাইভা: সকাল ১০:০৫ AM
                      </span>
                    </div>

                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', color: '#000' }}>
                      <thead>
                        <tr style={{ background: '#eff6ff', borderBottom: '2px solid #004b99' }}>
                          <th style={{ border: '1px solid #bfdbfe', padding: '0.45rem', width: '70px', textAlign: 'center', color: '#004b99' }}>সিট নং</th>
                          <th style={{ border: '1px solid #bfdbfe', padding: '0.45rem', width: '115px', textAlign: 'center', color: '#004b99' }}>রোল / আইডি (Roll)</th>
                          <th style={{ border: '1px solid #bfdbfe', padding: '0.45rem', textAlign: 'left', color: '#004b99' }}>পরীক্ষার্থীর নাম (Candidate Name)</th>
                          <th style={{ border: '1px solid #bfdbfe', padding: '0.45rem', width: '85px', textAlign: 'center', color: '#004b99' }}>ক্যাটাগরি</th>
                          <th style={{ border: '1px solid #bfdbfe', padding: '0.45rem', textAlign: 'left', color: '#004b99' }}>শিক্ষা প্রতিষ্ঠান (School / College)</th>
                          <th style={{ border: '1px solid #bfdbfe', padding: '0.45rem', width: '160px', textAlign: 'center', color: '#004b99' }}>পরবর্তী ভাইভা রুম ও বোর্ড</th>
                        </tr>
                      </thead>
                      <tbody>
                        {slot1Students.map((st) => (
                          <tr key={st.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                            <td style={{ border: '1px solid #bfdbfe', textAlign: 'center', fontWeight: 900, color: '#004b99', background: '#f8fafc' }}>
                              {st.writtenSeat || st.seatNumber}
                            </td>
                            <td style={{ border: '1px solid #bfdbfe', textAlign: 'center', fontWeight: 800, fontFamily: 'monospace', fontSize: '0.88rem' }}>
                              {st.id}
                            </td>
                            <td style={{ border: '1px solid #bfdbfe', paddingLeft: '0.5rem', fontWeight: 700 }}>
                              {st.name}
                            </td>
                            <td style={{ border: '1px solid #bfdbfe', textAlign: 'center' }}>
                              <span style={{ fontWeight: 700, color: getClassColor(st.className).text }}>{st.className}</span>
                            </td>
                            <td style={{ border: '1px solid #bfdbfe', paddingLeft: '0.5rem', fontSize: '0.78rem', color: '#334155' }}>
                              {st.institution || '—'}
                            </td>
                            <td style={{ border: '1px solid #bfdbfe', textAlign: 'center', fontWeight: 700, color: '#c2410c', background: '#fff7ed' }}>
                              {st.vivaRoom} • {st.vivaBoard} (#{st.vivaToken})
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Section 2: Slot 2 Candidates (Group B) */}
                  <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ 
                      background: 'linear-gradient(135deg, #0284c7, #004b99)', 
                      color: '#ffffff', 
                      padding: '0.55rem 0.85rem', 
                      borderRadius: '0.35rem', 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      marginBottom: '0.75rem'
                    }}>
                      <span style={{ fontWeight: 900, fontSize: '0.95rem' }}>
                        📝 স্লট ২ (সকাল ১০:০৫ AM – ১০:৫৫ AM) : গ্রুপ B পরীক্ষার্থী তালিকা ({slot2Students.length} জন)
                      </span>
                      <span style={{ fontSize: '0.8rem', background: 'rgba(255,255,255,0.2)', padding: '0.15rem 0.6rem', borderRadius: '0.25rem' }}>
                        ক্যাটাগরি: Class 8 থেকে Engineering | ভাইভা শেষ করে রুমে প্রবেশ
                      </span>
                    </div>

                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', color: '#000' }}>
                      <thead>
                        <tr style={{ background: '#eff6ff', borderBottom: '2px solid #004b99' }}>
                          <th style={{ border: '1px solid #bfdbfe', padding: '0.45rem', width: '70px', textAlign: 'center', color: '#004b99' }}>সিট নং</th>
                          <th style={{ border: '1px solid #bfdbfe', padding: '0.45rem', width: '115px', textAlign: 'center', color: '#004b99' }}>রোল / আইডি (Roll)</th>
                          <th style={{ border: '1px solid #bfdbfe', padding: '0.45rem', textAlign: 'left', color: '#004b99' }}>পরীক্ষার্থীর নাম (Candidate Name)</th>
                          <th style={{ border: '1px solid #bfdbfe', padding: '0.45rem', width: '85px', textAlign: 'center', color: '#004b99' }}>ক্যাটাগরি</th>
                          <th style={{ border: '1px solid #bfdbfe', padding: '0.45rem', textAlign: 'left', color: '#004b99' }}>শিক্ষা প্রতিষ্ঠান (School / College)</th>
                          <th style={{ border: '1px solid #bfdbfe', padding: '0.45rem', width: '160px', textAlign: 'center', color: '#004b99' }}>সকাল ০৯:০০ টার ভাইভা বোর্ড</th>
                        </tr>
                      </thead>
                      <tbody>
                        {slot2Students.map((st) => (
                          <tr key={st.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                            <td style={{ border: '1px solid #bfdbfe', textAlign: 'center', fontWeight: 900, color: '#004b99', background: '#f8fafc' }}>
                              {st.writtenSeat || st.seatNumber?.replace(' [Slot 2]', '')}
                            </td>
                            <td style={{ border: '1px solid #bfdbfe', textAlign: 'center', fontWeight: 800, fontFamily: 'monospace', fontSize: '0.88rem' }}>
                              {st.id}
                            </td>
                            <td style={{ border: '1px solid #bfdbfe', paddingLeft: '0.5rem', fontWeight: 700 }}>
                              {st.name}
                            </td>
                            <td style={{ border: '1px solid #bfdbfe', textAlign: 'center' }}>
                              <span style={{ fontWeight: 700, color: getClassColor(st.className).text }}>{st.className}</span>
                            </td>
                            <td style={{ border: '1px solid #bfdbfe', paddingLeft: '0.5rem', fontSize: '0.78rem', color: '#334155' }}>
                              {st.institution || '—'}
                            </td>
                            <td style={{ border: '1px solid #bfdbfe', textAlign: 'center', fontWeight: 700, color: '#c2410c', background: '#fff7ed' }}>
                              {st.vivaRoom} • {st.vivaBoard} (#{st.vivaToken})
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Door Notice Footer */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '2px dashed #cbd5e1', paddingTop: '1rem', fontSize: '0.8rem', color: '#475569' }}>
                    <div>
                      <strong>বিশেষ দ্রষ্টব্য:</strong> প্রতিটি সিটে ১ জন করে বসবেন। প্রবেশপত্র সাথে রাখা বাধ্যতামূলক।
                    </div>
                    <div style={{ display: 'flex', gap: '3rem' }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ borderTop: '1.5px solid #000', width: '150px', paddingTop: '0.2rem', fontWeight: 700 }}>
                          হল ইনচার্জ স্বাক্ষর
                        </div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ borderTop: '1.5px solid #000', width: '150px', paddingTop: '0.2rem', fontWeight: 700 }}>
                          পরীক্ষা নিয়ন্ত্রক
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* 2) Viva Rooms Dedicated Door Notices (Rooms 103, 104, 105) */}
            {(doorNoticeFilter === 'all' || doorNoticeFilter === 'viva') && (
              <div>
                {[
                  {
                    roomNo: '103',
                    boards: ['Board 1', 'Board 2'],
                    desc: 'Board 1 (Class 8 / Class 1 & 2) & Board 2 (Class 9/10 / Class 3 & 4)'
                  },
                  {
                    roomNo: '104',
                    boards: ['Board 3', 'Board 4'],
                    desc: 'Board 3 (Class 11/12 / Class 5) & Board 4 (Polytechnic / Class 6)'
                  },
                  {
                    roomNo: '105',
                    boards: ['Board 5'],
                    desc: 'Board 5 (Non-Engineering & Engineering / Class 7)'
                  }
                ].map((vivaRoom, vIdx) => {
                  const vivaRoomCandidates = allAllocatedStudents.filter(s => s.vivaRoom?.includes(vivaRoom.roomNo));

                  return (
                    <div 
                      key={`viva-door-${vivaRoom.roomNo}`}
                      className="print-page-break"
                      style={{ 
                        background: '#fff', 
                        padding: '1.75rem', 
                        borderRadius: '0.5rem', 
                        border: '3px solid #ea580c', 
                        marginBottom: '2.5rem',
                        boxShadow: '0 4px 16px rgba(234, 88, 12, 0.08)'
                      }}
                    >
                      {/* Notice Header */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '3px solid #ea580c', paddingBottom: '0.85rem', marginBottom: '1.25rem', gap: '1rem' }}>
                        <img src="/logo/logo.png" alt="Logo" style={{ height: '46px', width: 'auto' }} />
                        <div style={{ textAlign: 'center', flexGrow: 1 }}>
                          <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#004b99', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            ICT OLYMPIAD BANGLADESH - SEASON 3
                          </div>
                          <h1 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#c2410c', margin: '0.15rem 0' }}>
                            VIVA ROOM {vivaRoom.roomNo} • OFFICIAL DOOR NOTICE
                          </h1>
                          <div style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 600 }}>
                            {vivaRoom.desc} • মোট পরীক্ষার্থী: {vivaRoomCandidates.length} জন
                          </div>
                        </div>
                        <img src="/logo/tagline_1.png" alt="Tagline" style={{ height: '70px', width: 'auto', objectFit: 'contain' }} />
                      </div>

                      {vivaRoom.boards.map(bName => {
                        const boardStudents = vivaRoomCandidates.filter(s => s.vivaBoard?.includes(bName));
                        const slot1List = boardStudents.filter(s => s.group === 'Group B').sort((a, b) => (a.vivaToken || 0) - (b.vivaToken || 0));
                        const slot2List = boardStudents.filter(s => s.group === 'Group A').sort((a, b) => (a.vivaToken || 0) - (b.vivaToken || 0));

                        return (
                          <div key={bName} style={{ marginBottom: '1.75rem' }}>
                            <div style={{ 
                              background: '#fff7ed', 
                              border: '1.5px solid #fed7aa', 
                              padding: '0.5rem 0.85rem', 
                              borderRadius: '0.35rem', 
                              fontWeight: 900, 
                              color: '#c2410c',
                              fontSize: '0.95rem',
                              marginBottom: '0.65rem',
                              display: 'flex',
                              justifyContent: 'space-between'
                            }}>
                              <span>🎤 {bName} পরীক্ষার্থী তালিকা</span>
                              <span style={{ fontSize: '0.8rem', color: '#7c2d12' }}>রুম নং: {vivaRoom.roomNo}</span>
                            </div>

                            {/* Slot 1 candidates for this board */}
                            {slot1List.length > 0 && (
                              <div style={{ marginBottom: '0.85rem' }}>
                                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#004b99', marginBottom: '0.35rem' }}>
                                  • স্লট ১ (সকাল ০৯:০০ - ০৯:৫০ AM) — {slot1List[0]?.className}:
                                </div>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', color: '#000' }}>
                                  <thead>
                                    <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid #fed7aa' }}>
                                      <th style={{ border: '1px solid #fed7aa', padding: '0.35rem', width: '60px', textAlign: 'center' }}>টোকেন</th>
                                      <th style={{ border: '1px solid #fed7aa', padding: '0.35rem', width: '85px', textAlign: 'center' }}>আনুমানিক সময়</th>
                                      <th style={{ border: '1px solid #fed7aa', padding: '0.35rem', width: '120px', textAlign: 'center' }}>রোল / আইডি (Roll)</th>
                                      <th style={{ border: '1px solid #fed7aa', padding: '0.35rem', textAlign: 'left' }}>নাম (Candidate Name)</th>
                                      <th style={{ border: '1px solid #fed7aa', padding: '0.35rem', width: '85px', textAlign: 'center' }}>ক্লাস</th>
                                      <th style={{ border: '1px solid #fed7aa', padding: '0.35rem', textAlign: 'left' }}>শিক্ষা প্রতিষ্ঠান</th>
                                      <th style={{ border: '1px solid #fed7aa', padding: '0.35rem', width: '120px', textAlign: 'center' }}>পরবর্তী লিখিত হল</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {slot1List.map((st, idx) => (
                                      <tr key={st.id}>
                                        <td style={{ border: '1px solid #fed7aa', textAlign: 'center', fontWeight: 900, color: '#ea580c' }}>#{st.vivaToken}</td>
                                        <td style={{ border: '1px solid #fed7aa', textAlign: 'center', fontSize: '0.75rem', fontWeight: 700 }}>
                                          {getVivaEstimatedTime('Slot 1', idx, slot1List.length)}
                                        </td>
                                        <td style={{ border: '1px solid #fed7aa', textAlign: 'center', fontWeight: 800, fontFamily: 'monospace' }}>{st.id}</td>
                                        <td style={{ border: '1px solid #fed7aa', paddingLeft: '0.5rem', fontWeight: 700 }}>{st.name}</td>
                                        <td style={{ border: '1px solid #fed7aa', textAlign: 'center' }}>{st.className}</td>
                                        <td style={{ border: '1px solid #fed7aa', paddingLeft: '0.5rem', fontSize: '0.74rem' }}>{st.institution || '—'}</td>
                                        <td style={{ border: '1px solid #fed7aa', textAlign: 'center', fontWeight: 700, color: '#004b99' }}>
                                          {st.writtenRoom} ({st.writtenSeat})
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}

                            {/* Slot 2 candidates for this board */}
                            {slot2List.length > 0 && (
                              <div>
                                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#c2410c', marginBottom: '0.35rem' }}>
                                  • স্লট ২ (সকাল ১০:০৫ - ১০:৫৫ AM) — {Array.from(new Set(slot2List.map(s => s.className))).join(', ')}:
                                </div>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', color: '#000' }}>
                                  <thead>
                                    <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid #fed7aa' }}>
                                      <th style={{ border: '1px solid #fed7aa', padding: '0.35rem', width: '60px', textAlign: 'center' }}>টোকেন</th>
                                      <th style={{ border: '1px solid #fed7aa', padding: '0.35rem', width: '85px', textAlign: 'center' }}>আনুমানিক সময়</th>
                                      <th style={{ border: '1px solid #fed7aa', padding: '0.35rem', width: '120px', textAlign: 'center' }}>রোল / আইডি (Roll)</th>
                                      <th style={{ border: '1px solid #fed7aa', padding: '0.35rem', textAlign: 'left' }}>নাম (Candidate Name)</th>
                                      <th style={{ border: '1px solid #fed7aa', padding: '0.35rem', width: '85px', textAlign: 'center' }}>ক্লাস</th>
                                      <th style={{ border: '1px solid #fed7aa', padding: '0.35rem', textAlign: 'left' }}>শিক্ষা প্রতিষ্ঠান</th>
                                      <th style={{ border: '1px solid #fed7aa', padding: '0.35rem', width: '120px', textAlign: 'center' }}>পূর্ববর্তী লিখিত হল</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {slot2List.map((st, idx) => (
                                      <tr key={st.id}>
                                        <td style={{ border: '1px solid #fed7aa', textAlign: 'center', fontWeight: 900, color: '#ea580c' }}>#{st.vivaToken}</td>
                                        <td style={{ border: '1px solid #fed7aa', textAlign: 'center', fontSize: '0.75rem', fontWeight: 700 }}>
                                          {getVivaEstimatedTime('Slot 2', idx, slot2List.length)}
                                        </td>
                                        <td style={{ border: '1px solid #fed7aa', textAlign: 'center', fontWeight: 800, fontFamily: 'monospace' }}>{st.id}</td>
                                        <td style={{ border: '1px solid #fed7aa', paddingLeft: '0.5rem', fontWeight: 700 }}>{st.name}</td>
                                        <td style={{ border: '1px solid #fed7aa', textAlign: 'center' }}>{st.className}</td>
                                        <td style={{ border: '1px solid #fed7aa', paddingLeft: '0.5rem', fontSize: '0.74rem' }}>{st.institution || '—'}</td>
                                        <td style={{ border: '1px solid #fed7aa', textAlign: 'center', fontWeight: 700, color: '#004b99' }}>
                                          {st.writtenRoom} ({st.writtenSeat})
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            )}

            {/* 3) Master Venue Directory (সব ১৩টি ক্লাস) */}
            {(doorNoticeFilter === 'all' || doorNoticeFilter === 'master') && (
              <div 
                className="print-page-break"
                style={{ 
                  background: '#fff', 
                  padding: '1.75rem', 
                  borderRadius: '0.5rem', 
                  border: '3px solid #004b99', 
                  marginBottom: '2.5rem' 
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '3px solid #004b99', paddingBottom: '0.85rem', marginBottom: '1.25rem', gap: '1rem' }}>
                  <img src="/logo/logo.png" alt="Logo" style={{ height: '46px', width: 'auto' }} />
                  <div style={{ textAlign: 'center', flexGrow: 1 }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#004b99', textTransform: 'uppercase' }}>
                      ICT OLYMPIAD BANGLADESH - SEASON 3
                    </div>
                    <h1 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0b1a30', margin: '0.15rem 0' }}>
                      MASTER VENUE DIRECTORY (সব ১৩টি ক্যাটাগরি ও ১৩০ জন পরীক্ষার্থী)
                    </h1>
                    <div style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 600 }}>
                      সকল ক্যাটাগরির পরীক্ষার্থীদের লিখিত হল, সিট ও ভাইভা বোর্ডের সম্পূর্ণ মাস্টার চার্ট
                    </div>
                  </div>
                  <img src="/logo/tagline_1.png" alt="Tagline" style={{ height: '70px', width: 'auto', objectFit: 'contain' }} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {GALA_CLASSES.map(clsName => {
                    const clsStudents = allAllocatedStudents.filter(s => s.className.trim() === clsName.trim());
                    const colStyle = getClassColor(clsName);

                    return (
                      <div key={clsName} style={{ border: `1.5px solid ${colStyle.border}`, borderRadius: '0.4rem', overflow: 'hidden' }}>
                        <div style={{ background: colStyle.bg, padding: '0.45rem 0.75rem', fontWeight: 800, color: colStyle.text, display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                          <span>🏷️ {clsName} ({clsStudents.length} Candidates)</span>
                          <span>পরীক্ষার গ্রুপ: {clsStudents[0]?.group}</span>
                        </div>

                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem', color: '#000' }}>
                          <thead>
                            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                              <th style={{ padding: '0.35rem', width: '50px', textAlign: 'center' }}>র‍্যাঙ্ক</th>
                              <th style={{ padding: '0.35rem', width: '115px', textAlign: 'center' }}>রোল / আইডি</th>
                              <th style={{ padding: '0.35rem', textAlign: 'left' }}>পরীক্ষার্থীর নাম</th>
                              <th style={{ padding: '0.35rem', textAlign: 'left' }}>শিক্ষা প্রতিষ্ঠান (School / College)</th>
                              <th style={{ padding: '0.35rem', width: '130px', textAlign: 'center' }}>লিখিত পরীক্ষা হল ও সিট</th>
                              <th style={{ padding: '0.35rem', width: '150px', textAlign: 'center' }}>ভাইভা পরীক্ষা বোর্ড ও রুম</th>
                            </tr>
                          </thead>
                          <tbody>
                            {clsStudents.map((st) => (
                              <tr key={st.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ textAlign: 'center', fontWeight: 800, color: '#004b99' }}>#{st.rank || '—'}</td>
                                <td style={{ textAlign: 'center', fontWeight: 800, fontFamily: 'monospace' }}>{st.id}</td>
                                <td style={{ paddingLeft: '0.5rem', fontWeight: 700 }}>{st.name}</td>
                                <td style={{ paddingLeft: '0.5rem', color: '#475569' }}>{st.institution || '—'}</td>
                                <td style={{ textAlign: 'center', fontWeight: 700, color: '#004b99' }}>
                                  {st.writtenRoom} ({st.writtenSeat})
                                </td>
                                <td style={{ textAlign: 'center', fontWeight: 700, color: '#c2410c' }}>
                                  {st.vivaRoom} • {st.vivaBoard} (#{st.vivaToken})
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. ATTENDANCE & SIGNATURE REGISTER                        */}
      {/* ========================================================= */}
      {activeTab === 'attendance' && (
        <div>
          {/* Sub-tabs for Attendance */}
          <div className="no-print glass-card" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', padding: '0.65rem 1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary)', marginRight: '0.5rem' }}>সেশন নির্বাচন করুন:</span>
            {[
              { id: 'all', label: '📄 সব ৪টি শিট প্রিন্ট করুন (All Sessions)' },
              { id: '101-1', label: 'Room 101 • Slot 1 (Group A - ৩৫ জন)' },
              { id: '101-2', label: 'Room 101 • Slot 2 (Group B - ৩০ জন)' },
              { id: '102-1', label: 'Room 102 • Slot 1 (Group A - ৩৫ জন)' },
              { id: '102-2', label: 'Room 102 • Slot 2 (Group B - ৩০ জন)' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setAttendanceFilter(tab.id)}
                style={{
                  padding: '0.45rem 0.85rem',
                  borderRadius: '0.4rem',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  border: attendanceFilter === tab.id ? '2px solid var(--primary)' : '1px solid var(--primary-border)',
                  background: attendanceFilter === tab.id ? 'var(--primary)' : 'var(--btn-unselected-bg)',
                  color: attendanceFilter === tab.id ? '#fff' : 'var(--foreground)',
                  cursor: 'pointer'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div id="printable-area">
            {[
              {
                id: '101-1',
                roomName: '101',
                slotName: 'Slot 1 (০৯:০০ AM – ০৯:৫০ AM)',
                group: 'Group A',
                groupDesc: 'Primary & Junior Track (Class 1 to Class 7)',
                expectedCount: 35
              },
              {
                id: '101-2',
                roomName: '101',
                slotName: 'Slot 2 (১০:০৫ AM – ১০:৫৫ AM)',
                group: 'Group B',
                groupDesc: 'Secondary & Higher Track (Class 8 to Engineering)',
                expectedCount: 30
              },
              {
                id: '102-1',
                roomName: '102',
                slotName: 'Slot 1 (০৯:০০ AM – ০৯:৫০ AM)',
                group: 'Group A',
                groupDesc: 'Primary & Junior Track (Class 1 to Class 7)',
                expectedCount: 35
              },
              {
                id: '102-2',
                roomName: '102',
                slotName: 'Slot 2 (১০:০৫ AM – ১০:৫৫ AM)',
                group: 'Group B',
                groupDesc: 'Secondary & Higher Track (Class 8 to Engineering)',
                expectedCount: 30
              },
            ].map((sess, sIdx) => {
              if (attendanceFilter !== 'all' && attendanceFilter !== sess.id) return null;

              const sessionStudents = (assignments[sess.roomName] || [])
                .filter(s => s.group === sess.group)
                .sort((a, b) => (a.seatNumber || '').localeCompare(b.seatNumber || ''));

              return (
                <div 
                  key={sess.id}
                  className={sIdx > 0 && attendanceFilter === 'all' ? "print-page-break" : ""} 
                  style={{ 
                    background: '#fff', 
                    padding: '1.5rem', 
                    borderRadius: '0.5rem', 
                    border: '2px solid #004b99', 
                    marginBottom: '2rem' 
                  }}
                >
                  {/* Attendance Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2.5px solid #004b99', paddingBottom: '0.75rem', marginBottom: '0.85rem', gap: '1rem' }}>
                    <img src="/logo/logo.png" alt="Logo" style={{ height: '42px', width: 'auto' }} />
                    <div style={{ textAlign: 'center', flexGrow: 1 }}>
                      <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#004b99', textTransform: 'uppercase' }}>
                        ICT OLYMPIAD BANGLADESH - SEASON 3
                      </div>
                      <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0.15rem 0', color: '#0b1a30' }}>
                        WRITTEN EXAMINATION OFFICIAL ATTENDANCE & SCRIPT REGISTER
                      </h2>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0284c7' }}>
                        হলের বিবরণ: ROOM {sess.roomName} • {sess.slotName} • {sess.group}
                      </div>
                    </div>
                    <img src="/logo/tagline_1.png" alt="Tagline" style={{ height: '65px', width: 'auto', objectFit: 'contain' }} />
                  </div>

                  {/* Summary Bar */}
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    background: '#f8fafc', 
                    padding: '0.5rem 0.75rem', 
                    borderRadius: '0.4rem', 
                    border: '1px solid #bfdbfe', 
                    marginBottom: '0.85rem', 
                    fontSize: '0.82rem', 
                    color: '#1e293b' 
                  }}>
                    <div><strong>হল নং:</strong> Room {sess.roomName}</div>
                    <div><strong>সেশন:</strong> {sess.slotName}</div>
                    <div><strong>ক্যাটাগরি:</strong> {sess.groupDesc}</div>
                    <div style={{ display: 'flex', gap: '0.65rem', fontWeight: 800 }}>
                      <span>মোট: <strong>{sessionStudents.length}</strong></span>
                      <span>উপস্থিত: <span style={{ border: '1px solid #94a3b8', display: 'inline-block', width: '30px', height: '16px', verticalAlign: 'middle', background: '#fff' }}></span></span>
                      <span>অনুপস্থিত: <span style={{ border: '1px solid #94a3b8', display: 'inline-block', width: '30px', height: '16px', verticalAlign: 'middle', background: '#fff' }}></span></span>
                    </div>
                  </div>

                  {/* Candidates Attendance Table */}
                  <table style={{ width: '100%', borderCollapse: 'collapse', color: '#000', fontSize: '0.8rem' }}>
                    <thead>
                      <tr style={{ background: '#eff6ff', borderBottom: '2px solid #004b99' }}>
                        <th style={{ border: '1px solid #bfdbfe', padding: '0.4rem', width: '30px', textAlign: 'center', color: '#004b99' }}>ক্রমিক</th>
                        <th style={{ border: '1px solid #bfdbfe', padding: '0.4rem', width: '65px', textAlign: 'center', color: '#004b99' }}>সিট নং</th>
                        <th style={{ border: '1px solid #bfdbfe', padding: '0.4rem', width: '110px', textAlign: 'center', color: '#004b99' }}>রোল / আইডি</th>
                        <th style={{ border: '1px solid #bfdbfe', padding: '0.4rem', textAlign: 'left', color: '#004b99' }}>পরীক্ষার্থীর নাম (Candidate Name)</th>
                        <th style={{ border: '1px solid #bfdbfe', padding: '0.4rem', width: '75px', textAlign: 'center', color: '#004b99' }}>ক্লাস</th>
                        <th style={{ border: '1px solid #bfdbfe', padding: '0.4rem', textAlign: 'left', color: '#004b99' }}>শিক্ষা প্রতিষ্ঠান (Institution)</th>
                        <th style={{ border: '1px solid #bfdbfe', padding: '0.4rem', width: '90px', textAlign: 'center', color: '#004b99' }}>মূল খাতা নং</th>
                        <th style={{ border: '1px solid #bfdbfe', padding: '0.4rem', width: '50px', textAlign: 'center', color: '#004b99' }}>অতিরিক্ত</th>
                        <th style={{ border: '1px solid #bfdbfe', padding: '0.4rem', width: '125px', textAlign: 'center', color: '#004b99' }}>পরীক্ষার্থীর স্বাক্ষর</th>
                        <th style={{ border: '1px solid #bfdbfe', padding: '0.4rem', width: '60px', textAlign: 'center', color: '#004b99' }}>পরিদর্শক</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sessionStudents.map((st, idx) => (
                        <tr key={st.id} style={{ height: '30px', borderBottom: '1px solid #e2e8f0' }}>
                          <td style={{ border: '1px solid #bfdbfe', textAlign: 'center' }}>{idx + 1}</td>
                          <td style={{ border: '1px solid #bfdbfe', textAlign: 'center', fontWeight: 900, color: '#004b99' }}>
                            {st.writtenSeat || st.seatNumber?.replace(' [Slot 2]', '')}
                          </td>
                          <td style={{ border: '1px solid #bfdbfe', textAlign: 'center', fontWeight: 800, fontFamily: 'monospace' }}>
                            {st.id}
                          </td>
                          <td style={{ border: '1px solid #bfdbfe', paddingLeft: '0.45rem', fontWeight: 700 }}>
                            {st.name}
                          </td>
                          <td style={{ border: '1px solid #bfdbfe', textAlign: 'center' }}>
                            {st.className}
                          </td>
                          <td style={{ border: '1px solid #bfdbfe', paddingLeft: '0.45rem', fontSize: '0.74rem', color: '#334155' }}>
                            {st.institution || '—'}
                          </td>
                          {/* Main script write box */}
                          <td style={{ border: '1px solid #bfdbfe', padding: '2px', textAlign: 'center' }}>
                            <div style={{ height: '22px', border: '1px dashed #cbd5e1', borderRadius: '2px' }}></div>
                          </td>
                          {/* Extra script write box */}
                          <td style={{ border: '1px solid #bfdbfe', padding: '2px', textAlign: 'center' }}>
                            <div style={{ height: '22px', border: '1px dashed #cbd5e1', borderRadius: '2px' }}></div>
                          </td>
                          {/* Signature box */}
                          <td style={{ border: '1px solid #bfdbfe', padding: '2px' }}>
                            <div style={{ height: '22px' }}></div>
                          </td>
                          {/* Invigilator initial box */}
                          <td style={{ border: '1px solid #bfdbfe', padding: '2px' }}>
                            <div style={{ height: '22px' }}></div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Signatures at bottom */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2.5rem', padding: '0 1rem' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ borderTop: '1.5px solid #000', width: '170px', paddingTop: '0.25rem', fontSize: '0.78rem', fontWeight: 700 }}>
                        হল পরিদর্শক ১ (স্বাক্ষর ও নাম)
                      </div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ borderTop: '1.5px solid #000', width: '170px', paddingTop: '0.25rem', fontSize: '0.78rem', fontWeight: 700 }}>
                        হল পরিদর্শক ২ (স্বাক্ষর ও নাম)
                      </div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ borderTop: '1.5px solid #000', width: '170px', paddingTop: '0.25rem', fontSize: '0.78rem', fontWeight: 700 }}>
                        কেন্দ্র সুপারিনটেনডেন্ট স্বাক্ষর
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 6. JUDGES VIVA VOCE EVALUATION & SCORE REGISTER           */}
      {/* ========================================================= */}
      {activeTab === 'evaluation' && (
        <div>
          {/* Sub-tabs for Viva Boards */}
          <div className="no-print glass-card" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', padding: '0.65rem 1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#c2410c', marginRight: '0.5rem' }}>ভাইভা বোর্ড নির্বাচন:</span>
            {[
              { id: 'all', label: '📄 সব ৫টি বোর্ড শিট (All 5 Boards)' },
              { id: 'Board 1', label: 'Board 1 (Room 103 • Class 8 / Class 1 & 2)' },
              { id: 'Board 2', label: 'Board 2 (Room 103 • Class 9/10 / Class 3 & 4)' },
              { id: 'Board 3', label: 'Board 3 (Room 104 • Class 11/12 / Class 5)' },
              { id: 'Board 4', label: 'Board 4 (Room 104 • Polytechnic / Class 6)' },
              { id: 'Board 5', label: 'Board 5 (Room 105 • Non-Eng & Eng / Class 7)' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setEvaluationBoardFilter(tab.id)}
                style={{
                  padding: '0.45rem 0.85rem',
                  borderRadius: '0.4rem',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  border: evaluationBoardFilter === tab.id ? '2px solid #ea580c' : '1px solid #fed7aa',
                  background: evaluationBoardFilter === tab.id ? '#ea580c' : 'var(--btn-unselected-bg)',
                  color: evaluationBoardFilter === tab.id ? '#fff' : 'var(--foreground)',
                  cursor: 'pointer'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div id="printable-area">
            {vivaBoardsList.map((boardName, bIdx) => {
              if (evaluationBoardFilter !== 'all' && evaluationBoardFilter !== boardName) return null;

              const boardCandidates = allAllocatedStudents.filter(s => s.vivaBoard?.includes(boardName));
              const slot1Candidates = boardCandidates.filter(s => s.group === 'Group B').sort((a, b) => (a.vivaToken || 0) - (b.vivaToken || 0));
              const slot2Candidates = boardCandidates.filter(s => s.group === 'Group A').sort((a, b) => (a.vivaToken || 0) - (b.vivaToken || 0));

              return (
                <div 
                  key={boardName}
                  className={bIdx > 0 && evaluationBoardFilter === 'all' ? "print-page-break" : ""}
                  style={{ 
                    background: '#fff', 
                    padding: '1.5rem', 
                    borderRadius: '0.5rem', 
                    border: '2.5px solid #ea580c', 
                    marginBottom: '2.5rem',
                    boxShadow: '0 4px 16px rgba(234, 88, 12, 0.08)'
                  }}
                >
                  {/* Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2.5px solid #ea580c', paddingBottom: '0.85rem', marginBottom: '1rem', gap: '1rem' }}>
                    <img src="/logo/logo.png" alt="Logo" style={{ height: '42px', width: 'auto' }} />
                    <div style={{ textAlign: 'center', flexGrow: 1 }}>
                      <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#004b99', textTransform: 'uppercase' }}>
                        ICT OLYMPIAD BANGLADESH - SEASON 3
                      </div>
                      <h2 style={{ fontSize: '1.35rem', fontWeight: 900, margin: '0.15rem 0', color: '#c2410c' }}>
                        VIVA VOCE EVALUATION & OFFICIAL SCORE REGISTER
                      </h2>
                      <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0b1a30' }}>
                        {boardName} ({boardCandidates[0]?.vivaRoom || 'Room 103'}) • মোট পরীক্ষার্থী: {boardCandidates.length} জন
                      </div>
                    </div>
                    <img src="/logo/tagline_1.png" alt="Tagline" style={{ height: '65px', width: 'auto', objectFit: 'contain' }} />
                  </div>

                  {/* Marking Rubrics Banner */}
                  <div style={{ 
                    background: '#fff7ed', 
                    border: '1.5px solid #fed7aa', 
                    padding: '0.45rem 0.85rem', 
                    borderRadius: '0.4rem', 
                    marginBottom: '1rem', 
                    fontSize: '0.8rem', 
                    color: '#7c2d12',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '0.5rem'
                  }}>
                    <span><strong>মূল্যায়ন নির্দেশিকা:</strong> প্রতি পরীক্ষার্থী সর্বোচ্চ ৩-৪ মিনিট।</span>
                    <span><strong>আইসিটি ও প্রযুক্তি জ্ঞান:</strong> ১৫ নম্বর</span>
                    <span><strong>যুক্তি ও উপস্থিত বুদ্ধি:</strong> ১৫ নম্বর</span>
                    <span><strong>উপস্থাপন ও বাচনভঙ্গি:</strong> ১০ নম্বর</span>
                    <span><strong>মোট নম্বর:</strong> ৪০ নম্বর</span>
                  </div>

                  {/* Session 1 (Slot 1 Candidates) */}
                  {slot1Candidates.length > 0 && (
                    <div style={{ marginBottom: '1.75rem' }}>
                      <div style={{ 
                        background: '#ea580c', 
                        color: '#fff', 
                        padding: '0.45rem 0.75rem', 
                        borderRadius: '0.3rem', 
                        fontWeight: 900, 
                        fontSize: '0.88rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '0.5rem'
                      }}>
                        <span>সেশন ১ (সকাল ০৯:০০ AM – ০৯:৫০ AM) : {slot1Candidates[0]?.className} ({slot1Candidates.length} জন)</span>
                        <span>সময়কাল: ৫০ মিনিট (টোকেন ১ - {slot1Candidates.length})</span>
                      </div>

                      <table style={{ width: '100%', borderCollapse: 'collapse', color: '#000', fontSize: '0.8rem' }}>
                        <thead>
                          <tr style={{ background: '#fff7ed', borderBottom: '2px solid #ea580c' }}>
                            <th style={{ border: '1px solid #fed7aa', padding: '0.4rem', width: '45px', textAlign: 'center', color: '#c2410c' }}>টোকেন</th>
                            <th style={{ border: '1px solid #fed7aa', padding: '0.4rem', width: '75px', textAlign: 'center', color: '#c2410c' }}>আনুমানিক সময়</th>
                            <th style={{ border: '1px solid #fed7aa', padding: '0.4rem', width: '110px', textAlign: 'center', color: '#c2410c' }}>রোল / আইডি (Roll)</th>
                            <th style={{ border: '1px solid #fed7aa', padding: '0.4rem', textAlign: 'left', color: '#c2410c' }}>পরীক্ষার্থীর নাম ও শিক্ষা প্রতিষ্ঠান</th>
                            <th style={{ border: '1px solid #fed7aa', padding: '0.4rem', width: '80px', textAlign: 'center', color: '#c2410c' }}>ক্যাটাগরি</th>
                            <th style={{ border: '1px solid #fed7aa', padding: '0.4rem', width: '70px', textAlign: 'center', color: '#c2410c' }}>আইসিটি (১৫)</th>
                            <th style={{ border: '1px solid #fed7aa', padding: '0.4rem', width: '70px', textAlign: 'center', color: '#c2410c' }}>যুক্তি (১৫)</th>
                            <th style={{ border: '1px solid #fed7aa', padding: '0.4rem', width: '70px', textAlign: 'center', color: '#c2410c' }}>উপস্থাপন (১০)</th>
                            <th style={{ border: '1px solid #fed7aa', padding: '0.4rem', width: '75px', textAlign: 'center', color: '#c2410c' }}>মোট (৪০)</th>
                            <th style={{ border: '1px solid #fed7aa', padding: '0.4rem', width: '110px', textAlign: 'center', color: '#c2410c' }}>মেধাক্রম / মন্তব্য</th>
                          </tr>
                        </thead>
                        <tbody>
                          {slot1Candidates.map((st, idx) => (
                            <tr key={st.id} style={{ height: '34px', borderBottom: '1px solid #fed7aa' }}>
                              <td style={{ border: '1px solid #fed7aa', textAlign: 'center', fontWeight: 900, color: '#ea580c' }}>
                                #{st.vivaToken}
                              </td>
                              <td style={{ border: '1px solid #fed7aa', textAlign: 'center', fontSize: '0.74rem', fontWeight: 700 }}>
                                {getVivaEstimatedTime('Slot 1', idx, slot1Candidates.length)}
                              </td>
                              <td style={{ border: '1px solid #fed7aa', textAlign: 'center', fontWeight: 800, fontFamily: 'monospace' }}>
                                {st.id}
                              </td>
                              <td style={{ border: '1px solid #fed7aa', paddingLeft: '0.45rem' }}>
                                <div style={{ fontWeight: 700 }}>{st.name}</div>
                                {st.institution && (
                                  <div style={{ fontSize: '0.68rem', color: '#7c2d12', marginTop: '0.1rem' }}>{st.institution}</div>
                                )}
                              </td>
                              <td style={{ border: '1px solid #fed7aa', textAlign: 'center' }}>{st.className}</td>
                              <td style={{ border: '1px solid #fed7aa' }}></td>
                              <td style={{ border: '1px solid #fed7aa' }}></td>
                              <td style={{ border: '1px solid #fed7aa' }}></td>
                              <td style={{ border: '1px solid #fed7aa', background: '#fffbeb' }}></td>
                              <td style={{ border: '1px solid #fed7aa' }}></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Session 2 (Slot 2 Candidates) */}
                  {slot2Candidates.length > 0 && (
                    <div style={{ marginBottom: '1.5rem' }}>
                      <div style={{ 
                        background: '#c2410c', 
                        color: '#fff', 
                        padding: '0.45rem 0.75rem', 
                        borderRadius: '0.3rem', 
                        fontWeight: 900, 
                        fontSize: '0.88rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '0.5rem'
                      }}>
                        <span>সেশন ২ (সকাল ১০:০৫ AM – ১০:৫৫ AM) : {Array.from(new Set(slot2Candidates.map(s => s.className))).join(', ')} ({slot2Candidates.length} জন)</span>
                        <span>সময়কাল: ৫০ মিনিট (টোকেন ১ - {slot2Candidates.length})</span>
                      </div>

                      <table style={{ width: '100%', borderCollapse: 'collapse', color: '#000', fontSize: '0.8rem' }}>
                        <thead>
                          <tr style={{ background: '#fff7ed', borderBottom: '2px solid #ea580c' }}>
                            <th style={{ border: '1px solid #fed7aa', padding: '0.4rem', width: '45px', textAlign: 'center', color: '#c2410c' }}>টোকেন</th>
                            <th style={{ border: '1px solid #fed7aa', padding: '0.4rem', width: '75px', textAlign: 'center', color: '#c2410c' }}>আনুমানিক সময়</th>
                            <th style={{ border: '1px solid #fed7aa', padding: '0.4rem', width: '110px', textAlign: 'center', color: '#c2410c' }}>রোল / আইডি (Roll)</th>
                            <th style={{ border: '1px solid #fed7aa', padding: '0.4rem', textAlign: 'left', color: '#c2410c' }}>পরীক্ষার্থীর নাম ও শিক্ষা প্রতিষ্ঠান</th>
                            <th style={{ border: '1px solid #fed7aa', padding: '0.4rem', width: '80px', textAlign: 'center', color: '#c2410c' }}>ক্যাটাগরি</th>
                            <th style={{ border: '1px solid #fed7aa', padding: '0.4rem', width: '70px', textAlign: 'center', color: '#c2410c' }}>আইসিটি (১৫)</th>
                            <th style={{ border: '1px solid #fed7aa', padding: '0.4rem', width: '70px', textAlign: 'center', color: '#c2410c' }}>যুক্তি (১৫)</th>
                            <th style={{ border: '1px solid #fed7aa', padding: '0.4rem', width: '70px', textAlign: 'center', color: '#c2410c' }}>উপস্থাপন (১০)</th>
                            <th style={{ border: '1px solid #fed7aa', padding: '0.4rem', width: '75px', textAlign: 'center', color: '#c2410c' }}>মোট (৪০)</th>
                            <th style={{ border: '1px solid #fed7aa', padding: '0.4rem', width: '110px', textAlign: 'center', color: '#c2410c' }}>মেধাক্রম / মন্তব্য</th>
                          </tr>
                        </thead>
                        <tbody>
                          {slot2Candidates.map((st, idx) => (
                            <tr key={st.id} style={{ height: '34px', borderBottom: '1px solid #fed7aa' }}>
                              <td style={{ border: '1px solid #fed7aa', textAlign: 'center', fontWeight: 900, color: '#ea580c' }}>
                                #{st.vivaToken}
                              </td>
                              <td style={{ border: '1px solid #fed7aa', textAlign: 'center', fontSize: '0.74rem', fontWeight: 700 }}>
                                {getVivaEstimatedTime('Slot 2', idx, slot2Candidates.length)}
                              </td>
                              <td style={{ border: '1px solid #fed7aa', textAlign: 'center', fontWeight: 800, fontFamily: 'monospace' }}>
                                {st.id}
                              </td>
                              <td style={{ border: '1px solid #fed7aa', paddingLeft: '0.45rem' }}>
                                <div style={{ fontWeight: 700 }}>{st.name}</div>
                                {st.institution && (
                                  <div style={{ fontSize: '0.68rem', color: '#7c2d12', marginTop: '0.1rem' }}>{st.institution}</div>
                                )}
                              </td>
                              <td style={{ border: '1px solid #fed7aa', textAlign: 'center' }}>{st.className}</td>
                              <td style={{ border: '1px solid #fed7aa' }}></td>
                              <td style={{ border: '1px solid #fed7aa' }}></td>
                              <td style={{ border: '1px solid #fed7aa' }}></td>
                              <td style={{ border: '1px solid #fed7aa', background: '#fffbeb' }}></td>
                              <td style={{ border: '1px solid #fed7aa' }}></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Footer Signatures */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2.5rem', padding: '0 1rem' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ borderTop: '1.5px solid #000', width: '170px', paddingTop: '0.25rem', fontSize: '0.78rem', fontWeight: 700 }}>
                        বিচারক ১ (স্বাক্ষর ও নাম)
                      </div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ borderTop: '1.5px solid #000', width: '170px', paddingTop: '0.25rem', fontSize: '0.78rem', fontWeight: 700 }}>
                        বিচারক ২ (স্বাক্ষর ও নাম)
                      </div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ borderTop: '1.5px solid #000', width: '170px', paddingTop: '0.25rem', fontSize: '0.78rem', fontWeight: 700 }}>
                        ভাইভা বোর্ড প্রধান / আহ্বায়ক
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
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
