import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dugtong OJT",
  description:
    "Track OJT hours without the paperwork: students log, coordinators approve, one click makes the report.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
