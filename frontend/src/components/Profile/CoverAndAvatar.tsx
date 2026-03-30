"use client";

import { useRef } from "react";
import { UserProfile } from "@/store/profileStore";

export default function CoverAndAvatar({
  profile,
  onAvatarChange,
  onCoverChange,
}: {
  profile: UserProfile;
  onAvatarChange: (url: string) => void;
  onCoverChange: (url: string) => void;
}) {
  const avatarRef = useRef<HTMLInputElement>(null);
  const coverRef = useRef<HTMLInputElement>(null);

  const handleFile = (
    e: React.ChangeEvent<HTMLInputElement>,
    cb: (url: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    cb(url);
  };

  return (
    <div className="relative mb-16">
      {/* Cover */}
      <div
        className="relative h-40 sm:h-52 rounded-xl overflow-hidden cursor-pointer group"
        style={{ background: "linear-gradient(135deg, #e8edf2 0%, #d1dbe6 100%)" }}
        onClick={() => coverRef.current?.click()}
      >
        {profile.coverUrl && (
          <img src={profile.coverUrl} alt="cover" className="w-full h-full object-cover" />
        )}
        {/* Cover hover overlay */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="bg-white/90 rounded-lg px-3 py-1.5 flex items-center gap-2 text-sm font-medium text-gray-700">
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
              <path d="M1 12l4-4 3 3 3-4 4 5H1z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
              <circle cx="5" cy="5" r="1.5" stroke="currentColor" strokeWidth="1.2"/>
            </svg>
            Change cover
          </div>
        </div>
        <input ref={coverRef} type="file" accept="image/*" className="hidden"
          onChange={(e) => handleFile(e, onCoverChange)} />
      </div>

      {/* Avatar — overlaps cover */}
      <div className="absolute -bottom-12 left-6 sm:left-10">
        <div className="relative group cursor-pointer" onClick={() => avatarRef.current?.click()}>
          <div
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-white overflow-hidden flex items-center justify-center text-white text-3xl font-bold shadow-md"
            style={{ background: "#1B2A4A" }}
          >
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <span>{profile.initials}</span>
            )}
          </div>
          {/* Avatar hover */}
          <div className="absolute inset-0 rounded-full bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" stroke="white" strokeWidth="1.5"/>
              <path d="M3 9a2 2 0 0 1 2-2h.5l1-2h7l1 2H19a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z" stroke="white" strokeWidth="1.5"/>
            </svg>
          </div>
          <input ref={avatarRef} type="file" accept="image/*" className="hidden"
            onChange={(e) => handleFile(e, onAvatarChange)} />
        </div>
      </div>
    </div>
  );
}
