/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabaseAdmin as rawSupabaseAdmin } from "@/integrations/supabase/client.server";
import { logger } from "@/core/observability/logger";
import { type ReconciliationRecord } from "./payment.types";

const supabaseAdmin = rawSupabaseAdmin as any;

export class PaymentReconciliationService {
  /**
   * Performs an automated reconciliation audit comparing internal ledger records with payment transactions.
   */
  static async reconcileTenancyPayments(tenancyId: string): Promise<ReconciliationRecord[]> {
    const records: ReconciliationRecord[] = [];

    try {
      // 1. Fetch internal payment transactions
      const { data: transactions } = await supabaseAdmin
        .from("payment_transactions")
        .select("*, obligation:rent_obligations(*)")
        .eq("tenancy_id", tenancyId);

      if (!transactions || transactions.length === 0) {
        return [];
      }

      // 2. Fetch double-entry ledger entries for verification
      const { data: ledgerEntries } = await supabaseAdmin
        .from("ledger_entries")
        .select("*")
        .eq("tenancy_id", tenancyId);

      const ledgerTxIds = new Set((ledgerEntries || []).map((l: any) => l.transaction_id));

      for (const tx of transactions) {
        const expectedAmount = tx.obligation ? Number(tx.obligation.amount) : Number(tx.amount);
        const receivedAmount = Number(tx.amount);
        const hasLedger = ledgerTxIds.has(tx.id);

        let reconciliationStatus: ReconciliationRecord["reconciliationStatus"] = "MATCHED";
        let notes = "Ledger and transaction amounts match.";

        if (tx.status === "SUCCESSFUL" && !hasLedger) {
          reconciliationStatus = "MISSING_EXTERNAL";
          notes = "Transaction is marked successful but missing corresponding ledger entry.";
        } else if (expectedAmount > 0 && Math.abs(expectedAmount - receivedAmount) > 0.01) {
          reconciliationStatus = "AMOUNT_MISMATCH";
          notes = `Expected KSh ${expectedAmount.toLocaleString()} but received KSh ${receivedAmount.toLocaleString()}.`;
        }

        records.push({
          internalTransactionId: tx.id,
          tenancyId: tx.tenancy_id,
          obligationId: tx.obligation_id,
          expectedAmount,
          receivedAmount,
          currency: tx.currency || "KES",
          providerReference: tx.provider_reference,
          status: tx.status,
          reconciliationStatus,
          notes,
          timestamp: tx.completed_at || tx.created_at,
        });
      }

      logger.info("[PaymentReconciliation] Completed tenancy reconciliation audit:", {
        tenancyId,
        count: records.length,
      });

      return records;
    } catch (err: any) {
      logger.error("[PaymentReconciliation] Exception during reconciliation audit:", {
        tenancyId,
        error: err.message,
      });
      return [];
    }
  }
}
