import type { Metadata } from "next";
import { Inter, Inter_Tight, JetBrains_Mono } from "next/font/google";
import "./globals.css";

// The three typefaces from docs/Design.md. Satoshi (the spec's first choice
// for headings) is not on Google Fonts, so headings use the spec's own
// fallback, Inter Tight.
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const interTight = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-inter-tight",
  display: "swap",
});
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Dugtong OJT",
    template: "%s · Dugtong OJT",
  },
  description:
    "Track OJT hours without the paperwork: students log, supervisors and coordinators approve, one click makes the report.",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/dugtong-logo-mark.png", type: "image/png" },
    ],
    shortcut: "/icon.svg",
    apple: "/dugtong-logo-mark.png",
  },
};

// Runs before the page paints, so a person who chose dark mode never sees a
// white flash. It only reads the saved choice and sets a class.
//
// This is a plain inline script on purpose: next/script queues its code until
// Next's runtime loads, which is too late to stop the flash. It is written as
// raw HTML, which is safe here because the text below is a fixed constant in
// this file and no user input ever reaches it.
const themeInit = `try{if(localStorage.getItem("theme")==="dark")document.documentElement.classList.add("dark")}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${interTight.variable} ${jetbrainsMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
