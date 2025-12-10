import React, { useState } from "react";
import { apiClient } from "../api/client";
import { useAuth } from "../auth/AuthContext";

interface LoginStep1Response {
  temp_token: string;
  mfa_setup_required: boolean;
  mfa_code_required: boolean;
}

interface MfaSetupResponse {
  secret: string;
  qrCodeUrl: string;
  otpauthUrl: string;
}

interface MfaVerifyResponse {
  admin: any;
  accessToken: string;
  refreshToken: string;
}

type Step = "CREDENTIALS" | "MFA_SETUP" | "MFA_CODE";

export const LoginPage: React.FC = () => {
  const { loginWithFinalToken } = useAuth();
  const [step, setStep] = useState<Step>("CREDENTIALS");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [tempToken, setTempToken] = useState<string | null>(null);
  const [mfaSecret, setMfaSecret] = useState<string | null>(null);
  const [qr, setQr] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await apiClient.post<LoginStep1Response>("/auth/login", { email, password });
      setTempToken(res.temp_token);
      if (res.mfa_setup_required) {
        setStep("MFA_SETUP");
        const setupRes = await apiClient.post<MfaSetupResponse>(
          "/auth/mfa/setup",
          {},
          {
            headers: {
              Authorization: `Bearer ${res.temp_token}`
            }
          }
        );
        setMfaSecret(setupRes.secret);
        setQr(setupRes.qrCodeUrl);
      } else if (res.mfa_code_required) {
        setStep("MFA_CODE");
      } else {
        setStep("MFA_CODE");
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleMfaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempToken) return;
    setError(null);
    setLoading(true);
    try {
      const body: any = { code };
      // On first-time setup, backend expects the MFA secret in the payload as `secret`
      if (mfaSecret) {
        body.secret = mfaSecret;
      }
      const res = await apiClient.post<MfaVerifyResponse>(
        "/auth/mfa/verify",
        body,
        {
          headers: {
            Authorization: `Bearer ${tempToken}`
          }
        }
      );
      loginWithFinalToken(res);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4">
      <div className="max-w-md w-full space-y-6">
        <div className="flex flex-col items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-primary-600 flex items-center justify-center text-lg font-bold shadow-lg shadow-primary-900/50">
            B
          </div>
          <div className="text-center space-y-1">
            <h2 className="text-lg font-semibold text-slate-50">Baft Admin Console</h2>
            <p className="text-xs text-slate-400">
              Secure access for OPS, SUPPORT, FINANCE and SUPERADMIN roles.
            </p>
          </div>
        </div>
        <div className="card p-6 space-y-4">
          {step === "CREDENTIALS" && (
            <form onSubmit={handleCredentialsSubmit} className="space-y-4">
              <div>
                <label className="block text-xs mb-1 text-slate-300">Work email</label>
                <input
                  className="input"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-xs mb-1 text-slate-300">Password</label>
                <input
                  className="input"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {error && <p className="text-xs text-red-400">{error}</p>}
              <button className="btn-primary w-full" type="submit" disabled={loading}>
                {loading ? "Signing in..." : "Continue"}
              </button>
            </form>
          )}
          {step === "MFA_SETUP" && (
            <div className="space-y-4">
              <div className="text-sm text-slate-200 font-medium">
                Set up Microsoft Authenticator
              </div>
              <p className="text-xs text-slate-400">
                Scan this QR code in Microsoft Authenticator, then enter the 6-digit code below to
                complete setup.
              </p>
              {qr && (
                <div className="flex justify-center">
                  <img
                    src={qr}
                    alt="MFA QR"
                    className="rounded-lg border border-slate-700 bg-white p-2"
                  />
                </div>
              )}
              <form onSubmit={handleMfaSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs mb-1 text-slate-300">Authenticator code</label>
                  <input
                    className="input tracking-[0.3em] text-center font-mono"
                    type="text"
                    inputMode="numeric"
                    pattern="\d{6}"
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    required
                  />
                </div>
                {error && <p className="text-xs text-red-400">{error}</p>}
                <button className="btn-primary w-full" type="submit" disabled={loading}>
                  {loading ? "Verifying..." : "Complete setup & sign in"}
                </button>
              </form>
            </div>
          )}
          {step === "MFA_CODE" && (
            <form onSubmit={handleMfaSubmit} className="space-y-4">
              <div>
                <div className="text-sm font-medium text-slate-200 mb-1">
                  Enter Authenticator code
                </div>
                <p className="text-xs text-slate-400">
                  Approve the sign-in request in Microsoft Authenticator or enter the current
                  6-digit code.
                </p>
              </div>
              <div>
                <label className="block text-xs mb-1 text-slate-300">6-digit code</label>
                <input
                  className="input tracking-[0.3em] text-center font-mono"
                  type="text"
                  inputMode="numeric"
                  pattern="\d{6}"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                />
              </div>
              {error && <p className="text-xs text-red-400">{error}</p>}
              <button className="btn-primary w-full" type="submit" disabled={loading}>
                {loading ? "Verifying..." : "Sign in"}
              </button>
            </form>
          )}
        </div>
        <p className="text-[10px] text-center text-slate-500">
          All actions are logged to the audit trail. Do not share your credentials or OTPs.
        </p>
      </div>
    </div>
  );
};


