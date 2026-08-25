import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { ShieldAlert, ArrowLeft, Loader2, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { resetPassword } from "@/features/identity/identity.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/reset-password")({
  validateSearch: (search: Record<string, unknown>): { token?: string } => ({
    token: typeof search.token === "string" ? search.token : undefined,
  }),
  component: ResetPasswordComponent,
});

function ResetPasswordComponent() {
  const { token } = Route.useSearch();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const resetMutation = useMutation({
    mutationFn: () => resetPassword({ token: token || "", password, confirmPassword }),
    onSuccess: () => {
      toast.success("Password has been reset successfully!");
      setTimeout(() => {
        navigate({ to: "/login" });
      }, 3000);
    },
    onError: (err: unknown) => {
      const error = err as { message?: string };
      toast.error(error.message || "Failed to reset password. The link may have expired.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error("Missing password reset token.");
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    resetMutation.mutate();
  };

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="surface-card p-8 max-w-md w-full text-center shadow-elevated border border-destructive/20">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/15 text-destructive mx-auto mb-4">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground">Invalid Reset Request</h1>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            No password reset token was provided, or the reset token is invalid. Please request a
            new link.
          </p>
          <div className="mt-6">
            <Link
              to="/forgot-password"
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 font-semibold text-primary-foreground transition-all hover:bg-primary/95"
            >
              Request Reset Link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="surface-card p-8 max-w-md w-full text-center shadow-elevated">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary mx-auto mb-4">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <h1 className="font-display text-2xl font-bold text-foreground">Reset Password</h1>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          Please enter and confirm your new secure account password below.
        </p>

        {resetMutation.isSuccess ? (
          <div className="mt-8 rounded-xl bg-verified/5 border border-verified/20 p-4 text-left">
            <h4 className="font-display font-semibold text-foreground text-sm flex items-center gap-1.5">
              Password Reset Complete!
            </h4>
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
              Your password has been successfully updated. All other active sessions for your
              account have been invalidated. Redirecting you to the Sign In screen in a few
              seconds...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 text-left">
            <div className="space-y-4">
              <div className="relative">
                <label
                  htmlFor="new-pass"
                  className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2"
                >
                  New Password
                </label>
                <div className="relative">
                  <input
                    id="new-pass"
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="At least 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-4 pr-10 py-3 bg-secondary/30 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                    disabled={resetMutation.isPending}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="confirm-pass"
                  className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2"
                >
                  Confirm New Password
                </label>
                <input
                  id="confirm-pass"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Repeat new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-secondary/30 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                  disabled={resetMutation.isPending}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={
                resetMutation.isPending || password.length < 8 || password !== confirmPassword
              }
              className="mt-6 w-full flex items-center justify-center gap-2 rounded-lg bg-primary py-3 font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resetMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Reset Password"
              )}
            </button>
          </form>
        )}

        <div className="mt-8 border-t border-border/60 pt-6">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
