'use client';

import React from 'react';
import { useSeatPlan } from '@/context/SeatPlanContext';
import { Printer, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function ResultPage() {
  const { assignments } = useSeatPlan();
  const roomNames = Object.keys(assignments);

  const handlePrint = () => {
    window.print();
  };

  if (roomNames.length === 0) {
    return (
      <div className="container" style={{ textAlign: 'center', paddingTop: '4rem' }}>
        <h2>No seat plan generated.</h2>
        <Link href="/" className="button" style={{ marginTop: '1rem' }}>
          <ChevronLeft size={20} /> Back to Dashboard
        </Link>
      </div>
    );
  }

  // Chunk array into sizes of N
  const chunk = (arr: any[], size: number) => {
    const result = [];
    for (let i = 0; i < arr.length; i += size) {
      result.push(arr.slice(i, i + size));
    }
    return result;
  };

  return (
    <main className="container">
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <Link href="/" className="button" style={{ background: 'transparent', border: '1px solid var(--primary)', color: 'var(--primary)' }}>
          <ChevronLeft size={20} /> Dashboard
        </Link>
        <button onClick={handlePrint} className="button">
          <Printer size={20} /> Print All Slips
        </button>
      </div>

      <div id="printable-area">
        {roomNames.map((roomName) => {
          const roomStudents = assignments[roomName];
          const chunks = chunk(roomStudents, 9); // 9 seats per page

          return chunks.map((seatChunk, chunkIndex) => (
            <div key={`${roomName}-${chunkIndex}`} className={chunkIndex > 0 || roomNames.indexOf(roomName) > 0 ? "print-page-break" : ""} style={{ marginBottom: '2rem' }}>
              <div style={{ padding: '1rem', border: '1px solid #eee', borderRadius: '1rem', background: 'white' }}>
                <h3 className="no-print" style={{ marginBottom: '1rem', color: 'var(--text-muted)' }}>Room: {roomName} - Page {chunkIndex + 1}</h3>
                
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(3, 1fr)', 
                  gridTemplateRows: 'repeat(3, 1fr)',
                  gap: '0', 
                  border: '1px solid #000',
                  width: 'fit-content',
                  minHeight: '27.7cm', // Adjusted for A4
                }}>
                  {seatChunk.map((student, i) => (
                    <div key={student.id} style={{ 
                      border: '1.5px solid #000', 
                      padding: '0.8rem', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      position: 'relative',
                      height: '9.2cm', 
                      backgroundColor: 'white',
                      boxSizing: 'border-box'
                    }}>
                      {/* Header with two logos */}
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        marginBottom: '1.2rem',
                        width: '100%',
                        padding: '0 2px'
                      }}>
                        <div style={{ flexShrink: 0, opacity: 0.9 }}>
                          <img src="/logo/logo.png" alt="Main Logo" style={{ height: '30px', width: 'auto' }} />
                        </div>
                        <div style={{ flexGrow: 1, display: 'flex', justifyContent: 'flex-end' }}>
                          <img src="/logo/tagline_1.png" alt="Tagline" style={{ height: '50px', width: 'auto', maxWidth: '170px' }} />
                        </div>
                      </div>
                      
                      {/* Student Info */}
                      <div style={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: '0.6rem',
                        textAlign: 'left',
                        paddingLeft: '0.8rem',
                        marginTop: '0.5rem',
                        borderLeft: '2px solid #1a365d'
                      }}>
                        <div style={{ fontSize: '1.15rem', color: '#000', lineHeight: '1.2' }}>
                          <span style={{ fontWeight: '400', color: '#555' }}>Name: </span>
                          <span style={{ fontWeight: '700' }}>{student.name}</span>
                        </div>
                        <div style={{ fontSize: '1.15rem', color: '#000' }}>
                          <span style={{ fontWeight: '400', color: '#555' }}>Class: </span>
                          <span style={{ fontWeight: '700' }}>{student.className}</span>
                        </div>
                        <div style={{ fontSize: '1.15rem', color: '#000' }}>
                          <span style={{ fontWeight: '400', color: '#555' }}>Login ID: </span>
                          <span style={{ fontWeight: '700' }}>{student.id}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {/* Fill empty cells to maintain grid if less than 9 students */}
                  {Array.from({ length: 9 - seatChunk.length }).map((_, i) => (
                    <div key={`empty-${i}`} style={{ border: '1px solid #eee' }}></div>
                  ))}
                </div>
              </div>
            </div>
          ));
        })}
      </div>

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
            height: 297mm !important;
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
