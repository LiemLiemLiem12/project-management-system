"use client";

import ButtonSocial from "@/components/Button/ButtonSocial";
import IconLoader from "@/components/IconLoader";
import TextInput from "@/components/Input/TextInput";
import { useAuthService } from "@/services/auth.service";
import Image from "next/image";
import Link from "next/link";
import { Dispatch, useState } from "react";

export default function SignupPage() {
  const [email, setEmail] = useState<string>("");

  const { initSignup, pendingInitSignup } = useAuthService();

  const handleSignup = async () => {
    await initSignup(email);
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
            Get started with Popket
          </h1>
          <p className="text-gray-500 font-medium">
            From plan to progress — everywhere.
          </p>
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
                compulsory={false} // Label đã tự viết ở trên để tùy chỉnh layout
              />
            </div>
            {pendingInitSignup ? (
              <button
                disabled={false}
                onClick={handleSignup}
                className="bg-gray-300 flex justify-center items-center cursor-pointer text-white px-8 rounded-2xl font-bold transition-all whitespace-nowrap shadow-lg shadow-blue-100"
              >
                <IconLoader size={10} />
              </button>
            ) : (
              <button
                onClick={handleSignup}
                className="bg-primary h-10 hover:bg-primary-dark cursor-pointer text-white px-8 rounded-2xl font-bold transition-all whitespace-nowrap shadow-lg shadow-blue-100"
              >
                Sign up
              </button>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="w-full flex items-center gap-4 py-2">
          <div className="h-[1px] flex-grow bg-gray-200"></div>
          <span className="text-sm font-medium text-gray-400 whitespace-nowrap">
            Or continue with
          </span>
          <div className="h-[1px] flex-grow bg-gray-200"></div>
        </div>

        {/* Social Buttons Row */}
        <div className="grid grid-cols-2 gap-3 w-full">
          <ButtonSocial
            platform="Google"
            alt="Google"
            src="/google-icon.png"
            href="http://localhost:4000/api/auth/google"
          />
          <ButtonSocial
            platform="Facebook"
            alt="Facebook"
            src="/facebook-icon.png"
            href="http://localhost:4000/api/auth/facebook"
          />
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
