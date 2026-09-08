/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabaseAdmin as rawSupabaseAdmin } from "@/integrations/supabase/client.server";

const supabaseAdmin = rawSupabaseAdmin as any;

export interface TrustTimelineEvent {
  id: string;
  stage:
    | "PROPERTY_CREATED"
    | "CLAIMED"
    | "VERIFIED"
    | "LISTING_PUBLISHED"
    | "VIEWING_COMPLETED"
    | "APPLICATION_SUBMITTED"
    | "LEASE_SIGNED"
    | "PAYMENT_CONFIRMED"
    | "TENANCY_ACTIVATED";
  title: string;
  description: string;
  timestamp: string;
  status: "COMPLETED" | "IN_PROGRESS" | "PENDING";
}

export async function getPropertyTrustTimeline(propertyId: string): Promise<TrustTimelineEvent[]> {
  try {
    const timeline: TrustTimelineEvent[] = [];

    // 1. Property Creation
    const { data: prop } = await supabaseAdmin
      .from("properties")
      .select("id, address, town, created_at, verification_status")
      .eq("id", propertyId)
      .maybeSingle();

    if (prop) {
      timeline.push({
        id: `event-prop-created-${prop.id}`,
        stage: "PROPERTY_CREATED",
        title: "Property Registered",
        description: `Property created at ${prop.address || prop.town || "Nairobi"}`,
        timestamp: prop.created_at || new Date().toISOString(),
        status: "COMPLETED",
      });

      // Verification Status
      if (prop.verification_status === "VERIFIED") {
        timeline.push({
          id: `event-prop-verified-${prop.id}`,
          stage: "VERIFIED",
          title: "Owner Identity & Title Verified",
          description: "Physical inspection and title deed verification completed",
          timestamp: prop.created_at || new Date().toISOString(),
          status: "COMPLETED",
        });
      }
    }

    // 2. Listing Publication
    const { data: listings } = await supabaseAdmin
      .from("listings")
      .select("id, title, status, created_at")
      .eq("property_id", propertyId);

    if (listings && listings.length > 0) {
      listings.forEach((l: any) => {
        timeline.push({
          id: `event-listing-${l.id}`,
          stage: "LISTING_PUBLISHED",
          title: "Listing Published",
          description: l.title || "Rental listing active on HomeHunt marketplace",
          timestamp: l.created_at,
          status: "COMPLETED",
        });
      });
    }

    // Sort chronologically ascending
    timeline.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    return timeline;
  } catch (err) {
    console.error("[TrustGraphService] Error assembling trust timeline:", err);
    return [];
  }
}
