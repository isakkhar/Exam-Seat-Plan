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
}

interface SeatPlanContextType {
  rooms: Room[];
  students: Student[];
  assignments: Record<string, AllocatedStudent[]>; // Room Name -> Students with seat info
  examInfo: ExamInfo;
  availableClasses: string[];
  addRoom: (room: Room) => void;
  removeRoom: (id: string) => void;
  setStudents: (students: Student[]) => void;
  setExamInfo: React.Dispatch<React.SetStateAction<ExamInfo>>;
  generatePlan: () => void;
  clearAll: () => void;
}

const SeatPlanContext = createContext<SeatPlanContextType | undefined>(undefined);

export function SeatPlanProvider({ children }: { children: React.ReactNode }) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [assignments, setAssignments] = useState<Record<string, AllocatedStudent[]>>({});
  const [examInfo, setExamInfo] = useState<ExamInfo>({
    title: 'Final Examination 2026',
    date: '',
    subject: '',
    institutionName: '',
  });

  // Load from localStorage
  useEffect(() => {
    const savedRooms = localStorage.getItem('seatplan_rooms');
    const savedStudents = localStorage.getItem('seatplan_students');
    const savedAssignments = localStorage.getItem('seatplan_assignments');
    const savedExamInfo = localStorage.getItem('seatplan_exam_info');
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
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('seatplan_rooms', JSON.stringify(rooms));
    localStorage.setItem('seatplan_students', JSON.stringify(students));
    localStorage.setItem('seatplan_assignments', JSON.stringify(assignments));
    localStorage.setItem('seatplan_exam_info', JSON.stringify(examInfo));
  }, [rooms, students, assignments, examInfo]);

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

    // Helper to generate seat labels based on rows, cols, seatsPerBench
    const generateSeatSlots = (room: Room) => {
      const rows = room.rows && room.rows > 0 ? room.rows : Math.ceil(room.capacity / 4);
      const cols = room.cols && room.cols > 0 ? room.cols : 4;
      const seatsPerBench = room.seatsPerBench && room.seatsPerBench > 0 ? room.seatsPerBench : 1;
      
      const slots: { seatNumber: string; row: number; col: number; benchSeatIndex: number }[] = [];
      let count = 0;
      for (let r = 1; r <= rows; r++) {
        for (let c = 1; c <= cols; c++) {
          for (let b = 1; b <= seatsPerBench; b++) {
            if (count >= room.capacity) break;
            const seatNumber = seatsPerBench > 1 
              ? `R${r}-C${c} (S${b})` 
              : `R${r}-C${c}`;
            slots.push({ seatNumber, row: r, col: c, benchSeatIndex: b });
            count++;
          }
          if (count >= room.capacity) break;
        }
        if (count >= room.capacity) break;
      }
      return slots;
    };

    // Assign students to each room
    for (const room of rooms) {
      // Determine which classes are allowed for this room
      const allowed = room.allowedClasses && room.allowedClasses.length > 0
        ? room.allowedClasses
        : Object.keys(poolByClass);

      // Collect available candidate classes for this room that have students left
      const eligibleClasses = allowed.filter(cls => poolByClass[cls] && poolByClass[cls].length > 0);

      const slots = generateSeatSlots(room);
      const roomAssigned: AllocatedStudent[] = [];

      let classIndex = 0;
      for (let i = 0; i < slots.length; i++) {
        // Find next eligible class with available students
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
          // No more students available for this room
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
      availableClasses,
      addRoom, 
      removeRoom, 
      setStudents, 
      setExamInfo,
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
