import { useState, useEffect, useRef } from "react";
import { useStore } from "@/lib/store";
import { useMobileStore } from "@/lib/mobileStore";
import { toast } from "sonner";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { checkLoginRateLimit, recordLoginFailure, clearLoginFailures } from "@/lib/store";
import { readSheet } from "@/lib/googleSheets";
import type { Staff } from "@/lib/store";

const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Fast staff-only refresh from Google Sheets.
 * Only reads the Finance_Staff sheet instead of all 5 sheets,
 * making login ~5x faster on new/other devices.
 */
async function refreshStaffFromSheets(): Promise<Staff[]> {
  const sheetsUrl = useStore.getState().sheetsConfig.url || useMobileStore.getState().sheetsConfig.url || "";
  if (!sheetsUrl) return [];
  try {
    const staffRows = await readSheet(sheetsUrl, "Finance_Staff");
    if (staffRows.length > 0) {
      const mappedStaff: Staff[] = staffRows
        .filter((r: any) => (r.name && String(r.name).trim()) || (r.email && String(r.email).trim()))
        .map((r: any) => ({
          id: String(r.id || ""),
          name: String(r.name || ""),
          email: String(r.email || ""),
          role: String(r.role || "Staff"),
          status: (r.status || "Active") as "Active" | "Inactive",
          access: (r.access || "Both") as "Finance" | "Mobiles" | "Both",
          password: r.password ? String(r.password) : undefined,
          passwordHash: r.passwordHash ? String(r.passwordHash) : undefined,
          passwordSalt: r.passwordSalt ? String(r.passwordSalt) : undefined,
        }));
      if (mappedStaff.length > 0) {
        useStore.setState({ staff: mappedStaff });
        return mappedStaff;
      }
    }
  } catch (err) {
    console.warn("[Login] Failed to refresh staff from sheets:", err);
  }
  return [];
}

