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

const DEFAULT_CONTINUE =
  "https://trendzhauz.vercel.app/admin/reset-password";

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
    (item) => item.replace(/\/$/, "") === normalized
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
  <title>Reset your TrendzHauz password</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f8fafc;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:520px;background:#ffffff;border:1px solid #e4e4e7;border-radius:12px;overflow:hidden;">
          <tr>
            <td style="background:#f97316;padding:20px 28px;">
              <p style="margin:0;color:#ffffff;font-size:14px;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;">
                TrendzHauz Media
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:28px;">
              <h1 style="margin:0 0 12px;font-size:22px;line-height:1.25;color:#18181b;">
                Reset your password
              </h1>
              <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#52525b;">
                We received a request to reset the CMS password for
                <strong style="color:#18181b;">${email}</strong>.
              </p>
              <p style="margin:0 0 24px;font-size:14px;line-height:1.6;color:#52525b;">
                Click the button below to choose a new password on the official TrendzHauz recovery page.
              </p>
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 0 24px;">
                <tr>
                  <td style="border-radius:8px;background:#f97316;">
                    <a href="${appResetLink}"
                       style="display:inline-block;padding:14px 28px;color:#ffffff;font-size:13px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;text-decoration:none;">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 8px;font-size:12px;line-height:1.5;color:#71717a;">
                Or copy and paste this link into your browser:
              </p>
              <p style="margin:0 0 24px;font-size:11px;line-height:1.5;word-break:break-all;color:#a1a1aa;">
                ${appResetLink}
              </p>
              <p style="margin:0;font-size:12px;line-height:1.5;color:#a1a1aa;">
                If you did not request a password reset, you can safely ignore this email.
                This link expires after a limited time for security.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 28px;border-top:1px solid #f4f4f5;background:#fafafa;">
              <p style="margin:0;font-size:11px;color:#a1a1aa;text-transform:uppercase;letter-spacing:0.08em;font-weight:700;">
                TrendzHauz Media · Editorial Security
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
      throw new HttpsError("invalid-argument", "A valid email address is required.");
    }

    const apiKey = resendApiKey.value();
    if (!apiKey) {
      console.error("RESEND_API_KEY secret is empty");
      throw new HttpsError("failed-precondition", "Email service is not configured.");
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
        console.error("generatePasswordResetLink missing oobCode:", firebaseLink);
        throw new HttpsError("internal", "Failed to generate reset token.");
      }

      const appResetLink =
        `${continueBase}?mode=resetPassword&oobCode=${encodeURIComponent(oobCode)}`;

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
          "Failed to send password reset email. Please try again shortly."
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
        console.warn(`Password reset requested for unknown/invalid email: ${email}`);
        return { success: true as const };
      }

      if (err instanceof HttpsError) {
        throw err;
      }

      console.error("requestPasswordReset failed:", err);
      throw new HttpsError(
        "internal",
        "Unable to process password reset. Please try again later."
      );
    }
  }
);
