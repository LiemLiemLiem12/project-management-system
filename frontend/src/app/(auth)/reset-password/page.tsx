"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import IconLoader from "@/components/IconLoader";
import TextInput from "@/components/Input/TextInput";
import toast from "react-hot-toast";
import { useAuthService } from "@/services/auth.service";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [formData, setFormData] = useState({
    verificationToken: "",
    password: "",
    confirmPassword: "",
  });

  const { resetPassword, pendingResetPassword } = useAuthService();

  const token = searchParams.get("token") || "";

  useEffect(() => {
    if (!token) window.location.href = "/";

    setFormData({
      verificationToken: token,
      password: "",
      confirmPassword: "",
    });
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async () => {
    const { password, confirmPassword, verificationToken } = formData;

    if (!password || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    // Thực hiện gọi API
    await resetPassword({
      resetToken: verificationToken,
      newPassword: password,
    });
  };

  return (
    // Dùng min-h-screen và py-10 để màn hình không bị cắt nếu form quá dài trên thiết bị nhỏ
    <div className="min-h-screen flex items-center justify-center px-6 py-10 bg-gray-50/50">
      <div className="form-container flex flex-col items-center w-full max-w-[550px] gap-8 bg-white rounded-2xl px-8 md:px-12 py-12 shadow-2xl border border-gray-100">
        {/* Header */}
        <div className="header-group flex flex-col items-center gap-4 text-center">
          <div className="flex items-center gap-2">
            <Image src={"/logo.png"} alt="Popket Logo" width={32} height={32} />
            <span className="text-xl font-medium text-gray-700">Popket</span>
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-extrabold text-dark tracking-tight leading-tight">
              Reset password
            </h1>
            <p className="text-gray-500 font-medium text-sm">
              Entering your neu password
            </p>
          </div>
        </div>

        {/* Form Fields */}
        <div className="w-full space-y-4">
          {/* Password */}
          <div className="space-y-1">
            <label
              htmlFor="password"
              className="text-xs font-bold text-gray-700 ml-1"
            >
              Password <span className="text-red-500">*</span>
            </label>
            <TextInput
              id="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              compulsory={false}
            />
          </div>

          {/* Confirm Password */}
          <div className="space-y-1">
            <label
              htmlFor="confirmPassword"
              className="text-xs font-bold text-gray-700 ml-1"
            >
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <TextInput
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              compulsory={false}
            />
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleSubmit}
          disabled={pendingResetPassword}
          className="w-full cursor-pointer h-10 flex justify-center items-center bg-primary hover:bg-primary-dark text-white py-3 rounded-full font-bold text-lg transition-all shadow-lg shadow-blue-100 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-2"
        >
          {pendingResetPassword ? <IconLoader size={5} /> : "Reset Password"}
        </button>
      </div>
    </div>
  );
}
