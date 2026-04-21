import type { Metadata } from "next";
import "./globals.css";
import { SeatPlanProvider } from "@/context/SeatPlanContext";

export const metadata: Metadata = {
  title: "Exam Seat Plan Maker",
  description: "Generate professional exam seat plans with ease.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <SeatPlanProvider>
          {children}
        </SeatPlanProvider>
      </body>
    </html>
  );
}
