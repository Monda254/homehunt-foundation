import React, { createContext, useContext, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getMyIdentity, logout as serverLogout, type IdentitySnapshot } from "./identity.functions";
import {
  hasRole as checkRole,
  hasPermission as checkPermission,
  type AppRole,
  type AppPermission,
} from "@/core/auth/roles";
import { toast } from "sonner";

interface AuthContextType {
  isAuthenticated: boolean;
  user: IdentitySnapshot | null;
  isLoading: boolean;
  login: (tokens: { access_token: string; refresh_token: string }) => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (role: AppRole) => boolean;
  hasPermission: (permission: AppPermission) => boolean;
  refetch: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();

  // Retrieve identity using TanStack Query
  const {
    data: user,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["my-identity"],
    queryFn: async () => {
      // Check if we have an active session before querying server
      const { data } = await supabase.auth.getSession();
      if (!data.session) return null;

      try {
        return await getMyIdentity();
      } catch (error) {
        // If query fails due to authentication or other issues, return null
        return null;
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes stale time
    retry: false,
  });

  const isAuthenticated = !!user;

  // React to Supabase auth changes (e.g. sign-in/sign-out events across tabs or direct triggers)
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        queryClient.invalidateQueries({ queryKey: ["my-identity"] });
      } else if (event === "SIGNED_OUT") {
        queryClient.setQueryData(["my-identity"], null);
        queryClient.clear();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [queryClient]);

  const login = async (tokens: { access_token: string; refresh_token: string }) => {
    // Sets session on client-side Supabase client (stores in localStorage)
    const { error } = await supabase.auth.setSession(tokens);
    if (error) {
      toast.error("Authentication session establishment failed.");
      throw error;
    }
    await refetch();
  };

  const logout = async () => {
    try {
      // Call server function to revoke session
      await serverLogout();
    } catch (e) {
      console.warn("Server logout revocation failed, proceeding with client cleanup", e);
    } finally {
      // Clean up locally
      await supabase.auth.signOut();
      queryClient.setQueryData(["my-identity"], null);
      queryClient.clear();
      toast.success("Signed out successfully.");
    }
  };

  const hasRole = (role: AppRole): boolean => {
    if (!user) return false;
    return checkRole(user.roles, role);
  };

  const hasPermission = (permission: AppPermission): boolean => {
    if (!user) return false;
    return checkPermission(user.roles, permission);
  };

  const refetchIdentity = async () => {
    await refetch();
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user: user ?? null,
        isLoading,
        login,
        logout,
        hasRole,
        hasPermission,
        refetch: refetchIdentity,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface RequireAuthProps {
  children: React.ReactNode;
  role?: AppRole;
  permission?: AppPermission;
}

export const RequireAuth: React.FC<RequireAuthProps> = ({ children, role, permission }) => {
  const { isAuthenticated, isLoading, user, hasRole, hasPermission } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        navigate({ to: "/login", search: { redirect: window.location.pathname } });
      } else {
        if (role && !hasRole(role)) {
          navigate({ to: "/dashboard" });
        }
        if (permission && !hasPermission(permission)) {
          navigate({ to: "/dashboard" });
        }
        if (
          user &&
          user.status === "PENDING_VERIFICATION" &&
          window.location.pathname !== "/verify-email"
        ) {
          navigate({ to: "/verify-email" });
        }
      }
    }
  }, [isAuthenticated, isLoading, user, role, permission, navigate, hasRole, hasPermission]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Verifying access authorization...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;
  if (role && !hasRole(role)) return null;
  if (permission && !hasPermission(permission)) return null;

  if (
    user &&
    user.status === "PENDING_VERIFICATION" &&
    window.location.pathname !== "/verify-email"
  ) {
    return null;
  }

  return <>{children}</>;
};
