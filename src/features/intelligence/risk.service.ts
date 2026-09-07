import { supabaseAdmin as rawSupabaseAdmin } from "@/integrations/supabase/client.server";

const supabaseAdmin = rawSupabaseAdmin as any;

export type RiskSignalType =
  | "PRICE_ANOMALY"
  | "DUPLICATE_CONTENT"
  | "SUSPICIOUS_PAYMENT_RETRY"
  | "REPORT_SPIKE"
  | "INCOMPLETE_VERIFICATION";

export type RiskConfidence = "LOW" | "MEDIUM" | "HIGH";
export type RiskStatus = "OPEN" | "INVESTIGATING" | "CONFIRMED" | "DISMISSED" | "RESOLVED";

export interface RiskSignalRecord {
  id: string;
  entityType: string;
  entityId: string;
  signalType: RiskSignalType;
  confidence: RiskConfidence;
  reason: string;
  status: RiskStatus;
  createdAt: string;
  updatedAt: string;
}

export async function scanListingForRiskSignals(listingId: string): Promise<RiskSignalRecord[]> {
  const generatedSignals: RiskSignalRecord[] = [];

  try {
    const { data: listing } = await supabaseAdmin
      .from("listings")
      .select("*, properties(*)")
      .eq("id", listingId)
      .maybeSingle();

    if (!listing) return [];

    const rent = listing.rent_amount || listing.properties?.rent_amount || 0;
    const town = listing.town || listing.properties?.town || "Nairobi";

    // 1. Price Anomaly Detection (Suspiciously cheap < KSh 5,000 for Nairobi multi-bedroom)
    if (rent > 0 && rent < 5000 && (listing.bedrooms || 1) >= 2) {
      const reason = `Rent price of KSh ${rent.toLocaleString()} for a ${listing.bedrooms || 2}-bedroom unit in ${town} is 60%+ below town median. Verify owner identity and lease documentation.`;
      
      const signal = await createOrUpdateRiskSignal({
        entityType: "LISTING",
        entityId: listingId,
        signalType: "PRICE_ANOMALY",
        confidence: "HIGH",
        reason,
      });

      if (signal) generatedSignals.push(signal);
    }

    // 2. Report Spike Detection
    const { count: reportsCount } = await supabaseAdmin
      .from("analytics_events")
      .select("id", { count: "exact", head: true })
      .eq("event_name", "LISTING_REPORTED")
      .eq("entity_id", listingId);

    if ((reportsCount || 0) >= 2) {
      const reason = `Listing has received ${reportsCount} community report(s). Prompt administrative review recommended.`;
      
      const signal = await createOrUpdateRiskSignal({
        entityType: "LISTING",
        entityId: listingId,
        signalType: "REPORT_SPIKE",
        confidence: "HIGH",
        reason,
      });

      if (signal) generatedSignals.push(signal);
    }

    // 3. High Value Unverified Listing Detection
    const vStatus = listing.verification_status || listing.properties?.verification_status;
    if (rent >= 100000 && vStatus !== "VERIFIED") {
      const reason = `High-value listing (KSh ${rent.toLocaleString()}/mo) published without completed identity or property ownership verification.`;
      
      const signal = await createOrUpdateRiskSignal({
        entityType: "LISTING",
        entityId: listingId,
        signalType: "INCOMPLETE_VERIFICATION",
        confidence: "MEDIUM",
        reason,
      });

      if (signal) generatedSignals.push(signal);
    }

    return generatedSignals;
  } catch (err) {
    console.error("[RiskService] Error scanning listing for risk signals:", err);
    return [];
  }
}

export async function createOrUpdateRiskSignal(params: {
  entityType: string;
  entityId: string;
  signalType: RiskSignalType;
  confidence: RiskConfidence;
  reason: string;
}): Promise<RiskSignalRecord | null> {
  try {
    const { data: existing } = await supabaseAdmin
      .from("risk_signals")
      .select("*")
      .eq("entity_type", params.entityType)
      .eq("entity_id", params.entityId)
      .eq("signal_type", params.signalType)
      .maybeSingle();

    if (existing) {
      return {
        id: existing.id,
        entityType: existing.entity_type,
        entityId: existing.entity_id,
        signalType: existing.signal_type,
        confidence: existing.confidence,
        reason: existing.reason,
        status: existing.status,
        createdAt: existing.created_at,
        updatedAt: existing.updated_at,
      };
    }

    const { data, error } = await supabaseAdmin
      .from("risk_signals")
      .insert({
        entity_type: params.entityType,
        entity_id: params.entityId,
        signal_type: params.signalType,
        confidence: params.confidence,
        reason: params.reason,
        status: "OPEN",
      })
      .select("*")
      .single();

    if (error || !data) {
      console.error("[RiskService] Error creating risk signal:", error);
      return null;
    }

    return {
      id: data.id,
      entityType: data.entity_type,
      entityId: data.entity_id,
      signalType: data.signal_type,
      confidence: data.confidence,
      reason: data.reason,
      status: data.status,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  } catch (err) {
    console.error("[RiskService] Exception creating risk signal:", err);
    return null;
  }
}

export async function getActiveRiskSignals(limit: number = 20): Promise<RiskSignalRecord[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from("risk_signals")
      .select("*")
      .in("status", ["OPEN", "INVESTIGATING"])
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error || !data) return [];

    return data.map((r: any) => ({
      id: r.id,
      entityType: r.entity_type,
      entityId: r.entity_id,
      signalType: r.signal_type,
      confidence: r.confidence,
      reason: r.reason,
      status: r.status,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }));
  } catch (err) {
    console.error("[RiskService] Error fetching risk signals:", err);
    return [];
  }
}

export async function updateRiskSignalStatus(
  signalId: string,
  newStatus: RiskStatus
): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin
      .from("risk_signals")
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", signalId);

    if (error) {
      console.error("[RiskService] Error updating risk signal status:", error.message);
      return false;
    }

    return true;
  } catch (err) {
    console.error("[RiskService] Exception updating risk signal status:", err);
    return false;
  }
}
