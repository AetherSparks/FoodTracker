"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { SessionProvider } from "@/context/SessionContext";

export default function TrackLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-950">
        <div className="relative flex h-12 w-12 items-center justify-center">
          <div className="absolute h-full w-full animate-ping rounded-full bg-amber-500/20" />
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent shadow-lg shadow-amber-500/20" />
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="mx-auto min-h-screen max-w-md bg-gray-950 text-gray-100 shadow-2xl shadow-black/50">
      <SessionProvider>{children}</SessionProvider>
    </div>
  );
}
