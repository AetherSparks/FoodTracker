"use client";

import { SessionProvider } from "@/context/SessionContext";

export default function TrackLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SessionProvider>{children}</SessionProvider>;
}
