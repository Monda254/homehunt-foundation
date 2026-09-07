/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { logger } from "@/core/observability/logger";

export interface IntegrityCheckResult {
  checkName: string;
  passed: boolean;
  anomalyCount: number;
  details: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
}

export interface SystemIntegrityReport {
  timestamp: string;
  overallHealthy: boolean;
  checks: IntegrityCheckResult[];
}

/**
 * Executes a suite of read-only diagnostic queries to verify internal database integrity.
 */
export async function checkSystemIntegrity(): Promise<SystemIntegrityReport> {
  const checks: IntegrityCheckResult[] = [];
  const db = supabaseAdmin as any;

  // Check 1: Units missing parent Property
  try {
    const { data: orphanedUnits, error } = await db
      .from("units")
      .select("id, property_id")
      .is("property_id", null);

    const anomalyCount = orphanedUnits?.length || 0;
    checks.push({
      checkName: "Orphaned Units Check",
      passed: !error && anomalyCount === 0,
      anomalyCount,
      details: anomalyCount > 0 ? `Found ${anomalyCount} units without parent property.` : "All units linked to properties.",
      severity: "HIGH",
    });
  } catch (err: any) {
    checks.push({
      checkName: "Orphaned Units Check",
      passed: false,
      anomalyCount: -1,
      details: `Execution error: ${err?.message || err}`,
      severity: "HIGH",
    });
  }

  // Check 2: Active Tenancies missing Lease record reference
  try {
    const { data: activeTenancies, error } = await db
      .from("tenancies")
      .select("id, lease_id, status")
      .eq("status", "ACTIVE")
      .is("lease_id", null);

    const anomalyCount = activeTenancies?.length || 0;
    checks.push({
      checkName: "Active Tenancy Lease Reference Check",
      passed: !error && anomalyCount === 0,
      anomalyCount,
      details: anomalyCount > 0 ? `Found ${anomalyCount} active tenancies without lease agreement.` : "All active tenancies have linked leases.",
      severity: "CRITICAL",
    });
  } catch (err: any) {
    checks.push({
      checkName: "Active Tenancy Lease Reference Check",
      passed: false,
      anomalyCount: -1,
      details: `Execution error: ${err?.message || err}`,
      severity: "CRITICAL",
    });
  }

  // Check 3: Paid Rent Obligations without corresponding Payment record
  try {
    const { data: paidObligations, error } = await db
      .from("rent_obligations")
      .select("id, status, amount_paid")
      .eq("status", "PAID")
      .eq("amount_paid", 0);

    const anomalyCount = paidObligations?.length || 0;
    checks.push({
      checkName: "Paid Obligation Settlement Invariant",
      passed: !error && anomalyCount === 0,
      anomalyCount,
      details: anomalyCount > 0 ? `Found ${anomalyCount} obligations marked PAID with 0 amount paid.` : "Obligation payment amounts match paid status.",
      severity: "CRITICAL",
    });
  } catch (err: any) {
    checks.push({
      checkName: "Paid Obligation Settlement Invariant",
      passed: false,
      anomalyCount: -1,
      details: `Execution error: ${err?.message || err}`,
      severity: "CRITICAL",
    });
  }

  // Check 4: Duplicate Active Tenancies per Unit
  try {
    const { data: tenancies, error } = await db
      .from("tenancies")
      .select("id, unit_id, status")
      .eq("status", "ACTIVE");

    let duplicateCount = 0;
    if (tenancies) {
      const unitMap = new Map<string, number>();
      for (const t of tenancies) {
        const count = (unitMap.get(t.unit_id) || 0) + 1;
        unitMap.set(t.unit_id, count);
        if (count > 1) duplicateCount++;
      }
    }

    checks.push({
      checkName: "Duplicate Active Tenancy per Unit Check",
      passed: !error && duplicateCount === 0,
      anomalyCount: duplicateCount,
      details: duplicateCount > 0 ? `Found ${duplicateCount} units with multiple active tenancies.` : "No units have duplicate active tenancies.",
      severity: "CRITICAL",
    });
  } catch (err: any) {
    checks.push({
      checkName: "Duplicate Active Tenancy per Unit Check",
      passed: false,
      anomalyCount: -1,
      details: `Execution error: ${err?.message || err}`,
      severity: "CRITICAL",
    });
  }

  const overallHealthy = checks.every((c) => c.passed);
  logger.info("System integrity check completed", { overallHealthy, checkCount: checks.length });

  return {
    timestamp: new Date().toISOString(),
    overallHealthy,
    checks,
  };
}
