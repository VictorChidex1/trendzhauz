/**
 * TrendzHauz — Custom password-reset email via Resend
 *
 * Generates a Firebase Auth oobCode with Admin SDK, then emails a link that
 * points at OUR app (/admin/reset-password?oobCode=...) so writers never land
 * on the default firebaseapp.com password form.
 */

import { onCall, HttpsError } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import { getAuth } from "firebase-admin/auth";
import { Resend } from "resend";

const resendApiKey = defineSecret("RESEND_API_KEY");

/** Allowed password-reset landing pages (prevents open-redirect abuse). */
const ALLOWED_CONTINUE_BASES = [
  "https://trendzhauz.vercel.app/admin/reset-password",
  "https://trendzhauz.com/admin/reset-password",
  "https://www.trendzhauz.com/admin/reset-password",
  "http://localhost:5173/admin/reset-password",
  "http://127.0.0.1:5173/admin/reset-password",
] as const;

const DEFAULT_CONTINUE = "https://trendzhauz.vercel.app/admin/reset-password";

const FROM_ADDRESS = "TrendzHauz Media <onboarding@resend.dev>";
const REPLY_TO = "trendzhauz@gmail.com";

interface RequestPasswordResetData {
  email?: string;
  continueUrl?: string;
}

function normalizeContinueBase(raw: string | undefined): string {
  if (!raw || typeof raw !== "string") {
    return DEFAULT_CONTINUE;
  }

  let parsed: URL;
  try {
    parsed = new URL(raw.trim());
  } catch {
    return DEFAULT_CONTINUE;
  }

  // Strip query/hash; only path base is allowed
  const base = `${parsed.origin}${parsed.pathname}`.replace(/\/$/, "");
  const withPath = base.endsWith("/admin/reset-password")
    ? base
    : `${parsed.origin}/admin/reset-password`;

  const normalized = withPath.replace(/\/$/, "");
  const allowed = ALLOWED_CONTINUE_BASES.some(
    (item) => item.replace(/\/$/, "") === normalized,
  );

  return allowed ? normalized : DEFAULT_CONTINUE;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function buildResetEmailHtml(params: {
  appResetLink: string;
  email: string;
}): string {
  const { appResetLink, email } = params;
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Reset your TrendzHauz Media password</title>
</head>
<body style="margin:0;padding:0;background-color:#09090b;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#09090b;padding:40px 16px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" width="100%" style="max-width:540px;background-color:#18181b;border:1px solid #27272a;border-radius:16px;overflow:hidden;box-shadow:0 20px 25px -5px rgba(0, 0, 0, 0.5);">
          
          <!-- Header Banner with Logo & Accent -->
          <tr>
            <td style="background-color:#09090b;padding:32px 36px 24px;border-bottom:2px solid #f97316;text-align:center;">
              <img src="https://trendzhauz.vercel.app/assets/Trendzhauz-logo.png" 
                   alt="TrendzHauz Media" 
                   style="height:42px;width:auto;display:inline-block;border:0;outline:none;" 
                   onError="this.style.display='none';" />
              <p style="margin:12px 0 0;color:#f97316;font-size:11px;font-weight:900;letter-spacing:0.18em;text-transform:uppercase;">
                EDITORIAL CMS SECURITY
              </p>
            </td>
          </tr>

          <!-- Main Email Body -->
          <tr>
            <td style="padding:36px;color:#f4f4f5;">
              <h1 style="margin:0 0 16px;font-size:24px;font-weight:900;line-height:1.2;letter-spacing:-0.02em;color:#ffffff;">
                Password Reset Request
              </h1>
              
              <p style="margin:0 0 18px;font-size:14px;line-height:1.6;color:#a1a1aa;">
                A password reset request was initiated for your TrendzHauz editorial account:
              </p>
              
              <!-- User Context Box -->
              <div style="background-color:#27272a;border:1px solid #3f3f46;border-radius:8px;padding:12px 16px;margin-bottom:24px;">
                <span style="font-size:13px;font-weight:700;color:#ffffff;word-break:break-all;">
                  📧 ${email}
                </span>
              </div>

              <p style="margin:0 0 28px;font-size:14px;line-height:1.6;color:#a1a1aa;">
                Click the button below to open the official TrendzHauz recovery workspace and set a new password:
              </p>

              <!-- CTA Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 0 32px;width:100%;">
                <tr>
                  <td align="center">
                    <a href="${appResetLink}"
                       target="_blank"
                       style="display:inline-block;width:100%;box-sizing:border-box;text-align:center;padding:16px 32px;background-color:#f97316;color:#ffffff;font-size:13px;font-weight:900;letter-spacing:0.12em;text-transform:uppercase;text-decoration:none;border-radius:8px;box-shadow:0 4px 14px rgba(249, 115, 22, 0.4);">
                      Reset Password →
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Fallback Direct URL Box -->
              <div style="border-top:1px solid #27272a;padding-top:24px;margin-top:8px;">
                <p style="margin:0 0 8px;font-size:12px;font-weight:700;color:#71717a;text-transform:uppercase;letter-spacing:0.05em;">
                  Alternative Link:
                </p>
                <p style="margin:0 0 20px;font-size:11px;line-height:1.5;word-break:break-all;color:#f97316;background-color:#09090b;padding:10px 12px;border-radius:6px;border:1px solid #27272a;">
                  ${appResetLink}
                </p>
              </div>

              <p style="margin:0;font-size:12px;line-height:1.6;color:#71717a;">
                🔒 If you did not request this password reset, please ignore this email or contact support. This link is single-use and will expire automatically.
              </p>
            </td>
          </tr>

          <!-- Footer Banner -->
          <tr>
            <td style="padding:20px 36px;background-color:#09090b;border-top:1px solid #27272a;text-align:center;">
              <p style="margin:0;font-size:11px;color:#71717a;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">
                TrendzHauz Media · All Rights Reserved
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`.trim();
}

/**
 * Callable: requestPasswordReset
 * Input: { email: string, continueUrl?: string }
 * Always returns { success: true } when the request is well-formed (no email enumeration).
 */
export const requestPasswordReset = onCall(
  {
    region: "us-central1",
    secrets: [resendApiKey],
    timeoutSeconds: 30,
    memory: "256MiB",
    // Allow unauthenticated CMS writers who forgot their password
    invoker: "public",
  },
  async (request) => {
    const data = (request.data || {}) as RequestPasswordResetData;
    const email = (data.email || "").trim().toLowerCase();
    const continueBase = normalizeContinueBase(data.continueUrl);

    if (!email || !isValidEmail(email)) {
      throw new HttpsError(
        "invalid-argument",
        "A valid email address is required.",
      );
    }

    const apiKey = resendApiKey.value();
    if (!apiKey) {
      console.error("RESEND_API_KEY secret is empty");
      throw new HttpsError(
        "failed-precondition",
        "Email service is not configured.",
      );
    }

    try {
      // 1) Mint Firebase reset link (includes oobCode + continueUrl metadata)
      const firebaseLink = await getAuth().generatePasswordResetLink(email, {
        url: continueBase,
        handleCodeInApp: false,
      });

      // 2) Extract oobCode so the email can deep-link into OUR SPA
      const firebaseUrl = new URL(firebaseLink);
      const oobCode = firebaseUrl.searchParams.get("oobCode");
      if (!oobCode) {
        console.error(
          "generatePasswordResetLink missing oobCode:",
          firebaseLink,
        );
        throw new HttpsError("internal", "Failed to generate reset token.");
      }

      const appResetLink = `${continueBase}?mode=resetPassword&oobCode=${encodeURIComponent(oobCode)}`;

      // 3) Send branded email via Resend
      const resend = new Resend(apiKey);
      const { error } = await resend.emails.send({
        from: FROM_ADDRESS,
        to: [email],
        replyTo: REPLY_TO,
        subject: "Reset your TrendzHauz Media password",
        html: buildResetEmailHtml({ appResetLink, email }),
        text: [
          "Reset your TrendzHauz Media password",
          "",
          `We received a request to reset the password for ${email}.`,
          "",
          `Open this link to choose a new password:`,
          appResetLink,
          "",
          "If you did not request this, you can ignore this email.",
        ].join("\n"),
      });

      if (error) {
        console.error("Resend API error:", error);
        throw new HttpsError(
          "internal",
          "Failed to send password reset email. Please try again shortly.",
        );
      }

      console.log(`✅ Password reset email queued for ${email}`);
      return { success: true as const };
    } catch (err: unknown) {
      // Avoid email enumeration: treat missing users as success
      const code =
        err && typeof err === "object" && "code" in err
          ? String((err as { code: string }).code)
          : "";

      if (
        code === "auth/user-not-found" ||
        code === "auth/email-not-found" ||
        code === "auth/invalid-email"
      ) {
        console.warn(
          `Password reset requested for unknown/invalid email: ${email}`,
        );
        return { success: true as const };
      }

      if (err instanceof HttpsError) {
        throw err;
      }

      console.error("requestPasswordReset failed:", err);
      throw new HttpsError(
        "internal",
        "Unable to process password reset. Please try again later.",
      );
    }
  },
);
