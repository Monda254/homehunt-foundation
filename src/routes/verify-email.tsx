import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Mail, CheckCircle2, XCircle, ArrowRight, Loader2, RefreshCw } from "lucide-react";
import { verifyEmail, resendVerification } from "@/features/identity/identity.functions";
import { toast } from "sonner";
import { useAuth } from "@/features/identity/AuthContext";

export const Route = createFileRoute("/verify-email")({
  validateSearch: (search: Record<string, unknown>): { token?: string } => ({
    token: typeof search.token === "string" ? search.token : undefined,
  }),
  component: VerifyEmailComponent,
});

function VerifyEmailComponent() {
  const { token } = Route.useSearch();
  const navigate = useNavigate();
  const { user, refetch } = useAuth();

  const [resendEmail, setResendEmail] = useState("");
  const [countdown, setCountdown] = useState(0);

  // If user is already active and verified, redirect them to dashboard
  useEffect(() => {
    if (user && user.status === "ACTIVE") {
      navigate({ to: "/dashboard" });
    }
  }, [user, navigate]);

  // Mutation to verify email using the token
  const verifyMutation = useMutation({
    mutationFn: (tok: string) => verifyEmail({ token: tok }),
    onSuccess: async () => {
      toast.success("Email verified successfully!");
      await refetch();
      setTimeout(() => {
        navigate({ to: "/dashboard" });
      }, 3000);
    },
    onError: (err: unknown) => {
      const error = err as { message?: string };
      const msg = error.message || "Invalid or expired verification token.";
      toast.error(msg);
    },
  });

  // Automatically trigger verification if token is present
  useEffect(() => {
    if (token) {
      verifyMutation.mutate(token);
    }
  }, [token, verifyMutation]);

  // Mutation to resend verification link
  const resendMutation = useMutation({
    mutationFn: (email: string) => resendVerification({ email }),
    onSuccess: () => {
      toast.success("Verification link sent! Check your inbox.");
      setCountdown(60); // 60s cooldown
    },
    onError: (err: unknown) => {
      const error = err as { message?: string };
      toast.error(error.message || "Failed to resend verification link.");
    },
  });

  // Countdown timer for resend cooldown
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleResendSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resendEmail) return;
    resendMutation.mutate(resendEmail);
  };

  // ------------------------------------------------------------
  // Case A: Verifying token active loading state
  // ------------------------------------------------------------
  if (token && verifyMutation.isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="surface-card p-8 max-w-md w-full text-center shadow-elevated">
          <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto mb-4" />
          <h1 className="font-display text-2xl font-bold text-foreground">Verifying Email...</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            We are cryptographically validating your email verification link. Please wait a moment.
          </p>
        </div>
      </div>
    );
  }

  // ------------------------------------------------------------
  // Case B: Token verification successful
  // ------------------------------------------------------------
  if (token && verifyMutation.isSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="surface-card p-8 max-w-md w-full text-center shadow-elevated border border-verified/20">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-verified/10 text-verified mx-auto mb-6">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            Verification Successful!
          </h1>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            Your email has been successfully verified. You are being redirected to your dashboard.
          </p>
          <div className="mt-8">
            <Link
              to="/dashboard"
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 font-semibold text-primary-foreground shadow-md transition-all hover:bg-primary/95"
            >
              Go to Dashboard <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ------------------------------------------------------------
  // Case C: Token verification failed
  // ------------------------------------------------------------
  if (token && verifyMutation.isError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="surface-card p-8 max-w-md w-full text-center shadow-elevated border border-destructive/20">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive mx-auto mb-6">
            <XCircle className="h-8 w-8" />
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground">Verification Failed</h1>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            The link is invalid, expired, or has already been used. You can request a new
            verification link below.
          </p>

          <form onSubmit={handleResendSubmit} className="mt-8 text-left">
            <label
              htmlFor="resend-email-fail"
              className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2"
            >
              Email Address
            </label>
            <input
              id="resend-email-fail"
              type="email"
              required
              placeholder="e.g. user@example.com"
              value={resendEmail}
              onChange={(e) => setResendEmail(e.target.value)}
              className="w-full px-4 py-3 bg-secondary/30 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm mb-4"
            />
            <button
              type="submit"
              disabled={resendMutation.isPending || countdown > 0}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary py-3 font-semibold text-primary-foreground transition-all hover:bg-primary/95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resendMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : countdown > 0 ? (
                `Resend in ${countdown}s`
              ) : (
                <>
                  Resend Link <RefreshCw className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/login" className="text-xs font-semibold text-primary hover:underline">
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ------------------------------------------------------------
  // Case D: Default registration email notice screen (no token)
  // ------------------------------------------------------------
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="surface-card p-8 max-w-md w-full text-center shadow-elevated">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/15 text-accent mx-auto mb-6">
          <Mail className="h-8 w-8" />
        </div>
        <h1 className="font-display text-2xl font-bold text-foreground">Check Your Email</h1>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          We have sent a cryptographically secure verification link to your registered email
          address. Please check your inbox (and spam folder) and click the link to activate your
          account.
        </p>

        <form onSubmit={handleResendSubmit} className="mt-8 text-left">
          <label
            htmlFor="resend-email"
            className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2"
          >
            Didn't receive the email? Resend link
          </label>
          <input
            id="resend-email"
            type="email"
            required
            placeholder="Enter your email to resend"
            value={resendEmail}
            onChange={(e) => setResendEmail(e.target.value)}
            className="w-full px-4 py-3 bg-secondary/30 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm mb-4"
          />
          <button
            type="submit"
            disabled={resendMutation.isPending || countdown > 0}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary py-3 font-semibold text-primary-foreground transition-all hover:bg-primary/95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {resendMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : countdown > 0 ? (
              `Resend in ${countdown}s`
            ) : (
              <>
                Resend Verification Link <RefreshCw className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center flex justify-between">
          <Link to="/login" className="text-xs font-semibold text-primary hover:underline">
            Back to Sign In
          </Link>
          {user && (
            <button
              onClick={() => refetch()}
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
            >
              <RefreshCw className="h-3 w-3" /> Check status
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
