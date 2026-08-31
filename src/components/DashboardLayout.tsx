import React, { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { useAuth } from "@/features/identity/AuthContext";
import {
  Home,
  User,
  Settings,
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  Shield,
  Map,
  MessageSquare,
  Bookmark,
  FolderKanban,
  CalendarDays,
  MapPin,
  Clock,
  AlertCircle,
  Building,
  Compass,
  ClipboardList,
} from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, logout, hasPermission } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const routerState = useRouterState();

  const currentPath = routerState.location.pathname;

  const handleSignOut = () => {
    logout();
  };

  const showListingsManager =
    user &&
    (user.roles.includes("landlord") ||
      user.roles.includes("agent") ||
      user.roles.includes("property_manager") ||
      user.roles.includes("admin") ||
      user.roles.includes("super_admin"));

  const navItems = [
    { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
    ...(showListingsManager
      ? [
          { label: "My Properties", to: "/properties", icon: Building },
          { label: "My Listings", to: "/listings", icon: FolderKanban },
          { label: "Received Applications", to: "/dashboard/applications", icon: ClipboardList },
        ]
      : []),
    { label: "Map Search", to: "/homes", icon: Map },
    { label: "Recommended Matches", to: "/recommendations", icon: Compass },
    { label: "Saved Homes", to: "/saved", icon: Bookmark },
    { label: "Applications", to: "/applications", icon: FolderKanban },
    { label: "Viewings", to: "/viewings", icon: CalendarDays },
    { label: "Messages", to: "/messages", icon: MessageSquare },
    { label: "My Profile", to: "/profile", icon: User },
    { label: "Settings & Security", to: "/settings", icon: Settings },
  ];

  const showAdmin = hasPermission("ADMIN_VIEW_USERS");

  return (
    <div className="min-h-screen bg-background flex font-sans">
      {/* ------------------------------------------------------------
          Desktop Sidebar
         ------------------------------------------------------------ */}
      <aside className="hidden md:flex flex-col w-64 bg-card border-r border-border shrink-0">
        {/* Brand Header */}
        <div className="h-16 flex items-center gap-2.5 px-6 border-b border-border">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Home className="h-4.5 w-4.5" />
          </div>
          <span className="font-display text-xl font-bold tracking-tight text-primary">
            Home<span className="text-accent">Hunt</span>
          </span>
        </div>

        {/* User Card */}
        {user && (
          <div className="p-4 border-b border-border bg-secondary/10">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 text-primary font-display font-bold flex items-center justify-center border border-primary/20 uppercase">
                {user.firstName?.[0] || user.email?.[0] || "U"}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-semibold text-foreground truncate">
                  {user.fullName || "User Profile"}
                </p>
                <p className="text-xs text-muted-foreground truncate uppercase font-bold tracking-wider text-[9px] mt-0.5">
                  {user.roles.join(" / ")}
                </p>
              </div>
            </div>

            {/* Email verification alert badge */}
            {user.status === "PENDING_VERIFICATION" && (
              <div className="mt-3 flex items-center gap-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20 p-2 text-yellow-700 dark:text-yellow-400">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span className="text-[10px] leading-tight font-medium">Unverified Email</span>
              </div>
            )}
          </div>
        )}

        {/* Navigation Scroll Area */}
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = currentPath === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <Icon className="h-4.5 w-4.5" />
                {item.label}
              </Link>
            );
          })}

          {showAdmin && (
            <div className="pt-4 border-t border-border mt-4">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-3 mb-2">
                Administration
              </p>
              <Link
                to="/admin"
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  currentPath.startsWith("/admin")
                    ? "bg-accent/15 text-accent border border-accent/20"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <Shield className="h-4.5 w-4.5" />
                User Management
              </Link>
            </div>
          )}
        </nav>

        {/* Footer Sign Out */}
        <div className="p-4 border-t border-border mt-auto">
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/5 transition-all"
          >
            <LogOut className="h-4.5 w-4.5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ------------------------------------------------------------
          Mobile Hamburger Layout
         ------------------------------------------------------------ */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 flex items-center justify-between px-6 border-b border-border bg-card md:hidden shrink-0">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Home className="h-4 w-4" />
            </div>
            <span className="font-display text-lg font-bold tracking-tight text-primary">
              Home<span className="text-accent">Hunt</span>
            </span>
          </div>

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </header>

        {/* Mobile Navigation Drawer */}
        {sidebarOpen && (
          <div className="fixed inset-0 top-16 z-30 bg-background md:hidden flex flex-col">
            <div className="p-4 border-b border-border bg-secondary/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-primary/10 text-primary font-display font-bold flex items-center justify-center border border-primary/20 uppercase">
                  {user?.firstName?.[0] || "U"}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {user?.fullName || "User Profile"}
                  </p>
                  <p className="text-xs text-muted-foreground uppercase font-bold text-[9px]">
                    {user?.roles.join(" / ")}
                  </p>
                </div>
              </div>

              <button
                onClick={handleSignOut}
                className="p-2 text-destructive hover:bg-destructive/10 rounded-lg"
                aria-label="Sign out"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = currentPath === item.to;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      active
                        ? "bg-primary text-primary-foreground shadow"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-4.5 w-4.5" />
                    {item.label}
                  </Link>
                );
              })}

              {showAdmin && (
                <div className="pt-4 border-t border-border mt-4">
                  <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest px-3 mb-2">
                    Administration
                  </p>
                  <Link
                    to="/admin"
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      currentPath.startsWith("/admin")
                        ? "bg-accent/15 text-accent border border-accent/20"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    }`}
                  >
                    <Shield className="h-4.5 w-4.5" />
                    User Management
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}

        {/* Protected Inner Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-secondary/20">
          <div className="max-w-5xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
};
