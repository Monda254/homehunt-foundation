import { n as supabaseAdmin } from "./client.server-Ma94aMcQ.mjs";
import { r as logger } from "./request-id-Du7XsDoM.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/notifications.server-Dtdxn9Il.js
var NotificationService = class {
	/**
	* Dispatches a notification to all authorized channels based on the user's settings.
	*/
	static async send(params) {
		const { userId, type, title, content, payload = {} } = params;
		try {
			const { data: prefs, error: prefErr } = await supabaseAdmin.from("notification_preferences").select("channel, enabled, notification_type").eq("user_id", userId);
			if (prefErr) logger.error("Failed to fetch notification preferences", {
				userId,
				error: prefErr.message
			});
			let prefType = "viewing_reminders";
			if (type === "NEW_MESSAGE") prefType = "messages";
			else if (type === "VIEWING_REMINDER") prefType = "viewing_reminders";
			const isChannelEnabled = (channel) => {
				if (!prefs || prefs.length === 0) return channel === "IN_APP" || channel === "EMAIL";
				const pref = prefs.find((p) => p.channel === channel && p.notification_type === prefType);
				return pref ? pref.enabled : channel === "IN_APP" || channel === "EMAIL";
			};
			const dispatchPromises = [];
			if (isChannelEnabled("IN_APP")) dispatchPromises.push((async () => {
				const { error } = await supabaseAdmin.from("notifications").insert({
					user_id: userId,
					notification_type: type,
					title,
					content,
					payload,
					is_read: false
				});
				if (error) logger.error("Failed to create in-app notification", {
					userId,
					error: error.message
				});
			})());
			const { data: profile } = await supabaseAdmin.from("profiles").select("phone_number, full_name").eq("id", userId).maybeSingle();
			const { data: userAuth } = await supabaseAdmin.auth.admin.getUserById(userId);
			const email = userAuth?.user?.email;
			if (email && isChannelEnabled("EMAIL")) dispatchPromises.push((async () => {
				logger.info("Email notification dispatched", {
					event: "email.notification_sent",
					recipient: email,
					title,
					content
				});
				console.log("\n============================================================");
				console.log(`[EMAIL NOTIFICATION] TO: ${email}`);
				console.log(`SUBJECT: ${title}`);
				console.log(content);
				console.log(`DATA: ${JSON.stringify(payload)}`);
				console.log("============================================================\n");
			})());
			if (profile?.phone_number && isChannelEnabled("SMS")) dispatchPromises.push((async () => {
				logger.info("SMS notification dispatched", {
					event: "sms.notification_sent",
					recipient: profile.phone_number,
					content
				});
				console.log("\n============================================================");
				console.log(`[SMS NOTIFICATION] TO: ${profile.phone_number}`);
				console.log(content);
				console.log("============================================================\n");
			})());
			if (isChannelEnabled("PUSH")) dispatchPromises.push((async () => {
				logger.info("Push notification dispatched", {
					event: "push.notification_sent",
					recipient: userId,
					title,
					content
				});
			})());
			await Promise.all(dispatchPromises);
		} catch (err) {
			logger.error("Error in NotificationService.send", {
				userId,
				error: err.message
			});
		}
	}
};
//#endregion
export { NotificationService as t };
