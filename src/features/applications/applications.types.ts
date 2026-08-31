import { z } from "zod";

export const APPLICATION_STATUSES = [
  "DRAFT",
  "SUBMITTED",
  "UNDER_REVIEW",
  "ADDITIONAL_INFORMATION_REQUIRED",
  "RESUBMITTED",
  "SHORTLISTED",
  "APPROVED",
  "REJECTED",
  "WITHDRAWN",
  "EXPIRED",
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export const EMPLOYMENT_STATUSES = ["EMPLOYED", "SELF_EMPLOYED", "UNEMPLOYED", "STUDENT"] as const;
export type EmploymentStatus = (typeof EMPLOYMENT_STATUSES)[number];

export const INCOME_RANGES = [
  "Below KES 25,000",
  "KES 25,000 - 50,000",
  "KES 50,000 - 100,000",
  "KES 100,000 - 200,000",
  "Above KES 200,000",
] as const;
export type IncomeRange = (typeof INCOME_RANGES)[number];

export const REJECTION_REASONS = [
  "REQUIREMENTS_NOT_MET",
  "DOCUMENTATION_INCOMPLETE",
  "PROPERTY_NO_LONGER_AVAILABLE",
  "APPLICATION_WITHDRAWN",
  "OTHER",
] as const;
export type RejectionReason = (typeof REJECTION_REASONS)[number];

// Schema for creating an application (initializing draft)
export const CreateApplicationSchema = z.object({
  listingId: z.string().uuid(),
  unitId: z.string().uuid().optional().nullable(),
});

// Schema for updating draft values
export const UpdateDraftSchema = z.object({
  id: z.string().uuid(),
  preferredMoveInDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)")
    .optional()
    .nullable(),
  preferredLeaseMonths: z.number().int().min(1).max(60).optional().nullable(),
  personalInfo: z
    .object({
      fullName: z.string().min(2, "Full name must be at least 2 characters").optional(),
      phoneNumber: z.string().min(10, "Invalid phone number").optional(),
      email: z.string().email("Invalid email address").optional(),
    })
    .optional(),
  employmentInfo: z
    .object({
      status: z.enum(EMPLOYMENT_STATUSES).optional(),
      employer: z.string().optional(),
      occupation: z.string().optional(),
      incomeRange: z.enum(INCOME_RANGES).optional(),
      employmentDuration: z.string().optional(),
    })
    .optional(),
  householdInfo: z
    .object({
      adults: z.number().int().min(1).max(10).optional(),
      children: z.number().int().min(0).max(10).optional(),
      pets: z.boolean().optional(),
      additionalOccupants: z.string().optional(),
    })
    .optional(),
});

// Schema for submitting application
export const SubmitApplicationSchema = z.string().uuid();

// Schema for responding to information requests
export const RespondToRequestSchema = z.object({
  requestId: z.string().uuid(),
  message: z.string().min(5, "Response message must be at least 5 characters"),
  documents: z
    .array(
      z.object({
        requirementId: z.string().uuid().optional().nullable(),
        name: z.string(),
        filePath: z.string(), // private storage path
        fileSize: z.number().int(),
        mimeType: z.string(),
      }),
    )
    .optional(),
});

// Schema for provider requesting additional info
export const RequestAdditionalInfoSchema = z.object({
  applicationId: z.string().uuid(),
  requirementName: z.string().min(2, "Requirement name must be defined"),
  message: z.string().min(5, "Request message must be at least 5 characters"),
  dueDate: z.string().datetime().optional().nullable(),
});

// Schema for recording internal review notes/scoring
export const RecordReviewSchema = z.object({
  applicationId: z.string().uuid(),
  recommendation: z.enum(["APPROVE", "REJECT", "SHORTLIST", "HOLD"]),
  notes: z.string().optional(),
});

// Schema for provider final decision (Approve/Reject)
export const RecordDecisionSchema = z.object({
  applicationId: z.string().uuid(),
  action: z.enum(["APPROVE", "REJECT", "SHORTLIST"]),
  rejectionReason: z.enum(REJECTION_REASONS).optional().nullable(),
  rejectionNotes: z.string().optional().nullable(),
});
