/* eslint-disable @typescript-eslint/no-explicit-any */
export type PaymentProviderType = "mpesa" | "mock";

export type PaymentStatusType =
  "PENDING" | "PROCESSING" | "SUCCESSFUL" | "FAILED" | "CANCELLED" | "TIMEOUT" | "REVERSED";

export interface StkPushParams {
  phoneNumber: string; // e.g. "254712345678"
  amount: number; // Authoritative amount in KES
  accountReference: string; // e.g. "HH-TENANCY-REF"
  transactionDesc: string; // e.g. "Rent Deposit Payment"
  obligationId?: string;
  tenancyId: string;
  payerUserId: string;
}

export interface StkPushResponse {
  success: boolean;
  merchantRequestId?: string;
  checkoutRequestId?: string;
  responseCode?: string;
  responseDescription?: string;
  customerMessage?: string;
  error?: string;
}

export interface MpesaCallbackItem {
  Name: string;
  Value?: any;
}

export interface MpesaCallbackPayload {
  Body: {
    stkCallback: {
      MerchantRequestID: string;
      CheckoutRequestID: string;
      ResultCode: number;
      ResultDesc: string;
      CallbackMetadata?: {
        Item: MpesaCallbackItem[];
      };
    };
  };
}

export interface ProcessCallbackResult {
  success: boolean;
  transactionId?: string;
  status: PaymentStatusType;
  providerReference?: string;
  amount?: number;
  phoneNumber?: string;
  message: string;
}

export interface ReconciliationRecord {
  internalTransactionId: string;
  tenancyId: string;
  obligationId?: string;
  expectedAmount: number;
  receivedAmount: number;
  currency: string;
  providerReference?: string;
  status: PaymentStatusType;
  reconciliationStatus: "MATCHED" | "MISSING_EXTERNAL" | "AMOUNT_MISMATCH" | "DUPLICATE";
  notes?: string;
  timestamp: string;
}

export interface IPaymentProvider {
  name: string;
  initiateStkPush(params: StkPushParams): Promise<StkPushResponse>;
  processWebhookCallback(payload: MpesaCallbackPayload): Promise<ProcessCallbackResult>;
}
