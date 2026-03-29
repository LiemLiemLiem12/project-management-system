"use client";

import { useState, useRef, CSSProperties } from "react";
import { profile as initialProfile, workedOnItems } from "@/store/profileStore";
import type { UserProfile, WorkedOnItem } from "@/store/profileStore";

// ─── Styles ───────────────────────────────────────────────────────────────────
const s: Record<string, CSSProperties> = {
  page:          { minHeight: "100vh", background: "#F3F4F6", fontFamily: "'Plus Jakarta Sans','Segoe UI',sans-serif" },
  breadcrumb:    { padding: "20px 40px 8px", fontSize: 13, color: "#9CA3AF", fontWeight: 500 },
  container:     { maxWidth: 1100, margin: "0 auto", padding: "0 40px 64px" },
  cover:         { position: "relative", height: 180, borderRadius: 12, overflow: "hidden", background: "linear-gradient(135deg,#E8EDF2,#D1DBE6)", cursor: "pointer" },
  coverImg:      { width: "100%", height: "100%", objectFit: "cover" as const },
  coverOverlay:  { position: "absolute", inset: 0, background: "rgba(0,0,0,0.22)", display: "flex", alignItems: "center", justifyContent: "center", transition: "opacity 0.2s" },
  coverBtn:      { background: "rgba(255,255,255,0.92)", borderRadius: 8, padding: "6px 14px", fontSize: 13, fontWeight: 500, color: "#374151", display: "flex", alignItems: "center", gap: 6, border: "none", cursor: "pointer" },
  avatarWrap:    { position: "absolute", bottom: -48, left: 32 },
  avatar:        { width: 96, height: 96, borderRadius: "50%", border: "4px solid white", background: "#1B2A4A", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 28, fontWeight: 700, overflow: "hidden", cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.15)", position: "relative" },
  avatarOverlay: { position: "absolute", inset: 0, background: "rgba(0,0,0,0.3)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", transition: "opacity 0.2s" },
  body:          { display: "flex", gap: 40, marginTop: 16, alignItems: "flex-start" },
  sidebar:       { width: 280, flexShrink: 0 },
  main:          { flex: 1, minWidth: 0 },
  nameInput:     { fontSize: 22, fontWeight: 700, color: "#111827", background: "transparent", border: "none", borderBottom: "2px solid transparent", outline: "none", width: "100%", paddingBottom: 2, fontFamily: "inherit", transition: "border-color 0.15s", marginBottom: 16, display: "block" },
  manageBtn:     { width: "100%", fontSize: 13, fontWeight: 500, color: "#374151", border: "1px solid #E5E7EB", borderRadius: 8, padding: "8px 16px", background: "white", cursor: "pointer", marginBottom: 24, transition: "background 0.15s" },
  aboutTitle:    { fontSize: 15, fontWeight: 600, color: "#111827", marginBottom: 12 },
  aboutCard:     { background: "white", border: "1px solid #F3F4F6", borderRadius: 12, padding: "4px 16px" },
  aboutRow:      { display: "flex", alignItems: "center", gap: 12, padding: "11px 0", borderBottom: "1px solid #F9FAFB" },
  aboutRowLast:  { display: "flex", alignItems: "center", gap: 12, padding: "11px 0" },
  aboutInput:    { flex: 1, fontSize: 13, color: "#374151", background: "transparent", border: "none", borderBottom: "1px solid transparent", outline: "none", fontFamily: "inherit", transition: "border-color 0.15s", paddingBottom: 1 },
  sectionHead:   { display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 },
  sectionTitle:  { fontSize: 15, fontWeight: 600, color: "#111827", marginBottom: 2 },
  sectionSub:    { fontSize: 12, color: "#9CA3AF" },
  viewAllBtn:    { fontSize: 13, color: "#3B82F6", fontWeight: 500, background: "none", border: "none", cursor: "pointer", padding: 0 },
  workedCard:    { background: "white", border: "1px solid #F3F4F6", borderRadius: 12, padding: "4px 16px" },
  workedRow:     { display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 0", borderBottom: "1px solid #F9FAFB", cursor: "pointer" },
  workedRowLast: { display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 0", cursor: "pointer" },
  iconBox:       { width: 36, height: 36, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 },
  workedTitle:   { fontSize: 13, fontWeight: 600, color: "#111827", lineHeight: 1.4 },
  workedSub:     { fontSize: 12, color: "#6B7280", marginTop: 2, lineHeight: 1.4 },
  footerBtn:     { padding: "12px 0 4px", fontSize: 13, color: "#6B7280", fontWeight: 500, background: "none", border: "none", cursor: "pointer", display: "block" },
};

// ─── Icons ────────────────────────────────────────────────────────────────────
const IC = "#9CA3AF";
const IconJob  = () => <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><rect x="2" y="5" width="12" height="9" rx="1.5" stroke={IC} strokeWidth="1.2"/><path d="M5 5V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1" stroke={IC} strokeWidth="1.2"/><path d="M2 9h12" stroke={IC} strokeWidth="1.2"/></svg>;
const IconDept = () => <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><rect x="6" y="1" width="4" height="3" rx="0.8" stroke={IC} strokeWidth="1.2"/><rect x="1" y="12" width="4" height="3" rx="0.8" stroke={IC} strokeWidth="1.2"/><rect x="6" y="12" width="4" height="3" rx="0.8" stroke={IC} strokeWidth="1.2"/><rect x="11" y="12" width="4" height="3" rx="0.8" stroke={IC} strokeWidth="1.2"/><path d="M8 4v3M3 12V9H13v3" stroke={IC} strokeWidth="1.2" strokeLinecap="round"/></svg>;
const IconOrg  = () => <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><rect x="1" y="4" width="14" height="10" rx="1.5" stroke={IC} strokeWidth="1.2"/><path d="M5 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1" stroke={IC} strokeWidth="1.2"/><path d="M5 9h6M5 12h4" stroke={IC} strokeWidth="1.2" strokeLinecap="round"/></svg>;
const IconLoc  = () => <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M8 1.5A4.5 4.5 0 0 1 12.5 6c0 3-4.5 8.5-4.5 8.5S3.5 9 3.5 6A4.5 4.5 0 0 1 8 1.5z" stroke={IC} strokeWidth="1.2"/><circle cx="8" cy="6" r="1.5" stroke={IC} strokeWidth="1.2"/></svg>;
const IconCam  = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" stroke="white" strokeWidth="1.5"/><path d="M3 9a2 2 0 0 1 2-2h.5l1-2h7l1 2H19a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z" stroke="white" strokeWidth="1.5"/></svg>;

function WorkedIcon({ type, color }: { type: WorkedOnItem["icon"]; color: string }) {
  const icons: Record<WorkedOnItem["icon"], React.ReactNode> = {
    bolt:     <svg width="17" height="17" viewBox="0 0 20 20" fill="none"><path d="M11 2L4 11h7l-2 7 9-10h-7l2-6z" stroke={color} strokeWidth="1.4" strokeLinejoin="round"/></svg>,
    document: <svg width="17" height="17" viewBox="0 0 20 20" fill="none"><path d="M4 3h8l4 4v11H4V3z" stroke={color} strokeWidth="1.4" strokeLinejoin="round"/><path d="M12 3v4h4M7 10h6M7 13h4" stroke={color} strokeWidth="1.4" strokeLinecap="round"/></svg>,
    code:     <svg width="17" height="17" viewBox="0 0 20 20" fill="none"><path d="M7 6l-4 4 4 4M13 6l4 4-4 4M11 4l-2 12" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    star:     <svg width="17" height="17" viewBox="0 0 20 20" fill="none"><path d="M10 2l2.4 5 5.6.5-4 3.8 1.2 5.5L10 14l-5.2 2.8 1.2-5.5L2 7.5l5.6-.5L10 2z" stroke={color} strokeWidth="1.4" strokeLinejoin="round"/></svg>,
  };
  return <div style={{ ...s.iconBox, background: `${color}18` }}>{icons[type]}</div>;
}

// ─── About fields config ──────────────────────────────────────────────────────
const aboutFields: { icon: React.ReactNode; key: keyof UserProfile; placeholder: string }[] = [
  { icon: <IconJob />,  key: "jobTitle",     placeholder: "Your job title" },
  { icon: <IconDept />, key: "department",   placeholder: "Your department" },
  { icon: <IconOrg />,  key: "organization", placeholder: "Your organization" },
  { icon: <IconLoc />,  key: "location",     placeholder: "Your location" },
];

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile>(initialProfile);
  const [coverHover, setCoverHover] = useState(false);
  const [avatarHover, setAvatarHover] = useState(false);
  const avatarRef = useRef<HTMLInputElement>(null);
  const coverRef  = useRef<HTMLInputElement>(null);

  const update = (patch: Partial<UserProfile>) => setProfile(p => ({ ...p, ...patch }));

  const initials = profile.name
    .split(" ").filter(Boolean).map(w => w[0]).join("").toUpperCase().slice(0, 2) || "?";

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>, cb: (u: string) => void) => {
    const file = e.target.files?.[0];
    if (file) cb(URL.createObjectURL(file));
    e.target.value = "";
  };

  return (
    <div style={s.page}>
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      <div style={s.breadcrumb}>People</div>

      <div style={s.container}>
        {/* ── Cover + Avatar ── */}
        <div style={{ position: "relative", marginBottom: 60 }}>
          <div
            style={s.cover}
            onClick={() => coverRef.current?.click()}
            onMouseEnter={() => setCoverHover(true)}
            onMouseLeave={() => setCoverHover(false)}
          >
            {profile.coverUrl && <img src={profile.coverUrl} alt="" style={s.coverImg} />}
            <div style={{ ...s.coverOverlay, opacity: coverHover ? 1 : 0 }}>
              <button style={s.coverBtn}>
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M1 12l4-4 3 3 3-4 4 5H1z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/><circle cx="5" cy="5" r="1.5" stroke="currentColor" strokeWidth="1.2"/></svg>
                Change cover
              </button>
            </div>
            <input ref={coverRef} type="file" accept="image/*" style={{ display: "none" }}
              onChange={e => handleFile(e, url => update({ coverUrl: url }))} />
          </div>

          <div style={s.avatarWrap}>
            <div
              style={s.avatar}
              onMouseEnter={() => setAvatarHover(true)}
              onMouseLeave={() => setAvatarHover(false)}
              onClick={() => avatarRef.current?.click()}
            >
              {profile.avatarUrl
                ? <img src={profile.avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : <span>{initials}</span>}
              <div style={{ ...s.avatarOverlay, opacity: avatarHover ? 1 : 0 }}>
                <IconCam />
              </div>
            </div>
            <input ref={avatarRef} type="file" accept="image/*" style={{ display: "none" }}
              onChange={e => handleFile(e, url => update({ avatarUrl: url }))} />
          </div>
        </div>

        {/* ── Body ── */}
        <div style={s.body}>
          {/* Sidebar */}
          <div style={s.sidebar}>
            <input
              style={s.nameInput}
              value={profile.name}
              onChange={e => update({ name: e.target.value })}
              placeholder="Your name"
              onFocus={e => (e.target.style.borderBottomColor = "#60A5FA")}
              onBlur={e  => (e.target.style.borderBottomColor = "transparent")}
            />

            <button
              style={s.manageBtn}
              onMouseEnter={e => ((e.currentTarget).style.background = "#F9FAFB")}
              onMouseLeave={e => ((e.currentTarget).style.background = "white")}
            >
              Manage your account
            </button>

            <div style={s.aboutTitle}>About</div>
            <div style={s.aboutCard}>
              {aboutFields.map(({ icon, key, placeholder }, i, arr) => (
                <div key={key} style={i < arr.length - 1 ? s.aboutRow : s.aboutRowLast}>
                  <span style={{ flexShrink: 0, display: "flex" }}>{icon}</span>
                  <input
                    style={s.aboutInput}
                    value={String(profile[key] ?? "")}
                    onChange={e => update({ [key]: e.target.value })}
                    placeholder={placeholder}
                    onFocus={e => (e.target.style.borderBottomColor = "#60A5FA")}
                    onBlur={e  => (e.target.style.borderBottomColor = "transparent")}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Worked on */}
          <div style={s.main}>
            <div style={s.sectionHead}>
              <div>
                <div style={s.sectionTitle}>Worked on</div>
                <div style={s.sectionSub}>Others will only see what they can access.</div>
              </div>
              <button style={s.viewAllBtn}>View all</button>
            </div>

            <div style={s.workedCard}>
              {workedOnItems.map((item, i) => (
                <div
                  key={item.id}
                  style={i < workedOnItems.length - 1 ? s.workedRow : s.workedRowLast}
                  onMouseEnter={e => (e.currentTarget.style.background = "#F9FAFB")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  <WorkedIcon type={item.icon} color={item.iconColor} />
                  <div style={{ minWidth: 0 }}>
                    <div style={s.workedTitle}>{item.title}</div>
                    <div style={s.workedSub}>
                      <span style={{ fontWeight: 500, color: "#374151" }}>{item.project}</span>
                      {" · "}{item.collaborators}
                    </div>
                  </div>
                </div>
              ))}
              <button style={s.footerBtn}>View all</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
