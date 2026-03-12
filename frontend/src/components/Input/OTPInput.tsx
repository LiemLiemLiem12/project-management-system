"use client";

import React, { useState, useRef, useEffect } from "react";

interface OTPInputProps {
  length?: number;
  onComplete: (code: string) => void;
}

const OTPInput = ({ length = 6, onComplete }: OTPInputProps) => {
  const [otp, setOtp] = useState<string[]>(new Array(length).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
  ) => {
    const value = e.target.value;
    if (isNaN(Number(value))) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Trả về kết quả qua callback
    const fullCode = newOtp.join("");
    if (fullCode.length === length) onComplete(fullCode);

    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    const data = e.clipboardData.getData("text").slice(0, length);
    if (!/^\d+$/.test(data)) return;

    const pasteData = data.split("");
    const newOtp = [...otp];
    pasteData.forEach((char, index) => {
      if (index < length) newOtp[index] = char;
    });
    setOtp(newOtp);
    onComplete(newOtp.join(""));

    const focusIndex = data.length < length ? data.length : length - 1;
    inputRefs.current[focusIndex]?.focus();
  };

  return (
    <div
      className="flex justify-between w-full gap-1 md:gap-4 py-4"
      onPaste={handlePaste}
    >
      {otp.map((data, index) => (
        <input
          key={index}
          type="text"
          maxLength={1}
          ref={(el) => (inputRefs.current[index] = el)}
          value={data}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          className="size-10 sm:size-14 text-center text-2xl font-bold border-2 border-gray-200 rounded-lg focus:border-primary focus:ring-4 focus:ring-blue-50 outline-none transition-all"
        />
      ))}
    </div>
  );
};

export default OTPInput;
