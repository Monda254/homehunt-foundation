import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Shield, Eye, EyeOff, Loader2, ArrowLeft } from "lucide-react";
import { login as serverLogin } from "@/features/identity/identity.functions";
import { useAuth } from "@/features/identity/AuthContext";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>): { redirect?: string } => ({
    redirect: typeof search.redirect === "string" ? search.redirect : undefined,
  }),
  component: LoginComponent,
});

function LoginComponent() {
  const { redirect } = Route.useSearch();
  const navigate = useNavigate();
  const { login: establishSession } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const loginMutation = useMutation({
    mutationFn: () => serverLogin({ email, password }),
    onSuccess: async (data) => {
      toast.success("Signed in successfully!");
      // Establish session in AuthContext
      await establishSession({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
      });
      // Redirect to target destination or default dashboard
      navigate({ to: redirect || "/dashboard" });
    },
    onError: (err: unknown) => {
      const error = err as { message?: string };
      toast.error(error.message || "Invalid email or password.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    loginMutation.mutate();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="surface-card p-8 max-w-md w-full shadow-elevated">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mx-auto mb-4">
          <Shield className="h-6 w-6" />
        </div>
        <h1 className="font-display text-2xl font-bold text-foreground text-center">Sign In</h1>
        <p className="mt-2 text-sm text-muted-foreground text-center leading-relaxed">
          Access your HomeHunt account to find, verify, or manage rental properties.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
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
              placeholder="e.g. user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-secondary/30 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
              disabled={loginMutation.isPending}
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label
                htmlFor="pass"
                className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
              >
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-xs font-semibold text-primary hover:underline"
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <input
                id="pass"
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-4 pr-10 py-3 bg-secondary/30 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                disabled={loginMutation.isPending}
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

          <button
            type="submit"
            disabled={loginMutation.isPending || !email || !password}
            className="w-full mt-6 flex items-center justify-center gap-2 rounded-lg bg-primary py-3 font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loginMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign In"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link to="/register" className="font-semibold text-primary hover:underline">
            Create Account
          </Link>
        </div>

        <div className="mt-8 border-t border-border/60 pt-6 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Go Back Home
          </Link>
        </div>
      </div>
    </div>
  );
}
