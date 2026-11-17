'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { OFFICIAL_GALA_STUDENTS } from '@/data/galaStudents';

export interface Student {
  id: string;
  name: string;
  className: string;
  institution?: string;
  rank?: string;
}

export interface AllocatedStudent extends Student {
  seatNumber?: string;
  row?: number;
  col?: number;
  benchSeatIndex?: number;
  // Gala Round Parallel Scheduling Metadata
  group?: 'Group A' | 'Group B';
  writtenSlot?: string; // e.g. "09:00 AM - 09:50 AM (Slot 1)"
  writtenRoom?: string; // e.g. "Room 101"
  writtenSeat?: string; // e.g. "R1-C1"
  vivaSlot?: string;    // e.g. "10:05 AM - 10:55 AM (Slot 2)"
  vivaRoom?: string;    // e.g. "Room 103"
  vivaBoard?: string;   // e.g. "Board 1"
  vivaToken?: number;   // e.g. 5
}

export interface Room {
  id: string;
  name: string;
  capacity: number;
  rows?: number;
  cols?: number;
  seatsPerBench?: number;
  allowedClasses?: string[]; // If empty, all classes allowed
  roomType?: 'written' | 'viva' | 'both';
  vivaBoards?: string[];
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

export const GALA_CLASSES = [
  'Class 1',
  'Class 2',
  'Class 3',
  'Class 4',
  'Class 5',
  'Class 6',
  'Class 7',
  'Class 8',
  'Class 9/10',
  'Class 11/12',
  'Polytechnic',
  'Non-Engineering',
  'Engineering'
];

export const GROUP_A_CLASSES = [
  'Class 1',
  'Class 2',
  'Class 3',
  'Class 4',
  'Class 5',
  'Class 6',
  'Class 7'
];

export const GROUP_B_CLASSES = [
  'Class 8',
  'Class 9/10',
  'Class 11/12',
  'Polytechnic',
  'Non-Engineering',
  'Engineering'
];

export const DEFAULT_GALA_ROOMS: Room[] = [
  { id: 'room-101', name: '101', capacity: 40, rows: 8, cols: 5, seatsPerBench: 1, roomType: 'written' },
  { id: 'room-102', name: '102', capacity: 40, rows: 8, cols: 5, seatsPerBench: 1, roomType: 'written' },
  { id: 'room-103', name: '103', capacity: 40, rows: 8, cols: 5, seatsPerBench: 1, roomType: 'viva', vivaBoards: ['Board 1', 'Board 2'] },
  { id: 'room-104', name: '104', capacity: 40, rows: 8, cols: 5, seatsPerBench: 1, roomType: 'viva', vivaBoards: ['Board 3', 'Board 4'] },
  { id: 'room-105', name: '105', capacity: 40, rows: 8, cols: 5, seatsPerBench: 1, roomType: 'viva', vivaBoards: ['Board 5'] },
];

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
  generatePlan: (overrideRooms?: Room[], overrideStudents?: Student[]) => void;
  loadGalaPreset: () => void;
  clearAll: () => void;
}

const SeatPlanContext = createContext<SeatPlanContextType | undefined>(undefined);

