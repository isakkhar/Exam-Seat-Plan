# ICT Olympiad Bangladesh — Season 3 Gala Round Exam & Seat Plan System

A premier, web-based examination management, seat allocation, and admit card generation system built with **Next.js 16** for the **ICT Olympiad Bangladesh — Season 3 Gala Round**. Styled with the official **ICT Olympiad Bangladesh tech brand identity** (Deep Tech Blue `#004B99`, Digital Cyan `#00A3E0`, and Accent Gold/Orange `#FF7A00`).

---

## ✨ Gala Round Features & Architecture

### 1. 13 National Categories (130 Candidates)
- **Pre-configured Preset**: 1-click loading of 130 candidates across all 13 official Gala categories:
  1. Class 1
  2. Class 2
  3. Class 3
  4. Class 4
  5. Class 5
  6. Class 6
  7. Class 7
  8. Class 8
  9. Class 9/10
  10. Class 11/12
  11. Polytechnic (পলিটেকনিক)
  12. Non-Engineering (নন-ইঞ্জিনিয়ারিং)
  13. Engineering (ইঞ্জিনিয়ারিং)
- Custom upload support via `.xlsx` or `.csv` with auto-column detection (`ID/Roll`, `Name`, `Class`).

### 2. Parallel Examination Pipeline (09:00 AM – 11:00 AM)
Ensures zero crowding and maximum efficiency with 5 examination rooms (40 single chairs each = 200 capacity):
- **Group A (70 Candidates - Class 1 to 7)**:
  - **Slot 1 (09:00 AM - 09:50 AM)**: Written Exam (Room 101 & Room 102, 35 candidates/room).
  - **Break & Swap (09:50 AM - 10:05 AM)**: 15-minute room changeover.
  - **Slot 2 (10:05 AM - 10:55 AM)**: Viva Voce across 5 Viva Boards (Room 103, 104, 105).
- **Group B (60 Candidates - Class 8 to Engineering)**:
  - **Slot 1 (09:00 AM - 09:50 AM)**: Viva Voce across 5 Viva Boards (Room 103, 104, 105).
  - **Break & Swap (09:50 AM - 10:05 AM)**: 15-minute room changeover.
  - **Slot 2 (10:05 AM - 10:55 AM)**: Written Exam (Room 101 & Room 102, 30 candidates/room).

### 3. Comprehensive Print-Ready Document Views (A4 Portrait)
1. **🏷️ Dual Seat Slips (3x3 Grid)**:
   - 9 desk sticker slips per A4 page with cutting guide margins.
   - Shows both Written Hall/Seat + Viva Room/Board/Token for each candidate.
2. **🪪 Modernized Gala Admit Cards (2 per Page)**:
   - Official ICT Olympiad Bangladesh branded frame with dual logos.
   - Passport photo affix box, candidate identity, and Parallel Schedule Matrix table.
   - Instructions and signatures of Convener & Controller of Examinations.
3. **🪑 Visual Classroom Map (Single Chair Grid)**:
   - Front blackboard/podium with seat grid (8 rows × 5 cols).
   - Slot 1 / Slot 2 selector and live interactive seat swapping.
4. **🚪 Door Notice & Directory**:
   - Written halls (Room 101, 102) roll ranges and seating capacity.
   - Viva halls (Room 103, 104, 105) candidate queue list with tokens.
5. **📝 Written Attendance Sheet**:
   - Formal invigilator attendance sheets with candidate signature and script number boxes.
6. **⚖️ Judges Viva Evaluation Sheet**:
   - Scoring rubric per board (Presentation: 10, Technical Knowledge: 15, Problem Solving: 15, Total: 40).
7. **📊 Excel Export**:
   - Full `.xlsx` data export of all 130 candidates with their written seats and viva tokens.

---

## 🚀 Getting Started

### 1. Installation

```bash
npm install
```

### 2. Running Locally

Start the Next.js development server (Webpack is enabled for Windows compatibility):

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: ICT Olympiad Bangladesh Tech Theme (`globals.css`)
- **Icons**: Lucide React
- **Data Parsing & Export**: XLSX
- **Persistence**: LocalStorage

---

## 📄 License

MIT
