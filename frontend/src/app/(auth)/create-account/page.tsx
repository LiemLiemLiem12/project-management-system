"use client";

import { useEffect, useState, Suspense } from "react"; // 🚀 Bổ sung import Suspense
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import IconLoader from "@/components/IconLoader";
import TextInput from "@/components/Input/TextInput";
import toast from "react-hot-toast";
import { useAuthService } from "@/services/auth.service";

// 1. TÁCH LOGIC RA COMPONENT CON (Không export default)
function CreateAccountForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [formData, setFormData] = useState({
    verificationToken: "",
    fullName: "",
    username: "",
    birthday: "",
    password: "",
    confirmPassword: "",
  });

  const [isPending, setIsPending] = useState(false);
  const { completeSignup } = useAuthService();

  const token = searchParams.get("token") || "";

  useEffect(() => {
    if (!token) window.location.href = "/";

    setFormData((prev) => ({
      ...prev,
      verificationToken: token,
    }));
  }, [searchParams, token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async () => {
    const { fullName, username, birthday, password, confirmPassword } =
      formData;

    if (!fullName || !username || !birthday || !password || !confirmPassword) {
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

    try {
      const { verificationToken, password, username, fullName, birthday } =
        formData;
      setIsPending(true);
      await completeSignup({
        verificationToken,
        password,
        username,
        fullName,
        birthday,
      });
    } catch (error) {
      toast.error("Failed to create account. Please try again.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="form-container flex flex-col items-center w-full max-w-[550px] gap-8 bg-white rounded-2xl px-8 md:px-12 py-12 shadow-2xl border border-gray-100">
      {/* Header */}
      <div className="header-group flex flex-col items-center gap-4 text-center">
        <div className="flex items-center gap-2">
          <Image src={"/logo.png"} alt="Popket Logo" width={32} height={32} />
          <span className="text-xl font-medium text-gray-700">Popket</span>
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-extrabold text-dark tracking-tight leading-tight">
            Complete your profile
          </h1>
          <p className="text-gray-500 font-medium text-sm">
            Just a few more details to set up your account.
          </p>
        </div>
      </div>

      {/* Form Fields */}
      <div className="w-full space-y-4">
        {/* Fullname */}
        <div className="space-y-1">
          <label
            htmlFor="fullName"
            className="text-xs font-bold text-gray-700 ml-1"
          >
            Full Name <span className="text-red-500">*</span>
          </label>
          <TextInput
            id="fullName"
            type="text"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="e.g. John Doe"
            compulsory={false}
          />
        </div>

        {/* Username & Birthday Row */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="space-y-1 flex-1">
            <label
              htmlFor="username"
              className="text-xs font-bold text-gray-700 ml-1"
            >
              Username <span className="text-red-500">*</span>
            </label>
            <TextInput
              id="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              placeholder="johndoe123"
              compulsory={false}
            />
          </div>
          <div className="space-y-1 flex-1">
            <label
              htmlFor="birthday"
              className="text-xs font-bold text-gray-700 ml-1"
            >
              Birthday <span className="text-red-500">*</span>
            </label>
            <TextInput
              id="birthday"
              type="date"
              value={formData.birthday}
              onChange={handleChange}
              placeholder=""
              compulsory={false}
            />
          </div>
        </div>

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
        disabled={isPending}
        className="w-full cursor-pointer flex justify-center items-center h-12 bg-primary hover:bg-primary-dark text-white py-3 rounded-full font-bold text-lg transition-all shadow-lg shadow-blue-100 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-2"
      >
        {isPending ? <IconLoader size={10} /> : "Create Account"}
      </button>
    </div>
  );
}

export default function CreateAccountPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-10 bg-gray-50/50">
      <Suspense fallback={<IconLoader size={10} />}>
        <CreateAccountForm />
      </Suspense>
    </div>
  );
}
