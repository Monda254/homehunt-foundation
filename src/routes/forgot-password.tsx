import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { KeyRound, Mail, ArrowLeft, Loader2 } from "lucide-react";
import { requestPasswordReset } from "@/features/identity/identity.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/forgot-password")({
  component: ForgotPasswordComponent,
});

function ForgotPasswordComponent() {
  const [email, setEmail] = useState("");

  const resetRequestMutation = useMutation({
    mutationFn: (emailAddress: string) => requestPasswordReset({ email: emailAddress }),
    onSuccess: (data) => {
      toast.success("Reset request processed!");
    },
    onError: (err: unknown) => {
      const error = err as { message?: string };
      toast.error(error.message || "An error occurred. Please try again.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    resetRequestMutation.mutate(email);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="surface-card p-8 max-w-md w-full text-center shadow-elevated">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/15 text-accent mx-auto mb-4">
          <KeyRound className="h-6 w-6" />
        </div>
        <h1 className="font-display text-2xl font-bold text-foreground">Forgot Password?</h1>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          No worries! Enter your email address below and we'll send you instructions to reset your
          password.
        </p>

        {resetRequestMutation.isSuccess ? (
          <div className="mt-8 rounded-xl bg-verified/5 border border-verified/20 p-4 text-left">
            <h4 className="font-display font-semibold text-foreground text-sm flex items-center gap-1.5">
              <Mail className="h-4 w-4 text-verified" /> Check your inbox
            </h4>
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
              If an account is associated with <strong className="text-foreground">{email}</strong>,
              we have dispatched a password reset link to it. The link will expire in 1 hour.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 text-left">
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="e.g. yourname@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-secondary/30 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                  disabled={resetRequestMutation.isPending}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={resetRequestMutation.isPending || !email}
              className="mt-6 w-full flex items-center justify-center gap-2 rounded-lg bg-primary py-3 font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resetRequestMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Send Reset Instructions"
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
