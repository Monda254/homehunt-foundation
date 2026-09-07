import { supabaseAdmin as rawSupabaseAdmin } from "@/integrations/supabase/client.server";

const supabaseAdmin = rawSupabaseAdmin as any;

export interface DuplicateCandidateRecord {
  id: string;
  listingId1: string;
  listingId2: string;
  listing1Title: string;
  listing2Title: string;
  similarityScore: number;
  reason: string;
  status: "OPEN" | "CONFIRMED" | "DISMISSED";
  createdAt: string;
}

export async function scanForDuplicateListings(listingId: string): Promise<DuplicateCandidateRecord[]> {
  try {
    // Fetch target listing
    const { data: targetListing } = await supabaseAdmin
      .from("listings")
      .select("id, title, rent_amount, town, bedrooms, property_type, description")
      .eq("id", listingId)
      .maybeSingle();

    if (!targetListing) return [];

    // Fetch comparison listings in same town & bedrooms
    const { data: otherListings } = await supabaseAdmin
      .from("listings")
      .select("id, title, rent_amount, town, bedrooms, property_type, description")
      .eq("town", targetListing.town || "Nairobi")
      .eq("bedrooms", targetListing.bedrooms || 1)
      .neq("id", listingId)
      .limit(20);

    if (!otherListings || otherListings.length === 0) return [];

    const candidates: DuplicateCandidateRecord[] = [];

    for (const other of otherListings) {
      let score = 0;
      const reasons: string[] = [];

      // Rent match within 5%
      const targetRent = Number(targetListing.rent_amount) || 0;
      const otherRent = Number(other.rent_amount) || 0;
      if (targetRent > 0 && Math.abs(targetRent - otherRent) / targetRent <= 0.05) {
        score += 40;
        reasons.push(`Identical rent amount (KSh ${targetRent.toLocaleString()})`);
      }

      // Title / Description text similarity
      const title1 = (targetListing.title || "").toLowerCase();
      const title2 = (other.title || "").toLowerCase();
      if (title1 && title2 && (title1.includes(title2) || title2.includes(title1))) {
        score += 45;
        reasons.push("High title similarity");
      }

      if (score >= 70) {
        const candidatePayload = {
          listing_id_1: listingId,
          listing_id_2: other.id,
          similarity_score: score,
          reason: reasons.join("; "),
          status: "OPEN",
        };

        const { data: inserted } = await supabaseAdmin
          .from("duplicate_candidates")
          .upsert(candidatePayload, { onConflict: "listing_id_1,listing_id_2" })
          .select("id, created_at")
          .maybeSingle();

        candidates.push({
          id: inserted?.id || `dup-${other.id}`,
          listingId1: listingId,
          listingId2: other.id,
          listing1Title: targetListing.title || "Target Listing",
          listing2Title: other.title || "Compare Listing",
          similarityScore: score,
          reason: reasons.join("; "),
          status: "OPEN",
          createdAt: inserted?.created_at || new Date().toISOString(),
        });
      }
    }

    return candidates;
  } catch (err) {
    console.error("[DuplicateDetectionService] Error scanning duplicate listings:", err);
    return [];
  }
}

export async function getOpenDuplicateCandidates(): Promise<DuplicateCandidateRecord[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from("duplicate_candidates")
      .select("*, listing1:listings!listing_id_1(title), listing2:listings!listing_id_2(title)")
      .eq("status", "OPEN")
      .order("similarity_score", { ascending: false });

    if (error || !data) return [];

    return data.map((d: any) => ({
      id: d.id,
      listingId1: d.listing_id_1,
      listingId2: d.listing_id_2,
      listing1Title: d.listing1?.title || d.listing_id_1,
      listing2Title: d.listing2?.title || d.listing_id_2,
      similarityScore: Number(d.similarity_score),
      reason: d.reason,
      status: d.status,
      createdAt: d.created_at,
    }));
  } catch (err) {
    console.error("[DuplicateDetectionService] Error fetching duplicate candidates:", err);
    return [];
  }
}

export async function updateDuplicateCandidateStatus(
  candidateId: string,
  status: "CONFIRMED" | "DISMISSED"
): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin
      .from("duplicate_candidates")
      .update({ status })
      .eq("id", candidateId);

    return !error;
  } catch (err) {
    console.error("[DuplicateDetectionService] Error updating status:", err);
    return false;
  }
}