export function SeatPlanProvider({ children }: { children: React.ReactNode }) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [assignments, setAssignments] = useState<Record<string, AllocatedStudent[]>>({});
  const [seatingPattern, setSeatingPattern] = useState<SeatingPattern>('snake');
  const [examInfo, setExamInfo] = useState<ExamInfo>({
    title: 'Gala Round Grand Finale 2026',
    date: 'Saturday | 09:00 AM - 11:00 AM',
    subject: 'Written & Viva Voce Evaluation',
    institutionName: 'ICT Olympiad Bangladesh - Season 3',
    customLogoUrl: '',
    instructions: '১. প্রবেশপত্র ছাড়া পরীক্ষা কক্ষে প্রবেশ নিষেধ। ২. লিখিত পরীক্ষা সকাল ০৯:০০টা থেকে ০৯:৫০টা এবং ভাইভা সকাল ১০:০৫টা থেকে ১০:৫৫টার মধ্যে গ্রুপ অনুযায়ী অনুষ্ঠিত হবে। ৩. মোবাইল ও সব ধরণের ইলেকট্রনিক ডিভাইস সম্পূর্ণ নিষিদ্ধ।'
  });

  // Load from localStorage
  useEffect(() => {
    const savedRooms = localStorage.getItem('seatplan_rooms');
    const savedStudents = localStorage.getItem('seatplan_students');
    const savedAssignments = localStorage.getItem('seatplan_assignments');
    const savedExamInfo = localStorage.getItem('seatplan_exam_info');
    const savedPattern = localStorage.getItem('seatplan_pattern');

    let loadedRooms: Room[] = DEFAULT_GALA_ROOMS;
    let loadedStudents: Student[] = OFFICIAL_GALA_STUDENTS;
    let needsRegen = false;

    if (savedRooms) {
      try { 
        const parsed = JSON.parse(savedRooms);
        if (Array.isArray(parsed) && parsed.length > 0) loadedRooms = parsed;
      } catch (e) { console.error(e); }
    }
    if (savedStudents) {
      try { 
        const parsed = JSON.parse(savedStudents);
        if (Array.isArray(parsed) && parsed.length > 0) {
          if (parsed[0]?.id?.startsWith('ICTOB-')) {
            loadedStudents = OFFICIAL_GALA_STUDENTS;
            needsRegen = true;
          } else {
            loadedStudents = parsed;
          }
        }
      } catch (e) { console.error(e); }
    }
    setRooms(loadedRooms);
    setStudents(loadedStudents);

    if (savedExamInfo) {
      try { setExamInfo(JSON.parse(savedExamInfo)); } catch (e) { console.error(e); }
    }
    if (savedPattern && (savedPattern === 'column-wise' || savedPattern === 'snake' || savedPattern === 'row-wise')) {
      setSeatingPattern(savedPattern as SeatingPattern);
    }

    if (savedAssignments && !needsRegen) {
      try { setAssignments(JSON.parse(savedAssignments)); } catch (e) { console.error(e); }
    } else {
      generatePlan(loadedRooms, loadedStudents);
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

      const tempSeatNo = s1.seatNumber;
      const tempRow = s1.row;
      const tempCol = s1.col;
      const tempBench = s1.benchSeatIndex;
      const tempWrittenSeat = s1.writtenSeat;

      updated[idx1] = {
        ...s1,
        seatNumber: s2.seatNumber,
        writtenSeat: s2.writtenSeat,
        row: s2.row,
        col: s2.col,
        benchSeatIndex: s2.benchSeatIndex
      };

      updated[idx2] = {
        ...s2,
        seatNumber: tempSeatNo,
        writtenSeat: tempWrittenSeat,
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

  // Helper to generate seat slots according to the selected seating pattern
  const generateSeatSlots = (room: Room) => {
    const rows = room.rows && room.rows > 0 ? room.rows : Math.ceil(room.capacity / 5);
    const cols = room.cols && room.cols > 0 ? room.cols : 5;
    const slots: { seatNumber: string; row: number; col: number; benchSeatIndex: number }[] = [];

    if (seatingPattern === 'column-wise') {
      for (let c = 1; c <= cols; c++) {
        for (let r = 1; r <= rows; r++) {
          if (slots.length >= room.capacity) break;
          slots.push({ seatNumber: `R${r}-C${c}`, row: r, col: c, benchSeatIndex: 1 });
        }
        if (slots.length >= room.capacity) break;
      }
    } else if (seatingPattern === 'snake') {
      for (let c = 1; c <= cols; c++) {
        const isEvenCol = c % 2 === 0;
        if (isEvenCol) {
          for (let r = rows; r >= 1; r--) {
            if (slots.length >= room.capacity) break;
            slots.push({ seatNumber: `R${r}-C${c}`, row: r, col: c, benchSeatIndex: 1 });
          }
        } else {
          for (let r = 1; r <= rows; r++) {
            if (slots.length >= room.capacity) break;
            slots.push({ seatNumber: `R${r}-C${c}`, row: r, col: c, benchSeatIndex: 1 });
          }
        }
        if (slots.length >= room.capacity) break;
      }
    } else {
      // Row-wise
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

  // Main plan generator supporting Gala Parallel logic
  const generatePlan = (overrideRooms?: Room[], overrideStudents?: Student[]) => {
    const activeRooms = overrideRooms || rooms;
    const activeStudents = overrideStudents || students;
    if (activeRooms.length === 0 || activeStudents.length === 0) return;

    // Determine if this is ICT Olympiad Gala Round (or similar 13 classes setup)
    const isGroupA = (cls: string) => GROUP_A_CLASSES.includes(cls.trim());

    // Separate students into Group A and Group B
    const groupAStudents: Student[] = [];
    const groupBStudents: Student[] = [];

    activeStudents.forEach(s => {
      if (isGroupA(s.className)) {
        groupAStudents.push(s);
      } else {
        groupBStudents.push(s);
      }
    });

    // Check if we have 5 standard rooms (101-105) or at least 2 rooms
    const room101 = activeRooms.find(r => r.name.includes('101')) || activeRooms[0];
    const room102 = activeRooms.find(r => r.name.includes('102')) || activeRooms[1] || activeRooms[0];

    // Build Interleaved array of students for mixed seating
    const interleaveStudents = (studentList: Student[]): Student[] => {
      const byClass: Record<string, Student[]> = {};
      studentList.forEach(s => {
        const c = s.className.trim();
        if (!byClass[c]) byClass[c] = [];
        byClass[c].push(s);
      });

      const classNames = Object.keys(byClass);
      const interleaved: Student[] = [];
      let added = true;
      let ptr = 0;

      while (added) {
        added = false;
        for (const cName of classNames) {
          if (byClass[cName].length > ptr) {
            interleaved.push(byClass[cName][ptr]);
            added = true;
          }
        }
        ptr++;
      }
      return interleaved;
    };

    const interleavedA = interleaveStudents(groupAStudents);
    const interleavedB = interleaveStudents(groupBStudents);

    // Viva allocation definitions:
    // Slot 1 (09:00 - 09:50 AM): Group B takes Viva across 5 boards in Rooms 103, 104, 105
    // Slot 2 (10:05 - 10:55 AM): Group A takes Viva across 5 boards in Rooms 103, 104, 105
    const assignVivaMetadata = (student: Student, group: 'Group A' | 'Group B') => {
      const cls = student.className.trim();
      let vivaRoom = 'Room 103';
      let vivaBoard = 'Board 1';
      let vivaSlot = group === 'Group A' ? '10:05 AM - 10:55 AM (Slot 2)' : '09:00 AM - 09:50 AM (Slot 1)';

      if (group === 'Group A') {
        if (cls === 'Class 1' || cls === 'Class 2') {
          vivaRoom = 'Room 103';
          vivaBoard = 'Board 1 (Primary)';
        } else if (cls === 'Class 3' || cls === 'Class 4') {
          vivaRoom = 'Room 103';
          vivaBoard = 'Board 2 (Junior)';
        } else if (cls === 'Class 5') {
          vivaRoom = 'Room 104';
          vivaBoard = 'Board 3 (Junior 5)';
        } else if (cls === 'Class 6') {
          vivaRoom = 'Room 104';
          vivaBoard = 'Board 4 (Middle 6)';
        } else {
          vivaRoom = 'Room 105';
          vivaBoard = 'Board 5 (Middle 7)';
        }
      } else {
        // Group B
        if (cls === 'Class 8') {
          vivaRoom = 'Room 103';
          vivaBoard = 'Board 1 (Class 8)';
        } else if (cls === 'Class 9/10') {
          vivaRoom = 'Room 103';
          vivaBoard = 'Board 2 (Secondary 9/10)';
        } else if (cls === 'Class 11/12') {
          vivaRoom = 'Room 104';
          vivaBoard = 'Board 3 (Higher Secondary)';
        } else if (cls === 'Polytechnic') {
          vivaRoom = 'Room 104';
          vivaBoard = 'Board 4 (Polytechnic)';
        } else {
          vivaRoom = 'Room 105';
          vivaBoard = 'Board 5 (Engineering & University)';
        }
      }

      return { vivaRoom, vivaBoard, vivaSlot };
    };

    // Track tokens per board
    const boardTokensSlot1: Record<string, number> = {};
    const boardTokensSlot2: Record<string, number> = {};

    // Generate room slots for 101 and 102
    const slots101 = generateSeatSlots(room101);
    const slots102 = generateSeatSlots(room102);

    const room101Allocated: AllocatedStudent[] = [];
    const room102Allocated: AllocatedStudent[] = [];

    // 1) Slot 1 Written (Group A) -> Room 101 & 102
    const halfA = Math.ceil(interleavedA.length / 2);
    const groupA101 = interleavedA.slice(0, halfA);
    const groupA102 = interleavedA.slice(halfA);

    groupA101.forEach((st, idx) => {
      const slot = slots101[idx] || { seatNumber: `Seat ${idx + 1}`, row: Math.floor(idx / 5) + 1, col: (idx % 5) + 1, benchSeatIndex: 1 };
      const vivaInfo = assignVivaMetadata(st, 'Group A');
      boardTokensSlot2[vivaInfo.vivaBoard] = (boardTokensSlot2[vivaInfo.vivaBoard] || 0) + 1;

      room101Allocated.push({
        ...st,
        seatNumber: slot.seatNumber,
        row: slot.row,
        col: slot.col,
        benchSeatIndex: 1,
        group: 'Group A',
        writtenSlot: '09:00 AM - 09:50 AM (Slot 1)',
        writtenRoom: room101.name,
        writtenSeat: slot.seatNumber,
        vivaSlot: vivaInfo.vivaSlot,
        vivaRoom: vivaInfo.vivaRoom,
        vivaBoard: vivaInfo.vivaBoard,
        vivaToken: boardTokensSlot2[vivaInfo.vivaBoard]
      });
    });

    groupA102.forEach((st, idx) => {
      const slot = slots102[idx] || { seatNumber: `Seat ${idx + 1}`, row: Math.floor(idx / 5) + 1, col: (idx % 5) + 1, benchSeatIndex: 1 };
      const vivaInfo = assignVivaMetadata(st, 'Group A');
      boardTokensSlot2[vivaInfo.vivaBoard] = (boardTokensSlot2[vivaInfo.vivaBoard] || 0) + 1;

      room102Allocated.push({
        ...st,
        seatNumber: slot.seatNumber,
        row: slot.row,
        col: slot.col,
        benchSeatIndex: 1,
        group: 'Group A',
        writtenSlot: '09:00 AM - 09:50 AM (Slot 1)',
        writtenRoom: room102.name,
        writtenSeat: slot.seatNumber,
        vivaSlot: vivaInfo.vivaSlot,
        vivaRoom: vivaInfo.vivaRoom,
        vivaBoard: vivaInfo.vivaBoard,
        vivaToken: boardTokensSlot2[vivaInfo.vivaBoard]
      });
    });

    // 2) Slot 2 Written (Group B) -> Room 101 & 102
    const halfB = Math.ceil(interleavedB.length / 2);
    const groupB101 = interleavedB.slice(0, halfB);
    const groupB102 = interleavedB.slice(halfB);

    groupB101.forEach((st, idx) => {
      const slot = slots101[idx] || { seatNumber: `Seat ${idx + 1}`, row: Math.floor(idx / 5) + 1, col: (idx % 5) + 1, benchSeatIndex: 1 };
      const vivaInfo = assignVivaMetadata(st, 'Group B');
      boardTokensSlot1[vivaInfo.vivaBoard] = (boardTokensSlot1[vivaInfo.vivaBoard] || 0) + 1;

      room101Allocated.push({
        ...st,
        seatNumber: `${slot.seatNumber} [Slot 2]`,
        row: slot.row,
        col: slot.col,
        benchSeatIndex: 1,
        group: 'Group B',
        writtenSlot: '10:05 AM - 10:55 AM (Slot 2)',
        writtenRoom: room101.name,
        writtenSeat: slot.seatNumber,
        vivaSlot: vivaInfo.vivaSlot,
        vivaRoom: vivaInfo.vivaRoom,
        vivaBoard: vivaInfo.vivaBoard,
        vivaToken: boardTokensSlot1[vivaInfo.vivaBoard]
      });
    });

    groupB102.forEach((st, idx) => {
      const slot = slots102[idx] || { seatNumber: `Seat ${idx + 1}`, row: Math.floor(idx / 5) + 1, col: (idx % 5) + 1, benchSeatIndex: 1 };
      const vivaInfo = assignVivaMetadata(st, 'Group B');
      boardTokensSlot1[vivaInfo.vivaBoard] = (boardTokensSlot1[vivaInfo.vivaBoard] || 0) + 1;

      room102Allocated.push({
        ...st,
        seatNumber: `${slot.seatNumber} [Slot 2]`,
        row: slot.row,
        col: slot.col,
        benchSeatIndex: 1,
        group: 'Group B',
        writtenSlot: '10:05 AM - 10:55 AM (Slot 2)',
        writtenRoom: room102.name,
        writtenSeat: slot.seatNumber,
        vivaSlot: vivaInfo.vivaSlot,
        vivaRoom: vivaInfo.vivaRoom,
        vivaBoard: vivaInfo.vivaBoard,
        vivaToken: boardTokensSlot1[vivaInfo.vivaBoard]
      });
    });

    // Populate assignments map
    const finalAssignments: Record<string, AllocatedStudent[]> = {
      [room101.name]: room101Allocated,
      [room102.name]: room102Allocated,
    };

    // If other rooms exist (e.g. 103, 104, 105), add them with viva candidates for clear viewing
    activeRooms.forEach(r => {
      if (!finalAssignments[r.name]) {
        // Collect students whose viva room is this room
        const roomStudents = [...room101Allocated, ...room102Allocated].filter(
          s => s.vivaRoom?.includes(r.name) || r.name.includes(s.vivaRoom || '###')
        );
        finalAssignments[r.name] = roomStudents;
      }
    });

    setAssignments(finalAssignments);
    localStorage.setItem('seatplan_assignments', JSON.stringify(finalAssignments));
  };

  // Load Gala Round Season 3 Preset (130 official students across 13 classes, 5 rooms)
  const loadGalaPreset = () => {
    const galaRooms = DEFAULT_GALA_ROOMS;
    const galaStudents = OFFICIAL_GALA_STUDENTS;

    const galaExamInfo: ExamInfo = {
      title: 'Gala Round Grand Finale 2026',
      date: 'Saturday | 09:00 AM - 11:00 AM',
      subject: 'Written & Viva Voce Evaluation',
      institutionName: 'ICT Olympiad Bangladesh - Season 3',
      customLogoUrl: '',
      instructions: '১. প্রবেশপত্র ছাড়া পরীক্ষা কক্ষে প্রবেশ নিষেধ। ২. লিখিত পরীক্ষা সকাল ০৯:০০টা থেকে ০৯:৫০টা এবং ভাইভা সকাল ১০:০৫টা থেকে ১০:৫৫টার মধ্যে গ্রুপ অনুযায়ী অনুষ্ঠিত হবে। ৩. মোবাইল ও সব ধরণের ইলেকট্রনিক ডিভাইস সম্পূর্ণ নিষিদ্ধ।'
    };

    setRooms(galaRooms);
    setStudents(galaStudents);
    setExamInfo(galaExamInfo);
    setSeatingPattern('snake');

    // Save to localStorage immediately
    localStorage.setItem('seatplan_rooms', JSON.stringify(galaRooms));
    localStorage.setItem('seatplan_students', JSON.stringify(galaStudents));
    localStorage.setItem('seatplan_exam_info', JSON.stringify(galaExamInfo));
    localStorage.setItem('seatplan_pattern', 'snake');

    generatePlan(galaRooms, galaStudents);
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
      loadGalaPreset,
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
