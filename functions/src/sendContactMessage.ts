/**
 * TrendzHauz — Contact / Advertising inquiry submission
 *
 * Public contact form endpoint with six defense layers:
 *  1. Honeypot field — bots fill it, humans can't see it → silent success
 *  2. Input validation — strict length caps + enum checks (no memory bombs)
 *  3. Per-email rate limit — max 1 message per 5 minutes
 *  4. Per-IP rate limit — max 10 messages per hour (auto-expiring bucket)
 *  5. Firestore record — contactMessages collection for the Admin Inbox
 *  6. Branded Resend email — delivered to the admin inbox
 *
 * The Resend API key lives in Secret Manager and never touches the browser.
 */

import { onCall, HttpsError } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import {
  getFirestore,
  FieldValue,
  Timestamp,
} from "firebase-admin/firestore";
import { createHash } from "node:crypto";
import { Resend } from "resend";

const resendApiKey = defineSecret("RESEND_API_KEY");

/** Where all contact/advertising inquiries are delivered. */
const ADMIN_INBOX = "trendzhauz@gmail.com";

/** Test-mode sender until Phase B domain verification switches to noreply@trendzhauz.com. */
const FROM_ADDRESS = "TrendzHauz Media <onboarding@resend.dev>";

const SUBJECTS = ["advertising", "partnership", "general"] as const;
const SOURCE_PAGES = ["advertise", "contact"] as const;

const EMAIL_RATE_MINUTES = 5;
const IP_RATE_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const IP_RATE_MAX = 10;

type Subject = (typeof SUBJECTS)[number];
type SourcePage = (typeof SOURCE_PAGES)[number];

