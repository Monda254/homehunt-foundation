import { z } from "zod";

export const TENANCY_STATUSES = [
  "PENDING",
  "LEASE_PREPARATION",
  "AWAITING_ACCEPTANCE",
  "ACTIVE",
  "MOVE_IN_PENDING",
  "OCCUPIED",
  "NOTICE_GIVEN",
  "ENDED",
  "TERMINATED",
  "CANCELLED",
] as const;
export type TenancyStatus = (typeof TENANCY_STATUSES)[number];

export const LEASE_STATUSES = [
  "DRAFT",
  "READY_FOR_REVIEW",
  "SENT_TO_TENANT",
  "TENANT_ACCEPTED",
  "PROVIDER_ACCEPTED",
  "EXECUTED",
  "ACTIVE",
  "EXPIRED",
  "TERMINATED",
] as const;
export type LeaseStatus = (typeof LEASE_STATUSES)[number];

export const MOVE_IN_STATUSES = ["SCHEDULED", "RESCHEDULED", "COMPLETED", "CANCELLED"] as const;
export type MoveInStatus = (typeof MOVE_IN_STATUSES)[number];

export const TERMINATION_REASONS = ["LEASE_EXPIRED", "MUTUAL_END", "TERMINATION", "OTHER"] as const;
export type TerminationReason = (typeof TERMINATION_REASONS)[number];

// Schema to create tenancy from approved application
export const CreateTenancySchema = z.object({
  applicationId: z.string().uuid(),
});

// Schema to prepare or update lease details
export const PrepareLeaseSchema = z.object({
  tenancyId: z.string().uuid(),
  rentAmount: z.number().positive("Rent must be greater than zero"),
  depositAmount: z.number().nonnegative("Deposit must be non-negative"),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Start date must be YYYY-MM-DD"),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "End date must be YYYY-MM-DD"),
  terms: z
    .object({
      petsPolicy: z.string().optional(),
      utilitiesResponsibility: z.string().optional(),
      noticePeriodDays: z.number().int().nonnegative().optional(),
      occupancyLimit: z.number().int().positive().optional(),
      permittedUse: z.string().optional(),
      otherRules: z.string().optional(),
    })
    .optional()
    .default({}),
});

// Schema to accept a lease (by tenant)
export const AcceptLeaseSchema = z.object({
  leaseId: z.string().uuid(),
});

// Schema to decline a lease / request correction (by tenant)
export const DeclineLeaseSchema = z.object({
  leaseId: z.string().uuid(),
  notes: z.string().min(5, "Reason for correction must be at least 5 characters"),
});

// Schema to schedule the move-in inspection
export const ScheduleMoveInSchema = z.object({
  tenancyId: z.string().uuid(),
  scheduledDate: z.string().datetime("Invalid ISO date format"),
});

// Schema to complete move-in checklist
export const CompleteMoveInSchema = z.object({
  tenancyId: z.string().uuid(),
  actualDate: z.string().datetime("Invalid ISO date format"),
  checklist: z.object({
    keysReceived: z.boolean(),
    accessConfirmed: z.boolean(),
    conditionDocumented: z.boolean(),
    utilityInfoProvided: z.boolean(),
  }),
  conditionNotes: z.string().optional(),
  conditionMedia: z.array(z.string()).optional().default([]),
});

// Schema to record tenancy ending / termination
export const EndTenancySchema = z.object({
  tenancyId: z.string().uuid(),
  reason: z.enum(TERMINATION_REASONS),
  notes: z.string().optional(),
});
