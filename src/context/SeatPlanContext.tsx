'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Student {
  id: string;
  name: string;
  className: string;
}

export interface AllocatedStudent extends Student {
  seatNumber?: string;
  row?: number;
  col?: number;
  benchSeatIndex?: number;
}

export interface Room {
  id: string;
  name: string;
  capacity: number;
  rows?: number;
  cols?: number;
  seatsPerBench?: number;
  allowedClasses?: string[]; // If empty or undefined, all classes are allowed
}

export interface ExamInfo {
  title: string;
  date: string;
  subject: string;
  institutionName: string;
  customLogoUrl?: string;
  instructions?: string;
}

export type SeatingPattern = 'column-wise' | 'snake' | 'row-wise';

interface SeatPlanContextType {
  rooms: Room[];
  students: Student[];
  assignments: Record<string, AllocatedStudent[]>;
  examInfo: ExamInfo;
  seatingPattern: SeatingPattern;
  availableClasses: string[];
  addRoom: (room: Room) => void;
  removeRoom: (id: string) => void;
  setStudents: (students: Student[]) => void;
  setExamInfo: React.Dispatch<React.SetStateAction<ExamInfo>>;
  setSeatingPattern: (pattern: SeatingPattern) => void;
  swapSeats: (roomName: string, studentId1: string, studentId2: string) => void;
  generatePlan: () => void;
  clearAll: () => void;
}

const SeatPlanContext = createContext<SeatPlanContextType | undefined>(undefined);