interface SendContactMessageData {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
  sourcePage?: string;
  /** Honeypot — real humans never see or fill this field. */
  website?: string;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/** Escape user content before it is injected into the email HTML. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildContactEmailHtml(params: {
  name: string;
  email: string;
  subject: Subject;
  message: string;
  sourcePage: SourcePage;
}): string {
  const { name, email, subject, message, sourcePage } = params;
  const subjectLabel = subject.charAt(0).toUpperCase() + subject.slice(1);
  const sourceLabel =
    sourcePage === "advertise" ? "Advertise Page" : "Contact Page";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>New ${escapeHtml(subjectLabel)} message from ${escapeHtml(name)}</title>
</head>
<body style="margin:0;padding:0;background-color:#09090b;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;" bgcolor="#09090b">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#09090b;padding:40px 16px;" bgcolor="#09090b">
    <tr>
      <td align="center" style="background-color:#09090b;" bgcolor="#09090b">
        <table role="presentation" width="100%" style="max-width:560px;background-color:#ffffff;border:1px solid #e4e4e7;border-radius:16px;overflow:hidden;box-shadow:0 20px 25px -5px rgba(0, 0, 0, 0.5);" bgcolor="#ffffff">

          <!-- Header Banner with Logo & Accent -->
          <tr>
            <td style="background-color:#ffffff;padding:32px 36px 24px;border-bottom:2px solid #f97316;text-align:center;" bgcolor="#ffffff">
              <img src="https://trendzhauz.vercel.app/assets/Trendzhauz-logo.png"
                   alt="TrendzHauz Media"
                   style="height:42px;width:auto;display:inline-block;border:0;outline:none;"
                   onError="this.style.display='none';" />
              <p style="margin:12px 0 0;color:#f97316;font-size:11px;font-weight:900;letter-spacing:0.18em;text-transform:uppercase;">
                ${escapeHtml(sourceLabel)} INQUIRY
              </p>
            </td>
          </tr>

          <!-- Main White Email Body -->
          <tr>
            <td style="padding:36px;color:#18181b;background-color:#ffffff;" bgcolor="#ffffff">
              <h1 style="margin:0 0 16px;font-size:24px;font-weight:900;line-height:1.2;letter-spacing:-0.02em;color:#09090b;">
                New ${escapeHtml(subjectLabel)} Message
              </h1>

              <p style="margin:0 0 18px;font-size:14px;line-height:1.6;color:#52525b;">
                Someone just submitted the TrendzHauz contact form. Reply directly from Gmail to answer them.
              </p>

              <!-- Sender Details Box -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f4f4f5;border:1px solid #e4e4e7;border-radius:8px;margin-bottom:24px;">
                <tr>
                  <td style="padding:14px 16px;font-size:13px;line-height:1.7;color:#18181b;">
                    <strong style="color:#09090b;">Name:</strong> ${escapeHtml(name)}<br/>
                    <strong style="color:#09090b;">Email:</strong> <a href="mailto:${escapeHtml(email)}" style="color:#f97316;font-weight:700;">${escapeHtml(email)}</a><br/>
                    <strong style="color:#09090b;">Subject:</strong> ${escapeHtml(subjectLabel)}<br/>
                    <strong style="color:#09090b;">Submitted from:</strong> ${escapeHtml(sourceLabel)}
                  </td>
                </tr>
              </table>

              <!-- Message Body -->
              <p style="margin:0 0 10px;font-size:12px;font-weight:900;color:#71717a;text-transform:uppercase;letter-spacing:0.08em;">
                Message
              </p>
              <div style="background-color:#ffffff;border:1px solid #e4e4e7;border-left:4px solid #f97316;border-radius:8px;padding:16px;margin-bottom:28px;">
                <p style="margin:0;font-size:14px;line-height:1.7;color:#18181b;white-space:pre-wrap;">
                  ${escapeHtml(message)}
                </p>
              </div>

              <!-- Reply CTA -->
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 0 24px;width:100%;">
                <tr>
                  <td align="center">
                    <a href="mailto:${escapeHtml(email)}?subject=Re:%20${encodeURIComponent(subjectLabel)}%20inquiry"
                       style="display:inline-block;text-align:center;padding:14px 32px;background-color:#f97316;color:#ffffff;font-size:13px;font-weight:900;letter-spacing:0.12em;text-transform:uppercase;text-decoration:none;border-radius:8px;box-shadow:0 4px 14px rgba(249, 115, 22, 0.4);">
                      Reply to ${escapeHtml(name)} →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0;font-size:12px;line-height:1.6;color:#71717a;">
                You can also manage and delete this inquiry from the Admin Panel &gt; Inbox.
              </p>
            </td>
          </tr>

          <!-- Footer Banner -->
          <tr>
            <td style="padding:20px 36px;background-color:#ffffff;border-top:1px solid #e4e4e7;text-align:center;" bgcolor="#ffffff">
              <p style="margin:0;font-size:11px;color:#52525b;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;">
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
 * Callable: sendContactMessage
 * Input: { name, email, subject, message, sourcePage, website? }
 * Returns { success: true } for real submissions AND for honeypot bots
 * (bots get silent success so they never learn the trap exists).
 */
export const sendContactMessage = onCall(
  {
    region: "us-central1",
    secrets: [resendApiKey],
    timeoutSeconds: 30,
    memory: "256MiB",
    // Public visitors submit the contact form — no login required.
    invoker: "public",
  },
  async (request) => {
    const data = (request.data || {}) as SendContactMessageData;

    // ── 1) HONEYPOT — silent success, zero writes, zero emails ──
    if (typeof data.website === "string" && data.website.trim().length > 0) {
      console.warn("Contact form honeypot triggered (bot detected).");
      return { success: true as const };
    }

    const name = (data.name || "").trim();
    const email = (data.email || "").trim().toLowerCase();
    const message = (data.message || "").trim();
    const subject = data.subject as Subject;
    const sourcePage = data.sourcePage as SourcePage;

    // ── 2) VALIDATION ──
    if (name.length < 1 || name.length > 100) {
      throw new HttpsError("invalid-argument", "Please provide your name.");
    }

    if (!isValidEmail(email)) {
      throw new HttpsError(
        "invalid-argument",
        "A valid email address is required.",
      );
    }

    if (!SUBJECTS.includes(subject)) {
      throw new HttpsError("invalid-argument", "Invalid subject selection.");
    }

    if (message.length < 10 || message.length > 5000) {
      throw new HttpsError(
        "invalid-argument",
        "Message must be between 10 and 5000 characters.",
      );
    }

    if (!SOURCE_PAGES.includes(sourcePage)) {
      throw new HttpsError("invalid-argument", "Invalid source page.");
    }

    const db = getFirestore();

    // ── 3) PER-EMAIL RATE LIMIT — max 1 message per 5 minutes ──
    // Fail-open: if the rate-limit query can't run (e.g. a missing index),
    // log a warning and continue — validation, the honeypot, and the per-IP
    // limit still protect the form, and the visitor never sees an error.
    let lastCreatedAt: Timestamp | null = null;
    try {
      const recentSnap = await db
        .collection("contactMessages")
        .where("email", "==", email)
        .orderBy("createdAt", "desc")
        .limit(1)
        .get();

      if (!recentSnap.empty) {
        const data = recentSnap.docs[0].data();
        if (data.createdAt && typeof data.createdAt.toDate === "function") {
          lastCreatedAt = data.createdAt as Timestamp;
        }
      }
    } catch (err) {
      console.warn("Per-email rate limit check skipped:", err);
    }

    if (lastCreatedAt) {
      const ageMs = Date.now() - lastCreatedAt.toDate().getTime();
      if (ageMs < EMAIL_RATE_MINUTES * 60 * 1000) {
        throw new HttpsError(
          "resource-exhausted",
          "Please wait a few minutes before sending another message.",
        );
      }
    }

    // ── 4) PER-IP RATE LIMIT — max 10 messages per hour ──
    const rawIp = request.rawRequest.ip || "unknown";
    const ipKey = createHash("sha256").update(rawIp).digest("hex");
    const rateRef = db.doc(`contactRateLimits/${ipKey}`);
    const rateDoc = await rateRef.get();

    if (rateDoc.exists) {
      const rateData = rateDoc.data();
      const firstSeen = rateData?.firstSeenAt?.toDate?.()?.getTime() ?? Date.now();
      if (Date.now() - firstSeen > IP_RATE_WINDOW_MS) {
        // Window expired → reset the bucket
        await rateRef.set({
          count: 1,
          firstSeenAt: FieldValue.serverTimestamp(),
        });
      } else {
        const count = typeof rateData?.count === "number" ? rateData.count : 0;
        if (count >= IP_RATE_MAX) {
          throw new HttpsError(
            "resource-exhausted",
            "Too many messages from this network. Please try again later.",
          );
        }
        await rateRef.update({ count: count + 1 });
      }
    } else {
      await rateRef.set({
        count: 1,
        firstSeenAt: FieldValue.serverTimestamp(),
      });
    }

    const apiKey = resendApiKey.value();
    if (!apiKey) {
      console.error("RESEND_API_KEY secret is empty");
      throw new HttpsError(
        "failed-precondition",
        "Email service is not configured.",
      );
    }

    // ── 5) FIRESTORE RECORD (Admin Inbox) ──
    await db.collection("contactMessages").add({
      name,
      email,
      subject,
      message,
      sourcePage,
      isRead: false,
      createdAt: FieldValue.serverTimestamp(),
    });

    // ── 6) BRANDED RESEND EMAIL ──
    const subjectLabel = subject.charAt(0).toUpperCase() + subject.slice(1);
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: [ADMIN_INBOX],
      replyTo: email,
      subject: `New ${subjectLabel} Message — ${name}`,
      html: buildContactEmailHtml({
        name,
        email,
        subject,
        message,
        sourcePage,
      }),
      text: [
        `New ${subjectLabel} message from ${name}`,
        "",
        `Name: ${name}`,
        `Email: ${email}`,
        `Subject: ${subjectLabel}`,
        `Submitted from: ${sourcePage === "advertise" ? "Advertise Page" : "Contact Page"}`,
        "",
        "Message:",
        message,
        "",
        "Reply directly from Gmail to answer this inquiry.",
      ].join("\n"),
    });

    if (error) {
      console.error("Resend API error:", error);
      throw new HttpsError(
        "internal",
        "Failed to send your message. Please try again shortly.",
      );
    }

    console.log(`✅ Contact message stored + emailed (${subject} / ${email})`);
    return { success: true as const };
  },
);
