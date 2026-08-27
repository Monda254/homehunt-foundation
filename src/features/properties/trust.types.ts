import { z } from "zod";

export const VERIFICATION_STATUSES = [
  "UNVERIFIED",
  "PENDING",
  "UNDER_REVIEW",
  "VERIFIED",
  "REJECTED",
  "EXPIRED",
  "REVOKED",
] as const;
export type VerificationStatus = (typeof VERIFICATION_STATUSES)[number];

export const VERIFICATION_TYPES = [
  "IDENTITY",
  "PROPERTY_OWNERSHIP",
  "PROPERTY_EXISTENCE",
  "LISTING",
  "CONTACT",
  "AGENT",
  "LANDLORD",
] as const;
export type VerificationType = (typeof VERIFICATION_TYPES)[number];

export const EVIDENCE_STATUSES = ["PENDING", "APPROVED", "REJECTED"] as const;
export type EvidenceStatus = (typeof EVIDENCE_STATUSES)[number];

export const LISTING_FRESHNESS_STATUSES = [
  "CURRENT",
  "STALE",
  "REQUIRES_REVALIDATION",
  "EXPIRED",
] as const;
export type ListingFreshnessStatus = (typeof LISTING_FRESHNESS_STATUSES)[number];

export const REPORT_STATUSES = [
  "OPEN",
  "UNDER_REVIEW",
  "RESOLVED",
  "DISMISSED",
  "ESCALATED",
] as const;
export type ReportStatus = (typeof REPORT_STATUSES)[number];

export const RISK_SEVERITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;
export type RiskSeverity = (typeof RISK_SEVERITIES)[number];

export const RISK_STATUSES = ["OPEN", "RESOLVED", "DISMISSED"] as const;
export type RiskStatus = (typeof RISK_STATUSES)[number];

export const CLAIM_STATUSES = ["PENDING", "APPROVED", "REJECTED", "WITHDRAWN"] as const;
export type ClaimStatus = (typeof CLAIM_STATUSES)[number];

export const APPEAL_STATUSES = ["APPEAL_SUBMITTED", "UNDER_REVIEW", "UPHELD", "REVERSED"] as const;
export type AppealStatus = (typeof APPEAL_STATUSES)[number];

// Zod Validation Schemas
export const SubmitVerificationSchema = z.object({
  subjectType: z.enum(["USER", "PROPERTY", "LISTING"]),
  subjectId: z.string().uuid(),
  verificationType: z.enum(VERIFICATION_TYPES),
  evidence: z
    .array(
      z.object({
        evidenceType: z.string().min(2).max(100),
        storageReference: z.string().min(5),
      }),
    )
    .min(1, "At least one piece of evidence is required"),
});

export const ReviewVerificationSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["VERIFIED", "REJECTED", "UNDER_REVIEW"]),
  rejectionReason: z.string().optional(),
});

export const RevokeVerificationSchema = z.object({
  id: z.string().uuid(),
  revocationReason: z.string().min(5, "Reason must be at least 5 characters long"),
});

export const SubmitClaimSchema = z.object({
  propertyId: z.string().uuid(),
  evidence: z
    .array(
      z.object({
        evidenceType: z.string().min(2).max(100),
        storageReference: z.string().min(5),
      }),
    )
    .min(1, "At least one piece of ownership evidence is required"),
});

export const ResolveClaimSchema = z.object({
  id: z.string().uuid(),
  action: z.enum(["APPROVE", "REJECT"]),
  rejectionReason: z.string().optional(),
});

export const SubmitReportSchema = z.object({
  listingId: z.string().uuid(),
  reason: z.enum([
    "WRONG_PRICE",
    "PROPERTY_UNAVAILABLE",
    "FAKE_LISTING",
    "WRONG_LOCATION",
    "MISLEADING_PHOTOS",
    "DUPLICATE_LISTING",
    "SUSPICIOUS_PAYMENT_REQUEST",
    "IMPERSONATION",
    "OTHER",
  ]),
  description: z.string().max(1000).optional(),
});

export const ResolveReportSchema = z.object({
  id: z.string().uuid(),
  action: z.enum(["RESOLVE", "DISMISS", "ESCALATE"]),
  resolution: z.string().optional(),
});

export const SubmitAppealSchema = z.object({
  targetType: z.enum(["VERIFICATION", "LISTING_SUSPENSION", "PROPERTY_CLAIM"]),
  targetId: z.string().uuid(),
  reason: z.string().min(10, "Reason must be at least 10 characters long").max(1000),
});

export const ResolveAppealSchema = z.object({
  id: z.string().uuid(),
  action: z.enum(["UPHELD", "REVERSED"]),
  notes: z.string().optional(),
});

// Safe Public Trust DTO
export interface PublicTrustDto {
  identityVerified: boolean;
  propertyVerified: boolean;
  listingVerified: boolean;
  lastVerifiedAt: string | null;
  freshnessStatus: ListingFreshnessStatus;
  priceConfirmedAt: string | null;
  availabilityConfirmedAt: string | null;
}
