"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import OTPInput from "@/components/Input/OTPInput";

export default function VerifyCodePage() {
  const [code, setCode] = useState("");

  const handleVerify = () => {
    if (code.length < 6) {
      alert("Please enter the full 6-digit code");
      return;
    }
    console.log("Xác thực với mã:", code);
    // Gọi API của bạn ở đây
  };

  return (
    <div className="h-screen flex items-center justify-center px-6 bg-gray-50/50">
      <div className="form-container flex flex-col items-center w-full max-w-[550px] gap-8 bg-white rounded-2xl px-8 md:px-12 py-12 shadow-2xl border border-gray-100">
        {/* Header */}
        <div className="header-group flex flex-col items-center gap-6 text-center">
          <div className="flex items-center gap-2">
            <Image src={"/logo.png"} alt="Popket Logo" width={32} height={32} />
            <span className="text-xl font-medium text-gray-700">Popket</span>
          </div>
          <div className="space-y-3">
            <h1 className="text-3xl md:text-4xl font-extrabold text-dark tracking-tight leading-tight">
              Verify your email
            </h1>
            <p className="text-gray-500 font-medium text-sm">
              Enter the code sent to{" "}
              <span className="text-dark font-bold">
                52300041@student.tdtu.edu.vn
              </span>
            </p>
          </div>
        </div>

        {/* Sử dụng Component OTP đã tách */}
        <OTPInput length={6} onComplete={(value) => setCode(value)} />

        {/* Action Button */}
        <button
          onClick={handleVerify}
          className="w-full cursor-pointer bg-primary hover:bg-primary-dark text-white py-2 rounded-full font-bold text-lg transition-all shadow-lg shadow-blue-100 active:scale-[0.98]"
        >
          Verify
        </button>

        <div className="footer-group">
          <p className="text-gray-500 font-medium flex items-center gap-1 text-sm">
            Don’t receive the email?{" "}
            <button className="text-primary hover:underline font-bold flex items-center gap-1 group">
              Resend email
              <ArrowRight
                size={14}
                className="group-hover:translate-x-1 transition-transform"
              />
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
