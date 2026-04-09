"use client";

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

export default function UserDropdown({
  name = "Alex Rivera",
  email = "ducxww@gmail.com",
  role = "Project Manager",
  avatarSrc,
  variant = "full",
}: UserDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const initials =
    name
      .split(" ")
      .filter(Boolean)
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "?";

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

  return (
    <div ref={ref} className="relative inline-block">
      {/* Trigger */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-2 py-1.5 rounded-xl border-none bg-transparent cursor-pointer transition-colors duration-150 hover:bg-gray-100"
      >
        {variant === "full" && (
          <div className="flex flex-col items-end leading-tight">
            <span className="font-semibold text-sm text-gray-900 whitespace-nowrap">
              {name}
            </span>
            <span className="text-xs text-gray-500 whitespace-nowrap">
              {role}
            </span>
          </div>
        )}
        <AvatarCircle
          src={avatarSrc}
          initials={initials}
          size={variant === "full" ? 40 : 36}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-[280px] bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.12)] border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3.5 bg-gray-50 border-b border-gray-100">
            <AvatarCircle src={avatarSrc} initials={initials} size={44} />
            <div className="min-w-0">
              <p className="font-semibold text-sm text-gray-900 m-0 truncate">
                {name}
              </p>
              <p className="text-xs text-gray-400 mt-0.5 mb-0 truncate">
                {email}
              </p>
            </div>
          </div>

          {/* Menu items */}
          <div className="py-1.5">
            {[
              { icon: <IconSwitch />, label: "Switch account" },
              { icon: <IconLogout />, label: "Log out" },
            ].map(({ icon, label }) => (
              <button
                key={label}
                onClick={() => setOpen(false)}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 bg-transparent border-none cursor-pointer text-left transition-colors duration-100 hover:bg-gray-50"
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
