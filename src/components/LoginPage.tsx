import { useState, useEffect, useRef } from "react";
import { useStore } from "@/lib/store";
import { useMobileStore } from "@/lib/mobileStore";
import { toast } from "sonner";
import { 
  ArrowLeft, 
  RefreshCw, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  SendHorizontal, 
  Phone, 
  ShieldCheck, 
  Clock, 
  Headphones, 
  KeyRound 
} from "lucide-react";
import { checkLoginRateLimit, recordLoginFailure, clearLoginFailures, seedStaff } from "@/lib/store";
import { readSheet } from "@/lib/googleSheets";
import type { Staff } from "@/lib/store";

const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes — matches Code.gs

/**
 * Ask the Apps Script to issue a verification code.
 *
 * The code is generated and stored server-side; nothing about it comes back in
 * this response. Previously the browser invented the code, passed it to the
 * mailer as ?otp=, and then compared the typed value against its own copy —
 * which meant the code was known to whoever was sitting at the browser before
 * the email had even been sent, so reading the inbox was never actually
 * required to sign in.
 *
 * Returns "server" when the deployment supports server-issued codes,
 * "legacy" when it is still running the pre-fix Code.gs, or "failed".
 */
async function requestOtp(url: string, email: string): Promise<"server" | "legacy" | "failed"> {
  try {
    const response = await fetch(
      `${url}?action=sendOtp&email=${encodeURIComponent(email)}`,
      { method: "GET", redirect: "follow" }
    );
    if (!response.ok) return "failed";
    const result = await response.json();
    if (result.status === "ok" && result.issued) return "server";
    // The old deployment rejects a sendOtp with no ?otp= parameter. Detect that
    // exact answer rather than treating every error as "old script", so a real
    // failure (deactivated staff, rate limit) is still reported as a failure.
    if (typeof result.error === "string" && /missing email or otp/i.test(result.error)) {
      return "legacy";
    }
    console.warn("[Login] OTP request refused:", result.error);
    return "failed";
  } catch (err) {
    console.error("[Login] Failed to request OTP:", err);
    return "failed";
  }
}

/** Send a legacy client-generated code through the old sendOtp signature. */
async function sendLegacyOtp(url: string, email: string, code: string): Promise<boolean> {
  try {
    const response = await fetch(
      `${url}?action=sendOtp&email=${encodeURIComponent(email)}&otp=${encodeURIComponent(code)}&system=${encodeURIComponent("Jain Finance & Mobiles Hub")}`,
      { method: "GET", redirect: "follow" }
    );
    if (!response.ok) return false;
    const result = await response.json();
    return result.status === "ok";
  } catch (err) {
    console.error("[Login] Failed to send legacy OTP:", err);
    return false;
  }
}

/** Ask the Apps Script whether this code is the one it issued. */
async function verifyOtpWithServer(
  url: string,
  email: string,
  otp: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    const response = await fetch(
      `${url}?action=verifyOtp&email=${encodeURIComponent(email)}&otp=${encodeURIComponent(otp)}`,
      { method: "GET", redirect: "follow" }
    );
    if (!response.ok) return { ok: false, error: `Verification failed (HTTP ${response.status})` };
    const result = await response.json();
    if (result.status === "ok" && result.verified) return { ok: true };
    return { ok: false, error: String(result.error || "Incorrect code") };
  } catch (err) {
    return { ok: false, error: (err as Error)?.message || "Could not reach the verification service" };
  }
}

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
        const hasDefaultAdmin = mappedStaff.some((s) => s.email.toLowerCase() === "jainmobile7828@gmail.com");
        const finalStaff = hasDefaultAdmin ? mappedStaff : [seedStaff[0], ...mappedStaff];
        useStore.setState({ staff: finalStaff });
        return finalStaff;
      }
    }
  } catch (err) {
    console.warn("[Login] Failed to refresh staff from sheets:", err);
  }
  return [];
}

