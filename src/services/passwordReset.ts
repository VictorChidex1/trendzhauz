import { httpsCallable, type HttpsCallableResult } from "firebase/functions";
import { functions } from "@/services/firebase";

interface RequestPasswordResetPayload {
  email: string;
  continueUrl: string;
}

interface RequestPasswordResetResponse {
  success: boolean;
}

/**
 * Ask the Cloud Function to mint a Firebase oobCode and email a branded
 * Resend message that deep-links to our /admin/reset-password page.
 */
export async function requestPasswordResetEmail(
  email: string,
  continueUrl: string
): Promise<void> {
  const callable = httpsCallable<
    RequestPasswordResetPayload,
    RequestPasswordResetResponse
  >(functions, "requestPasswordReset");

  const result: HttpsCallableResult<RequestPasswordResetResponse> =
    await callable({
      email: email.trim(),
      continueUrl,
    });

  if (!result.data?.success) {
    throw new Error("Password reset request was not accepted.");
  }
}
