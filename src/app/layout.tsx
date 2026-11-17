import type { Metadata } from "next";
import "./globals.css";
import { SeatPlanProvider } from "@/context/SeatPlanContext";

export const metadata: Metadata = {
  title: "ICT Olympiad Bangladesh - Seat Plan & Exam System",
  description: "Official Season 3 Gala Round Parallel Seat Plan & Admit Card Generator",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning>
        <SeatPlanProvider>
          {children}
        </SeatPlanProvider>
      </body>
    </html>
  );
}
