import type { Metadata } from "next";
import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "Absolute Tracker",
  description: "Buffet food tracker",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-950 text-gray-100 antialiased">
        <AuthProvider>
          <div className="mx-auto min-h-screen max-w-[480px] shadow-2xl">
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
