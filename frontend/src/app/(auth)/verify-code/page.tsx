"use client";

import { useEffect, useState, Suspense } from "react"; // 🚀 Import Suspense
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import OTPInput from "@/components/Input/OTPInput";
import { useRouter, useSearchParams } from "next/navigation";
import IconLoader from "@/components/IconLoader";
import toast from "react-hot-toast";
import { useAuthService } from "@/services/auth.service";

// 1. TÁCH TOÀN BỘ LOGIC VÀO COMPONENT CON
function VerifyCodeForm() {
  const [code, setCode] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userId, setUserId] = useState("");
  const [tokenStr, setTokenStr] = useState("");
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState(120);

  const searchParams = useSearchParams();
  const router = useRouter();

  const type = searchParams.get("type") || "0";
  const token = searchParams.get("token");
  const emailParam = searchParams.get("email");

  const {
    verifyLogin,
    verifyLoginPending,
    verifySignup,
    pendingVerifySignup,
    verifyForgotPasswordOtp,
    pendingVerifyForgotPasswordOtp,
    resendOTP,
    pendingResetOTP,
  } = useAuthService();

  const isPending =
    type === "1"
      ? pendingVerifySignup
      : type === "2"
        ? pendingVerifyForgotPasswordOtp
        : verifyLoginPending;

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }

    if (type === "1" || type === "2") {
      if (!emailParam) {
        toast.error("Invalid session.");
        router.push(type === "1" ? "/signup" : "/login");
        return;
      }
      setUserEmail(decodeURIComponent(emailParam));
      setTokenStr(token);
      setLoading(false);
    } else {
      try {
        const decodedString = atob(token);
        const [id, email] = decodedString.split(":");
        if (id && email) {
          setUserEmail(email);
          setUserId(id);
          setTokenStr(token);
          setLoading(false);
        } else {
          throw new Error("Invalid token format");
        }
      } catch (error) {
        toast.error("Invalid verification link.");
        router.push("/login");
      }
    }
  }, [searchParams, router, type, token, emailParam]);

  const handleVerify = async () => {
    if (code.length < 6) {
      toast.error("Please enter the full 6-digit code");
      return;
    }
    if (isPending) return;

    if (type === "1") {
      await verifySignup({ email: userEmail, otp: code, token: tokenStr });
    } else if (type === "2") {
      await verifyForgotPasswordOtp({
        email: userEmail,
        otp: code,
        token: tokenStr,
      });
    } else {
      await verifyLogin({ userId: userId, otp: code });
    }
  };

  const handleResendOTP = async () => {
    try {
      if (type === "1") {
        await resendOTP({ email: userEmail, type: "1" });
      } else if (type === "2") {
        await resendOTP({ email: userEmail, type: "2" });
      } else {
        await resendOTP({ email: userEmail, type: "0" });
      }
      setCountdown(120);
    } catch (error) {
      console.error(error);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <IconLoader size={48} />
      </div>
    );
  }

  return (
    <div className="form-container flex flex-col items-center w-full max-w-[550px] gap-8 bg-white rounded-2xl px-8 md:px-12 py-12 shadow-2xl border border-gray-100">
      <div className="header-group flex flex-col items-center gap-6 text-center">
        <div className="flex items-center gap-2">
          <Image src={"/logo.png"} alt="Popket Logo" width={32} height={32} />
          <span className="text-xl font-medium text-gray-700">Popket</span>
        </div>
        <div className="space-y-3">
          <h1 className="text-3xl md:text-4xl font-extrabold text-dark tracking-tight leading-tight">
            {type === "1"
              ? "Verify your email"
              : type === "2"
                ? "Reset Password"
                : "Verify login"}
          </h1>
          <p className="text-gray-500 font-medium text-sm">
            Enter the code sent to{" "}
            <span className="text-dark font-bold">
              {userEmail || "your email address"}
            </span>
          </p>
        </div>
      </div>

      <OTPInput length={6} onComplete={(value) => setCode(value)} />

      <button
        onClick={handleVerify}
        disabled={isPending}
        className="w-full cursor-pointer h-12 flex justify-center items-center bg-primary hover:bg-primary-dark text-white py-3 rounded-full font-bold text-lg transition-all shadow-lg shadow-blue-100 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isPending ? <IconLoader size={10} /> : "Verify"}
      </button>

      <div className="footer-group">
        <p className="text-gray-500 font-medium flex items-center gap-1 text-sm">
          Don’t receive the email?{" "}
          {countdown > 0 ? (
            <span className="text-gray-400 font-bold flex items-center gap-1">
              Resend email in {formatTime(countdown)}
            </span>
          ) : pendingResetOTP ? (
            <button
              disabled={true}
              className="text-primary h-10 font-bold flex items-center gap-2 group cursor-not-allowed opacity-70"
            >
              Sending...
              <IconLoader size={12} />
            </button>
          ) : (
            <button
              onClick={handleResendOTP}
              className="text-primary hover:underline font-bold flex items-center gap-1 group cursor-pointer"
            >
              Resend email
              <ArrowRight
                size={14}
                className="group-hover:translate-x-1 transition-transform"
              />
            </button>
          )}
        </p>
      </div>
    </div>
  );
}

// 2. COMPONENT CHÍNH EXPORT DEFAULT BỌC SUSPENSE
export default function VerifyCodePage() {
  return (
    <div className="h-screen flex items-center justify-center px-6 bg-gray-50/50">
      <Suspense
        fallback={
          <div className="h-screen flex justify-center items-center bg-gray-50/50">
            <IconLoader size={48} />
          </div>
        }
      >
        <VerifyCodeForm />
      </Suspense>
    </div>
  );
}
