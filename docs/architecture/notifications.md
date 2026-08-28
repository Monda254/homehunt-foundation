# Architecture Documentation - Notifications

HomeHunt dispatches transactional workflow alerts through multiple notification channels.

## Architecture

- **`NotificationService`**: Centralized service class handling template selection and preferences evaluation.
- **Preference Mapping**: Persists channel preferences (IN_APP, EMAIL, SMS, PUSH) against categories (messages, viewing_reminders, recommendations).
- **Adapters**:
  - `InAppNotificationAdapter`: Records alerts to the database for header panel displaying.
  - `EmailNotificationAdapter`: Logs details to the console in development, prepared for transactional SMTP/Resend hookups.
  - `SmsNotificationAdapter`: Stubbed wrapper ready for integration with APIs like Africa's Talking or Twilio.
