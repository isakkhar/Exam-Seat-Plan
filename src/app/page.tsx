'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useSeatPlan, GALA_CLASSES, GROUP_A_CLASSES } from '@/context/SeatPlanContext';
import { 
  LayoutGrid, 
  Users, 
  BookOpen, 
  Building2,
  Compass,
  Sparkles,
  CheckCircle,
  Clock,
  Layers,
  Award,
  ArrowRight,
  ShieldCheck,
  BadgeCheck
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
    generatePlan
  } = useSeatPlan();

  const totalSeats = rooms.reduce((acc, r) => acc + r.capacity, 0);
  const totalStudents = students.length;

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

  return (
    <main className="container" style={{ paddingBottom: '3rem' }}>
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
              ১৩টি ক্যাটাগরির ১৩০ জন ফাইনালিস্টের প্যারালাল পরীক্ষা, ৩x৩ ডেস্ক স্লিপ, নোটিশ বোর্ড চার্ট, এডমিট কার্ড ও রেজাল্ট শিট।
            </p>
          </div>
        </div>

        <div>
          <button 
            onClick={handleGenerate} 
            className="button button-accent"
            style={{ fontWeight: 800, padding: '0.75rem 1.6rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <LayoutGrid size={20} /> সিট প্ল্যান ও এডমিট কার্ড দেখুন <ArrowRight size={18} />
          </button>
        </div>
      </header>

      {/* Gala Round Parallel Exam Info Banner */}
      <div style={{ 
        background: 'linear-gradient(135deg, rgba(0, 75, 153, 0.08), rgba(0, 163, 224, 0.08))', 
        border: '1.5px solid var(--primary-border)', 
        borderRadius: '0.75rem', 
        padding: '1.25rem 1.75rem', 
        marginBottom: '2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ background: 'var(--primary)', color: '#fff', padding: '0.75rem', borderRadius: '0.6rem' }}>
            <Clock size={28} />
          </div>
          <div>
            <div style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '1.05rem', marginBottom: '0.25rem' }}>
              প্যারালাল পরীক্ষা পদ্ধতি (Parallel Written & Viva Voce: 09:00 AM - 11:00 AM)
            </div>
            <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              • <strong>Slot 1 (09:00 - 09:50 AM):</strong> Group A লিখিত (Room 101, 102) | Group B ভাইভা (Room 103, 104, 105 এর ৫টি বোর্ডে)<br />
              • <strong>Slot 2 (10:05 - 10:55 AM):</strong> Group B লিখিত (Room 101, 102) | Group A ভাইভা (Room 103, 104, 105 এর ৫টি বোর্ডে)
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: '#ffffff', padding: '0.5rem 1rem', borderRadius: '0.5rem', border: '1px solid var(--primary-border)' }}>
          <ShieldCheck size={20} color="#16a34a" />
          <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#15803d' }}>
            ১৩টি ক্যাটাগরির ডাটা কনফিগারেশন সক্রিয়
          </span>
        </div>
      </div>

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
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>রুম ১০১ ও ১০২ (লিখিত) + ১০৩, ১০৪, ১০৫ (ভাইভা)</div>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: '4px solid var(--secondary)' }}>
          <div style={{ background: 'rgba(0, 163, 224, 0.1)', padding: '0.85rem', borderRadius: '0.75rem', color: 'var(--secondary)' }}>
            <Users size={28} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>মোট ফাইনালিস্ট পরীক্ষার্থী</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--secondary)' }}>
              {totalStudents} জন পরীক্ষার্থী
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              ১৩টি ক্যাটাগরি × ১০ জন = ১৩০ জন
            </div>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: '4px solid #8b5cf6' }}>
          <div style={{ background: 'rgba(139, 92, 246, 0.1)', padding: '0.85rem', borderRadius: '0.75rem', color: '#8b5cf6' }}>
            <Layers size={28} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>গ্রুপ বিভাজন (প্যারালাল)</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#6d28d9' }}>
              Group A: ৭০ | Group B: ৬০
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              ক্লাস ১-৭ (Group A) ও ক্লাস ৮-Eng (Group B)
            </div>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ background: 'rgba(245, 158, 11, 0.12)', padding: '0.85rem', borderRadius: '0.75rem', color: '#b45309' }}>
            <Award size={28} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>শীর্ষ বিজয়ী ও পদক</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#b45309' }}>
              ৩৯ জন গ্র্যান্ড বিজয়ী
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              ১৩ চ্যাম্পিয়ন, ১৩ ১ম রানার আপ, ১৩ ২য় রানার আপ
            </div>
          </div>
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
                সিট স্লিপ, এডমিট কার্ড, নোটিশ বোর্ড ও রেজাল্ট শিটে স্বয়ংক্রিয়ভাবে দৃশ্যমান
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

      {/* Gala Round Venue & Exam Halls Layout Overview */}
      <section className="glass-card" style={{ marginBottom: '2rem', borderTop: '4px solid var(--secondary)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--secondary)' }}>
              <Building2 size={20} color="var(--secondary)" /> গালা রাউন্ড ভেন্যু ও পরীক্ষার রুম বিন্যাস (Fixed Halls & Boards)
            </h3>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              লিখিত পরীক্ষা ও ভাইভা মূল্যায়নের জন্য নির্ধারিত ৫টি অফিশিয়াল রুম
            </p>
          </div>
          <span style={{ fontSize: '0.78rem', background: '#dcfce7', color: '#15803d', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontWeight: 800, border: '1px solid #bbf7d0' }}>
            ✓ ৫টি রুম ও ৫টি ভাইভা বোর্ড কনফিগার করা
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          {rooms.map(room => {
            const isWritten = room.roomType === 'written';
            return (
              <div 
                key={room.id}
                style={{
                  background: isWritten ? '#eff6ff' : '#f0fdf4',
                  border: isWritten ? '1.5px solid #bfdbfe' : '1.5px solid #bbf7d0',
                  borderRadius: '0.65rem',
                  padding: '1rem',
                  textAlign: 'center'
                }}
              >
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: isWritten ? '#1d4ed8' : '#15803d', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                  {isWritten ? '📝 লিখিত পরীক্ষার হল' : '🎙️ ভাইভা বোর্ড ভেন্যু'}
                </div>
                <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0f172a' }}>
                  Room {room.name}
                </div>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                  ধারণক্ষমতা: {room.capacity} আসন ({room.rows}×{room.cols})
                </div>
                {room.vivaBoards && room.vivaBoards.length > 0 && (
                  <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'center', gap: '0.3rem', flexWrap: 'wrap' }}>
                    {room.vivaBoards.map(b => (
                      <span key={b} style={{ fontSize: '0.7rem', fontWeight: 800, background: '#16a34a', color: '#fff', padding: '0.15rem 0.5rem', borderRadius: '0.25rem' }}>
                        {b}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 13 Categories Finalists Distribution Card */}
      <section className="glass-card" style={{ marginBottom: '2.5rem', borderTop: '4px solid #8b5cf6' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6d28d9' }}>
              <Users size={20} color="#8b5cf6" /> ১৩টি ক্যাটাগরির ফাইনালিস্ট তালিকা (১৩০ জন শিক্ষার্থী)
            </h3>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              প্রতিটি ক্লাসের শীর্ষ ১০ জন করে ফাইনালিস্ট ইতিমধ্যে সিস্টেমে তালিকাভুক্ত
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.78rem', background: '#eff6ff', color: '#1d4ed8', padding: '0.25rem 0.65rem', borderRadius: '0.35rem', fontWeight: 800, border: '1px solid #bfdbfe' }}>
              Group A (Class 1-7): ৭০ জন
            </span>
            <span style={{ fontSize: '0.78rem', background: '#f5f3ff', color: '#6d28d9', padding: '0.25rem 0.65rem', borderRadius: '0.35rem', fontWeight: 800, border: '1px solid #ddd6fe' }}>
              Group B (Class 8-Eng): ৬০ জন
            </span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
          {GALA_CLASSES.map((cls) => {
            const count = classBreakdown[cls] || 10;
            const isGroupA = GROUP_A_CLASSES.includes(cls);
            return (
              <div 
                key={cls}
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  background: isGroupA ? '#eff6ff' : '#f8fafc',
                  border: isGroupA ? '1px solid #bfdbfe' : '1px solid #e2e8f0',
                  borderRadius: '0.45rem',
                  padding: '0.6rem 0.85rem'
                }}
              >
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#0f172a' }}>
                    {cls}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: isGroupA ? '#2563eb' : '#64748b', fontWeight: 700 }}>
                    {isGroupA ? 'Group A (Slot 1)' : 'Group B (Slot 2)'}
                  </div>
                </div>
                <div style={{ background: isGroupA ? '#1d4ed8' : '#334155', color: '#fff', borderRadius: '1rem', padding: '0.15rem 0.55rem', fontSize: '0.75rem', fontWeight: 900 }}>
                  {count} জন
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Prominent Call to Action Footer Card */}
      <div 
        className="glass-card" 
        style={{ 
          textAlign: 'center', 
          padding: '2.5rem 2rem', 
          background: 'linear-gradient(135deg, #f0fdf4 0%, #eff6ff 100%)', 
          border: '2px solid var(--primary-border)',
          borderRadius: '1rem'
        }}
      >
        <BadgeCheck size={52} color="#004b99" style={{ margin: '0 auto 0.75rem auto' }} />
        <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#004b99', margin: '0 0 0.5rem 0' }}>
          গালা রাউন্ডের সিট প্ল্যান, এডমিট কার্ড ও রেজাল্ট শিট প্রস্তুত!
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', maxWidth: '650px', margin: '0 auto 1.5rem auto' }}>
          ডেস্ক স্লিপ (৩x৩), অফিশিয়াল এডমিট কার্ড (প্রতি পাতায় ২টি), দরজার নোটিশ চার্ট, উপস্থিতি শিট, ভাইভা ইভ্যালুয়েশন শিট এবং ৩৯ জন বিজয়ীর ফাইনাল অ্যাওয়ার্ড শিট প্রিন্ট করতে নিচের বাটনে ক্লিক করুন:
        </p>
        <button 
          onClick={handleGenerate}
          className="button button-accent"
          style={{ fontSize: '1.15rem', fontWeight: 900, padding: '0.95rem 2.5rem', boxShadow: '0 8px 25px rgba(0, 75, 153, 0.25)' }}
        >
          <LayoutGrid size={22} /> সিট প্ল্যান ও এডমিট কার্ড পেজে প্রবেশ করুন →
        </button>
      </div>
    </main>
  );
}
