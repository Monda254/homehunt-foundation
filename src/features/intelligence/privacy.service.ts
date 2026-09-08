/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabaseAdmin as rawSupabaseAdmin } from "@/integrations/supabase/client.server";

const supabaseAdmin = rawSupabaseAdmin as any;

export interface UserPrivacyPreferences {
  userId: string;
  enablePersonalization: boolean;
  enableAiAssistance: boolean;
  enableSearchHistory: boolean;
  updatedAt: string;
}

export async function getUserPrivacyPreferences(userId: string): Promise<UserPrivacyPreferences> {
  try {
    const { data } = await supabaseAdmin
      .from("user_privacy_preferences")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (!data) {
      return {
        userId,
        enablePersonalization: true,
        enableAiAssistance: true,
        enableSearchHistory: true,
        updatedAt: new Date().toISOString(),
      };
    }

    return {
      userId: data.user_id,
      enablePersonalization: data.enable_personalization ?? true,
      enableAiAssistance: data.enable_ai_assistance ?? true,
      enableSearchHistory: data.enable_search_history ?? true,
      updatedAt: data.updated_at,
    };
  } catch (err) {
    console.error("[PrivacyService] Error fetching user privacy preferences:", err);
    return {
      userId,
      enablePersonalization: true,
      enableAiAssistance: true,
      enableSearchHistory: true,
      updatedAt: new Date().toISOString(),
    };
  }
}

export async function updateUserPrivacyPreferences(
  userId: string,
  prefs: Partial<Omit<UserPrivacyPreferences, "userId" | "updatedAt">>,
): Promise<boolean> {
  try {
    const payload = {
      user_id: userId,
      enable_personalization: prefs.enablePersonalization ?? true,
      enable_ai_assistance: prefs.enableAiAssistance ?? true,
      enable_search_history: prefs.enableSearchHistory ?? true,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabaseAdmin.from("user_privacy_preferences").upsert(payload);

    if (error) {
      console.error("[PrivacyService] Error updating privacy preferences:", error.message);
      return false;
    }

    return true;
  } catch (err) {
    console.error("[PrivacyService] Exception updating privacy preferences:", err);
    return false;
  }
}