/** Escape special HTML characters to prevent XSS in any dynamic HTML */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function LoginPage() {
  const login = useStore((s) => s.login);
  const loginWithPassword = useStore((s) => s.loginWithPassword);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [step, setStep] = useState<"email" | "otp">("email");
  const [otpVal, setOtpVal] = useState("");
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);

  // OTP is stored in a ref (not state) so it's NOT visible in React DevTools
  const sentOtpRef = useRef<string>("");
  const otpExpiryRef = useRef<number>(0);
  const [otpExpired, setOtpExpired] = useState(false);

  // Countdown timer for resend & expiry
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  // OTP expiry watcher
  useEffect(() => {
    if (step !== "otp") return;
    const check = setInterval(() => {
      if (otpExpiryRef.current && Date.now() > otpExpiryRef.current) {
        setOtpExpired(true);
        clearInterval(check);
      }
    }, 5000);
    return () => clearInterval(check);
  }, [step]);

  /** Generate a cryptographically random 6-digit OTP (not Math.random) */
  function generateOtp(): string {
    const arr = new Uint32Array(1);
    crypto.getRandomValues(arr);
    return String(100000 + (arr[0] % 900000));
  }

  // Send verification code
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    // Check rate limit
    const rateCheck = checkLoginRateLimit(cleanEmail);
    if (!rateCheck.allowed) {
      const mins = Math.ceil((rateCheck.secondsLeft ?? 0) / 60);
      toast.error(`Account temporarily locked. Try again in ${mins} minute(s).`);
      return;
    }

    setLoading(true);

    const sheetsUrl = useStore.getState().sheetsConfig.url || useMobileStore.getState().sheetsConfig.url || "";
    let staffList = useStore.getState().staff;
    const cleanPass = password.trim();

    if (cleanPass) {
      // Password-based login: try local staff cache first for instant sign-in.
      let success = await loginWithPassword(cleanEmail, cleanPass);

      // If not matched locally, fast-refresh ONLY the Staff sheet and retry.
      // This is much faster than loadFromSheets() which fetches all 5 sheets.
      if (!success && sheetsUrl) {
        try {
          await refreshStaffFromSheets();
          success = await loginWithPassword(cleanEmail, cleanPass);
        } catch (err) {
          console.warn("Failed to refresh staff from sheets on login attempt:", err);
        }
      }

      if (success) {
        toast.success("Signed in successfully", {
          description: "Welcome to the Jain Finance & Mobiles Hub",
        });
        // Background refresh all sheets data without blocking UI
        if (sheetsUrl) {
          useStore.getState().loadFromSheets().catch(() => {});
        }
      } else {
        recordLoginFailure(cleanEmail);
        toast.error("Invalid password or email address");
      }
      setLoading(false);
      return;
    }

    // OTP flow — check local staff first
    let exists = staffList.find(
      (s) => s.email.toLowerCase() === cleanEmail && s.status === "Active"
    );

    // If not found locally, fast-refresh ONLY the Staff sheet (not all 5)
    if (!exists && sheetsUrl) {
      try {
        const freshStaff = await refreshStaffFromSheets();
        if (freshStaff.length > 0) {
          staffList = freshStaff;
        } else {
          staffList = useStore.getState().staff;
        }
        exists = staffList.find(
          (s) => s.email.toLowerCase() === cleanEmail && s.status === "Active"
        );
      } catch (err) {
        console.warn("Failed to refresh staff from sheets on login attempt:", err);
      }
    }

    if (!exists) {
      recordLoginFailure(cleanEmail);
      toast.error("This email address is not registered or active");
      setLoading(false);
      return;
    }

    // Generate OTP using crypto API and store in ref (not state)
    const code = generateOtp();
    sentOtpRef.current = code;
    otpExpiryRef.current = Date.now() + OTP_EXPIRY_MS;
    setOtpExpired(false);

    // Try sending email via Apps Script
    let emailSent = false;

    if (sheetsUrl) {
      try {
        const response = await fetch(
          `${sheetsUrl}?action=sendOtp&email=${encodeURIComponent(cleanEmail)}&otp=${code}&system=${encodeURIComponent("Jain Finance & Mobiles Hub")}`,
          { method: "GET", redirect: "follow" }
        );
        if (response.ok) {
          const result = await response.json();
          if (result.status === "ok") {
            emailSent = true;
          } else {
            console.warn("Apps Script OTP send warning:", result.error);
          }
        }
      } catch (err) {
        console.error("Failed to send OTP via Apps Script:", err);
      }
    }

    setStep("otp");
    setLoading(false);
    setTimer(30);

    if (emailSent) {
      toast.success(`OTP code sent to ${escapeHtml(cleanEmail)}`, {
        description: `We've sent a 6-digit code to your email. It expires in 5 minutes.`,
        duration: 12000,
      });
    } else {
      toast.info(`OTP fallback — no mail server configured`, {
        description: `Check your registered email or contact admin. (Dev: check console)`,
        duration: 15000,
      });
      // Only log to console in dev
      if (import.meta.env.DEV) {
        console.info("[DEV ONLY] OTP:", code);
      }
    }
  };

  // Resend code
  const handleResend = async () => {
    if (timer > 0) return;
    const rateCheck = checkLoginRateLimit(email.trim().toLowerCase());
    if (!rateCheck.allowed) {
      const mins = Math.ceil((rateCheck.secondsLeft ?? 0) / 60);
      toast.error(`Too many attempts. Try again in ${mins} minute(s).`);
      return;
    }

    const code = generateOtp();
    sentOtpRef.current = code;
    otpExpiryRef.current = Date.now() + OTP_EXPIRY_MS;
    setOtpExpired(false);
    setTimer(30);

    const activeUrl = useStore.getState().sheetsConfig.url || useMobileStore.getState().sheetsConfig.url || "";
    let emailSent = false;

    if (activeUrl) {
      try {
        const response = await fetch(
          `${activeUrl}?action=sendOtp&email=${encodeURIComponent(email.trim())}&otp=${code}&system=${encodeURIComponent("Jain Finance & Mobiles Hub")}`,
          { method: "GET", redirect: "follow" }
        );
        if (response.ok) {
          const result = await response.json();
          if (result.status === "ok") {
            emailSent = true;
          }
        }
      } catch (err) {
        console.error("Failed to resend OTP via Apps Script:", err);
      }
    }

    if (emailSent) {
      toast.success("New OTP code sent to your email", {
        description: `Please check your inbox. Expires in 5 minutes.`,
        duration: 12000,
      });
    } else {
      toast.info("OTP resent (fallback)", {
        description: "Check your email or contact admin.",
        duration: 15000,
      });
      if (import.meta.env.DEV) {
        console.info("[DEV ONLY] Resent OTP:", code);
      }
    }
  };

  // Verify code and log in
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();

    // Check OTP expiry
    if (otpExpired || Date.now() > otpExpiryRef.current) {
      toast.error("OTP Expired", {
        description: "Your verification code has expired. Please request a new one.",
      });
      sentOtpRef.current = "";
      setOtpVal("");
      return;
    }

    if (otpVal.length < 6) {
      toast.error("Please enter the complete 6-digit code");
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    const rateCheck = checkLoginRateLimit(cleanEmail);
    if (!rateCheck.allowed) {
      const mins = Math.ceil((rateCheck.secondsLeft ?? 0) / 60);
      toast.error(`Too many attempts. Try again in ${mins} minute(s).`);
      return;
    }

    setLoading(true);
    setTimeout(() => {
      // Note: 200ms delay provides brief visual feedback via spinner
      if (otpVal === sentOtpRef.current) {
        // Invalidate OTP after use (one-time use)
        sentOtpRef.current = "";
        otpExpiryRef.current = 0;
        clearLoginFailures(cleanEmail);

        const success = login(cleanEmail);
        if (success) {
          toast.success("Signed in successfully", {
            description: "Welcome to the Jain Finance & Mobiles Hub",
          });
        } else {
          toast.error("Access Denied", {
            description: "This email is not registered as an active staff member.",
          });
          setStep("email");
          setOtpVal("");
        }
      } else {
        recordLoginFailure(cleanEmail);
        const after = checkLoginRateLimit(cleanEmail);
        if (!after.allowed) {
          toast.error("Too many failed attempts. Account locked for 5 minutes.");
          setStep("email");
          setOtpVal("");
        } else {
          toast.error("Invalid Code", {
            description: "The verification code is incorrect. Please try again.",
          });
          setOtpVal("");
        }
      }
      setLoading(false);
    }, 200);
  };

  return (
    <div className="min-h-screen w-full flex items-start sm:items-center justify-center bg-[#f0f4f8] text-slate-800 font-sans sm:p-4 relative">
      {/* Centered card container — full-width on mobile, max-w card on sm+ */}
      <div className="w-full sm:max-w-[420px] bg-white sm:rounded-2xl p-6 sm:p-8 md:p-10 shadow-none sm:shadow-[0_8px_30px_rgb(0,0,0,0.03)] border-0 sm:border sm:border-slate-100/80 flex flex-col text-center min-h-screen sm:min-h-0">
        
        {/* Standalone Logo — clean, prominent without outer circle */}
        <div className="flex justify-center mb-6 mt-8 sm:mt-0">
          <img src="/logo.png" alt="Jain Mobile Logo" className="h-28 sm:h-32 w-auto object-contain drop-shadow-md hover:scale-105 transition-transform duration-300" />
        </div>

        {/* Portal Headers */}
        <div className="mb-6">
          <h1 className="text-xl font-bold tracking-tight text-slate-800 uppercase">Jain Mobile &amp; Finance</h1>
          <p className="text-[12px] font-medium text-slate-500 mt-1">Management Portal · Secure Sign In</p>
        </div>

        {step === "email" ? (
          <form onSubmit={handleSendOtp} className="text-left space-y-4" autoComplete="off">
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#3b82f6] transition-all"
                required
                disabled={loading}
                autoComplete="email"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="pass" className="block text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                Password (or leave blank for OTP)
              </label>
              <input
                id="pass"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#3b82f6] transition-all"
                disabled={loading}
                autoComplete="current-password"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-semibold rounded-lg flex items-center justify-center gap-2 active:scale-[0.99] transition-all cursor-pointer shadow-sm shadow-blue-500/10 disabled:opacity-50"
              >
                {loading ? (
                  <RefreshCw className="size-4 animate-spin" />
                ) : (
                  "Send Verification Code"
                )}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="text-left space-y-5" autoComplete="off">
            {otpExpired && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-3.5 py-2.5 text-sm text-red-700">
                Your verification code has expired. Please{" "}
                <button type="button" className="font-semibold underline" onClick={() => { setStep("email"); setOtpVal(""); }}>
                  go back
                </button>{" "}
                and request a new one.
              </div>
            )}
            <div className="space-y-1.5">
              <label htmlFor="otp" className="block text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                Verification Code
              </label>
              <input
                id="otp"
                type="text"
                inputMode="numeric"
                placeholder="Enter 6-digit OTP"
                maxLength={6}
                value={otpVal}
                onChange={(e) => setOtpVal(e.target.value.replace(/[^0-9]/g, ""))}
                className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3.5 text-sm text-slate-800 placeholder:text-slate-400 tracking-[0.2em] font-semibold text-center focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#3b82f6] transition-all"
                required
                disabled={loading || otpExpired}
                autoComplete="one-time-code"
              />
              <p className="text-[11px] text-slate-400">Code expires in 5 minutes</p>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400">
              <button
                type="button"
                onClick={() => {
                  setStep("email");
                  setOtpVal("");
                  sentOtpRef.current = "";
                }}
                className="inline-flex items-center gap-1 hover:text-slate-600 transition-colors"
              >
                <ArrowLeft className="size-3" /> Change Email
              </button>
              {timer > 0 ? (
                <span>Resend in {timer}s</span>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  className="text-blue-600 font-semibold hover:underline"
                >
                  Resend Code
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || otpExpired}
              className="w-full h-11 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-semibold rounded-lg flex items-center justify-center gap-2 active:scale-[0.99] transition-all cursor-pointer shadow-sm shadow-blue-500/10 disabled:opacity-50"
            >
              {loading ? (
                <RefreshCw className="size-4 animate-spin" />
              ) : (
                "Sign in"
              )}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
