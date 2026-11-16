# Exam Seat Plan & Admit Card Maker

A modern, institutional web-based application built with **Next.js 16** to plan, manage, generate, and print exam seat arrangements and official admit cards. Designed with a clean, professional **Teal theme**, this tool is ideal for schools, colleges, and examination centers.

---

## ✨ Features

- **Classroom Bench Grid (১ জন / বেঞ্চ)**:
  - Configure rooms with **Rows** and **Columns** (bench layout).
  - Single-student-per-bench rule with automatically computed capacity and distinct seat codes (`R1-C1`, `R1-C2`...).
- **Room-wise Class Mapping**:
  - Assign specific classes to specific rooms or choose **"All Classes"**.
- **Anti-Cheating Seating Patterns**:
  - Choose between **Snake / Zig-zag order**, **Column-wise**, or **Row-wise** distribution to ensure students of the same class never sit side-by-side.
- **Interactive Manual Seat Swap**:
  - In the Visual Classroom Map, click any two desks to immediately swap student seat positions.
- **5 Print-Ready A4 Document Views**:
  1. **Seat Slips (3x3 Grid)**: 9 desk sticker slips per A4 page with student info, institution logo, room, and seat code.
  2. **Admit Cards (প্রবেশপত্র)**: Official printable admit cards with candidate photo placeholder, rules, student details, and signature zones.
  3. **Visual Classroom Map**: Classroom diagram with podium/blackboard and color-coded class badges.
  4. **Notice Board Summary**: Clean summary table for the examination notice board with roll ranges and class breakdown.
  5. **Attendance & Signature Sheet**: Invigilator attendance sheet with student signature and answer script number columns.
- **Real-Time Student Search**:
  - Instant live filter by Roll/ID, student name, or class.
- **Excel Export (.xlsx)**:
  - One-click full seat allocation export in Excel format.
- **Institutional Branding**:
  - Set custom institution name and upload your own school/college logo directly from the browser.
- **Smart Column Detection**:
  - Upload CSV or Excel files with flexible header names (e.g. `Roll`, `ID`, `Student Name`, `Class`, `Grade`).
- **Capacity Alerts**:
  - Visual indicator warning of seat shortages or reporting surplus empty seats.

---

## 🚀 Getting Started

### 1. Installation

Clone the repository and install dependencies:

```bash
npm install
```

### 2. Running Locally

Start the Next.js development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📋 Quick Usage Guide

1. **Setup Institution & Exam**: Enter institution name, exam title, subject, and date on the dashboard. Optionally upload your institution logo.
2. **Configure Rooms**: Add exam halls by specifying room name, number of rows, and columns (1 student per bench). Select allowed classes for each room.
3. **Upload Student List**: Upload your student list via `.xlsx` or `.csv` (Columns: `Roll/ID, Name, Class`).
4. **Choose Seating Pattern**: Select Snake/Zig-zag order, Column-wise, or Row-wise.
5. **Generate**: Click **"Generate Seat Plan & Admit Cards"**.
6. **Print & Export**:
   - Switch between **Seat Slips**, **Admit Cards**, **Classroom Map**, **Notice Board**, or **Attendance Sheet**.
   - Click **"Print Current View"** (Recommended print settings: Layout = **Portrait**, Margins = **None / Default**).
   - Click **"Export Excel"** for a complete spreadsheet.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Modern Teal CSS Theme with Glassmorphism
- **Icons**: Lucide React
- **Data Parsing & Export**: XLSX
- **Persistence**: LocalStorage

---

## 📄 License

MIT
