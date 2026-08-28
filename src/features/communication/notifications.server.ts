import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { emailService, smsService } from "@/core/auth/email-sms.server";
import { logger } from "@/core/observability/logger";
import { type NotificationType } from "./communication.types";

interface NotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  content: string;
  payload?: Record<string, unknown>;
}

export class NotificationService {
  /**
   * Dispatches a notification to all authorized channels based on the user's settings.
   */
  static async send(params: NotificationParams): Promise<void> {
    const { userId, type, title, content, payload = {} } = params;

    try {
      // 1. Fetch user notification preferences
      const { data: prefs, error: prefErr } = await supabaseAdmin
        .from("notification_preferences")
        .select("channel, enabled, notification_type")
        .eq("user_id", userId);

      if (prefErr) {
        logger.error("Failed to fetch notification preferences", {
          userId,
          error: prefErr.message,
        });
      }

      // Map type to user preference category:
      // 'NEW_MESSAGE' -> 'messages'
      // 'VIEWING_REMINDER' -> 'viewing_reminders'
      // Others -> 'viewing_reminders' (transactional housing workflow)
      let prefType: "messages" | "viewing_reminders" | "recommendations" | "marketing" =
        "viewing_reminders";
      if (type === "NEW_MESSAGE") {
        prefType = "messages";
      } else if (type === "VIEWING_REMINDER") {
        prefType = "viewing_reminders";
      }

      // If preferences are empty, we default to enabling IN_APP and EMAIL for transactional messages
      const isChannelEnabled = (channel: string): boolean => {
        if (!prefs || prefs.length === 0) {
          return channel === "IN_APP" || channel === "EMAIL";
        }
        const pref = prefs.find((p) => p.channel === channel && p.notification_type === prefType);
        return pref ? pref.enabled : channel === "IN_APP" || channel === "EMAIL";
      };

      const dispatchPromises: Promise<void>[] = [];

      // 2. IN_APP channel
      if (isChannelEnabled("IN_APP")) {
        dispatchPromises.push(
          (async () => {
            const { error } = await supabaseAdmin.from("notifications").insert({
              user_id: userId,
              notification_type: type,
              title,
              content,
              payload: payload as any, // eslint-disable-line @typescript-eslint/no-explicit-any
              is_read: false,
            });
            if (error) {
              logger.error("Failed to create in-app notification", {
                userId,
                error: error.message,
              });
            }
          })(),
        );
      }

      // Fetch user profile for email/phone contact information
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("phone_number, full_name")
        .eq("id", userId)
        .maybeSingle();

      const { data: userAuth } = await supabaseAdmin.auth.admin.getUserById(userId);
      const email = userAuth?.user?.email;

      // 3. EMAIL channel
      if (email && isChannelEnabled("EMAIL")) {
        dispatchPromises.push(
          (async () => {
            // Reusing console dispatch structure via logger/dev email
            logger.info("Email notification dispatched", {
              event: "email.notification_sent",
              recipient: email,
              title,
              content,
            });
            console.log("\n============================================================");
            console.log(`[EMAIL NOTIFICATION] TO: ${email}`);
            console.log(`SUBJECT: ${title}`);
            console.log(content);
            console.log(`DATA: ${JSON.stringify(payload)}`);
            console.log("============================================================\n");
          })(),
        );
      }

      // 4. SMS channel
      if (profile?.phone_number && isChannelEnabled("SMS")) {
        dispatchPromises.push(
          (async () => {
            logger.info("SMS notification dispatched", {
              event: "sms.notification_sent",
              recipient: profile.phone_number,
              content,
            });
            console.log("\n============================================================");
            console.log(`[SMS NOTIFICATION] TO: ${profile.phone_number}`);
            console.log(content);
            console.log("============================================================\n");
          })(),
        );
      }

      // 5. PUSH channel (stubbed structure)
      if (isChannelEnabled("PUSH")) {
        dispatchPromises.push(
          (async () => {
            logger.info("Push notification dispatched", {
              event: "push.notification_sent",
              recipient: userId,
              title,
              content,
            });
          })(),
        );
      }

      await Promise.all(dispatchPromises);
    } catch (err) {
      logger.error("Error in NotificationService.send", { userId, error: (err as Error).message });
    }
  }
}
