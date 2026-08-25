import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  User,
  Landmark,
  ShieldAlert,
  Loader2,
  ArrowLeft,
  CheckCircle2,
  Shield,
} from "lucide-react";
import { register as serverRegister } from "@/features/identity/identity.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/register")({
  component: RegisterComponent,
});

type IntendedRole = "tenant" | "landlord" | "agent";

function RegisterComponent() {
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<IntendedRole>("tenant");

  const registerMutation = useMutation({
    mutationFn: () =>
      serverRegister({
        firstName,
        lastName,
        email,
        phoneNumber: phoneNumber || undefined,
        password,
        confirmPassword,
        role,
      }),
    onSuccess: () => {
      toast.success("Account created successfully!");
      // Redirect to verify-email notice screen
      navigate({ to: "/verify-email" });
    },
    onError: (err: unknown) => {
      const error = err as { message?: string };
      toast.error(error.message || "Registration failed. Please check inputs.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      toast.error("Please fill in all required fields.");
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    if (phoneNumber && !/^\+?[0-9]{9,15}$/.test(phoneNumber)) {
      toast.error("Please enter a valid phone number (e.g. +254712345678).");
      return;
    }
    registerMutation.mutate();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
      <div className="surface-card p-8 max-w-xl w-full shadow-elevated">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mx-auto mb-4">
          <User className="h-6 w-6" />
        </div>
        <h1 className="font-display text-2xl font-bold text-foreground text-center">
          Create Account
        </h1>
        <p className="mt-2 text-sm text-muted-foreground text-center leading-relaxed">
          Join HomeHunt today. Find scam-free rentals or list properties securely.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {/* Role Card Selector */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-3 text-center sm:text-left">
              Select Your Intended Account Role
            </label>
            <div className="grid gap-3 sm:grid-cols-3">
              {/* Tenant */}
              <button
                type="button"
                onClick={() => setRole("tenant")}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border text-center transition-all cursor-pointer ${
                  role === "tenant"
                    ? "border-primary bg-primary/5 text-primary ring-2 ring-primary/20"
                    : "border-border bg-transparent hover:border-primary/40 text-muted-foreground hover:text-foreground"
                }`}
              >
                <User className="h-6 w-6 mb-2" />
                <span className="font-semibold text-xs">Tenant</span>
                <span className="text-[10px] mt-1 leading-tight block">Looking for a home</span>
              </button>

              {/* Landlord */}
              <button
                type="button"
                onClick={() => setRole("landlord")}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border text-center transition-all cursor-pointer ${
                  role === "landlord"
                    ? "border-primary bg-primary/5 text-primary ring-2 ring-primary/20"
                    : "border-border bg-transparent hover:border-primary/40 text-muted-foreground hover:text-foreground"
                }`}
              >
                <Landmark className="h-6 w-6 mb-2" />
                <span className="font-semibold text-xs">Landlord</span>
                <span className="text-[10px] mt-1 leading-tight block">I own rental units</span>
              </button>

              {/* Agent */}
              <button
                type="button"
                onClick={() => setRole("agent")}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border text-center transition-all cursor-pointer ${
                  role === "agent"
                    ? "border-primary bg-primary/5 text-primary ring-2 ring-primary/20"
                    : "border-border bg-transparent hover:border-primary/40 text-muted-foreground hover:text-foreground"
                }`}
              >
                <Shield className="h-6 w-6 mb-2" />
                <span className="font-semibold text-xs">Agent / Mgr</span>
                <span className="text-[10px] mt-1 leading-tight block">I manage properties</span>
              </button>
            </div>
            <p className="mt-2.5 text-[10px] text-muted-foreground text-center">
              * Note: Admins, Verifiers, and Property Managers require controlled offline
              authorization.
            </p>
          </div>

          {/* Core Fields */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="first-name"
                className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2"
              >
                First Name
              </label>
              <input
                id="first-name"
                type="text"
                required
                placeholder="e.g. John"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-4 py-2.5 bg-secondary/30 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                disabled={registerMutation.isPending}
              />
            </div>

            <div>
              <label
                htmlFor="last-name"
                className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2"
              >
                Last Name
              </label>
              <input
                id="last-name"
                type="text"
                required
                placeholder="e.g. Doe"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-4 py-2.5 bg-secondary/30 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                disabled={registerMutation.isPending}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
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
                placeholder="name@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-secondary/30 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                disabled={registerMutation.isPending}
              />
            </div>

            <div>
              <label
                htmlFor="phone"
                className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2"
              >
                Phone Number <span className="text-muted-foreground/60">(Optional)</span>
              </label>
              <input
                id="phone"
                type="tel"
                placeholder="e.g. +254712345678"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full px-4 py-2.5 bg-secondary/30 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                disabled={registerMutation.isPending}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="pass"
                className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2"
              >
                Password
              </label>
              <input
                id="pass"
                type="password"
                required
                placeholder="At least 8 chars"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-secondary/30 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                disabled={registerMutation.isPending}
              />
            </div>

            <div>
              <label
                htmlFor="confirm-pass"
                className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2"
              >
                Confirm Password
              </label>
              <input
                id="confirm-pass"
                type="password"
                required
                placeholder="Repeat password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-secondary/30 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                disabled={registerMutation.isPending}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={registerMutation.isPending}
            className="w-full mt-4 flex items-center justify-center gap-2 rounded-lg bg-primary py-3 font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {registerMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-primary hover:underline">
            Sign In
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
