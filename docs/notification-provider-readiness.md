# Notification Provider Infrastructure Readiness

## Overview

HomeHunt supports multi-channel transactional messaging via Email and SMS adapters defined in `src/core/auth/email-sms.server.ts` and `src/features/communication/notifications.server.ts`.

## Provider Configuration Matrix

| Channel   | Production Provider       | Fallback Mechanism      | Environment Variables                               |
| :-------- | :------------------------ | :---------------------- | :-------------------------------------------------- |
| **Email** | Resend API                | Console Logger Fallback | `RESEND_API_KEY`                                    |
| **SMS**   | Africa's Talking / Twilio | Console Logger Fallback | `AFRICASTALKING_API_KEY`, `AFRICASTALKING_USERNAME` |

## Deduplication & Rate Control

- System notifications are throttled using in-memory / Redis lock keys (`notification_lock:${userId}:${notificationType}`) to prevent duplicate notification delivery during burst application activity.
