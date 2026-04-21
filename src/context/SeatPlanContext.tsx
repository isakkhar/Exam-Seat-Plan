'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Student {
  id: string;
  name: string;
  className: string;
}

export interface Room {
  id: string;
  name: string;
  capacity: number;
}

export interface SeatAssignment {
  student: Student;
  roomName: string;
}

interface SeatPlanContextType {
  rooms: Room[];
  students: Student[];
  assignments: Record<string, Student[]>; // Room Name -> Students
  addRoom: (room: Room) => void;
  removeRoom: (id: string) => void;
  setStudents: (students: Student[]) => void;
  generatePlan: () => void;
  clearAll: () => void;
}

const SeatPlanContext = createContext<SeatPlanContextType | undefined>(undefined);

export function SeatPlanProvider({ children }: { children: React.ReactNode }) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [assignments, setAssignments] = useState<Record<string, Student[]>>({});

  // Load from localStorage
  useEffect(() => {
    const savedRooms = localStorage.getItem('seatplan_rooms');
    const savedStudents = localStorage.getItem('seatplan_students');
    const savedAssignments = localStorage.getItem('seatplan_assignments');
    if (savedRooms) setRooms(JSON.parse(savedRooms));
    if (savedStudents) setStudents(JSON.parse(savedStudents));
    if (savedAssignments) setAssignments(JSON.parse(savedAssignments));
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('seatplan_rooms', JSON.stringify(rooms));
    localStorage.setItem('seatplan_students', JSON.stringify(students));
    localStorage.setItem('seatplan_assignments', JSON.stringify(assignments));
  }, [rooms, students, assignments]);

  const addRoom = (room: Room) => setRooms([...rooms, room]);
  const removeRoom = (id: string) => setRooms(rooms.filter(r => r.id !== id));
  
  const clearAll = () => {
    setRooms([]);
    setStudents([]);
    setAssignments({});
    localStorage.removeItem('seatplan_rooms');
    localStorage.removeItem('seatplan_students');
    localStorage.removeItem('seatplan_assignments');
  };

  const generatePlan = () => {
    if (rooms.length === 0 || students.length === 0) return;

    // Group students by class
    const classes: Record<string, Student[]> = {};
    students.forEach(s => {
      if (!classes[s.className]) classes[s.className] = [];
      classes[s.className].push(s);
    });

    const classNames = Object.keys(classes);
    const interleaved: Student[] = [];
    const classIndices = classNames.reduce((acc, name) => ({ ...acc, [name]: 0 }), {} as Record<string, number>);
    
    let added = true;
    while (added) {
      added = false;
      for (const name of classNames) {
        if (classIndices[name] < classes[name].length) {
          interleaved.push(classes[name][classIndices[name]]);
          classIndices[name]++;
          added = true;
        }
      }
    }

    const newAssignments: Record<string, Student[]> = {};
    let studentIndex = 0;

    for (const room of rooms) {
      const roomStudents = interleaved.slice(studentIndex, studentIndex + room.capacity);
      newAssignments[room.name] = roomStudents;
      studentIndex += room.capacity;
    }

    setAssignments(newAssignments);
  };

  return (
    <SeatPlanContext.Provider value={{ 
      rooms, students, assignments, addRoom, removeRoom, setStudents, generatePlan, clearAll 
    }}>
      {children}
    </SeatPlanContext.Provider>
  );
}

export const useSeatPlan = () => {
  const context = useContext(SeatPlanContext);
  if (!context) throw new Error('useSeatPlan must be used within SeatPlanProvider');
  return context;
};
