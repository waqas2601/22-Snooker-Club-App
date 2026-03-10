"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import { clearUser } from "@/lib/storage/auth.storage";
import type { ClubUser } from "@/types";

interface AppShellProps {
  user: ClubUser;
  children: React.ReactNode;
}

export default function AppShell({ user, children }: AppShellProps) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    clearUser();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-theme-primary flex">
      {/* Sidebar */}
      <Sidebar
        user={user}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onLogout={handleLogout}
      />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Pages render here — they bring their own PageHeader */}
        {/* We pass setSidebarOpen down via a slot pattern */}
        <MenuContext.Provider value={() => setSidebarOpen((o) => !o)}>
          {children}
        </MenuContext.Provider>
      </div>
    </div>
  );
}

// ── Small context so any page can open the sidebar ───────────────
import { createContext, useContext } from "react";

const MenuContext = createContext<() => void>(() => {});

export function useMenuToggle() {
  return useContext(MenuContext);
}
