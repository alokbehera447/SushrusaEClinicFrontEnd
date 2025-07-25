import React, { useState, useEffect } from "react";
import { InputOTP } from "./input-otp";
import { Button } from "./button";

interface OtpVerificationProps {
  phone: string;
  onVerify: (otp: string) => Promise<void>;
  onResend: () => Promise<void>;
  loading?: boolean;
  error?: string | null;
  success?: string | null;
  initialCountdown?: number;
}

export const OtpVerification: React.FC<OtpVerificationProps> = ({
  phone,
  onVerify,
  onResend,
  loading = false,
  error = null,
  success = null,
  initialCountdown = 30,
}) => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [countdown, setCountdown] = useState(initialCountdown);
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  useEffect(() => {
    setLocalError(error || null);
  }, [error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpString = otp.join("");
    if (otpString.length !== 6) {
      setLocalError("Please enter a valid 6-digit OTP");
      return;
    }
    setSubmitting(true);
    setLocalError(null);
    try {
      await onVerify(otpString);
    } catch (err) {
      setLocalError("Invalid OTP. Please try again.");
      setOtp(["", "", "", "", "", ""]);
    }
    setSubmitting(false);
  };

  const handleResend = async () => {
    setCountdown(initialCountdown);
    setLocalError(null);
    setOtp(["", "", "", "", "", ""]);
    await onResend();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="text-center text-sm text-muted-foreground mb-2">
        Enter the 6-digit OTP sent to <span className="font-semibold">{phone}</span>
      </div>
      <div className="flex justify-center">
        <InputOTP
          value={otp.join("")}
          onChange={val => setOtp(val.split(""))}
          maxLength={6}
          inputMode="numeric"
          className={localError ? "border-red-500" : ""}
          autoFocus
          render={({ slots }) => (
            <>
              {slots.map((slot, idx) => (
                <div
                  key={idx}
                  className={
                    "relative flex h-10 w-10 items-center justify-center border-y border-r border-input text-lg transition-all first:rounded-l-md first:border-l last:rounded-r-md" +
                    (slot.isActive ? " z-10 ring-2 ring-ring ring-offset-background" : "") +
                    (localError ? " border-red-500" : "")
                  }
                >
                  {slot.char}
                  {slot.hasFakeCaret && (
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                      <div className="h-4 w-px animate-caret-blink bg-foreground duration-1000" />
                    </div>
                  )}
                </div>
              ))}
            </>
          )}
        />
      </div>
      {localError && (
        <div className="text-red-600 text-sm text-center">{localError}</div>
      )}
      {success && (
        <div className="text-green-600 text-sm text-center">{success}</div>
      )}
      <Button
        type="submit"
        className="w-full flex items-center justify-center"
        disabled={submitting || loading}
      >
        {(submitting || loading) && (
          <svg className="animate-spin h-4 w-4 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
          </svg>
        )}
        Verify OTP
      </Button>
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={handleResend}
        disabled={countdown > 0 || submitting || loading}
      >
        {countdown > 0 ? `Resend OTP in ${countdown}s` : "Resend OTP"}
      </Button>
    </form>
  );
}; 