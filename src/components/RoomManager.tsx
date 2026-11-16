'use client';

import React, { useState } from 'react';
import { useSeatPlan } from '@/context/SeatPlanContext';
import { Plus, Trash2, DoorOpen, Grid } from 'lucide-react';

export default function RoomManager() {
  const { rooms, addRoom, removeRoom, availableClasses } = useSeatPlan();
  const [name, setName] = useState('');
  const [rows, setRows] = useState(5);
  const [cols, setCols] = useState(4);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [isAllClasses, setIsAllClasses] = useState(true);

  // Auto calculate total seats (1 seat per bench)
  const calculatedCapacity = Math.max(1, rows) * Math.max(1, cols);

  const toggleClass = (className: string) => {
    if (selectedClasses.includes(className)) {
      setSelectedClasses(selectedClasses.filter(c => c !== className));
    } else {
      setSelectedClasses([...selectedClasses, className]);
    }
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addRoom({
      id: Math.random().toString(36).substring(2, 9),
      name: name.trim(),
      capacity: calculatedCapacity,
      rows: Number(rows),
      cols: Number(cols),
      seatsPerBench: 1,
      allowedClasses: isAllClasses || selectedClasses.length === 0 ? [] : selectedClasses,
    });

    setName('');
    setSelectedClasses([]);
    setIsAllClasses(true);
  };

  return (
    <div className="glass-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, color: 'var(--primary)', fontSize: '1.3rem' }}>
          <DoorOpen size={24} color="var(--primary)" /> Rooms & Bench Layout
        </h2>
        <span style={{ fontSize: '0.8rem', background: 'var(--primary-tint)', color: 'var(--primary)', padding: '0.25rem 0.65rem', borderRadius: '1rem', fontWeight: 700, border: '1px solid var(--primary-border)' }}>
          {rooms.length} {rooms.length === 1 ? 'Room' : 'Rooms'}
        </span>
      </div>
      
      <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '0.75rem' }}>
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
              Room Name / No.
            </label>
            <input 
              className="input" 
              placeholder="e.g. Room 101" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              required
            />
          </div>
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
              Rows (শাড়ি)
            </label>
            <input 
              className="input" 
              type="number" 
              min={1}
              max={25}
              placeholder="Rows" 
              value={rows} 
              onChange={e => setRows(Math.max(1, parseInt(e.target.value) || 1))} 
            />
          </div>
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
              Columns (কলাম)
            </label>
            <input 
              className="input" 
              type="number" 
              min={1}
              max={15}
              placeholder="Columns" 
              value={cols} 
              onChange={e => setCols(Math.max(1, parseInt(e.target.value) || 1))} 
            />
          </div>
        </div>

        {/* Bench Capacity & Allowed Classes */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '0.75rem', alignItems: 'center' }}>
          <div style={{ background: 'var(--primary-tint)', padding: '0.65rem 0.85rem', borderRadius: '0.5rem', border: '1px solid var(--primary-border)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
              বেঞ্চ প্রতি ধারণক্ষমতা
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '0.95rem' }}>
                ১ জন / বেঞ্চ (Single Seat)
              </span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              মোট সিট: <strong style={{ color: 'var(--primary)' }}>{calculatedCapacity}</strong> ({rows} Rows × {cols} Cols)
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
              কোন কোন ক্লাস বসবে?
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => { setIsAllClasses(true); setSelectedClasses([]); }}
                style={{
                  padding: '0.3rem 0.6rem',
                  fontSize: '0.75rem',
                  borderRadius: '0.35rem',
                  border: isAllClasses ? '1px solid var(--primary)' : '1px solid var(--card-border)',
                  background: isAllClasses ? 'var(--primary)' : 'transparent',
                  color: isAllClasses ? '#fff' : 'var(--foreground)',
                  cursor: 'pointer',
                  fontWeight: 700
                }}
              >
                সব ক্লাস (All)
              </button>
              {availableClasses.length > 0 ? (
                availableClasses.map(cls => {
                  const isChecked = !isAllClasses && selectedClasses.includes(cls);
                  return (
                    <button
                      type="button"
                      key={cls}
                      onClick={() => {
                        setIsAllClasses(false);
                        toggleClass(cls);
                      }}
                      style={{
                        padding: '0.3rem 0.6rem',
                        fontSize: '0.75rem',
                        borderRadius: '0.35rem',
                        border: isChecked ? '1px solid var(--primary)' : '1px solid var(--card-border)',
                        background: isChecked ? 'var(--primary-light)' : 'transparent',
                        color: isChecked ? '#fff' : 'var(--foreground)',
                        cursor: 'pointer',
                        fontWeight: 600
                      }}
                    >
                      {cls}
                    </button>
                  );
                })
              ) : (
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  (ফাইল আপলোড করলে ক্লাসের তালিকা আসবে)
                </span>
              )}
            </div>
          </div>
        </div>

        <button className="button" type="submit" style={{ justifyContent: 'center', marginTop: '0.25rem' }}>
          <Plus size={18} /> Add Room
        </button>
      </form>

      {/* Room list */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '0.85rem' }}>
        {rooms.map(room => (
          <div key={room.id} style={{ 
            padding: '0.85rem', 
            borderRadius: '0.5rem', 
            background: 'var(--card-bg)', 
            border: '1px solid var(--primary-border)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            boxShadow: '0 2px 4px rgba(13, 148, 136, 0.05)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--primary)' }}>
                  Room {room.name}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Grid size={13} color="var(--primary)" />
                  <span>{room.rows || Math.ceil(room.capacity / 4)} Rows × {room.cols || 4} Cols</span>
                  <span>•</span>
                  <span>১ জন/বেঞ্চ</span>
                </div>
              </div>
              <button 
                onClick={() => removeRoom(room.id)}
                title="Remove room"
                style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.2rem' }}
              >
                <Trash2 size={16} />
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.4rem', borderTop: '1px dashed var(--primary-border)', fontSize: '0.8rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>
                ক্যাপাসিটি: <strong style={{ color: 'var(--primary)' }}>{room.capacity}</strong> সিট
              </span>
              <span style={{ 
                fontSize: '0.72rem', 
                background: 'var(--primary-tint)', 
                color: 'var(--primary)', 
                padding: '0.15rem 0.5rem', 
                borderRadius: '0.25rem',
                border: '1px solid var(--primary-border)',
                maxWidth: '120px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                fontWeight: 600
              }}>
                {room.allowedClasses && room.allowedClasses.length > 0 
                  ? room.allowedClasses.join(', ') 
                  : 'All Classes'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
