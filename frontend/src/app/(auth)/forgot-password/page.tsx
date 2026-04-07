"use client";

import ButtonSocial from "@/components/Button/ButtonSocial";
import IconLoader from "@/components/IconLoader";
import TextInput from "@/components/Input/TextInput";
import { useAuthService } from "@/services/auth.service";
import Image from "next/image";
import Link from "next/link";
import { Dispatch, useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState<string>("");

  const { initForgotPassword, pendingInitForgotPassword } = useAuthService();

  const handleReset = async () => {
    await initForgotPassword(email);
  };

  return (
    <div className="h-screen flex items-center justify-center px-6 bg-gray-50/50">
      <div className="form-container flex flex-col items-center w-full max-w-[550px] gap-8 bg-white rounded-2xl px-8 md:px-12 py-12 shadow-2xl border border-gray-100">
        {/* Header Section */}
        <div className="header-group flex flex-col items-center gap-4 text-center">
          <div className="flex items-center gap-2">
            <Image src={"/logo.png"} alt="Popket Logo" width={32} height={32} />
            <span className="text-xl font-medium text-gray-700">Popket</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-dark tracking-tight">
            Forgot your password
          </h1>
          <p className="text-gray-500 font-medium">Use your working email</p>
        </div>

        {/* Signup Form */}
        <div className="w-full space-y-2">
          <label
            htmlFor="email"
            className="text-xs font-bold text-gray-700 ml-1"
          >
            Work email
          </label>
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-grow">
              <TextInput
                id="email"
                value={email}
                type="email"
                onChange={(e) => setEmail(e.target.value)}
                placeholder="youremail@email.com"
                compulsory={false}
              />
            </div>
            {pendingInitForgotPassword ? (
              <button
                disabled={false}
                onClick={handleReset}
                className="bg-gray-300 h-10 flex justify-center items-center cursor-pointer text-white px-8 rounded-2xl font-bold transition-all whitespace-nowrap shadow-lg shadow-blue-100"
              >
                <IconLoader size={5} />
              </button>
            ) : (
              <button
                onClick={handleReset}
                className="bg-primary h-10 hover:bg-primary-dark cursor-pointer text-white px-8 rounded-2xl font-bold transition-all whitespace-nowrap shadow-lg shadow-blue-100"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Footer Link */}
        <div className="footer-group pt-2">
          <p className="text-gray-600 font-medium">
            Already have Popket?{" "}
            <Link
              href="/login"
              className="text-primary hover:underline font-bold"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
