'use client';

import React, { useState } from 'react';
import { useSeatPlan } from '@/context/SeatPlanContext';
import { Plus, Trash2, DoorOpen } from 'lucide-react';

export default function RoomManager() {
  const { rooms, addRoom, removeRoom } = useSeatPlan();
  const [name, setName] = useState('');
  const [capacity, setCapacity] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !capacity) return;
    addRoom({ id: Math.random().toString(36).substr(2, 9), name, capacity: parseInt(capacity) });
    setName('');
    setCapacity('');
  };

  return (
    <div className="glass-card">
      <h2 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <DoorOpen size={24} /> Rooms Configuration
      </h2>
      
      <form onSubmit={handleAdd} style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        <input 
          className="input" 
          placeholder="Room Name (e.g. 101)" 
          value={name} 
          onChange={e => setName(e.target.value)} 
        />
        <input 
          className="input" 
          type="number" 
          placeholder="Capacity" 
          value={capacity} 
          onChange={e => setCapacity(e.target.value)} 
        />
        <button className="button" type="submit">
          <Plus size={20} /> Add
        </button>
      </form>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
        {rooms.map(room => (
          <div key={room.id} style={{ 
            padding: '1rem', 
            borderRadius: '0.5rem', 
            background: 'var(--glass-bg)', 
            border: '1px solid var(--glass-border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <div style={{ fontWeight: 'bold' }}>Room {room.name}</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Cap: {room.capacity}</div>
            </div>
            <button 
              onClick={() => removeRoom(room.id)}
              style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
