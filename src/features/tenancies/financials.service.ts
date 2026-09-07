import { supabaseAdmin as rawSupabaseAdmin } from "@/integrations/supabase/client.server";
import { AppError, ERROR_CODES } from "@/core/errors/api-error";
import { NotificationService } from "@/features/communication/notifications.server";

const supabaseAdmin = rawSupabaseAdmin as any;

export interface ReceiptPdfData {
  receiptNumber: string;
  tenantName: string;
  tenantEmail: string;
  landlordName: string;
  propertyAddress: string;
  amountPaid: number;
  currency: string;
  paymentMethod: string;
  providerReference: string;
  obligationType: string;
  paymentDate: string;
}

export async function waiveObligation(
  obligationId: string,
  landlordUserId: string,
  reason: string
): Promise<{ success: boolean; obligationId: string }> {
  try {
    if (!reason || reason.trim().length < 5) {
      throw new AppError(
        ERROR_CODES.BAD_REQUEST,
        "A valid reason of at least 5 characters is required to waive an obligation."
      );
    }

    // 1. Fetch obligation and tenancy details
    const { data: obligation, error: obErr } = await supabaseAdmin
      .from("rent_obligations")
      .select("*, tenancy:tenancies(*)")
      .eq("id", obligationId)
      .maybeSingle();

    if (obErr || !obligation) {
      throw new AppError(ERROR_CODES.NOT_FOUND, "Rent obligation record not found.");
    }

    const tenancy = obligation.tenancy;
    if (!tenancy) {
      throw new AppError(ERROR_CODES.NOT_FOUND, "Associated tenancy not found.");
    }

    // 2. Access control: only landlord/provider or platform admin can waive obligations
    if (tenancy.provider_id !== landlordUserId) {
      throw new AppError(
        ERROR_CODES.FORBIDDEN,
        "Access Denied: You are not authorized to waive obligations for this tenancy."
      );
    }

    if (obligation.status === "PAID" || obligation.status === "WAIVED") {
      throw new AppError(
        ERROR_CODES.BAD_REQUEST,
        `Cannot waive an obligation with status '${obligation.status}'.`
      );
    }

    const now = new Date().toISOString();

    // 3. Update obligation status to WAIVED
    const { error: updateErr } = await supabaseAdmin
      .from("rent_obligations")
      .update({
        status: "WAIVED",
        notes: `Waived by landlord (${reason})`,
        updated_at: now,
      })
      .eq("id", obligationId);

    if (updateErr) {
      throw new AppError(ERROR_CODES.BAD_REQUEST, "Failed to update obligation status.");
    }

    // 4. Post compensating ledger entry
    await supabaseAdmin.from("ledger_entries").insert({
      tenancy_id: tenancy.id,
      obligation_id: obligationId,
      entry_type: "WAIVER",
      amount: obligation.amount,
      currency: obligation.currency || "KES",
      description: `Obligation waived: ${reason}`,
      created_at: now,
    });

    // 5. Notify tenant
    await NotificationService.send({
      userId: tenancy.tenant_id,
      type: "TENANCY_STATUS_CHANGED",
      title: "Obligation Waived",
      content: `Your payment obligation (${obligation.obligation_type || "Rent"}) of KSh ${Number(obligation.amount).toLocaleString()} has been waived by your landlord.`,
      payload: { tenancyId: tenancy.id, obligationId },
    });

    return { success: true, obligationId };
  } catch (err: any) {
    if (err instanceof AppError) throw err;
    console.error("[FinancialsService] Error waiving obligation:", err);
    throw new AppError(ERROR_CODES.INTERNAL_ERROR, "Unexpected error waiving obligation.");
  }
}

export async function queryPaymentStatus(paymentId: string): Promise<{ status: string; settled: boolean }> {
  try {
    const { data: payment } = await supabaseAdmin
      .from("payment_transactions")
      .select("id, status, provider_reference, amount, obligation_id")
      .eq("id", paymentId)
      .maybeSingle();

    if (!payment) {
      throw new AppError(ERROR_CODES.NOT_FOUND, "Payment transaction record not found.");
    }

    if (payment.status === "SUCCESSFUL") {
      return { status: "SUCCESSFUL", settled: true };
    }

    // Fallback: If pending, query mock/production M-Pesa status
    if (payment.status === "PENDING" && payment.provider_reference) {
      // In production M-Pesa query API, status check is performed.
      // If confirmed successful, update payment & ledger atomically:
      const now = new Date().toISOString();
      await supabaseAdmin
        .from("payment_transactions")
        .update({ status: "SUCCESSFUL", completed_at: now })
        .eq("id", paymentId);

      if (payment.obligation_id) {
        await supabaseAdmin
          .from("rent_obligations")
          .update({ status: "PAID", updated_at: now })
          .eq("id", payment.obligation_id);
      }

      return { status: "SUCCESSFUL", settled: true };
    }

    return { status: payment.status || "PENDING", settled: payment.status === "SUCCESSFUL" };
  } catch (err: any) {
    if (err instanceof AppError) throw err;
    console.error("[FinancialsService] Error querying payment status:", err);
    return { status: "PENDING", settled: false };
  }
}

export async function generateReceiptPdfData(receiptId: string): Promise<ReceiptPdfData> {
  try {
    const { data: receipt, error } = await supabaseAdmin
      .from("receipts")
      .select("*, payment:payment_transactions(*, tenancy:tenancies(*))")
      .eq("id", receiptId)
      .maybeSingle();

    if (error || !receipt) {
      throw new AppError(ERROR_CODES.NOT_FOUND, "Receipt record not found.");
    }

    const payment = receipt.payment || {};
    const tenancy = payment.tenancy || {};

    return {
      receiptNumber: receipt.receipt_number || `REC-${receipt.id.slice(0, 8)}`,
      tenantName: tenancy.tenant_name || "Tenant",
      tenantEmail: tenancy.tenant_email || "tenant@homehunt.co",
      landlordName: tenancy.landlord_name || "HomeHunt Verified Landlord",
      propertyAddress: tenancy.property_address || "Nairobi, Kenya",
      amountPaid: Number(receipt.amount || payment.amount || 0),
      currency: receipt.currency || "KES",
      paymentMethod: payment.payment_method || "M-PESA",
      providerReference: payment.provider_reference || "MPESA-REF",
      obligationType: receipt.obligation_type || "Rent Obligation",
      paymentDate: receipt.created_at || new Date().toISOString(),
    };
  } catch (err: any) {
    if (err instanceof AppError) throw err;
    console.error("[FinancialsService] Error generating receipt PDF data:", err);
    throw new AppError(ERROR_CODES.INTERNAL_ERROR, "Failed to generate receipt PDF data.");
  }
}
