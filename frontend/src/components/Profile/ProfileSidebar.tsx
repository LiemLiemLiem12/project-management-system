"use client";

import { UserProfile } from "@/store/profileStore";

// ─── Editable field ───────────────────────────────────────────
function AboutField({
  icon,
  value,
  placeholder,
  onChange,
}: {
  icon: React.ReactNode;
  value: string;
  placeholder: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-3 py-2.5 group border-b border-gray-100 last:border-0">
      <span className="text-gray-400 flex-shrink-0">{icon}</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 text-sm text-gray-700 placeholder:text-gray-400 bg-transparent outline-none border-b border-transparent focus:border-blue-400 transition-colors pb-0.5"
      />
    </div>
  );
}

// ─── Icons ────────────────────────────────────────────────────
const icons = {
  job: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="2" y="5" width="12" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M5 5V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M2 9h12" stroke="currentColor" strokeWidth="1.2"/>
    </svg>
  ),
  dept: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="6" y="1" width="4" height="3" rx="0.8" stroke="currentColor" strokeWidth="1.2"/>
      <rect x="1" y="12" width="4" height="3" rx="0.8" stroke="currentColor" strokeWidth="1.2"/>
      <rect x="6" y="12" width="4" height="3" rx="0.8" stroke="currentColor" strokeWidth="1.2"/>
      <rect x="11" y="12" width="4" height="3" rx="0.8" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M8 4v3M3 12V9H13v3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  ),
  org: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="1" y="4" width="14" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M5 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M5 9h6M5 12h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  ),
  loc: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 1.5A4.5 4.5 0 0 1 12.5 6c0 3-4.5 8.5-4.5 8.5S3.5 9 3.5 6A4.5 4.5 0 0 1 8 1.5z" stroke="currentColor" strokeWidth="1.2"/>
      <circle cx="8" cy="6" r="1.5" stroke="currentColor" strokeWidth="1.2"/>
    </svg>
  ),
};

// ─── ProfileSidebar ───────────────────────────────────────────
export default function ProfileSidebar({
  profile,
  onUpdate,
}: {
  profile: UserProfile;
  onUpdate: (patch: Partial<UserProfile>) => void;
}) {
  return (
    <div className="w-full">
      {/* Name */}
      <div className="mb-4 px-1">
        <input
          type="text"
          value={profile.name}
          onChange={(e) => onUpdate({ name: e.target.value })}
          placeholder="Your name"
          className="text-2xl font-bold text-gray-900 bg-transparent outline-none border-b-2 border-transparent focus:border-blue-400 transition-colors w-full pb-0.5"
        />
      </div>

      {/* Manage account button */}
      <button className="w-full text-sm font-medium text-gray-600 border border-gray-200 rounded-lg py-2 px-4 hover:bg-gray-50 hover:border-gray-300 transition-all mb-6">
        Manage your account
      </button>

      {/* About section */}
      <div>
        <h3 className="text-base font-semibold text-gray-900 mb-3">About</h3>
        <div className="bg-white border border-gray-100 rounded-xl px-4 py-1">
          <AboutField
            icon={icons.job}
            value={profile.jobTitle}
            placeholder="Your job title"
            onChange={(v) => onUpdate({ jobTitle: v })}
          />
          <AboutField
            icon={icons.dept}
            value={profile.department}
            placeholder="Your department"
            onChange={(v) => onUpdate({ department: v })}
          />
          <AboutField
            icon={icons.org}
            value={profile.organization}
            placeholder="Your organization"
            onChange={(v) => onUpdate({ organization: v })}
          />
          <AboutField
            icon={icons.loc}
            value={profile.location}
            placeholder="Your location"
            onChange={(v) => onUpdate({ location: v })}
          />
        </div>
      </div>
    </div>
  );
}