export function LoginPage() {
  const login = useStore((s) => s.login);
  const loginWithPassword = useStore((s) => s.loginWithPassword);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [step, setStep] = useState<"email" | "otp">("email");
  const [otpVal, setOtpVal] = useState("");
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);

  // Only ever populated on the legacy path (a deployment still running the
  // pre-fix Code.gs). When the server issues the code, the browser never holds
  // it at all. A ref rather than state so it is not visible in React DevTools.
  const sentOtpRef = useRef<string>("");
  /** True when the deployed Apps Script issued this code and will verify it. */
  const serverIssuedRef = useRef<boolean>(false);
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

    // If not found locally, fast-refresh ONLY the Staff sheet
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

    if (!exists && cleanEmail === "jainmobile7828@gmail.com") {
      exists = seedStaff[0];
    }

    if (!exists) {
      recordLoginFailure(cleanEmail);
      toast.error("This email address is not registered or active");
      setLoading(false);
      return;
    }

    if (!sheetsUrl) {
      toast.error("Cannot send a verification code", {
        description:
          "The Google Sheets backend is not configured on this build, so no code can be issued or checked.",
        duration: 12000,
      });
      setLoading(false);
      return;
    }

    // Ask the server for a code. serverIssuedRef records whether the deployed
    // Apps Script actually took ownership of the code, because that decides
    // which check runs on submit: the server's, or the legacy local one.
    const mode = await requestOtp(sheetsUrl, cleanEmail);

    if (mode === "failed") {
      toast.error("Could not send a verification code", {
        description:
          "The email could not be issued. Check that this address is an Active staff member, then try again in a few minutes.",
        duration: 12000,
      });
      setLoading(false);
      return;
    }

    serverIssuedRef.current = mode === "server";
    sentOtpRef.current = "";
    otpExpiryRef.current = Date.now() + OTP_EXPIRY_MS;
    setOtpExpired(false);

    if (mode === "legacy") {
      // The deployed Code.gs predates server-issued codes. Keep the shop
      // working, but this path cannot actually prove the user read the email —
      // re-deploy google-apps-script/Code.gs to close it.
      console.warn(
        "[Login] The deployed Apps Script still expects a browser-generated OTP. " +
          "Re-deploy google-apps-script/Code.gs so codes are issued and verified server-side."
      );
      const code = generateOtp();
      sentOtpRef.current = code;
      const sent = await sendLegacyOtp(sheetsUrl, cleanEmail, code);
      if (!sent && import.meta.env.DEV) {
        console.info("[DEV ONLY] OTP:", code);
      }
    }

    setStep("otp");
    setLoading(false);
    setTimer(30);

    toast.success(`OTP code sent to ${cleanEmail}`, {
      description: "We've sent a 6-digit code to your email. It expires in 10 minutes.",
      duration: 12000,
    });
  };

  // Resend code
  const handleResend = async () => {
    if (timer > 0) return;
    const cleanEmail = email.trim().toLowerCase();
    const rateCheck = checkLoginRateLimit(cleanEmail);
    if (!rateCheck.allowed) {
      const mins = Math.ceil((rateCheck.secondsLeft ?? 0) / 60);
      toast.error(`Too many attempts. Try again in ${mins} minute(s).`);
      return;
    }

    const activeUrl = useStore.getState().sheetsConfig.url || useMobileStore.getState().sheetsConfig.url || "";
    if (!activeUrl) {
      toast.error("The Google Sheets backend is not configured on this build");
      return;
    }

    setTimer(30);
    const mode = await requestOtp(activeUrl, cleanEmail);

    if (mode === "failed") {
      toast.error("Could not resend the verification code", {
        description: "Try again in a few minutes, or contact your administrator.",
        duration: 12000,
      });
      return;
    }

    serverIssuedRef.current = mode === "server";
    sentOtpRef.current = "";
    otpExpiryRef.current = Date.now() + OTP_EXPIRY_MS;
    setOtpExpired(false);

    if (mode === "legacy") {
      const code = generateOtp();
      sentOtpRef.current = code;
      const sent = await sendLegacyOtp(activeUrl, cleanEmail, code);
      if (!sent && import.meta.env.DEV) {
        console.info("[DEV ONLY] Resent OTP:", code);
      }
    }

    toast.success("New OTP code sent to your email", {
      description: "Please check your inbox. It expires in 10 minutes.",
      duration: 12000,
    });
  };

  // Verify code and log in
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();

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

    // The server holds the code and does the comparison. The browser never sees
    // it, so a correct answer here means the mailbox was actually read.
    let verified = false;
    let failureReason = "The verification code is incorrect. Please try again.";

    if (serverIssuedRef.current) {
      const activeUrl = useStore.getState().sheetsConfig.url || useMobileStore.getState().sheetsConfig.url || "";
      const result = await verifyOtpWithServer(activeUrl, cleanEmail, otpVal);
      verified = result.ok;
      if (!verified && result.error) failureReason = result.error;
    } else {
      // Legacy deployment only — see the note in handleSendOtp.
      verified = !!sentOtpRef.current && otpVal === sentOtpRef.current;
    }

    if (verified) {
      sentOtpRef.current = "";
      otpExpiryRef.current = 0;
      serverIssuedRef.current = false;
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
        toast.error("Invalid Code", { description: failureReason });
        setOtpVal("");
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-between bg-[#060609] text-slate-100 font-sans p-4 sm:p-6 relative overflow-x-hidden selection:bg-[#c5a059]/30 selection:text-white">
      {/* Decorative Gold Wave Vector Background Accent - Top Right */}
      <svg className="absolute top-0 right-0 w-80 sm:w-96 h-80 sm:h-96 opacity-30 pointer-events-none z-0" viewBox="0 0 400 400" fill="none">
        <path d="M400 0C320 80 280 180 400 300M400 50C350 120 320 200 400 350M400 100C380 160 360 220 400 400" stroke="url(#gold-grad-1)" strokeWidth="1" />
        <path d="M400 0C260 120 220 260 400 400" stroke="url(#gold-grad-1)" strokeWidth="1.5" strokeDasharray="3 3" />
        <defs>
          <linearGradient id="gold-grad-1" x1="400" y1="0" x2="200" y2="400" gradientUnits="userSpaceOnUse">
            <stop stopColor="#d4af37" stopOpacity="0.8" />
            <stop offset="1" stopColor="#b8860b" stopOpacity="0.1" />
          </linearGradient>
        </defs>
      </svg>

      {/* Decorative Gold Wave Vector Background Accent - Bottom Left */}
      <svg className="absolute bottom-0 left-0 w-80 sm:w-96 h-80 sm:h-96 opacity-25 pointer-events-none z-0" viewBox="0 0 400 400" fill="none">
        <path d="M0 400C80 320 180 280 300 400M50 400C120 350 200 320 350 400M100 400C160 380 220 360 400 400" stroke="url(#gold-grad-2)" strokeWidth="1" />
        <defs>
          <linearGradient id="gold-grad-2" x1="0" y1="400" x2="400" y2="200" gradientUnits="userSpaceOnUse">
            <stop stopColor="#d4af37" stopOpacity="0.8" />
            <stop offset="1" stopColor="#8b6508" stopOpacity="0.05" />
          </linearGradient>
        </defs>
      </svg>

      {/* Top Spacer */}
      <div className="h-4 sm:h-6" />

      {/* Main Luxury Dark Card Container */}
      <div className="w-full max-w-[440px] bg-[#0c0c12]/95 backdrop-blur-2xl rounded-2xl p-6 sm:p-8 border border-[#2a2419] shadow-[0_12px_50px_rgba(0,0,0,0.9)] flex flex-col text-center relative z-10 my-auto">
        
        {/* Emblem Logo */}
        <div className="flex justify-center mb-4">
          <img 
            src="/logo.png" 
            alt="Jain Mobile Logo" 
            className="h-24 sm:h-28 w-auto object-contain drop-shadow-[0_0_20px_rgba(212,175,55,0.2)] hover:scale-105 transition-transform duration-300" 
          />
        </div>

        {/* Header Text */}
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-wider text-white uppercase">
            JAIN MOBILE <span className="text-[#c5a059] font-normal">&amp;</span> FINANCE
          </h1>
          <p className="text-xs font-medium text-[#8e8e9e] tracking-wide mt-1">
            Management Portal • Secure Sign In
          </p>
        </div>

        {step === "email" ? (
          <form onSubmit={handleSendOtp} className="text-left space-y-4" autoComplete="off">
            {/* EMAIL ADDRESS Field */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-[11px] font-bold tracking-widest text-[#c5a059] uppercase">
                EMAIL ADDRESS
              </label>
              <div className="flex items-center gap-2.5">
                <div className="size-10 rounded-full bg-[#181510] border border-[#2d2518] flex items-center justify-center text-[#d4af37] shrink-0">
                  <Mail className="size-4" />
                </div>
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 flex-1 rounded-xl border border-[#262016] bg-[#08080c] px-3.5 text-sm text-white placeholder:text-[#4a4a58] focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]/30 transition-all"
                  required
                  disabled={loading}
                  autoComplete="email"
                />
              </div>
            </div>

            {/* PASSWORD Field */}
            <div className="space-y-1.5">
              <label htmlFor="pass" className="block text-[11px] font-bold tracking-widest text-[#c5a059] uppercase">
                PASSWORD (OR LEAVE BLANK FOR OTP)
              </label>
              <div className="flex items-center gap-2.5">
                <div className="size-10 rounded-full bg-[#181510] border border-[#2d2518] flex items-center justify-center text-[#d4af37] shrink-0">
                  <Lock className="size-4" />
                </div>
                <div className="relative flex-1">
                  <input
                    id="pass"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 w-full rounded-xl border border-[#262016] bg-[#08080c] pl-3.5 pr-10 text-sm text-white placeholder:text-[#4a4a58] focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]/30 transition-all"
                    disabled={loading}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#71717a] hover:text-[#d4af37] transition-colors p-1"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Checkbox and Forgot password row */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 text-[#a1a1aa] cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-[#3a3020] bg-[#08080c] text-[#d4af37] focus:ring-[#d4af37]/30 accent-[#d4af37]"
                />
                Remember me
              </label>
              <button
                type="button"
                onClick={() => {
                  toast.info("Password Reset Information", {
                    description: "Leave the password field blank to log in securely using an email OTP verification code.",
                  });
                }}
                className="text-[#c5a059] hover:text-[#e5c158] transition-colors font-medium cursor-pointer"
              >
                Forgot password?
              </button>
            </div>

            {/* Primary Action Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-gradient-to-r from-[#b8860b] via-[#d4af37] to-[#e5c158] hover:from-[#c59114] hover:to-[#f0d068] text-slate-950 font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(212,175,55,0.25)] active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <RefreshCw className="size-4 animate-spin text-slate-950" />
                ) : (
                  <>
                    <SendHorizontal className="size-4 text-slate-950" />
                    {password.trim() ? "Sign In" : "Send Verification Code"}
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="text-left space-y-5" autoComplete="off">
            {otpExpired && (
              <div className="rounded-xl bg-red-950/40 border border-red-800/50 px-3.5 py-2.5 text-xs text-red-300">
                Verification code expired. Please{" "}
                <button type="button" className="font-bold underline text-red-200" onClick={() => { setStep("email"); setOtpVal(""); }}>
                  go back
                </button>{" "}
                and request a new code.
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="otp" className="block text-[11px] font-bold tracking-widest text-[#c5a059] uppercase">
                VERIFICATION CODE
              </label>
              <div className="flex items-center gap-2.5">
                <div className="size-10 rounded-full bg-[#181510] border border-[#2d2518] flex items-center justify-center text-[#d4af37] shrink-0">
                  <KeyRound className="size-4" />
                </div>
                <input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  placeholder="Enter 6-digit OTP"
                  maxLength={6}
                  value={otpVal}
                  onChange={(e) => setOtpVal(e.target.value.replace(/[^0-9]/g, ""))}
                  className="h-11 flex-1 rounded-xl border border-[#262016] bg-[#08080c] px-3.5 text-sm text-white placeholder:text-[#4a4a58] tracking-[0.25em] font-bold text-center focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]/30 transition-all"
                  required
                  disabled={loading || otpExpired}
                  autoComplete="one-time-code"
                />
              </div>
              <p className="text-[11px] text-[#71717a] text-right">Code expires in 10 minutes</p>
            </div>

            <div className="flex items-center justify-between text-xs text-[#a1a1aa] pt-1">
              <button
                type="button"
                onClick={() => {
                  setStep("email");
                  setOtpVal("");
                  sentOtpRef.current = "";
                  serverIssuedRef.current = false;
                }}
                className="inline-flex items-center gap-1 hover:text-[#d4af37] transition-colors"
              >
                <ArrowLeft className="size-3" /> Change Email
              </button>
              {timer > 0 ? (
                <span className="text-[#71717a]">Resend in {timer}s</span>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  className="text-[#c5a059] font-bold hover:underline"
                >
                  Resend Code
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || otpExpired}
              className="w-full h-12 bg-gradient-to-r from-[#b8860b] via-[#d4af37] to-[#e5c158] hover:from-[#c59114] hover:to-[#f0d068] text-slate-950 font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(212,175,55,0.25)] active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <RefreshCw className="size-4 animate-spin text-slate-950" />
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        )}

        {/* Feature Badges Footer inside Card */}
        <div className="grid grid-cols-3 gap-1 pt-5 mt-6 border-t border-[#1e1b15]">
          <div className="flex flex-col items-center gap-1 border-r border-[#1e1b15] px-1">
            <ShieldCheck className="size-4 text-[#d4af37]" />
            <span className="text-[10px] font-medium text-[#9a9aa0]">Secure &amp; Safe</span>
          </div>
          <div className="flex flex-col items-center gap-1 border-r border-[#1e1b15] px-1">
            <Clock className="size-4 text-[#d4af37]" />
            <span className="text-[10px] font-medium text-[#9a9aa0]">Quick Access</span>
          </div>
          <div className="flex flex-col items-center gap-1 px-1">
            <Headphones className="size-4 text-[#d4af37]" />
            <span className="text-[10px] font-medium text-[#9a9aa0]">24/7 Support</span>
          </div>
        </div>

      </div>

      {/* Copyright Footer */}
      <div className="py-4 text-center text-xs text-[#71717a] relative z-10 space-y-0.5">
        <div>© 2026 Jain Mobile &amp; Finance.</div>
        <div>All rights reserved.</div>
      </div>
    </div>
  );
}

