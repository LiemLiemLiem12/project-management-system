"use client";

import { useState, useRef } from "react";
import { Camera, AlertTriangle } from "lucide-react";

const mockDbUser = {
  avatarUrl: "",
  name: "Na Ha",
  email: "ducxww@gmail.com",
  role: "LEADER",
};

export default function ProfileSettings() {
  const [profile, setProfile] = useState(mockDbUser);
  const [newEmail, setNewEmail] = useState("");
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const avatarRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfile((p) => ({ ...p, avatarUrl: URL.createObjectURL(file) }));
    }
  };

  const initials = profile.name.charAt(0).toUpperCase() || "?";

  return (
    <div className="min-h-screen bg-[#F4F5F7] font-sans py-10 text-[#172B4D]">
      <div className="max-w-[1000px] mx-auto px-4 flex flex-col gap-6">
        {/* ─── TOP SECTION: PROFILE HEADER (Lightly Rounded) ─── */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8 flex items-center gap-8">
          <div
            onClick={() => avatarRef.current?.click()}
            className="w-24 h-24 rounded-full bg-[#1B2A4A] flex items-center justify-center text-white text-4xl font-bold cursor-pointer shrink-0 overflow-hidden relative group"
          >
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <span>{initials}</span>
            )}
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Camera size={24} className="text-white" />
            </div>
          </div>
          <input
            ref={avatarRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />

          <div className="flex-1 space-y-4">
            <input
              type="text"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className="w-full max-w-md border border-gray-300 rounded-none px-3 py-2 text-[20px] font-bold text-[#172B4D] focus:outline-none focus:border-blue-500 transition-colors bg-transparent"
            />
            <div className="flex flex-col gap-1">
              <span className="text-[14px] text-gray-500">{profile.email}</span>
              <div className="inline-flex items-center w-fit bg-[#E9F2FF] text-[#0052CC] px-3 py-1 rounded-none text-[11px] font-bold tracking-widest uppercase">
                {profile.role}
              </div>
            </div>
          </div>
        </div>

        {/* ─── BOTTOM SECTION: TWO COLUMNS (Square/Rounded-none) ─── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {/* LEFT COLUMN: EMAIL MANAGEMENT */}
          <div className="bg-white border border-gray-200 rounded-none shadow-sm flex flex-col h-full">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-[16px] font-bold">Email</h2>
            </div>
            <div className="p-6 space-y-6 flex-1">
              <div>
                <label className="block text-[13px] font-bold text-gray-700 mb-2">
                  Current email
                </label>
                <div className="bg-[#F4F5F7] border border-gray-200 rounded-none p-3 text-[13px] text-gray-700">
                  Your email:{" "}
                  <span className="font-bold text-black">{profile.email}</span>
                </div>
              </div>

              <div className="bg-[#FFF8E6] border border-[#FFAB00] rounded-none p-4 flex gap-3">
                <AlertTriangle
                  size={18}
                  className="text-[#FFAB00] shrink-0 mt-0.5"
                />
                <div>
                  <div className="text-[13px] font-bold text-[#172B4D] mb-1">
                    Connected account
                  </div>
                  <div className="text-[13px] text-gray-700 leading-relaxed">
                    Your account is connected to Google. Changing your email
                    will disconnect this Google account.
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-bold text-gray-700 mb-2">
                  New email address
                </label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full border border-gray-300 rounded-none px-3 py-2 text-[13px] focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button className="bg-[#0052CC] hover:bg-[#0047B3] text-white rounded-none px-4 py-2 text-[13px] font-bold transition-colors">
                  Save changes
                </button>
                <button className="border border-gray-300 bg-white hover:bg-gray-50 text-gray-800 rounded-none px-4 py-2 text-[13px] font-bold transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: SECURITY MANAGEMENT */}
          <div className="bg-white border border-gray-200 rounded-none shadow-sm flex flex-col h-full">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-[16px] font-bold">Security</h2>
            </div>
            <div className="p-6 space-y-5 flex-1">
              <div>
                <label className="block text-[13px] font-bold text-gray-700 mb-2">
                  Current password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full border border-gray-300 rounded-none px-3 py-2 text-[13px] focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[13px] font-bold text-gray-700 mb-2">
                  New password
                </label>
                <input
                  type="password"
                  placeholder="At least 8 characters"
                  className="w-full border border-gray-300 rounded-none px-3 py-2 text-[13px] focus:outline-none focus:border-blue-500 transition-colors"
                />
                <p className="text-[11px] text-gray-500 mt-2 italic">
                  Use uppercase letters, numbers, and special characters for
                  better security.
                </p>
              </div>

              <div>
                <label className="block text-[13px] font-bold text-gray-700 mb-2">
                  Confirm new password
                </label>
                <input
                  type="password"
                  placeholder="Re-type new password"
                  className="w-full border border-gray-300 rounded-none px-3 py-2 text-[13px] focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button className="bg-[#0052CC] hover:bg-[#0047B3] text-white rounded-none px-4 py-2 text-[13px] font-bold transition-colors">
                  Update password
                </button>
                <button className="border border-gray-300 bg-white hover:bg-gray-50 text-gray-800 rounded-none px-4 py-2 text-[13px] font-bold transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
