// Runtime settings that can be changed from the admin panel without a deploy.

export type WhatsappProvider = "cloud" | "callmebot";

export interface NotificationSettings {
  emailEnabled: boolean;
  resendApiKey: string;
  resendFrom: string;
  emailTo: string;
  whatsappEnabled: boolean;
  whatsappProvider: WhatsappProvider;
  whatsappPhoneNumberId: string;
  whatsappToken: string;
  whatsappTo: string;
  whatsappTemplate: string;
  whatsappTemplateLang: string;
  callmebotPhone: string;
  callmebotApiKey: string;
}

export const SETTING_KEYS = [
  "email_enabled",
  "resend_api_key",
  "resend_from",
  "email_to",
  "whatsapp_enabled",
  "whatsapp_provider",
  "whatsapp_phone_number_id",
  "whatsapp_token",
  "whatsapp_to",
  "whatsapp_template",
  "whatsapp_template_lang",
  "callmebot_phone",
  "callmebot_api_key"
] as const;

export type SettingKey = (typeof SETTING_KEYS)[number];

export type SettingsMap = Partial<Record<SettingKey, string>>;

function isWhatsappProvider(value: string | undefined): value is WhatsappProvider {
  return value === "cloud" || value === "callmebot";
}

export async function loadSettings(env: Env): Promise<NotificationSettings> {
  let stored: SettingsMap = {};
  try {
    const result = await env.DB.prepare("SELECT key, value FROM settings").all<{ key: string; value: string }>();
    stored = {};
    for (const row of result.results ?? []) {
      if ((SETTING_KEYS as readonly string[]).includes(row.key)) {
        stored[row.key as SettingKey] = row.value;
      }
    }
  } catch (error) {
    console.error(
      JSON.stringify({
        message: "settings_load_failed",
        error: error instanceof Error ? error.message : String(error)
      })
    );
  }

  const provider = stored.whatsapp_provider;

  return {
    emailEnabled: stored.email_enabled === "1",
    resendApiKey: stored.resend_api_key ?? "",
    resendFrom: stored.resend_from ?? "",
    emailTo: stored.email_to ?? "",
    whatsappEnabled: stored.whatsapp_enabled === "1",
    whatsappProvider: isWhatsappProvider(provider) ? provider : "cloud",
    whatsappPhoneNumberId: stored.whatsapp_phone_number_id ?? "",
    whatsappToken: stored.whatsapp_token ?? "",
    whatsappTo: stored.whatsapp_to ?? "",
    whatsappTemplate: stored.whatsapp_template ?? "",
    whatsappTemplateLang: stored.whatsapp_template_lang || "en",
    callmebotPhone: stored.callmebot_phone ?? "",
    callmebotApiKey: stored.callmebot_api_key ?? ""
  };
}

/** Writes only the keys present in `values`, so untouched fields keep their value. */
export async function saveSettings(env: Env, values: SettingsMap): Promise<void> {
  const now = new Date().toISOString();
  const entries = Object.entries(values).filter(
    (entry): entry is [SettingKey, string] => (SETTING_KEYS as readonly string[]).includes(entry[0])
  );
  if (entries.length === 0) return;

  await env.DB.batch(
    entries.map(([key, value]) =>
      env.DB.prepare(
        "INSERT INTO settings (key, value, updated_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at"
      ).bind(key, value, now)
    )
  );
}
