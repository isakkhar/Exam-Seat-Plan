'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useSeatPlan, SeatingPattern } from '@/context/SeatPlanContext';
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
  Image as ImageIcon,
  Compass,
  Sparkles
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

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setExamInfo(prev => ({ ...prev, customLogoUrl: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleDownloadSample = () => {
    const csvContent = "data:text/csv;charset=utf-8,ID,Name,Class\n101,Rahim Ahmed,Class 9\n102,Karim Ullah,Class 10\n103,Fatima Begum,Class 9\n104,Tanvir Hasan,Class 10\n105,Sadia Islam,Class 8\n106,Nabil Hossain,Class 8\n107,Afsana Mimi,Class 9\n108,Mehedi Hasan,Class 10";
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
      {/* Header with Teal Gradient */}
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'var(--primary-tint)', color: 'var(--primary-hover)', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem', border: '1px solid var(--primary-border)' }}>
            <Sparkles size={14} /> Smart Exam & Seating Management
          </div>
          <h1 style={{ fontSize: '2.4rem', fontWeight: '800', background: 'linear-gradient(to right, #0d9488, #0284c7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0, letterSpacing: '-0.5px' }}>
            Exam Seat Plan Maker
          </h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.3rem', fontSize: '0.95rem' }}>
            সিট প্ল্যান, ৩x৩ ডেস্ক স্লিপ, নোটিশ বোর্ড সামারি এবং পরীক্ষার প্রবেশপত্র (Admit Card) তৈরি করুন।
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={handleDownloadSample} className="button button-secondary" style={{ background: 'transparent', border: '1.5px solid var(--secondary)', color: 'var(--secondary)', boxShadow: 'none' }}>
            <Download size={18} /> Sample CSV
          </button>
          <button onClick={clearAll} className="button" style={{ background: '#ef4444', boxShadow: 'none' }}>
            <Trash2 size={18} /> Reset All
          </button>
        </div>
      </header>

      {/* Institution Details & Seating Configuration Section */}
      <section className="glass-card" style={{ marginBottom: '2rem', borderTop: '4px solid var(--primary)' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-hover)' }}>
          <BookOpen size={20} color="var(--primary)" /> প্রতিষ্ঠান ও পরীক্ষার তথ্য (Institution & Exam Setup)
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>
              প্রতিষ্ঠানের নাম (Institution Name)
            </label>
            <input 
              className="input" 
              placeholder="e.g. Dhaka Residential Model College" 
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
              placeholder="e.g. Annual Examination 2026" 
              value={examInfo.title}
              onChange={e => setExamInfo(prev => ({ ...prev, title: e.target.value }))}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>
              বিষয় (Subject)
            </label>
            <input 
              className="input" 
              placeholder="e.g. Mathematics" 
              value={examInfo.subject}
              onChange={e => setExamInfo(prev => ({ ...prev, subject: e.target.value }))}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>
              তারিখ (Date)
            </label>
            <input 
              className="input" 
              type="date"
              value={examInfo.date}
              onChange={e => setExamInfo(prev => ({ ...prev, date: e.target.value }))}
            />
          </div>
        </div>

        {/* Custom Logo Upload & Seating Pattern Select */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', alignItems: 'center', paddingTop: '1rem', borderTop: '1px dashed var(--primary-border)' }}>
          {/* Logo Uploader */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '56px', height: '56px', border: '1px solid var(--primary-border)', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--card-bg)', overflow: 'hidden', flexShrink: 0 }}>
              {examInfo.customLogoUrl ? (
                <img src={examInfo.customLogoUrl} alt="Logo" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
              ) : (
                <ImageIcon size={28} color="var(--primary)" />
              )}
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>
                প্রতিষ্ঠানের নিজস্ব লোগো আপলোড
              </label>
              <input 
                type="file" 
                accept="image/*"
                onChange={handleLogoUpload}
                style={{ fontSize: '0.8rem' }}
              />
            </div>
          </div>

          {/* Seating Pattern Selector */}
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem' }}>
              <Compass size={15} color="var(--primary)" /> সিটিং প্যাটার্ন (বসার বিন্যাস)
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
                  color: seatingPattern === 'snake' ? 'var(--primary-hover)' : 'var(--foreground)',
                  cursor: 'pointer'
                }}
              >
                🐍 স্নেক / জিগ-জ্যাগ (Snake Order)
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
                  color: seatingPattern === 'column-wise' ? 'var(--primary-hover)' : 'var(--foreground)',
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
                  color: seatingPattern === 'row-wise' ? 'var(--primary-hover)' : 'var(--foreground)',
                  cursor: 'pointer'
                }}
              >
                ➡️ রো অনুযায়ী (Row-wise)
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Capacity & Alert Stats Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: '4px solid var(--primary)' }}>
          <div style={{ background: 'var(--primary-tint)', padding: '0.85rem', borderRadius: '0.75rem', color: 'var(--primary)' }}>
            <Building2 size={28} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>মোট রুম ও সিট</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary-hover)' }}>
              {rooms.length} Rooms / {totalSeats} Seats
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>বেঞ্চ প্রতি ১ জন পরীক্ষার্থী</div>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: '4px solid var(--secondary)' }}>
          <div style={{ background: 'rgba(2, 132, 199, 0.1)', padding: '0.85rem', borderRadius: '0.75rem', color: 'var(--secondary)' }}>
            <Users size={28} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>মোট পরীক্ষার্থী</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--secondary)' }}>
              {totalStudents} Students
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {Object.keys(classBreakdown).length} টি ক্লাসের তালিকা
            </div>
          </div>
        </div>

        <div className="glass-card" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '1rem',
          borderLeft: isShortage ? '4px solid #ef4444' : '4px solid #0d9488'
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
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>সিট ক্যাপাসিটি অবস্থা</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: isShortage ? '#ef4444' : 'var(--primary-hover)' }}>
              {totalStudents === 0 ? 'ডেটা আপলোড করুন' : isShortage ? `সিট ঘাটতি: ${totalStudents - totalSeats} টি` : `পর্যাপ্ত (${surplusSeats} টি সিট খালি)`}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {isShortage ? 'অনুগ্রহ করে আরো রুম যোগ করুন' : 'সিট প্ল্যান তৈরির জন্য প্রস্তুত'}
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
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, color: 'var(--primary-hover)' }}>
                <Users size={24} color="var(--primary)" /> আপলোডকৃত শিক্ষার্থী ({students.length})
              </h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                {Object.entries(classBreakdown).map(([cls, count]) => (
                  <span key={cls} style={{ fontSize: '0.75rem', background: 'var(--primary-tint)', color: 'var(--primary-hover)', padding: '0.2rem 0.55rem', borderRadius: '0.35rem', border: '1px solid var(--primary-border)', fontWeight: 600 }}>
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
                  <th>Class</th>
                </tr>
              </thead>
              <tbody>
                {students.slice(0, 10).map((s, idx) => (
                  <tr key={`${s.id}-${idx}`}>
                    <td><span style={{ fontWeight: 700, color: 'var(--foreground)' }}>{s.id}</span></td>
                    <td>{s.name}</td>
                    <td>
                      <span style={{ background: 'var(--primary-tint)', color: 'var(--primary-hover)', padding: '0.2rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.85rem', fontWeight: 700, border: '1px solid var(--primary-border)' }}>
                        {s.className}
                      </span>
                    </td>
                  </tr>
                ))}
                {students.length > 10 && (
                  <tr>
                    <td colSpan={3} style={{ textAlign: 'center', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                      ...এবং আরো {students.length - 10} জন শিক্ষার্থীর তালিকা
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {rooms.length > 0 && students.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3.5rem', opacity: 0.7 }}>
          <Users size={56} style={{ margin: '0 auto 1rem', display: 'block', color: 'var(--primary)' }} />
          <h3 style={{ color: 'var(--primary-hover)' }}>শিক্ষার্থীদের তালিকা (CSV/Excel) আপলোড করুন</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>ডানপাশের প্যানেল থেকে ফাইল ড্র্যাগ বা সিলেক্ট করুন</p>
        </div>
      )}
    </main>
  );
}
