"use client";

import { useState, useRef, useEffect } from "react";
import { Camera, ArrowLeft, Loader2, KeyRound } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/store/auth.store";
import { useAuthService } from "@/services/auth.service";
import toast from "react-hot-toast";

export default function ProfileSettings() {
  const currentUser = useAuthStore((s: any) => s.user);

  // 🚀 Đã thay đổi hook thành 2 bước OTP
  const {
    updateProfile,
    isUpdatingProfile,
    initChangePassword,
    isInitPassword,
    verifyChangePasswordOtp,
    isVerifyingPassword,
  } = useAuthService();

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    avatarUrl: "",
  });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  // 🚀 STATE LUỒNG OTP
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [sessionToken, setSessionToken] = useState("");

  const avatarRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (currentUser) {
      setProfile({
        name: currentUser.fullName || currentUser.username || "",
        email: currentUser.email || "",
        avatarUrl: currentUser.avatarUrl || "",
      });
    }
  }, [currentUser]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const previewUrl = URL.createObjectURL(file);
      setProfile((p) => ({ ...p, avatarUrl: previewUrl }));
    }
  };

  const handleSaveProfile = async () => {
    if (!profile.name.trim()) return toast.error("Full name cannot be empty");

    try {
      let finalAvatarUrl = profile.avatarUrl;

      if (avatarFile) {
        finalAvatarUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(avatarFile);
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = (error) => reject(error);
        });
      }

      await updateProfile({
        full_name: profile.name.trim(),
        avatar_url:
          finalAvatarUrl !== currentUser?.avatarUrl
            ? finalAvatarUrl
            : undefined,
      });

      setAvatarFile(null);
    } catch (error) {
      console.log("Error updating profile", error);
    }
  };

  // 🚀 BƯỚC 1: KIỂM TRA MẬT KHẨU VÀ YÊU CẦU GỬI OTP
  const handleRequestPasswordChange = async () => {
    if (!passwords.current || !passwords.new || !passwords.confirm) {
      return toast.error("Please fill in all password fields");
    }

    const strongPasswordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!strongPasswordRegex.test(passwords.new)) {
      return toast.error(
        "Password is too weak: Must include uppercase, lowercase, number, and special character",
      );
    }

    if (passwords.new !== passwords.confirm) {
      return toast.error("New passwords do not match!");
    }

    try {
      const res = await initChangePassword({
        current_password: passwords.current,
        new_password: passwords.new,
      });

      // Backend trả về token phiên -> lưu lại và chuyển sang bước OTP
      if (res?.data?.token) {
        setSessionToken(res.data.token);
        setIsOtpStep(true);
      }
    } catch (error) {
      console.log("Error initiating password change", error);
    }
  };

  // 🚀 BƯỚC 2: XÁC NHẬN OTP & HOÀN TẤT ĐỔI MẬT KHẨU
  const handleVerifyOtp = async () => {
    if (!otpCode || otpCode.length < 6) {
      return toast.error("Please enter a valid 6-digit OTP");
    }

    try {
      await verifyChangePasswordOtp({
        otp: otpCode,
        token: sessionToken,
      });

      // Thành công -> Đóng khung, dọn sạch form
      setIsOtpStep(false);
      setOtpCode("");
      setSessionToken("");
      setPasswords({ current: "", new: "", confirm: "" });
    } catch (error) {
      console.log("Error verifying OTP", error);
    }
  };

  const initials = profile.name ? profile.name.charAt(0).toUpperCase() : "U";

  const hasChanges =
    profile.name !== (currentUser?.fullName || currentUser?.username || "") ||
    avatarFile !== null;

  return (
    <div className="min-h-screen bg-white font-sans py-12 text-[#172B4D]">
      <div className="max-w-[640px] mx-auto px-6 flex flex-col gap-10">
        <div>
          <Link
            href="/for-you"
            className="inline-flex items-center gap-2 text-[14px] font-medium text-gray-500 hover:text-[#0052CC] transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Home
          </Link>
        </div>

        <div className="flex items-center gap-8">
          <div
            onClick={() => avatarRef.current?.click()}
            className="w-24 h-24 rounded-full bg-indigo-600 flex items-center justify-center text-white text-4xl font-bold cursor-pointer shrink-0 overflow-hidden relative group shadow-md"
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

          <div className="flex-1 space-y-1">
            <input
              type="text"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className="w-full max-w-sm border-b-2 border-transparent hover:border-gray-200 px-0 py-1 text-[24px] font-bold text-[#172B4D] focus:outline-none focus:border-blue-500 transition-colors bg-transparent"
              title="Click to edit full name"
              placeholder="Your Full Name"
            />
            <div className="text-[14px] text-gray-500 pt-1">
              {profile.email}
            </div>

            {hasChanges && (
              <button
                onClick={handleSaveProfile}
                disabled={isUpdatingProfile}
                className="mt-2 text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1.5 rounded-md transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {isUpdatingProfile ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : null}
                {isUpdatingProfile ? "Saving..." : "Save Changes"}
              </button>
            )}
          </div>
        </div>

        <hr className="border-gray-100" />

        <div className="flex flex-col">
          <h2 className="text-[18px] font-bold text-gray-900 mb-6">Security</h2>

          <div className="space-y-6">
            <div>
              <label className="block text-[13px] font-bold text-gray-700 mb-2">
                Current password
              </label>
              <input
                type="password"
                value={passwords.current}
                onChange={(e) =>
                  setPasswords({ ...passwords, current: e.target.value })
                }
                disabled={isOtpStep}
                placeholder="••••••••"
                className="w-full max-w-md border border-gray-300 rounded-md px-3 py-2.5 text-[13px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors disabled:bg-gray-50 disabled:text-gray-400"
              />
            </div>

            <div>
              <label className="block text-[13px] font-bold text-gray-700 mb-2">
                New password
              </label>
              <input
                type="password"
                value={passwords.new}
                onChange={(e) =>
                  setPasswords({ ...passwords, new: e.target.value })
                }
                disabled={isOtpStep}
                placeholder="At least 8 characters"
                className="w-full max-w-md border border-gray-300 rounded-md px-3 py-2.5 text-[13px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors disabled:bg-gray-50 disabled:text-gray-400"
              />
              <p className="text-[12px] text-gray-500 mt-2 italic">
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
                value={passwords.confirm}
                onChange={(e) =>
                  setPasswords({ ...passwords, confirm: e.target.value })
                }
                disabled={isOtpStep}
                placeholder="Re-type new password"
                className="w-full max-w-md border border-gray-300 rounded-md px-3 py-2.5 text-[13px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors disabled:bg-gray-50 disabled:text-gray-400"
              />
            </div>

            {/* 🚀 KHUNG NHẬP OTP XUẤT HIỆN KHI XONG BƯỚC 1 */}
            {isOtpStep && (
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-md max-w-md animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center gap-2 text-blue-800 font-bold mb-2 text-sm">
                  <KeyRound size={16} /> Enter Verification Code
                </div>
                <p className="text-xs text-blue-700 mb-3">
                  We sent a 6-digit code to{" "}
                  <span className="font-semibold">{profile.email}</span>.
                </p>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="000000"
                  value={otpCode}
                  onChange={(e) =>
                    setOtpCode(e.target.value.replace(/\D/g, ""))
                  } // Chỉ cho nhập số
                  className="w-full border border-blue-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 ring-blue-400 text-center tracking-widest font-mono font-bold text-lg text-gray-800"
                />
              </div>
            )}

            <div className="flex gap-3 pt-6">
              {!isOtpStep ? (
                // 🚀 NÚT BƯỚC 1: GỬI YÊU CẦU ĐỔI PASS
                <button
                  onClick={handleRequestPasswordChange}
                  disabled={isInitPassword || !passwords.new}
                  className="bg-[#0052CC] hover:bg-[#0047B3] text-white rounded-md px-5 py-2.5 text-[13px] font-bold transition-colors shadow-sm flex items-center gap-2 disabled:opacity-70"
                >
                  {isInitPassword ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : null}
                  Update password
                </button>
              ) : (
                // 🚀 NÚT BƯỚC 2: XÁC NHẬN OTP
                <button
                  onClick={handleVerifyOtp}
                  disabled={isVerifyingPassword || otpCode.length < 6}
                  className="bg-green-600 hover:bg-green-700 text-white rounded-md px-5 py-2.5 text-[13px] font-bold transition-colors shadow-sm flex items-center gap-2 disabled:opacity-70"
                >
                  {isVerifyingPassword ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : null}
                  Confirm & Change
                </button>
              )}

              <button
                onClick={() => {
                  setIsOtpStep(false);
                  setOtpCode("");
                  setSessionToken("");
                  setPasswords({ current: "", new: "", confirm: "" });
                }}
                className="border border-gray-300 bg-white hover:bg-gray-50 text-gray-800 rounded-md px-5 py-2.5 text-[13px] font-bold transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
