import { onSchedule } from "firebase-functions/v2/scheduler";
import { getFirestore, Timestamp } from "firebase-admin/firestore";

/**
 * TrendzHauz — Auto-Publish Scheduled Posts
 * 
 * Runs every 5 minutes. Finds all posts with status: "scheduled" where
 * createdAt is less than or equal to the current time, and flips their 
 * status to "published".
 */
export const publishScheduled = onSchedule(
  {
    schedule: "every 5 minutes",
    region: "us-central1",
    timeoutSeconds: 60,
    memory: "256MiB",
  },
  async () => {
    console.log("⏰ [publishScheduled] Checking for scheduled posts...");
    
    try {
      const db = getFirestore();
      const now = Timestamp.now();
      
      const scheduledSnap = await db.collection("posts")
        .where("status", "==", "scheduled")
        .where("createdAt", "<=", now)
        .get();

      if (scheduledSnap.empty) {
        console.log("  ✅ No scheduled posts ready to publish.");
        return;
      }

      console.log(`  🚀 Found ${scheduledSnap.size} post(s) ready to publish. Executing batch update...`);
      
      const batch = db.batch();
      
      scheduledSnap.docs.forEach((doc) => {
        batch.update(doc.ref, { status: "published" });
        console.log(`    - Publishing post: ${doc.id}`);
      });
      
      await batch.commit();
      
      console.log("🎉 [publishScheduled] Successfully published scheduled posts.");
    } catch (error) {
      console.error("❌ [publishScheduled] Failed to publish scheduled posts:", error);
      throw error;
    }
  }
);