export function SeatPlanProvider({ children }: { children: React.ReactNode }) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [assignments, setAssignments] = useState<Record<string, AllocatedStudent[]>>({});
  const [seatingPattern, setSeatingPattern] = useState<SeatingPattern>('snake');
  const [examInfo, setExamInfo] = useState<ExamInfo>({
    title: 'Final Examination 2026',
    date: '',
    subject: '',
    institutionName: 'Ideal Model School & College',
    customLogoUrl: '',
    instructions: '১. প্রবেশপত্র ছাড়া পরীক্ষা কক্ষে প্রবেশ নিষেধ। ২. মোবাইল ফোন বা ইলেকট্রনিক ডিভাইস সম্পূর্ণ নিষিদ্ধ।'
  });

  // Load from localStorage
  useEffect(() => {
    const savedRooms = localStorage.getItem('seatplan_rooms');
    const savedStudents = localStorage.getItem('seatplan_students');
    const savedAssignments = localStorage.getItem('seatplan_assignments');
    const savedExamInfo = localStorage.getItem('seatplan_exam_info');
    const savedPattern = localStorage.getItem('seatplan_pattern');

    if (savedRooms) {
      try { setRooms(JSON.parse(savedRooms)); } catch (e) { console.error(e); }
    }
    if (savedStudents) {
      try { setStudents(JSON.parse(savedStudents)); } catch (e) { console.error(e); }
    }
    if (savedAssignments) {
      try { setAssignments(JSON.parse(savedAssignments)); } catch (e) { console.error(e); }
    }
    if (savedExamInfo) {
      try { setExamInfo(JSON.parse(savedExamInfo)); } catch (e) { console.error(e); }
    }
    if (savedPattern && (savedPattern === 'column-wise' || savedPattern === 'snake' || savedPattern === 'row-wise')) {
      setSeatingPattern(savedPattern as SeatingPattern);
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('seatplan_rooms', JSON.stringify(rooms));
    localStorage.setItem('seatplan_students', JSON.stringify(students));
    localStorage.setItem('seatplan_assignments', JSON.stringify(assignments));
    localStorage.setItem('seatplan_exam_info', JSON.stringify(examInfo));
    localStorage.setItem('seatplan_pattern', seatingPattern);
  }, [rooms, students, assignments, examInfo, seatingPattern]);

  // Distinct classes from uploaded students
  const availableClasses = Array.from(new Set(students.map(s => s.className.trim()))).filter(Boolean);

  const addRoom = (room: Room) => setRooms(prev => [...prev, room]);
  const removeRoom = (id: string) => setRooms(prev => prev.filter(r => r.id !== id));
  
  const clearAll = () => {
    setRooms([]);
    setStudents([]);
    setAssignments({});
    localStorage.removeItem('seatplan_rooms');
    localStorage.removeItem('seatplan_students');
    localStorage.removeItem('seatplan_assignments');
  };

  // Manual seat swapping function
  const swapSeats = (roomName: string, studentId1: string, studentId2: string) => {
    setAssignments(prev => {
      const roomStudents = prev[roomName];
      if (!roomStudents) return prev;

      const idx1 = roomStudents.findIndex(s => s.id === studentId1);
      const idx2 = roomStudents.findIndex(s => s.id === studentId2);
      if (idx1 === -1 || idx2 === -1) return prev;

      const updated = [...roomStudents];
      const s1 = updated[idx1];
      const s2 = updated[idx2];

      // Swap seat metadata
      const tempSeatNo = s1.seatNumber;
      const tempRow = s1.row;
      const tempCol = s1.col;
      const tempBench = s1.benchSeatIndex;

      updated[idx1] = {
        ...s1,
        seatNumber: s2.seatNumber,
        row: s2.row,
        col: s2.col,
        benchSeatIndex: s2.benchSeatIndex
      };

      updated[idx2] = {
        ...s2,
        seatNumber: tempSeatNo,
        row: tempRow,
        col: tempCol,
        benchSeatIndex: tempBench
      };

      return {
        ...prev,
        [roomName]: updated
      };
    });
  };

  const generatePlan = () => {
    if (rooms.length === 0 || students.length === 0) return;

    // Track unallocated students by class
    const poolByClass: Record<string, Student[]> = {};
    students.forEach(s => {
      const cls = s.className.trim();
      if (!poolByClass[cls]) poolByClass[cls] = [];
      poolByClass[cls].push(s);
    });

    const newAssignments: Record<string, AllocatedStudent[]> = {};

    // Helper to generate seat slots according to the selected seating pattern
    const generateSeatSlots = (room: Room) => {
      const rows = room.rows && room.rows > 0 ? room.rows : Math.ceil(room.capacity / 4);
      const cols = room.cols && room.cols > 0 ? room.cols : 4;
      const slots: { seatNumber: string; row: number; col: number; benchSeatIndex: number }[] = [];

      if (seatingPattern === 'column-wise') {
        // Fill column by column downwards: (R1-C1 -> R2-C1 ... then R1-C2)
        for (let c = 1; c <= cols; c++) {
          for (let r = 1; r <= rows; r++) {
            if (slots.length >= room.capacity) break;
            slots.push({ seatNumber: `R${r}-C${c}`, row: r, col: c, benchSeatIndex: 1 });
          }
          if (slots.length >= room.capacity) break;
        }
      } else if (seatingPattern === 'snake') {
        // Snake / Zig-zag order: Col 1 down, Col 2 up, Col 3 down...
        for (let c = 1; c <= cols; c++) {
          const isEvenCol = c % 2 === 0;
          if (isEvenCol) {
            // Go upwards
            for (let r = rows; r >= 1; r--) {
              if (slots.length >= room.capacity) break;
              slots.push({ seatNumber: `R${r}-C${c}`, row: r, col: c, benchSeatIndex: 1 });
            }
          } else {
            // Go downwards
            for (let r = 1; r <= rows; r++) {
              if (slots.length >= room.capacity) break;
              slots.push({ seatNumber: `R${r}-C${c}`, row: r, col: c, benchSeatIndex: 1 });
            }
          }
          if (slots.length >= room.capacity) break;
        }
      } else {
        // Row-wise: Fill row by row across (R1-C1 -> R1-C2 ... then R2-C1)
        for (let r = 1; r <= rows; r++) {
          for (let c = 1; c <= cols; c++) {
            if (slots.length >= room.capacity) break;
            slots.push({ seatNumber: `R${r}-C${c}`, row: r, col: c, benchSeatIndex: 1 });
          }
          if (slots.length >= room.capacity) break;
        }
      }

      return slots;
    };

    // Assign students to each room
    for (const room of rooms) {
      const allowed = room.allowedClasses && room.allowedClasses.length > 0
        ? room.allowedClasses
        : Object.keys(poolByClass);

      const eligibleClasses = allowed.filter(cls => poolByClass[cls] && poolByClass[cls].length > 0);
      const slots = generateSeatSlots(room);
      const roomAssigned: AllocatedStudent[] = [];

      let classIndex = 0;
      for (let i = 0; i < slots.length; i++) {
        let foundStudent: Student | null = null;
        let attempts = 0;
        const totalEligible = eligibleClasses.length;

        while (attempts < totalEligible) {
          const clsName = eligibleClasses[classIndex % totalEligible];
          classIndex++;
          attempts++;

          if (poolByClass[clsName] && poolByClass[clsName].length > 0) {
            foundStudent = poolByClass[clsName].shift()!;
            break;
          }
        }

        // If none found in designated classes, try any remaining student in pool if room has open classes
        if (!foundStudent && (!room.allowedClasses || room.allowedClasses.length === 0)) {
          for (const anyCls of Object.keys(poolByClass)) {
            if (poolByClass[anyCls].length > 0) {
              foundStudent = poolByClass[anyCls].shift()!;
              break;
            }
          }
        }

        if (foundStudent) {
          const slot = slots[i];
          roomAssigned.push({
            ...foundStudent,
            seatNumber: slot.seatNumber,
            row: slot.row,
            col: slot.col,
            benchSeatIndex: slot.benchSeatIndex,
          });
        } else {
          break;
        }
      }

      newAssignments[room.name] = roomAssigned;
    }

    setAssignments(newAssignments);
  };

  return (
    <SeatPlanContext.Provider value={{ 
      rooms, 
      students, 
      assignments, 
      examInfo,
      seatingPattern,
      availableClasses,
      addRoom, 
      removeRoom, 
      setStudents, 
      setExamInfo,
      setSeatingPattern,
      swapSeats,
      generatePlan, 
      clearAll 
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
