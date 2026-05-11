"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";

function AcceptInviteContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState("Processing invitation...");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage(
        "Invitation token not found. Please check the link in your email.",
      );
      return;
    }

    const verifyToken = async () => {
      try {
        // Hàm hỗ trợ lấy cookie theo tên (accessToken)
        const getCookie = (name: string) => {
          const value = `; ${document.cookie}`;
          const parts = value.split(`; ${name}=`);
          if (parts.length === 2) return parts.pop()?.split(";").shift();
        };

        const cookieToken = getCookie("accessToken");

        // Gọi API đến Gateway (Port 4000)
        const res = await fetch(
          `http://localhost:4000/api/project/accept-invite?token=${token}`,
          {
            method: "GET",
            // Rất quan trọng: Cho phép gửi kèm Cookie tự động
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
              // Gửi kèm Header Authorization nếu lấy được token từ JS
              ...(cookieToken
                ? { Authorization: `Bearer ${cookieToken}` }
                : {}),
            },
          },
        );

        // Nếu Backend trả về 401 (Chưa đăng nhập hoặc Session expired)
        if (res.status === 401) {
          setStatus("error");
          setMessage("Your session has expired. Redirecting to login...");
          setTimeout(() => {
            // Chuyển hướng sang trang login và ghi nhớ link quay lại
            router.push(`/login?redirect=/accept-invite?token=${token}`);
          }, 1500);
          return;
        }

        const data = await res.json();

        if (res.ok) {
          setStatus("success");
          setMessage("You have successfully joined the project!");

          // Đợi 2 giây rồi chuyển về dashboard
          setTimeout(() => {
            router.push("/for-you");
          }, 2000);
        } else {
          setStatus("error");
          setMessage(
            data.message || "The invitation is invalid or has expired.",
          );
        }
      } catch (error) {
        setStatus("error");
        setMessage("Unable to connect to the server. Please try again later.");
      }
    };

    verifyToken();
  }, [token, router]);

  return (
    <div className="w-full max-w-md p-10 bg-white rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-gray-100 text-center">
      {/* Header (Popket Branding) */}
      <div className="border-b border-gray-100 pb-5 mb-8">
        <h1 className="text-2xl font-extrabold text-[#1e3a8a] tracking-tight">
          Popket
        </h1>
      </div>

      {/* Main Content Area */}
      <div className="min-h-[150px] flex flex-col justify-center">
        {/* LOADING STATE */}
        {status === "loading" && (
          <div className="animate-fade-in text-center">
            <div className="h-10 w-10 border-4 border-[#1e3a8a]/20 border-t-[#1e3a8a] rounded-full animate-spin mx-auto mb-5"></div>
            <h2 className="text-lg font-semibold text-gray-800">{message}</h2>
            <p className="text-sm text-gray-500 mt-2">
              Please wait a moment...
            </p>
          </div>
        )}

        {/* SUCCESS STATE */}
        {status === "success" && (
          <div className="animate-fade-in text-center">
            <div className="h-16 w-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-5">
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Awesome!</h2>
            <p className="text-sm text-gray-600">{message}</p>
            <p className="text-xs text-gray-400 mt-5 animate-pulse">
              Redirecting to your project...
            </p>
          </div>
        )}

        {/* ERROR STATE */}
        {status === "error" && (
          <div className="animate-fade-in text-center">
            <div className="h-16 w-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-5">
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Oops!</h2>
            <p className="text-sm text-gray-600 mb-8">{message}</p>
            <button
              onClick={() => router.push("/")}
              className="w-full py-3 px-4 bg-[#1e3a8a] hover:bg-blue-900 text-white font-semibold rounded-md transition-all duration-200 shadow-sm"
            >
              Back to Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Main Page Component with Suspense Boundary
export default function AcceptInvitePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f4f5f7] font-sans px-4">
      <Suspense
        fallback={
          <div className="text-gray-500 flex items-center gap-2">
            <div className="h-4 w-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
            Loading...
          </div>
        }
      >
        <AcceptInviteContent />
      </Suspense>
    </div>
  );
}
