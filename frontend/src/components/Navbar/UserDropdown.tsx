"use client";

import { useAuthStore } from "@/store/auth.store";
import { useEffect, useRef, useState } from "react";

function IconSwitch() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="8" cy="7" r="3" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="16" cy="17" r="3" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M14 7h6M10 17H4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M17 4l3 3-3 3M7 14l-3 3 3 3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconLogout() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M10 17l5-5-5-5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15 12H3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function AvatarCircle({
  src,
  initials,
  size = 40,
}: {
  src?: string;
  initials: string;
  size?: number;
}) {
  const [imgError, setImgError] = useState(false);

  // Giữ lại width, height và fontSize dạng inline style vì đây là giá trị động
  if (src && !imgError) {
    return (
      <div
        className="rounded-full shrink-0 bg-[#1B2A4A] flex items-center justify-center text-white font-bold overflow-hidden"
        style={{ width: size, height: size }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt="avatar"
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className="rounded-full shrink-0 bg-[#1B2A4A] flex items-center justify-center text-white font-bold overflow-hidden"
      style={{ width: size, height: size, fontSize: size * 0.33 }}
    >
      {initials}
    </div>
  );
}

interface UserDropdownProps {
  name?: string;
  email?: string;
  role?: string;
  avatarSrc?: string;
  /** "full" = tên + role + avatar (desktop), "avatar" = chỉ avatar (mobile) */
  variant?: "full" | "avatar";
}

export default function UserDropdown({}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const initials = user?.fullname
    ? user.fullname
        .split(" ")
        .filter(Boolean)
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "??"; // Fallback nếu không có tên

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handle);
    return () => document.removeEventListener("keydown", handle);
  }, []);

  if (!user) {
    return <UserDropdownSkeleton />;
  }

  return (
    <div ref={ref} className="relative inline-block">
      {/* Trigger */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-2 py-1.5 rounded-xl border-none bg-transparent cursor-pointer transition-colors duration-150 hover:bg-gray-100"
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            lineHeight: 1.3,
          }}
        >
          <span
            style={{
              fontWeight: 600,
              fontSize: 14,
              color: "#111827",
              whiteSpace: "nowrap",
            }}
          >
            {user?.fullname || ""}
          </span>
          <span
            style={{ fontSize: 12, color: "#6B7280", whiteSpace: "nowrap" }}
          >
            Role
          </span>
        </div>
        <AvatarCircle src={user?.avatarUrl} initials={initials} size={36} />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-[280px] bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.12)] border border-gray-100 overflow-hidden">
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "14px 16px",
              background: "#F9FAFB",
              borderBottom: "1px solid #F3F4F6",
            }}
          >
            <AvatarCircle
              src={user?.avatarUrl || ""}
              initials={initials}
              size={44}
            />
            <div style={{ minWidth: 0 }}>
              <p
                style={{
                  fontWeight: 600,
                  fontSize: 14,
                  color: "#111827",
                  margin: 0,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {user?.fullname || ""}
              </p>
              <p
                style={{
                  fontSize: 12,
                  color: "#9CA3AF",
                  margin: "2px 0 0",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {user?.email || ""}
              </p>
            </div>
          </div>

          {/* Menu items */}
          <div className="py-1.5">
            {[
              { icon: <IconSwitch />, label: "Switch account" },
              {
                icon: <IconLogout />,
                label: "Log out",
                onclick: () => logout(),
              },
            ].map(({ icon, label, onclick }) => (
              <button
                key={label}
                onClick={onclick}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 16px",
                  fontSize: 14,
                  color: "#374151",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "background 0.1s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#F9FAFB")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                <span className="text-gray-400 flex">{icon}</span>
                {label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const UserDropdownSkeleton = ({
  variant = "full",
}: {
  variant?: "full" | "minimal";
}) => {
  return (
    <div className="inline-block">
      <div className="flex items-center gap-2 p-2 px-2 py-1.5 rounded-xl">
        {variant === "full" && (
          <div className="flex flex-col items-end gap-1.5">
            {/* Name Skeleton */}
            <div className="h-3.5 w-20 bg-gray-200 rounded animate-pulse" />
            {/* Role Skeleton */}
            <div className="h-3 w-12 bg-gray-100 rounded animate-pulse" />
          </div>
        )}
        {/* Avatar Skeleton */}
        <div
          className={`bg-gray-200 rounded-full animate-pulse ${
            variant === "full" ? "w-10 h-10" : "w-9 h-9"
          }`}
        />
      </div>
    </div>
  );
};
