# Exam Seat Plan Maker

A professional, web-based tool built with **Next.js** to generate and print exam seat plans. This application allows you to manage rooms, upload student lists via Excel/CSV, and automatically generates print-ready seat slips in a 3x3 grid layout (9 slips per A4 page).

## Features

- **Automated Seating**: Intelligently mixes students from different classes so that no two students from the same class sit side-by-side.
- **Bulk Upload**: Import student data easily via `.csv` or `.xlsx` files.
- **Room Management**: Add, remove, and manage rooms with specific seat capacities.
- **Print-Ready Layout**: Generates a 3x3 grid of seat slips per page, perfectly sized for A4 paper.
- **Custom Branding**: Includes your organization's logo and tagline on every seat slip.
- **Professional Design**: Modern, clean UI with glassmorphism effects and optimized print styles.

## Getting Started

### 1. Installation

First, clone the repository and install the dependencies:

```bash
npm install
```

### 2. Running Locally

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### 3. Usage Guide

1.  **Manage Rooms**: On the dashboard, add your rooms and specify the number of seats available in each.
2.  **Upload Data**: Upload your student list. The file should be a `.csv` or `.xlsx` file.
    -   **Required Columns**: `ID`, `Name`, `Class`. (Case-insensitive)
3.  **Generate**: Click "Generate Seat Plan". The system will distribute students across rooms based on your rules.
4.  **Print**: Go to the result page and click "Print All Slips".
    -   **Note**: In the print dialog, Ensure **Layout** is set to **Portrait** and **Margins** are set to **None** or **Default** for the best result.

## Data Format Example

See the provided `sample_students.csv` for reference. It should look like this:

| ID | Name | Class |
| :--- | :--- | :--- |
| 1001 | John Doe | 9 |
| 1002 | Jane Smith | 10 |
| ... | ... | ... |

## Technologies Used

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Vanilla CSS + CSS Modules
- **Icons**: Lucide React
- **Data Parsing**: XLSX
- **Persistence**: LocalStorage (Data stays even after refresh)

## License

MIT
