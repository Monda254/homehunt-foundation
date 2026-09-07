import { supabaseAdmin as rawSupabaseAdmin } from "@/integrations/supabase/client.server";

const supabaseAdmin = rawSupabaseAdmin as any;

export interface FeatureFlag {
  id: string;
  flagKey: string;
  description: string;
  enabled: boolean;
  rolloutPercentage: number;
  allowedRoles: string[];
  updatedAt: string;
}

export async function isFeatureEnabled(flagKey: string, userRole?: string): Promise<boolean> {
  try {
    const { data } = await supabaseAdmin
      .from("feature_flags")
      .select("*")
      .eq("flag_key", flagKey)
      .maybeSingle();

    if (!data) {
      // Default to true for standard platform features
      return true;
    }

    if (!data.enabled) return false;

    if (userRole && Array.isArray(data.allowed_roles) && data.allowed_roles.length > 0) {
      return data.allowed_roles.includes(userRole);
    }

    return true;
  } catch (err) {
    console.error("[FeatureFlagsService] Error checking feature flag:", err);
    return true;
  }
}

export async function getAllFeatureFlags(): Promise<FeatureFlag[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from("feature_flags")
      .select("*")
      .order("flag_key", { ascending: true });

    if (error || !data) return [];

    return data.map((f: any) => ({
      id: f.id,
      flagKey: f.flag_key,
      description: f.description || "",
      enabled: f.enabled,
      rolloutPercentage: f.rollout_percentage,
      allowedRoles: Array.isArray(f.allowed_roles) ? f.allowed_roles : [],
      updatedAt: f.updated_at,
    }));
  } catch (err) {
    console.error("[FeatureFlagsService] Error listing feature flags:", err);
    return [];
  }
}

export async function toggleFeatureFlag(flagKey: string, enabled: boolean): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin
      .from("feature_flags")
      .update({
        enabled,
        updated_at: new Date().toISOString(),
      })
      .eq("flag_key", flagKey);

    if (error) {
      console.error("[FeatureFlagsService] Error toggling feature flag:", error.message);
      return false;
    }

    return true;
  } catch (err) {
    console.error("[FeatureFlagsService] Exception toggling feature flag:", err);
    return false;
  }
}
