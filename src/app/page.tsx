'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useSeatPlan, SeatingPattern, GALA_CLASSES } from '@/context/SeatPlanContext';
import RoomManager from '@/components/RoomManager';
import FileUploader from '@/components/FileUploader';
import { 
  LayoutGrid, 
  Users, 
  Trash2, 
  Download, 
  AlertTriangle, 
  CheckCircle2, 
  BookOpen, 
  Building2,
  Compass,
  Sparkles,
  CheckCircle,
  Clock,
  Layers,
  Award
} from 'lucide-react';

export default function Dashboard() {
  const router = useRouter();
  const { 
    students, 
    rooms, 
    examInfo, 
    setExamInfo, 
    seatingPattern,
    setSeatingPattern,
    generatePlan, 
    loadGalaPreset,
    clearAll 
  } = useSeatPlan();

  const totalSeats = rooms.reduce((acc, r) => acc + r.capacity, 0);
  const totalStudents = students.length;
  const isShortage = totalSeats < totalStudents && totalStudents > 0;
  const surplusSeats = totalSeats - totalStudents;

  // Class-wise count
  const classBreakdown = students.reduce((acc, s) => {
    const cls = s.className.trim() || 'Unknown';
    acc[cls] = (acc[cls] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const handleGenerate = () => {
    generatePlan();
    router.push('/result');
  };

  const handleDownloadSample = () => {
    // 13 Gala classes sample
    let sampleRows = "ID,Name,Class\n";
    GALA_CLASSES.forEach((c, idx) => {
      sampleRows += `ICTOB-${1001 + idx * 10},Student ${idx + 1}A,${c}\n`;
      sampleRows += `ICTOB-${1002 + idx * 10},Student ${idx + 1}B,${c}\n`;
    });
    const encodedUri = encodeURI("data:text/csv;charset=utf-8," + sampleRows);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "ict_olympiad_sample_students.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <main className="container">
      {/* Header with ICT Olympiad Bangladesh Brand Colors & Logos */}
      <header className="glass-card" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.25rem', padding: '1.25rem 1.75rem', borderTop: '4px solid var(--primary)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          {/* Main Logo & Tagline Displays */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: '#ffffff', padding: '0.55rem 1.1rem', borderRadius: '0.6rem', border: '1.5px solid var(--primary-border)', boxShadow: '0 2px 8px rgba(0, 75, 153, 0.1)' }}>
            <img src="/logo/logo.png" alt="ICT Olympiad Bangladesh Logo" style={{ height: '44px', width: 'auto', objectFit: 'contain' }} />
            <div style={{ width: '1.5px', height: '52px', background: 'var(--primary-border)' }} />
            <img src="/logo/tagline_1.png" alt="Tagline" style={{ height: '62px', width: 'auto', objectFit: 'contain' }} />
          </div>

          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'var(--primary-tint)', color: 'var(--primary)', padding: '0.2rem 0.65rem', borderRadius: '1rem', fontSize: '0.78rem', fontWeight: 800, marginBottom: '0.3rem', border: '1px solid var(--primary-border)' }}>
              <Sparkles size={13} color="var(--accent)" /> Season 3 Gala Round Edition
            </div>
            <h1 style={{ fontSize: '2.1rem', fontWeight: '900', background: 'linear-gradient(to right, #004b99, #00a3e0, #0284c7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0, letterSpacing: '-0.5px' }}>
              ICT Olympiad Seat Plan & Exam System
            </h1>
            <p style={{ color: 'var(--text-muted)', marginTop: '0.2rem', fontSize: '0.9rem' }}>
              লিখিত ও ভাইভা পরীক্ষার প্যারালাল সিট প্ল্যান, ৩x৩ ডেস্ক স্লিপ, নোটিশ বোর্ড চার্ট ও আধুনিক এডমিট কার্ড।
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button 
            onClick={loadGalaPreset} 
            className="button button-accent"
            style={{ fontWeight: 800 }}
            title="Load 130 students across 13 classes with 5 rooms and parallel schedule"
          >
            <Award size={18} /> Load Season 3 Gala Preset (130)
          </button>
          <button onClick={handleDownloadSample} className="button button-secondary" style={{ background: 'transparent', border: '1.5px solid var(--secondary)', color: 'var(--secondary)', boxShadow: 'none' }}>
            <Download size={18} /> Sample CSV
          </button>
          <button onClick={clearAll} className="button" style={{ background: '#ef4444', boxShadow: 'none' }}>
            <Trash2 size={18} /> Reset
          </button>
        </div>
      </header>

      {/* Gala Round Parallel Exam Info Banner */}
      <div style={{ 
        background: 'linear-gradient(135deg, rgba(0, 75, 153, 0.08), rgba(0, 163, 224, 0.08))', 
        border: '1.5px solid var(--primary-border)', 
        borderRadius: '0.75rem', 
        padding: '1rem 1.5rem', 
        marginBottom: '2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'var(--primary)', color: '#fff', padding: '0.6rem', borderRadius: '0.5rem' }}>
            <Clock size={24} />
          </div>
          <div>
            <div style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '1rem' }}>
              প্যারালাল পরীক্ষা পদ্ধতি (Parallel Written & Viva Voce: 09:00 AM - 11:00 AM)
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              • <strong>Slot 1 (09:00 - 09:50 AM):</strong> Group A লিখিত (Room 101, 102) | Group B ভাইভা (Room 103, 104, 105 এর ৫টি বোর্ডে)<br />
              • <strong>Slot 2 (10:05 - 10:55 AM):</strong> Group B লিখিত (Room 101, 102) | Group A ভাইভা (Room 103, 104, 105 এর ৫টি বোর্ডে)
            </div>
          </div>
        </div>
        <div>
          <button 
            onClick={handleGenerate} 
            className="button"
            style={{ fontWeight: 800, padding: '0.65rem 1.4rem' }}
          >
            <LayoutGrid size={18} /> সিট প্ল্যান ও এডমিট কার্ড দেখুন
          </button>
        </div>
      </div>

      {/* Institution Details & Seating Configuration Section */}
      <section className="glass-card" style={{ marginBottom: '2rem', borderTop: '4px solid var(--primary)' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
          <BookOpen size={20} color="var(--primary)" /> প্রতিষ্ঠান ও পরীক্ষার তথ্য (Institution & Exam Setup)
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>
              প্রতিষ্ঠানের নাম (Institution Name)
            </label>
            <input 
              className="input" 
              placeholder="e.g. ICT Olympiad Bangladesh - Season 3" 
              value={examInfo.institutionName}
              onChange={e => setExamInfo(prev => ({ ...prev, institutionName: e.target.value }))}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>
              পরীক্ষার নাম (Exam Title)
            </label>
            <input 
              className="input" 
              placeholder="e.g. Gala Round Grand Finale 2026" 
              value={examInfo.title}
              onChange={e => setExamInfo(prev => ({ ...prev, title: e.target.value }))}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>
              বিষয় ও মূল্যায়ন (Subject / Evaluation)
            </label>
            <input 
              className="input" 
              placeholder="e.g. Written & Viva Voce Evaluation" 
              value={examInfo.subject}
              onChange={e => setExamInfo(prev => ({ ...prev, subject: e.target.value }))}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>
              সময়কাল ও তারিখ (Date & Time Window)
            </label>
            <input 
              className="input" 
              placeholder="e.g. Saturday | 09:00 AM - 11:00 AM"
              value={examInfo.date}
              onChange={e => setExamInfo(prev => ({ ...prev, date: e.target.value }))}
            />
          </div>
        </div>

        {/* Logo and Tagline Status & Seating Pattern Select */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', alignItems: 'center', paddingTop: '1rem', borderTop: '1px dashed var(--primary-border)' }}>
          {/* Logo & Tagline Status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#ffffff', padding: '0.45rem 0.85rem', borderRadius: '0.5rem', border: '1.5px solid var(--primary-border)', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
              <img src="/logo/logo.png" alt="Logo" style={{ height: '32px', width: 'auto' }} />
              <span style={{ color: 'var(--primary-border)' }}>•</span>
              <img src="/logo/tagline_1.png" alt="Tagline" style={{ height: '50px', width: 'auto' }} />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <CheckCircle size={15} color="var(--primary)" /> অফিশিয়াল লোগো ও ব্র্যান্ডিং সক্রিয়
              </div>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                সিট স্লিপ, এডমিট কার্ড, নোটিশ বোর্ড ও উপস্থিতি শিটে স্বয়ংক্রিয়ভাবে দৃশ্যমান
              </span>
            </div>
          </div>

          {/* Seating Pattern Selector */}
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem' }}>
              <Compass size={15} color="var(--primary)" /> লিখিত পরীক্ষার সিটিং প্যাটার্ন (Sitting Pattern)
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setSeatingPattern('snake')}
                style={{
                  flex: 1,
                  padding: '0.5rem 0.6rem',
                  borderRadius: '0.4rem',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  border: seatingPattern === 'snake' ? '2px solid var(--primary)' : '1px solid var(--primary-border)',
                  background: seatingPattern === 'snake' ? 'var(--primary-tint)' : 'var(--btn-unselected-bg)',
                  color: seatingPattern === 'snake' ? 'var(--primary)' : 'var(--foreground)',
                  cursor: 'pointer'
                }}
              >
                🐍 স্নেক / জিগ-জ্যাগ (Snake)
              </button>

              <button
                type="button"
                onClick={() => setSeatingPattern('column-wise')}
                style={{
                  flex: 1,
                  padding: '0.5rem 0.6rem',
                  borderRadius: '0.4rem',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  border: seatingPattern === 'column-wise' ? '2px solid var(--primary)' : '1px solid var(--primary-border)',
                  background: seatingPattern === 'column-wise' ? 'var(--primary-tint)' : 'var(--btn-unselected-bg)',
                  color: seatingPattern === 'column-wise' ? 'var(--primary)' : 'var(--foreground)',
                  cursor: 'pointer'
                }}
              >
                ⬇️ কলাম অনুযায়ী (Column-wise)
              </button>

              <button
                type="button"
                onClick={() => setSeatingPattern('row-wise')}
                style={{
                  flex: 1,
                  padding: '0.5rem 0.6rem',
                  borderRadius: '0.4rem',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  border: seatingPattern === 'row-wise' ? '2px solid var(--primary)' : '1px solid var(--primary-border)',
                  background: seatingPattern === 'row-wise' ? 'var(--primary-tint)' : 'var(--btn-unselected-bg)',
                  color: seatingPattern === 'row-wise' ? 'var(--primary)' : 'var(--foreground)',
                  cursor: 'pointer'
                }}
              >
                ➡️ রো অনুযায়ী (Row-wise)
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Capacity & Stats Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: '4px solid var(--primary)' }}>
          <div style={{ background: 'var(--primary-tint)', padding: '0.85rem', borderRadius: '0.75rem', color: 'var(--primary)' }}>
            <Building2 size={28} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>মোট রুম ও আসন</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)' }}>
              {rooms.length} Rooms / {totalSeats} Seats
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>সিঙ্গেল চেয়ার (১ জন/চেয়ার)</div>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: '4px solid var(--secondary)' }}>
          <div style={{ background: 'rgba(0, 163, 224, 0.1)', padding: '0.85rem', borderRadius: '0.75rem', color: 'var(--secondary)' }}>
            <Users size={28} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>মোট পরীক্ষার্থী</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--secondary)' }}>
              {totalStudents} Candidates
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {Object.keys(classBreakdown).length} টি ক্যাটাগরি / ক্লাস
            </div>
          </div>
        </div>

        <div className="glass-card" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '1rem',
          borderLeft: isShortage ? '4px solid #ef4444' : '4px solid var(--primary)'
        }}>
          <div style={{ 
            background: isShortage ? 'rgba(239, 68, 68, 0.12)' : 'var(--primary-tint)', 
            padding: '0.85rem', 
            borderRadius: '0.75rem', 
            color: isShortage ? '#ef4444' : 'var(--primary)' 
          }}>
            {isShortage ? <AlertTriangle size={28} /> : <CheckCircle2 size={28} />}
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>ক্যাপাসিটি ও ব্যালান্স</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: isShortage ? '#ef4444' : 'var(--primary)' }}>
              {totalStudents === 0 ? 'গালা প্রিসেট লোড করুন' : isShortage ? `সিট ঘাটতি: ${totalStudents - totalSeats} টি` : `পর্যাপ্ত (${surplusSeats} টি সিট অতিরিক্ত)`}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {isShortage ? 'অনুগ্রহ করে আরো রুম যোগ করুন' : 'প্যারালাল পরীক্ষার জন্য প্রস্তুত'}
            </div>
          </div>
        </div>
      </div>

      {/* Room Manager & File Uploader */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
        <RoomManager />
        <FileUploader />
      </div>

      {/* Uploaded Students Preview */}
      {students.length > 0 && (
        <div className="glass-card" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, color: 'var(--primary)' }}>
                <Users size={24} color="var(--primary)" /> তালিকাভুক্ত শিক্ষার্থী ({students.length})
              </h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.5rem' }}>
                {Object.entries(classBreakdown).map(([cls, count]) => (
                  <span key={cls} style={{ fontSize: '0.75rem', background: 'var(--primary-tint)', color: 'var(--primary)', padding: '0.2rem 0.55rem', borderRadius: '0.35rem', border: '1px solid var(--primary-border)', fontWeight: 700 }}>
                    <strong>{cls}:</strong> {count} জন
                  </span>
                ))}
              </div>
            </div>

            <button 
              onClick={handleGenerate} 
              className="button" 
              disabled={rooms.length === 0}
              style={{ fontSize: '1.05rem', padding: '0.85rem 1.85rem', opacity: rooms.length === 0 ? 0.5 : 1 }}
            >
              <LayoutGrid size={22} /> Generate Seat Plan & Admit Cards
            </button>
          </div>

          <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Roll / ID</th>
                  <th>Student Name</th>
                  <th>Category / Class</th>
                </tr>
              </thead>
              <tbody>
                {students.slice(0, 15).map((s, idx) => (
                  <tr key={`${s.id}-${idx}`}>
                    <td><span style={{ fontWeight: 700, color: 'var(--foreground)' }}>{s.id}</span></td>
                    <td>{s.name}</td>
                    <td>
                      <span style={{ background: 'var(--primary-tint)', color: 'var(--primary)', padding: '0.2rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.85rem', fontWeight: 700, border: '1px solid var(--primary-border)' }}>
                        {s.className}
                      </span>
                    </td>
                  </tr>
                ))}
                {students.length > 15 && (
                  <tr>
                    <td colSpan={3} style={{ textAlign: 'center', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                      ...এবং আরো {students.length - 15} জন শিক্ষার্থীর তালিকা
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {rooms.length === 0 && students.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3.5rem', background: 'var(--card-bg)', borderRadius: '1rem', border: '1.5px dashed var(--primary-border)' }}>
          <Award size={64} style={{ margin: '0 auto 1rem', display: 'block', color: 'var(--primary)' }} />
          <h2 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>ICT Olympiad Bangladesh - Season 3 Gala Round</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '600px', margin: '0 auto 1.5rem auto' }}>
            ১৩টি ক্যাটাগরির ১৩০ জন শিক্ষার্থী এবং ৫টি রুমের প্যারালাল সিট প্ল্যান ও এডমিট কার্ড এক ক্লিকেই তৈরি করতে নিচের বাটনে চাপ দিন:
          </p>
          <button onClick={loadGalaPreset} className="button button-accent" style={{ fontSize: '1.1rem', padding: '0.9rem 2rem' }}>
            <Award size={22} /> Load Season 3 Gala Preset (130 Candidates)
          </button>
        </div>
      )}
    </main>
  );
}
