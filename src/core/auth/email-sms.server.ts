/**
 * Email and SMS services (server-only).
 *
 * Provides a modular interface for sending notifications.
 * In development, output is written to structured console logger.
 */

import { logger } from "../observability/logger";
import { readServerConfig } from "../config/server-config";

export interface EmailService {
  sendVerificationEmail(email: string, token: string, customBaseUrl?: string): Promise<void>;
  sendPasswordResetEmail(email: string, token: string, customBaseUrl?: string): Promise<void>;
}

export interface SmsService {
  sendVerificationSms(phoneNumber: string, otp: string): Promise<void>;
}

// In a real staging/production environment, this would initialize an SMTP client
// or integrate with an external transactional service like Resend, Mailgun, etc.
export const emailService: EmailService = {
  async sendVerificationEmail(email: string, token: string, customBaseUrl?: string): Promise<void> {
    const config = readServerConfig();
    const isDev = !config.ok || config.config.APP_ENV === "development";

    // Construct local or production redirect link
    const baseUrl = customBaseUrl || (isDev ? "http://localhost:8080" : "https://homehunt.dev");
    const verificationLink = `${baseUrl}/verify-email?token=${token}`;

    logger.info("Email verification dispatched", {
      event: "email.verification_sent",
      recipient: email,
      ...(isDev ? { localUrl: verificationLink } : {}),
    });

    if (isDev) {
      console.log("\n============================================================");
      console.log(`[DEVELOPMENT EMAIL SENDER] TO: ${email}`);
      console.log("Please click the link below to verify your account:");
      console.log(verificationLink);
      console.log("============================================================\n");
    }
  },

  async sendPasswordResetEmail(email: string, token: string, customBaseUrl?: string): Promise<void> {
    const config = readServerConfig();
    const isDev = !config.ok || config.config.APP_ENV === "development";

    const baseUrl = customBaseUrl || (isDev ? "http://localhost:8080" : "https://homehunt.dev");
    const resetLink = `${baseUrl}/reset-password?token=${token}`;

    logger.info("Password reset dispatched", {
      event: "email.password_reset_sent",
      recipient: email,
      ...(isDev ? { localUrl: resetLink } : {}),
    });

    if (isDev) {
      console.log("\n============================================================");
      console.log(`[DEVELOPMENT EMAIL SENDER] TO: ${email}`);
      console.log("Please click the link below to reset your password:");
      console.log(resetLink);
      console.log("============================================================\n");
    }
  },
};

// Prepared for Africa's Talking, Twilio, or another SMS API
export const smsService: SmsService = {
  async sendVerificationSms(phoneNumber: string, otp: string): Promise<void> {
    const config = readServerConfig();
    const isDev = !config.ok || config.config.APP_ENV === "development";

    logger.info("SMS OTP verification dispatched", {
      event: "sms.otp_sent",
      recipient: phoneNumber,
      ...(isDev ? { otp } : {}),
    });

    if (isDev) {
      console.log("\n============================================================");
      console.log(`[DEVELOPMENT SMS SENDER] TO: ${phoneNumber}`);
      console.log(`Your OTP code is: ${otp}`);
      console.log("============================================================\n");
    }
  },
};
