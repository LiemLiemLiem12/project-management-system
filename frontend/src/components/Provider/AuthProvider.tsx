"use client";

import { useMyContext } from "@/contexts/MyContext";
import { useAuthService } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth.store";
import { useEffect } from "react";
import { usePathname } from "next/navigation"; // Import hook này

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const user = useAuthStore((s) => s.user);
  const { persist } = useMyContext();
  const { getStatus } = useAuthService();
  const pathname = usePathname();

  // Danh sách các đường dẫn không cần check status
  const publicRoutes = ["/", "/login", "/sign-up", "/verify-code"];

  useEffect(() => {
    if (user) return;

    if (publicRoutes.includes(pathname)) return;

    if (persist) {
      getStatus();
    }
  }, [pathname, user, persist]);

  return <>{children}</>;
};
