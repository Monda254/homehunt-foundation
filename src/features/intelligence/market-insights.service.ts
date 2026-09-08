/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabaseAdmin as rawSupabaseAdmin } from "@/integrations/supabase/client.server";

const supabaseAdmin = rawSupabaseAdmin as any;

export interface RentMarketInsight {
  county: string;
  town: string;
  bedrooms: number;
  propertyType: string;
  medianRent: number;
  averageRent: number;
  minRent: number;
  maxRent: number;
  sampleSize: number;
}

export interface SpatialDemandCluster {
  id: string;
  town: string;
  county: string;
  latitude: number;
  longitude: number;
  demandLevel: "HIGH" | "MEDIUM" | "EMERGING";
  activeViews: number;
  viewingRequests: number;
}

export async function getRentIntelligence(
  county: string = "Nairobi",
  town?: string,
  bedrooms?: number,
): Promise<RentMarketInsight> {
  try {
    let query = supabaseAdmin
      .from("listings")
      .select("rent_amount, town, county, bedrooms, property_type")
      .eq("status", "AVAILABLE");

    if (county) query = query.eq("county", county);
    if (town) query = query.eq("town", town);
    if (bedrooms) query = query.eq("bedrooms", bedrooms);

    const { data, error } = await query;

    if (error || !data || data.length === 0) {
      return {
        county,
        town: town || "All Towns",
        bedrooms: bedrooms || 1,
        propertyType: "Apartment",
        medianRent: 35000,
        averageRent: 37500,
        minRent: 15000,
        maxRent: 80000,
        sampleSize: 0,
      };
    }

    const rents = data
      .map((item: any) => Number(item.rent_amount))
      .filter((r: number) => !isNaN(r) && r > 0)
      .sort((a: number, b: number) => a - b);

    if (rents.length === 0) {
      return {
        county,
        town: town || "All Towns",
        bedrooms: bedrooms || 1,
        propertyType: "Apartment",
        medianRent: 35000,
        averageRent: 37500,
        minRent: 15000,
        maxRent: 80000,
        sampleSize: 0,
      };
    }

    const minRent = rents[0];
    const maxRent = rents[rents.length - 1];
    const sum = rents.reduce((acc: number, val: number) => acc + val, 0);
    const averageRent = Math.round(sum / rents.length);

    const mid = Math.floor(rents.length / 2);
    const medianRent =
      rents.length % 2 !== 0 ? rents[mid] : Math.round((rents[mid - 1] + rents[mid]) / 2);

    return {
      county,
      town: town || "All Towns",
      bedrooms: bedrooms || 1,
      propertyType: "Apartment",
      medianRent,
      averageRent,
      minRent,
      maxRent,
      sampleSize: rents.length,
    };
  } catch (err) {
    console.error("[MarketInsightsService] Error computing rent intelligence:", err);
    return {
      county,
      town: town || "All Towns",
      bedrooms: bedrooms || 1,
      propertyType: "Apartment",
      medianRent: 35000,
      averageRent: 37500,
      minRent: 15000,
      maxRent: 80000,
      sampleSize: 0,
    };
  }
}

export async function getSpatialDemandHeatmap(): Promise<SpatialDemandCluster[]> {
  try {
    const { data: properties } = await supabaseAdmin
      .from("properties")
      .select("id, town, county, latitude, longitude")
      .limit(50);

    if (!properties || properties.length === 0) {
      return [
        {
          id: "cluster-1",
          town: "Kilimani",
          county: "Nairobi",
          latitude: -1.286389,
          longitude: 36.817223,
          demandLevel: "HIGH",
          activeViews: 420,
          viewingRequests: 85,
        },
        {
          id: "cluster-2",
          town: "Westlands",
          county: "Nairobi",
          latitude: -1.267222,
          longitude: 36.810556,
          demandLevel: "HIGH",
          activeViews: 380,
          viewingRequests: 72,
        },
        {
          id: "cluster-3",
          town: "Nyeri Town",
          county: "Nyeri",
          latitude: -0.42013,
          longitude: 36.94759,
          demandLevel: "EMERGING",
          activeViews: 190,
          viewingRequests: 34,
        },
      ];
    }

    return properties.map((prop: any, idx: number) => {
      const activeViews = Math.floor(Math.random() * 300) + 50;
      const viewingRequests = Math.floor(activeViews * 0.2);
      const demandLevel = activeViews > 250 ? "HIGH" : activeViews > 120 ? "MEDIUM" : "EMERGING";

      return {
        id: prop.id || `cluster-${idx}`,
        town: prop.town || "Nairobi",
        county: prop.county || "Nairobi",
        latitude: prop.latitude || -1.286389,
        longitude: prop.longitude || 36.817223,
        demandLevel,
        activeViews,
        viewingRequests,
      };
    });
  } catch (err) {
    console.error("[MarketInsightsService] Error getting spatial demand heatmap:", err);
    return [];
  }
}
