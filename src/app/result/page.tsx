'use client';

import React, { useState } from 'react';
import { useSeatPlan, AllocatedStudent } from '@/context/SeatPlanContext';
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
  Sparkles
} from 'lucide-react';
import Link from 'next/link';

type ViewMode = 'slips' | 'visual' | 'notice' | 'attendance' | 'admit';

// Deep Purple and complementary pastel colors for visual room layout
const CLASS_COLORS = [
  { bg: '#faf5ff', border: '#7e22ce', text: '#581c87' }, // Deep Purple
  { bg: '#eef2ff', border: '#4f46e5', text: '#312e81' }, // Indigo
  { bg: '#fdf2f8', border: '#db2777', text: '#9d174d' }, // Pink
  { bg: '#f0fdfa', border: '#0d9488', text: '#115e59' }, // Teal
  { bg: '#fffbeb', border: '#d97706', text: '#92400e' }, // Amber
  { bg: '#f0fdf4', border: '#16a34a', text: '#166534' }, // Emerald
  { bg: '#fff1f2', border: '#e11d48', text: '#881337' }, // Rose
  { bg: '#f8fafc', border: '#475569', text: '#1e293b' }, // Slate
];

export default function ResultPage() {
  const { assignments, rooms, examInfo, swapSeats } = useSeatPlan();
  const [activeTab, setActiveTab] = useState<ViewMode>('slips');
  const [selectedRoomName, setSelectedRoomName] = useState<string>(
    Object.keys(assignments)[0] || ''
  );
  const [searchQuery, setSearchQuery] = useState('');
  
  // Interactive seat swap state
  const [swapSelectedStudent, setSwapSelectedStudent] = useState<AllocatedStudent | null>(null);
  const [swapNotification, setSwapNotification] = useState<string | null>(null);

  const roomNames = Object.keys(assignments);

  const handlePrint = () => {
    window.print();
  };

  if (roomNames.length === 0) {
    return (
      <div className="container" style={{ textAlign: 'center', paddingTop: '4rem' }}>
        <h2 style={{ color: 'var(--primary)' }}>কোন সিট প্ল্যান তৈরি করা হয়নি।</h2>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
          অনুগ্রহ করে ড্যাশবোর্ড থেকে রুম এবং শিক্ষার্থী ডেটা দিয়ে সিট প্ল্যান জেনারেট করুন।
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

  // Distinct classes
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

  // Search results
  const searchResults = searchQuery.trim()
    ? Object.entries(assignments).flatMap(([roomName, students]) =>
        students
          .filter(s =>
            s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.className.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .map(s => ({ ...s, roomName }))
      )
    : [];

  // Export to Excel (.xlsx)
  const handleExportExcel = () => {
    const exportData = Object.entries(assignments).flatMap(([roomName, students]) =>
      students.map((s, idx) => ({
        'Serial': idx + 1,
        'Room': `Room ${roomName}`,
        'Seat Code': s.seatNumber || `Seat ${idx + 1}`,
        'Row': s.row || '-',
        'Column': s.col || '-',
        'Roll / ID': s.id,
        'Student Name': s.name,
        'Class': s.className,
        'Institution': examInfo.institutionName || '',
        'Exam Title': examInfo.title || '',
        'Subject': examInfo.subject || '',
        'Date': examInfo.date || ''
      }))
    );

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Exam Seat Plan');
    XLSX.writeFile(
      workbook, 
      `Seat_Plan_${examInfo.title ? examInfo.title.replace(/[^a-zA-Z0-9]/g, '_') : 'Exam'}.xlsx`
    );
  };

  // Handle seat swap click
  const handleSeatClick = (student: AllocatedStudent) => {
    if (!swapSelectedStudent) {
      setSwapSelectedStudent(student);
      setSwapNotification(`সিট ১ নির্বাচিত: ${student.name} (${student.seatNumber})। সোয়াপ করতে অন্য সিটে ক্লিক করুন।`);
    } else {
      if (swapSelectedStudent.id === student.id) {
        setSwapSelectedStudent(null);
        setSwapNotification(null);
        return;
      }
      swapSeats(selectedRoomName, swapSelectedStudent.id, student.id);
      setSwapNotification(`সফলভাবে সোয়াপ হয়েছে: ${swapSelectedStudent.name} ⇄ ${student.name}`);
      setSwapSelectedStudent(null);
      setTimeout(() => setSwapNotification(null), 4000);
    }
  };

  return (
    <main className="container">
      {/* Top action bar - Hidden when printing */}
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link href="/" className="button" style={{ background: 'transparent', border: '1.5px solid var(--primary)', color: 'var(--primary)', boxShadow: 'none' }}>
            <ChevronLeft size={20} /> Dashboard
          </Link>
          {/* Logo & Tagline Pill in Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#ffffff', padding: '0.25rem 0.6rem', borderRadius: '0.5rem', border: '1px solid var(--primary-border)' }}>
            <img src="/logo/logo.png" alt="Logo" style={{ height: '24px', width: 'auto' }} />
            <span style={{ color: '#d8b4fe' }}>•</span>
            <img src="/logo/tagline_1.png" alt="Tagline" style={{ height: '26px', width: 'auto', maxWidth: '80px' }} />
          </div>
        </div>

        {/* View Mode Tabs (Deep Purple themed) */}
        <div style={{ display: 'flex', background: 'var(--card-bg)', padding: '0.25rem', borderRadius: '0.6rem', border: '1px solid var(--primary-border)', gap: '0.25rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveTab('slips')}
            style={{
              padding: '0.5rem 0.85rem',
              borderRadius: '0.4rem',
              border: 'none',
              background: activeTab === 'slips' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'slips' ? '#fff' : 'var(--foreground)',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <LayoutGrid size={16} /> Seat Slips (3x3)
          </button>

          <button
            onClick={() => setActiveTab('admit')}
            style={{
              padding: '0.5rem 0.85rem',
              borderRadius: '0.4rem',
              border: 'none',
              background: activeTab === 'admit' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'admit' ? '#fff' : 'var(--foreground)',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <CreditCard size={16} /> প্রবেশপত্র (Admit Cards)
          </button>

          <button
            onClick={() => setActiveTab('visual')}
            style={{
              padding: '0.5rem 0.85rem',
              borderRadius: '0.4rem',
              border: 'none',
              background: activeTab === 'visual' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'visual' ? '#fff' : 'var(--foreground)',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <Eye size={16} /> রো-কলাম লেআউট & সোয়াপ
          </button>

          <button
            onClick={() => setActiveTab('notice')}
            style={{
              padding: '0.5rem 0.85rem',
              borderRadius: '0.4rem',
              border: 'none',
              background: activeTab === 'notice' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'notice' ? '#fff' : 'var(--foreground)',
              cursor: 'pointer',
              fontWeight: 700,
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
              padding: '0.5rem 0.85rem',
              borderRadius: '0.4rem',
              border: 'none',
              background: activeTab === 'attendance' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'attendance' ? '#fff' : 'var(--foreground)',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <CheckSquare size={16} /> হাজিরা শিট
          </button>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={handleExportExcel} className="button button-secondary">
            <Download size={18} /> Export Excel
          </button>
          <button onClick={handlePrint} className="button">
            <Printer size={18} /> Print Current View
          </button>
        </div>
      </div>

      {/* Real-time Student Search Bar (Hidden when printing) */}
      <div className="no-print glass-card" style={{ padding: '0.75rem 1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', border: '1px solid var(--primary-border)' }}>
        <Search size={18} color="var(--primary)" />
        <input
          className="input"
          style={{ border: 'none', background: 'transparent', padding: '0.2rem', fontSize: '0.95rem' }}
          placeholder="রোল, শিক্ষার্থী নাম অথবা ক্লাস দিয়ে সিট খুঁজুন (Search Student / Roll)..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button 
            onClick={() => setSearchQuery('')}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Search Results Preview Card */}
      {searchQuery.trim() && (
        <div className="no-print glass-card" style={{ marginBottom: '1.5rem', border: '2px solid var(--primary)', background: 'var(--card-bg)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <h4 style={{ margin: 0, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Search size={18} /> সার্চ ফলাফল ({searchResults.length} জন পাওয়া গেছে)
            </h4>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              রুমের নামের উপর ক্লিক করলে রো-কলাম লেআউটে নিয়ে যাবে
            </span>
          </div>

          {searchResults.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', padding: '0.5rem 0' }}>
              কোন শিক্ষার্থী পাওয়া যায়নি।
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '0.75rem', maxHeight: '220px', overflowY: 'auto' }}>
              {searchResults.map((st) => (
                <div 
                  key={`${st.id}-${st.roomName}`}
                  onClick={() => {
                    setSelectedRoomName(st.roomName);
                    setActiveTab('visual');
                  }}
                  style={{
                    padding: '0.65rem 0.85rem',
                    borderRadius: '0.4rem',
                    border: '1px solid var(--primary-border)',
                    background: 'var(--primary-tint)',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'border-color 0.2s ease'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--foreground)' }}>{st.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Roll: <strong>{st.id}</strong> • Class: {st.className}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ background: 'var(--primary)', color: '#fff', fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '0.25rem', fontWeight: 700 }}>
                      Room {st.roomName}
                    </span>
                    <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 800, marginTop: '0.2rem' }}>
                      {st.seatNumber || 'Seat 1'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* 1. SEAT SLIPS (3x3 Grid Layout with Logo & Tagline)       */}
      {/* ========================================================= */}
      {activeTab === 'slips' && (
        <div id="printable-area">
          {roomNames.map((roomName) => {
            const roomStudents = assignments[roomName];
            const chunks = chunk(roomStudents, 9); // 9 slips per A4 page

            return chunks.map((seatChunk, chunkIndex) => (
              <div 
                key={`${roomName}-${chunkIndex}`} 
                className={chunkIndex > 0 || roomNames.indexOf(roomName) > 0 ? "print-page-break" : ""} 
                style={{ marginBottom: '2.5rem' }}
              >
                <div style={{ padding: '0.5rem', border: '1px solid var(--primary-border)', borderRadius: '0.5rem', background: 'white' }}>
                  <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    <strong style={{ color: 'var(--primary)' }}>Room: {roomName} — Page {chunkIndex + 1} of {chunks.length}</strong>
                    <span>({seatChunk.length} Slips on this page)</span>
                  </div>
                  
                  {/* 3x3 Grid with 7mm Cutting Gutter */}
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(3, 1fr)', 
                    gridTemplateRows: 'repeat(3, 1fr)',
                    gap: '7mm', 
                    padding: '6mm 5mm',
                    width: '100%',
                    maxWidth: '210mm',
                    height: '290mm',
                    maxHeight: '295mm',
                    margin: '0 auto',
                    boxSizing: 'border-box'
                  }}>
                    {seatChunk.map((student) => (
                      <div key={student.id} style={{ 
                        border: '1.5px dashed #a855f7', 
                        borderRadius: '8px',
                        padding: '3px', 
                        height: '100%',
                        backgroundColor: '#ffffff',
                        boxSizing: 'border-box',
                        position: 'relative'
                      }}>
                        {/* Inner Deep Purple Card Frame */}
                        <div style={{
                          border: '2px solid #6b21a8',
                          borderRadius: '6px',
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          overflow: 'hidden',
                          backgroundColor: '#ffffff',
                          boxShadow: '0 2px 6px rgba(107, 33, 168, 0.1)'
                        }}>
                          {/* 1. Header with BOTH Logo & Tagline */}
                          <div>
                            <div style={{ 
                              background: 'linear-gradient(135deg, #4c1d95 0%, #6b21a8 50%, #7e22ce 100%)', 
                              padding: '0.4rem 0.55rem',
                              color: '#ffffff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: '0.4rem',
                              borderBottom: '2px solid #3b0764'
                            }}>
                              {/* Left: Main Logo */}
                              <div style={{ 
                                background: '#ffffff', 
                                borderRadius: '4px', 
                                padding: '2px 5px', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                flexShrink: 0
                              }}>
                                <img 
                                  src="/logo/logo.png" 
                                  alt="Logo" 
                                  style={{ height: '22px', width: 'auto', maxWidth: '85px', objectFit: 'contain' }} 
                                />
                              </div>

                              {/* Right: Tagline */}
                              <div style={{ 
                                background: '#ffffff', 
                                borderRadius: '4px', 
                                padding: '2px 5px', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                flexShrink: 0
                              }}>
                                <img 
                                  src="/logo/tagline_1.png" 
                                  alt="Tagline" 
                                  style={{ height: '26px', width: 'auto', maxWidth: '85px', objectFit: 'contain' }} 
                                />
                              </div>
                            </div>

                            {/* Institution Name & Exam Subheader */}
                            <div style={{ 
                              background: '#faf5ff', 
                              borderBottom: '1px solid #e9d5ff', 
                              padding: '0.2rem 0.5rem', 
                              textAlign: 'center',
                              fontSize: '0.68rem',
                              fontWeight: 800,
                              color: '#581c87',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}>
                              {examInfo.institutionName || 'Model School & College'}
                              {examInfo.title && ` • ${examInfo.title}`}
                            </div>
                          </div>

                          {/* 2. Prominent Room & Seat Highlight Ribbon */}
                          <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center', 
                            padding: '0.35rem 0.55rem', 
                            background: '#fdf4ff',
                            borderBottom: '1px solid #f0abfc'
                          }}>
                            <div style={{ 
                              background: '#ffffff', 
                              border: '1.5px solid #7e22ce', 
                              padding: '0.15rem 0.45rem', 
                              borderRadius: '4px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem'
                            }}>
                              <span style={{ fontSize: '0.7rem', color: '#6b21a8', fontWeight: 700 }}>ROOM</span>
                              <strong style={{ fontSize: '0.95rem', color: '#581c87', fontWeight: 900 }}>{roomName}</strong>
                            </div>

                            <div style={{ 
                              background: '#6b21a8', 
                              color: '#ffffff', 
                              padding: '0.18rem 0.6rem', 
                              borderRadius: '4px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                              boxShadow: '0 1px 3px rgba(107, 33, 168, 0.4)'
                            }}>
                              <span style={{ fontSize: '0.72rem', color: '#f3e8ff', fontWeight: 700 }}>SEAT</span>
                              <strong style={{ fontSize: '1.05rem', color: '#ffffff', fontWeight: 900, letterSpacing: '0.5px' }}>
                                {student.seatNumber || 'N/A'}
                              </strong>
                            </div>
                          </div>

                          {/* 3. Student Profile Section */}
                          <div style={{ padding: '0.45rem 0.6rem', flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            {/* Candidate Name */}
                            <div style={{ marginBottom: '0.5rem' }}>
                              <div style={{ fontSize: '0.64rem', fontWeight: 800, color: '#6b21a8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Candidate Name
                              </div>
                              <div style={{ 
                                fontSize: '1.12rem', 
                                fontWeight: 900, 
                                color: '#1e112a', 
                                lineHeight: '1.2',
                                marginTop: '0.1rem',
                                wordBreak: 'break-word'
                              }}>
                                {student.name}
                              </div>
                            </div>

                            {/* Class & Roll Grid */}
                            <div style={{ 
                              display: 'grid', 
                              gridTemplateColumns: '1fr 1fr', 
                              gap: '0.5rem', 
                              background: '#faf5ff', 
                              padding: '0.4rem 0.55rem', 
                              borderRadius: '5px',
                              border: '1px solid #e9d5ff'
                            }}>
                              <div>
                                <div style={{ fontSize: '0.64rem', fontWeight: 800, color: '#6b21a8', textTransform: 'uppercase' }}>
                                  Class
                                </div>
                                <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#6b21a8', marginTop: '0.1rem' }}>
                                  {student.className}
                                </div>
                              </div>
                              <div style={{ borderLeft: '1.5px solid #d8b4fe', paddingLeft: '0.5rem' }}>
                                <div style={{ fontSize: '0.64rem', fontWeight: 800, color: '#6b21a8', textTransform: 'uppercase' }}>
                                  Roll / ID
                                </div>
                                <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#1e112a', fontFamily: 'monospace', marginTop: '0.1rem' }}>
                                  {student.id}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* 4. Bottom Footer Strip */}
                          <div style={{ 
                            background: '#faf5ff', 
                            padding: '0.3rem 0.55rem', 
                            borderTop: '1px dashed #d8b4fe', 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            fontSize: '0.65rem'
                          }}>
                            <span style={{ fontWeight: 800, color: '#6b21a8', letterSpacing: '0.3px', textTransform: 'uppercase' }}>
                              ★ Official Desk Slip
                            </span>
                            <span style={{ color: '#8b5cf6', fontStyle: 'italic', fontWeight: 600 }}>
                              Keep on Desk
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Fill empty cells to maintain 3x3 grid */}
                    {Array.from({ length: 9 - seatChunk.length }).map((_, i) => (
                      <div key={`empty-${i}`} style={{ border: '1px dashed #cbd5e1', borderRadius: '8px', background: '#fafafa', height: '100%' }} />
                    ))}
                  </div>
                </div>
              </div>
            ));
          })}
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. ADMIT CARDS GENERATION (with Logo & Tagline)           */}
      {/* ========================================================= */}
      {activeTab === 'admit' && (
        <div id="printable-area">
          {roomNames.map((roomName) => {
            const roomStudents = assignments[roomName];
            const chunks = chunk(roomStudents, 2);

            return chunks.map((admitPair, pIdx) => (
              <div 
                key={`admit-${roomName}-${pIdx}`} 
                className={pIdx > 0 || roomNames.indexOf(roomName) > 0 ? "print-page-break" : ""}
                style={{ marginBottom: '2rem' }}
              >
                <div style={{ maxWidth: '210mm', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5cm', minHeight: '27.7cm', justifyContent: 'center' }}>
                  {admitPair.map((student) => (
                    <div 
                      key={student.id} 
                      style={{ 
                        border: '2px solid #6b21a8', 
                        borderRadius: '0.6rem', 
                        padding: '1.25rem', 
                        background: '#fff',
                        position: 'relative',
                        boxShadow: '0 4px 12px rgba(107, 33, 168, 0.1)'
                      }}
                    >
                      {/* Top Header with BOTH Logo & Tagline */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2.5px solid #6b21a8', paddingBottom: '0.85rem', marginBottom: '1rem', gap: '0.75rem' }}>
                        {/* Main Logo */}
                        <div style={{ background: '#ffffff', padding: '4px 8px', borderRadius: '6px', border: '1px solid #d8b4fe', flexShrink: 0 }}>
                          <img 
                            src="/logo/logo.png" 
                            alt="Logo" 
                            style={{ height: '40px', width: 'auto', maxWidth: '140px', objectFit: 'contain' }} 
                          />
                        </div>

                        {/* Center Institution Info */}
                        <div style={{ textAlign: 'center', flexGrow: 1 }}>
                          <h2 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#581c87', margin: 0, textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                            {examInfo.institutionName || 'Model School & College'}
                          </h2>
                          <div style={{ fontSize: '0.88rem', color: '#6b21a8', fontWeight: 700, marginTop: '0.15rem' }}>
                            {examInfo.title || 'Examination Admit Card 2026'}
                          </div>
                        </div>

                        {/* Tagline Graphic */}
                        <div style={{ background: '#ffffff', padding: '3px 8px', borderRadius: '6px', border: '1px solid #d8b4fe', flexShrink: 0 }}>
                          <img 
                            src="/logo/tagline_1.png" 
                            alt="Tagline" 
                            style={{ height: '45px', width: 'auto', maxWidth: '130px', objectFit: 'contain' }} 
                          />
                        </div>

                        {/* Candidate Photo Box */}
                        <div style={{ 
                          width: '74px', 
                          height: '88px', 
                          border: '1.5px dashed #7e22ce', 
                          borderRadius: '0.35rem', 
                          display: 'flex', 
                          flexDirection: 'column',
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          textAlign: 'center',
                          fontSize: '0.62rem',
                          color: '#6b21a8',
                          background: '#faf5ff',
                          padding: '0.2rem',
                          flexShrink: 0
                        }}>
                          <span>Affix Passport Size Photo</span>
                        </div>
                      </div>

                      {/* Admit Card Badge */}
                      <div style={{ textAlign: 'center', marginTop: '-1.6rem', marginBottom: '0.85rem' }}>
                        <span style={{ background: '#6b21a8', color: '#fff', padding: '0.25rem 1.4rem', borderRadius: '1rem', fontWeight: 900, fontSize: '0.85rem', letterSpacing: '0.5px', boxShadow: '0 2px 4px rgba(107,33,168,0.3)' }}>
                          ADMIT CARD / প্রবেশপত্র
                        </span>
                      </div>

                      {/* Student Details Grid */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', background: '#faf5ff', padding: '0.9rem', borderRadius: '0.5rem', border: '1px solid #e9d5ff', marginBottom: '0.9rem', fontSize: '0.95rem' }}>
                        <div>
                          <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Student Name: </span>
                          <strong style={{ color: '#1e112a' }}>{student.name}</strong>
                        </div>
                        <div>
                          <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Roll / ID: </span>
                          <strong style={{ color: '#6b21a8', fontFamily: 'monospace' }}>{student.id}</strong>
                        </div>
                        <div>
                          <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Class: </span>
                          <strong style={{ color: '#1e112a' }}>{student.className}</strong>
                        </div>
                        <div>
                          <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Subject: </span>
                          <strong style={{ color: '#1e112a' }}>{examInfo.subject || 'All Subjects'}</strong>
                        </div>
                        <div>
                          <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Allotted Room: </span>
                          <strong style={{ color: '#6b21a8' }}>Room {roomName}</strong>
                        </div>
                        <div>
                          <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Assigned Seat: </span>
                          <strong style={{ color: '#6b21a8', fontWeight: 800 }}>{student.seatNumber || 'Seat 1'}</strong>
                        </div>
                      </div>

                      {/* Instructions */}
                      <div style={{ fontSize: '0.75rem', color: '#475569', marginBottom: '1.5rem', lineHeight: '1.3' }}>
                        <strong>পরীক্ষার্থীর নির্দেশনাবলী:</strong> {examInfo.instructions || '১. প্রবেশপত্র ছাড়া পরীক্ষা কক্ষে প্রবেশ নিষেধ। ২. পরীক্ষা শুরু হওয়ার ১৫ মিনিট পূর্বে হলে উপস্থিত হতে হবে।'}
                      </div>

                      {/* Signatures */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: '1rem', borderTop: '1px dashed #cbd5e1' }}>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ borderTop: '1.5px solid #334155', width: '160px', paddingTop: '0.25rem', fontSize: '0.8rem', fontWeight: 700 }}>
                            Candidate Signature
                          </div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ borderTop: '1.5px solid #6b21a8', width: '170px', paddingTop: '0.25rem', fontSize: '0.8rem', fontWeight: 800, color: '#581c87' }}>
                            Headmaster / Principal
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ));
          })}
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. VISUAL ROOM BENCH LAYOUT & SEAT SWAP                   */}
      {/* ========================================================= */}
      {activeTab === 'visual' && (
        <div id="printable-area" className="glass-card" style={{ padding: '1.5rem', background: 'var(--card-bg)' }}>
          {/* Room Selector & Swap Notice Bar */}
          <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ArrowLeftRight size={22} color="var(--primary)" /> Room {selectedRoomName} - রো-কলাম লেআউট & ম্যানুয়াল সোয়াপ
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
                বেঞ্চ প্রতি ১ জন পরীক্ষার্থী। <strong>সিট সোয়াপ করতে:</strong> যেকোনো শিক্ষার্থীর সিটে ক্লিক করুন, তারপর অন্য সিটে ক্লিক করলে তাদের সিট স্বয়ংক্রিয়ভাবে অদলবদল হয়ে যাবে।
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>রুম সিলেক্ট করুন:</span>
              <select
                className="input"
                style={{ width: 'auto', padding: '0.4rem 0.8rem' }}
                value={selectedRoomName}
                onChange={e => {
                  setSelectedRoomName(e.target.value);
                  setSwapSelectedStudent(null);
                  setSwapNotification(null);
                }}
              >
                {roomNames.map(name => (
                  <option key={name} value={name}>Room {name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Interactive Swap Banner */}
          {swapNotification && (
            <div className="no-print" style={{ 
              background: 'var(--primary-tint)', 
              border: '1.5px solid var(--primary)', 
              borderRadius: '0.5rem', 
              padding: '0.65rem 1rem', 
              marginBottom: '1rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontWeight: 700,
              color: 'var(--primary)',
              fontSize: '0.9rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ArrowLeftRight size={18} />
                <span>{swapNotification}</span>
              </div>
              {swapSelectedStudent && (
                <button 
                  onClick={() => { setSwapSelectedStudent(null); setSwapNotification(null); }}
                  className="button"
                  style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem', background: '#ef4444' }}
                >
                  Cancel Swap
                </button>
              )}
            </div>
          )}

          {/* Class Legend */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', marginBottom: '1.5rem', padding: '0.75rem', background: 'var(--primary-tint)', borderRadius: '0.5rem', border: '1px solid var(--primary-border)' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary)', alignSelf: 'center' }}>
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
                    fontWeight: 800 
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
            background: 'linear-gradient(135deg, #4c1d95, #6b21a8)', 
            color: '#fff', 
            padding: '0.55rem', 
            borderRadius: '0.4rem', 
            fontWeight: 800, 
            letterSpacing: '1px', 
            marginBottom: '1.5rem',
            width: '60%',
            margin: '0 auto 1.5rem auto',
            boxShadow: '0 2px 6px rgba(107, 33, 168, 0.25)'
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
                      
                      const student = roomStudents.find(s => 
                        s.seatNumber?.startsWith(seatCode) || 
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
                              ? '3px solid #f59e0b' 
                              : student 
                              ? `2px solid ${colStyle?.border}` 
                              : '1.5px dashed var(--primary-border)',
                            background: isSelectedForSwap ? '#fef3c7' : student ? colStyle?.bg : 'var(--glass-bg)',
                            borderRadius: '0.5rem',
                            padding: '0.85rem',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            minHeight: '115px',
                            boxShadow: isSelectedForSwap ? '0 0 10px rgba(245, 158, 11, 0.5)' : student ? '0 2px 6px rgba(107,33,168,0.06)' : 'none',
                            position: 'relative',
                            cursor: student ? 'pointer' : 'default',
                            transform: isSelectedForSwap ? 'scale(1.02)' : 'none',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          {/* Seat identifier */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)', background: 'var(--card-bg)', padding: '0.1rem 0.4rem', borderRadius: '0.2rem', border: '1px solid var(--primary-border)' }}>
                              {seatCode}
                            </span>
                            {student && (
                              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: colStyle?.text }}>
                                {student.className}
                              </span>
                            )}
                          </div>

                          {student ? (
                            <div>
                              <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a', lineHeight: '1.2', marginBottom: '0.2rem' }}>
                                {student.name}
                              </div>
                              <div style={{ fontSize: '0.8rem', color: '#475569' }}>
                                Roll: <strong>{student.id}</strong>
                              </div>
                            </div>
                          ) : (
                            <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.8rem', margin: 'auto' }}>
                              (খালি সিট)
                            </div>
                          )}

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.35rem', paddingTop: '0.25rem', borderTop: '1px dashed rgba(0,0,0,0.06)' }}>
                            <span style={{ fontSize: '0.65rem', color: '#64748b' }}>১ জন/বেঞ্চ</span>
                            {student && (
                              <span style={{ fontSize: '0.65rem', color: 'var(--primary)', fontWeight: 700 }}>
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
      {/* 4. NOTICE BOARD SUMMARY (with Logo & Tagline)             */}
      {/* ========================================================= */}
      {activeTab === 'notice' && (
        <div id="printable-area" style={{ background: '#fff', padding: '2rem', borderRadius: '0.5rem', border: '2px solid #6b21a8' }}>
          {/* Header with BOTH Logo & Tagline */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2.5px solid #6b21a8', paddingBottom: '1rem', marginBottom: '1.5rem', gap: '1rem' }}>
            {/* Logo */}
            <div style={{ background: '#ffffff', padding: '4px 8px', borderRadius: '6px', border: '1px solid #d8b4fe', flexShrink: 0 }}>
              <img src="/logo/logo.png" alt="Logo" style={{ height: '42px', width: 'auto' }} />
            </div>

            {/* Title */}
            <div style={{ textAlign: 'center', flexGrow: 1 }}>
              <h1 style={{ fontSize: '1.65rem', fontWeight: 900, color: '#581c87', margin: 0, textTransform: 'uppercase' }}>
                {examInfo.institutionName || 'Model School & College'}
              </h1>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#6b21a8', marginTop: '0.25rem' }}>
                EXAMINATION SEAT ALLOCATION NOTICE — {examInfo.title || 'Seat Plan'}
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '0.4rem', fontSize: '0.85rem', color: '#475569' }}>
                {examInfo.subject && <span><strong>Subject:</strong> {examInfo.subject}</span>}
                {examInfo.date && <span><strong>Date:</strong> {examInfo.date}</span>}
                <span><strong>Rule:</strong> ১ জন / বেঞ্চ (Single Seat Grid)</span>
              </div>
            </div>

            {/* Tagline */}
            <div style={{ background: '#ffffff', padding: '3px 8px', borderRadius: '6px', border: '1px solid #d8b4fe', flexShrink: 0 }}>
              <img src="/logo/tagline_1.png" alt="Tagline" style={{ height: '45px', width: 'auto', maxWidth: '120px' }} />
            </div>
          </div>

          {/* Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', color: '#000' }}>
            <thead>
              <tr style={{ background: '#faf5ff', borderBottom: '2px solid #6b21a8' }}>
                <th style={{ border: '1px solid #d8b4fe', padding: '0.75rem', textAlign: 'center', color: '#581c87' }}>রুম নম্বর</th>
                <th style={{ border: '1px solid #d8b4fe', padding: '0.75rem', textAlign: 'center', color: '#581c87' }}>লেআউট (Row × Col)</th>
                <th style={{ border: '1px solid #d8b4fe', padding: '0.75rem', textAlign: 'left', color: '#581c87' }}>অন্তর্ভুক্ত ক্লাসসমূহ</th>
                <th style={{ border: '1px solid #d8b4fe', padding: '0.75rem', textAlign: 'left', color: '#581c87' }}>শিক্ষার্থী আইডি / রোল রেঞ্জ</th>
                <th style={{ border: '1px solid #d8b4fe', padding: '0.75rem', textAlign: 'center', color: '#581c87' }}>মোট পরীক্ষার্থী</th>
              </tr>
            </thead>
            <tbody>
              {roomNames.map(roomName => {
                const roomStudents = assignments[roomName] || [];
                const roomObj = rooms.find(r => r.name === roomName);
                
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
                  <tr key={roomName} style={{ borderBottom: '1px solid #e9d5ff' }}>
                    <td style={{ border: '1px solid #e9d5ff', padding: '0.75rem', textAlign: 'center', fontWeight: 800, fontSize: '1.05rem', color: '#6b21a8' }}>
                      Room {roomName}
                    </td>
                    <td style={{ border: '1px solid #e9d5ff', padding: '0.75rem', textAlign: 'center' }}>
                      {roomObj?.rows || Math.ceil((roomObj?.capacity || 20) / 4)} × {roomObj?.cols || 4}
                    </td>
                    <td style={{ border: '1px solid #e9d5ff', padding: '0.75rem' }}>
                      {Object.keys(classGroups).join(', ')}
                    </td>
                    <td style={{ border: '1px solid #e9d5ff', padding: '0.75rem', fontSize: '0.85rem' }}>
                      {classSummaries.map((s, idx) => (
                        <div key={idx} style={{ marginBottom: '0.2rem' }}>{s}</div>
                      ))}
                    </td>
                    <td style={{ border: '1px solid #e9d5ff', padding: '0.75rem', textAlign: 'center', fontWeight: 800, fontSize: '1rem', color: '#6b21a8' }}>
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
              <div style={{ borderTop: '1.5px solid #000', width: '180px', paddingTop: '0.3rem', fontWeight: 700 }}>
                পরীক্ষা নিয়ন্ত্রক
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ borderTop: '1.5px solid #000', width: '180px', paddingTop: '0.3rem', fontWeight: 700 }}>
                অধ্যক্ষ / প্রধান শিক্ষক
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. ATTENDANCE SHEET (with Logo & Tagline)                 */}
      {/* ========================================================= */}
      {activeTab === 'attendance' && (
        <div id="printable-area">
          {roomNames.map((roomName, rIndex) => {
            const roomStudents = assignments[roomName] || [];

            return (
              <div 
                key={roomName} 
                className={rIndex > 0 ? "print-page-break" : ""} 
                style={{ background: '#fff', padding: '1.5rem', borderRadius: '0.5rem', border: '2px solid #6b21a8', marginBottom: '2rem' }}
              >
                {/* Header with BOTH Logo & Tagline */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2.5px solid #6b21a8', paddingBottom: '0.85rem', marginBottom: '1rem', gap: '1rem' }}>
                  {/* Logo */}
                  <div style={{ background: '#ffffff', padding: '3px 6px', borderRadius: '4px', border: '1px solid #d8b4fe', flexShrink: 0 }}>
                    <img src="/logo/logo.png" alt="Logo" style={{ height: '36px', width: 'auto' }} />
                  </div>

                  {/* Center Text */}
                  <div style={{ textAlign: 'center', flexGrow: 1 }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#581c87', textTransform: 'uppercase' }}>
                      {examInfo.institutionName || 'Model School & College'}
                    </div>
                    <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: '0.15rem 0', color: '#1e112a' }}>
                      EXAM ATTENDANCE & SIGNATURE SHEET
                    </h2>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#6b21a8' }}>
                      {examInfo.title || 'Examination 2026'}
                    </div>
                  </div>

                  {/* Tagline */}
                  <div style={{ background: '#ffffff', padding: '2px 6px', borderRadius: '4px', border: '1px solid #d8b4fe', flexShrink: 0 }}>
                    <img src="/logo/tagline_1.png" alt="Tagline" style={{ height: '40px', width: 'auto', maxWidth: '110px' }} />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.85rem', fontSize: '0.85rem', color: '#444' }}>
                  <span><strong>Room:</strong> Room {roomName} ({roomStudents.length} Students)</span>
                  {examInfo.subject && <span><strong>Subject:</strong> {examInfo.subject}</span>}
                  {examInfo.date && <span><strong>Date:</strong> {examInfo.date}</span>}
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse', color: '#000', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ background: '#faf5ff', borderBottom: '2px solid #6b21a8' }}>
                      <th style={{ border: '1px solid #d8b4fe', padding: '0.5rem', width: '50px', textAlign: 'center', color: '#581c87' }}>SL</th>
                      <th style={{ border: '1px solid #d8b4fe', padding: '0.5rem', width: '90px', textAlign: 'center', color: '#581c87' }}>Seat No</th>
                      <th style={{ border: '1px solid #d8b4fe', padding: '0.5rem', width: '100px', textAlign: 'center', color: '#581c87' }}>Roll / ID</th>
                      <th style={{ border: '1px solid #d8b4fe', padding: '0.5rem', textAlign: 'left', color: '#581c87' }}>Student Name</th>
                      <th style={{ border: '1px solid #d8b4fe', padding: '0.5rem', width: '100px', textAlign: 'center', color: '#581c87' }}>Class</th>
                      <th style={{ border: '1px solid #d8b4fe', padding: '0.5rem', width: '160px', textAlign: 'center', color: '#581c87' }}>Student Sign</th>
                      <th style={{ border: '1px solid #d8b4fe', padding: '0.5rem', width: '120px', textAlign: 'center', color: '#581c87' }}>Script / Khata No</th>
                    </tr>
                  </thead>
                  <tbody>
                    {roomStudents.map((student, idx) => (
                      <tr key={student.id} style={{ height: '38px', borderBottom: '1px solid #e9d5ff' }}>
                        <td style={{ border: '1px solid #d8b4fe', textAlign: 'center' }}>{idx + 1}</td>
                        <td style={{ border: '1px solid #d8b4fe', textAlign: 'center', fontWeight: 800, color: '#6b21a8' }}>
                          {student.seatNumber || `Seat ${idx + 1}`}
                        </td>
                        <td style={{ border: '1px solid #d8b4fe', textAlign: 'center', fontWeight: 700 }}>{student.id}</td>
                        <td style={{ border: '1px solid #d8b4fe', paddingLeft: '0.5rem' }}>{student.name}</td>
                        <td style={{ border: '1px solid #d8b4fe', textAlign: 'center' }}>{student.className}</td>
                        <td style={{ border: '1px solid #d8b4fe' }}></td>
                        <td style={{ border: '1px solid #d8b4fe' }}></td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3.5rem', padding: '0 1rem' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ borderTop: '1.5px solid #000', width: '200px', paddingTop: '0.3rem', fontSize: '0.85rem', fontWeight: 700 }}>
                      Invigilator 1 Signature
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ borderTop: '1.5px solid #000', width: '200px', paddingTop: '0.3rem', fontSize: '0.85rem', fontWeight: 700 }}>
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
