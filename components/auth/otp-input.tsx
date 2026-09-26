"use client";

import React, { useRef } from "react";
import { cn } from "@/lib/utils";

interface OtpInputProps {
  value: string;
  onChange: (otp: string) => void;
  disabled?: boolean;
  length?: number;
  className?: string;
  error?: string;
}

export function OtpInput({
  value = "",
  onChange,
  disabled = false,
  length = 6,
  className,
  error,
}: OtpInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const digits = value.split("");

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!digits[index] && index > 0) {
        // Move focus to previous input
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < length - 1) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    const char = rawVal.replace(/\D/g, "").slice(-1); // Only take last digit

    const newDigits = [...digits];
    // Fill up to length
    while (newDigits.length < length) {
      newDigits.push("");
    }

    if (char) {
      newDigits[index] = char;
      onChange(newDigits.join(""));
      // Advance to next input
      if (index < length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    } else {
      newDigits[index] = "";
      onChange(newDigits.join(""));
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (pasted) {
      onChange(pasted);
      const nextFocus = Math.min(pasted.length, length - 1);
      inputRefs.current[nextFocus]?.focus();
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex justify-between items-center gap-2 max-w-xs mx-auto">
        {Array.from({ length }).map((_, index) => {
          const digit = digits[index] || "";
          return (
            <input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              value={digit}
              disabled={disabled}
              onChange={(e) => handleChange(index, e)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              className={cn(
                "w-11 h-13 text-center text-xl font-semibold rounded-xl border bg-white text-zinc-900 transition-all",
                "focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:border-zinc-950",
                error
                  ? "border-rose-400 focus:ring-rose-500"
                  : "border-zinc-200 hover:border-zinc-300",
                disabled && "opacity-50 cursor-not-allowed bg-zinc-50"
              )}
            />
          );
        })}
      </div>
      {error && (
        <p className="text-center text-xs font-medium text-rose-600 animate-in fade-in-0">
          {error}
        </p>
      )}
    </div>
  );
}
