import type { Metadata } from "next";
import "./globals.css";
import { ThemeToggleButton2 } from "@/components/v1/skiper4";

export const metadata: Metadata = {
  title: "Dugtong OJT",
  description:
    "Track OJT hours without the paperwork: students log, coordinators approve, one click makes the report.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <div className="fixed right-4 top-4 z-50">
          <ThemeToggleButton2 />
        </div>
        {children}
      </body>
    </html>
  );
}
