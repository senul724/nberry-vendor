import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Notes App - IAM Authentication Demo",
  description: "Simple, secure notes application demonstrating modern IAM authentication flows.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#fafafa] text-zinc-900">
        {children}
        <Toaster
          position="top-right"
          richColors
          closeButton
          toastOptions={{
            className: "border border-zinc-200 shadow-md font-sans text-sm",
          }}
        />
      </body>
    </html>
  );
}
