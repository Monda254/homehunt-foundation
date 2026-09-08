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

    const baseUrl = customBaseUrl || (isDev ? "http://localhost:8080" : "https://homehunt.co.ke");
    const verificationLink = `${baseUrl}/verify-email?token=${token}`;

    const resendApiKey = process.env.RESEND_API_KEY;

    logger.info("Email verification dispatched", {
      event: "email.verification_sent",
      recipient: email,
      provider: resendApiKey ? "Resend" : "LoggerFallback",
      ...(isDev ? { localUrl: verificationLink } : {}),
    });

    if (resendApiKey) {
      try {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "HomeHunt <no-reply@homehunt.co.ke>",
            to: [email],
            subject: "Verify your HomeHunt Account",
            html: `<p>Welcome to HomeHunt! Click <a href="${verificationLink}">here</a> to verify your account.</p>`,
          }),
        });
      } catch (err: unknown) {
        logger.error("Failed to send email via Resend provider:", {
          error: (err as Error).message,
        });
      }
    } else {
      console.log("\n============================================================");
      console.log(`[DEVELOPMENT EMAIL SENDER] TO: ${email}`);
      console.log("Please click the link below to verify your account:");
      console.log(verificationLink);
      console.log("============================================================\n");
    }
  },

  async sendPasswordResetEmail(
    email: string,
    token: string,
    customBaseUrl?: string,
  ): Promise<void> {
    const config = readServerConfig();
    const isDev = !config.ok || config.config.APP_ENV === "development";

    const baseUrl = customBaseUrl || (isDev ? "http://localhost:8080" : "https://homehunt.co.ke");
    const resetLink = `${baseUrl}/reset-password?token=${token}`;

    const resendApiKey = process.env.RESEND_API_KEY;

    logger.info("Password reset dispatched", {
      event: "email.password_reset_sent",
      recipient: email,
      provider: resendApiKey ? "Resend" : "LoggerFallback",
      ...(isDev ? { localUrl: resetLink } : {}),
    });

    if (resendApiKey) {
      try {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "HomeHunt <no-reply@homehunt.co.ke>",
            to: [email],
            subject: "Reset your HomeHunt Password",
            html: `<p>Click <a href="${resetLink}">here</a> to reset your password.</p>`,
          }),
        });
      } catch (err: unknown) {
        logger.error("Failed to send password reset email via Resend:", {
          error: (err as Error).message,
        });
      }
    } else {
      console.log("\n============================================================");
      console.log(`[DEVELOPMENT EMAIL SENDER] TO: ${email}`);
      console.log("Please click the link below to reset your password:");
      console.log(resetLink);
      console.log("============================================================\n");
    }
  },
};

// Prepared for Africa's Talking / Twilio SMS API
export const smsService: SmsService = {
  async sendVerificationSms(phoneNumber: string, otp: string): Promise<void> {
    const config = readServerConfig();
    const isDev = !config.ok || config.config.APP_ENV === "development";

    const atApiKey = process.env.AFRICASTALKING_API_KEY;
    const atUsername = process.env.AFRICASTALKING_USERNAME || "sandbox";

    logger.info("SMS OTP verification dispatched", {
      event: "sms.otp_sent",
      recipient: phoneNumber,
      provider: atApiKey ? "AfricasTalking" : "LoggerFallback",
      ...(isDev ? { otp } : {}),
    });

    if (atApiKey) {
      try {
        const bodyParams = new URLSearchParams({
          username: atUsername,
          to: phoneNumber,
          message: `Your HomeHunt verification code is: ${otp}`,
        });

        await fetch("https://api.africastalking.com/version1/messaging", {
          method: "POST",
          headers: {
            apiKey: atApiKey,
            "Content-Type": "application/x-www-form-urlencoded",
            Accept: "application/json",
          },
          body: bodyParams.toString(),
        });
      } catch (err: unknown) {
        logger.error("Failed to send SMS via Africa's Talking:", { error: (err as Error).message });
      }
    } else {
      console.log("\n============================================================");
      console.log(`[DEVELOPMENT SMS SENDER] TO: ${phoneNumber}`);
      console.log(`Your OTP code is: ${otp}`);
      console.log("============================================================\n");
    }
  },
};
