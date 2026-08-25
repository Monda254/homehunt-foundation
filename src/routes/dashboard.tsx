import { createFileRoute, Link } from "@tanstack/react-router";
import { RequireAuth, useAuth } from "@/features/identity/AuthContext";
import { DashboardLayout } from "@/components/DashboardLayout";
import {
  User,
  Landmark,
  Shield,
  Search,
  PlusCircle,
  Building,
  KeyRound,
  ShieldCheck,
  AlertTriangle,
  FolderOpen,
  Mail,
  UserCheck,
  CheckCircle,
} from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  component: () => (
    <RequireAuth>
      <DashboardComponent />
    </RequireAuth>
  ),
});

function DashboardComponent() {
  const { user } = useAuth();

  if (!user) return null;

  // Compute profile completeness
  const fields = [
    user.firstName,
    user.lastName,
    user.phoneNumber,
    user.county,
    user.town,
    user.fullName,
  ];
  const filled = fields.filter((f) => f && f.trim() !== "").length;
  const completeness = Math.round((filled / fields.length) * 100);

  const isTenant = user.roles.includes("tenant");
  const isLandlord = user.roles.includes("landlord");
  const isAgent = user.roles.includes("agent");
  const isAdmin = user.roles.includes("admin") || user.roles.includes("super_admin");

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-card p-6 rounded-2xl border border-border shadow-sm">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              Welcome back, {user.firstName || "User"}!
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              You are signed in as a{" "}
              <span className="font-semibold text-primary capitalize">{user.roles.join(", ")}</span>
              .
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
              Profile Completeness
            </span>
            <div className="relative flex items-center justify-center">
              <svg className="w-12 h-12 transform -rotate-90">
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  stroke="currentColor"
                  strokeWidth="4"
                  className="text-secondary"
                  fill="transparent"
                />
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  stroke="currentColor"
                  strokeWidth="4"
                  className="text-primary transition-all duration-500"
                  fill="transparent"
                  strokeDasharray={125.6}
                  strokeDashoffset={125.6 - (125.6 * completeness) / 100}
                />
              </svg>
              <span className="absolute text-[10px] font-bold text-foreground">
                {completeness}%
              </span>
            </div>
          </div>
        </div>

        {/* Verification Status Alert */}
        {user.status === "PENDING_VERIFICATION" && (
          <div className="flex gap-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 p-4 text-yellow-800 dark:text-yellow-400">
            <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-sm">Email Verification Required</h4>
              <p className="text-xs mt-1 leading-relaxed opacity-90">
                Your account is currently restricted. Please check your email inbox for the
                verification link. If you didn't receive it, you can request a resend.
              </p>
              <Link
                to="/verify-email"
                className="inline-flex items-center gap-1 text-xs font-bold mt-2 hover:underline"
              >
                Go to Verification Screen →
              </Link>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------
            TENANT DASHBOARD
           ------------------------------------------------------------ */}
        {isTenant && (
          <div className="grid gap-6 md:grid-cols-2">
            <div className="surface-card p-6 flex flex-col justify-between shadow-sm">
              <div>
                <div className="h-10 w-10 bg-primary/10 text-primary flex items-center justify-center rounded-xl mb-4">
                  <Search className="h-5 w-5" />
                </div>
                <h3 className="font-display font-semibold text-lg text-foreground">
                  Find a Verified Home
                </h3>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                  Browse apartments, bedsitters, and townhouses verified by physical agents. Zero
                  scams, direct bookings.
                </p>
              </div>
              <div className="border-t border-border/60 mt-6 pt-4">
                <span className="text-xs text-muted-foreground block italic">
                  * Property search module is scheduled for Phase 3 (Integrates with PostGIS maps).
                </span>
              </div>
            </div>

            <div className="surface-card p-6 flex flex-col justify-between shadow-sm">
              <div>
                <div className="h-10 w-10 bg-accent/15 text-accent flex items-center justify-center rounded-xl mb-4">
                  <Building className="h-5 w-5" />
                </div>
                <h3 className="font-display font-semibold text-lg text-foreground">
                  My Rental Applications
                </h3>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                  Manage your rental requests, coordinate viewing calendars, and sign leases
                  directly inside the portal.
                </p>
              </div>
              <div className="border-t border-border/60 mt-6 pt-4">
                <span className="text-xs text-muted-foreground block italic">
                  * Application and lease signing workflows scheduled for Phase 4.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------
            LANDLORD DASHBOARD
           ------------------------------------------------------------ */}
        {isLandlord && (
          <div className="grid gap-6 md:grid-cols-2">
            <div className="surface-card p-6 flex flex-col justify-between shadow-sm">
              <div>
                <div className="h-10 w-10 bg-primary/10 text-primary flex items-center justify-center rounded-xl mb-4">
                  <PlusCircle className="h-5 w-5" />
                </div>
                <h3 className="font-display font-semibold text-lg text-foreground">
                  Add New Property
                </h3>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                  Create and manage your apartment blocks, houses, or single units. Request physical
                  agent verification checks.
                </p>
              </div>
              <div className="border-t border-border/60 mt-6 pt-4">
                <span className="text-xs text-muted-foreground block italic">
                  * Property creation and KYC verification scheduled for Phase 2.
                </span>
              </div>
            </div>

            <div className="surface-card p-6 flex flex-col justify-between shadow-sm">
              <div>
                <div className="h-10 w-10 bg-accent/15 text-accent flex items-center justify-center rounded-xl mb-4">
                  <FolderOpen className="h-5 w-5" />
                </div>
                <h3 className="font-display font-semibold text-lg text-foreground">
                  Marketplace Listings
                </h3>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                  Publish vacant units to the marketplace, manage monthly rents, review applicant
                  trust scores, and collect deposits.
                </p>
              </div>
              <div className="border-t border-border/60 mt-6 pt-4">
                <span className="text-xs text-muted-foreground block italic">
                  * Rental listings, tenancy support, and payments (M-Pesa) are scheduled for later
                  modules.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------
            AGENT / PROPERTY MANAGER DASHBOARD
           ------------------------------------------------------------ */}
        {isAgent && (
          <div className="grid gap-6 md:grid-cols-2">
            <div className="surface-card p-6 flex flex-col justify-between shadow-sm">
              <div>
                <div className="h-10 w-10 bg-primary/10 text-primary flex items-center justify-center rounded-xl mb-4">
                  <Building className="h-5 w-5" />
                </div>
                <h3 className="font-display font-semibold text-lg text-foreground">
                  Managed Portfolios
                </h3>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                  Coordinate with landlords who assigned their properties to your agency, monitor
                  vacancy rates, and update leases.
                </p>
              </div>
              <div className="border-t border-border/60 mt-6 pt-4">
                <span className="text-xs text-muted-foreground block italic">
                  * Property agent assignment scheduled for Phase 2.
                </span>
              </div>
            </div>

            <div className="surface-card p-6 flex flex-col justify-between shadow-sm">
              <div>
                <div className="h-10 w-10 bg-accent/15 text-accent flex items-center justify-center rounded-xl mb-4">
                  <UserCheck className="h-5 w-5" />
                </div>
                <h3 className="font-display font-semibold text-lg text-foreground">
                  Tenant Inquiries
                </h3>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                  Review applicant profiles, schedule viewing appointments, verify national IDs, and
                  handle deposit claims.
                </p>
              </div>
              <div className="border-t border-border/60 mt-6 pt-4">
                <span className="text-xs text-muted-foreground block italic">
                  * Viewer bookings and trust scores are scheduled for subsequent phases.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------
            ADMINISTRATOR SECTION
           ------------------------------------------------------------ */}
        {isAdmin && (
          <div className="surface-card p-6 shadow-sm space-y-4">
            <h3 className="font-display font-semibold text-lg text-foreground flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" /> Admin Controls
            </h3>
            <p className="text-sm text-muted-foreground">
              You hold administrative privileges. You can view, audit, suspend, reactivate users,
              and manage account roles.
            </p>
            <div className="pt-2">
              <Link
                to="/admin"
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow hover:bg-primary/95"
              >
                Open User Management
              </Link>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
