import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Send, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import {
  sendContactMessage,
  type ContactSubject,
  type ContactSourcePage,
} from "@/services/contact";

interface ContactFormProps {
  subjectPreset: ContactSubject;
  sourcePage: ContactSourcePage;
}

const SUCCESS_TOAST_KEY = "trendzhauz-contact-sent";

export function ContactForm({ subjectPreset, sourcePage }: ContactFormProps) {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [subject, setSubject] = React.useState<ContactSubject>(subjectPreset);
  const [message, setMessage] = React.useState("");
  const [website, setWebsite] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [showSuccessToast, setShowSuccessToast] = React.useState(false);

  React.useEffect(() => {
    if (sessionStorage.getItem(SUCCESS_TOAST_KEY) !== "1") return;
    sessionStorage.removeItem(SUCCESS_TOAST_KEY);
    setShowSuccessToast(true);
    const timer = setTimeout(() => setShowSuccessToast(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Please provide your name.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Please provide a valid email address.");
      return;
    }

    if (message.trim().length < 10) {
      setError("Message must be at least 10 characters.");
      return;
    }

    setIsSubmitting(true);
    try {
      await sendContactMessage({
        name: name.trim(),
        email: email.trim(),
        subject,
        message: message.trim(),
        sourcePage,
        website,
      });
      sessionStorage.setItem(SUCCESS_TOAST_KEY, "1");
      window.location.reload();
    } catch (err: any) {
      setError(err.message || "Failed to send your message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-xs space-y-5"
      >
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4">
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-zinc-900 dark:text-white">
              Send a Message
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
              We usually reply within 24 hours.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-md text-red-600 dark:text-red-400 text-xs font-medium flex items-start space-x-2">
            <AlertCircle className="h-4 w-4 shrink-0 mt-px" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-700 dark:text-zinc-300 block">
              Your Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alex Johnson"
              required
              className="w-full bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-300 dark:border-zinc-700 rounded-md px-3.5 py-2.5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:border-brand dark:focus:border-brand"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-700 dark:text-zinc-300 block">
              Email Address *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-300 dark:border-zinc-700 rounded-md px-3.5 py-2.5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:border-brand dark:focus:border-brand"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-700 dark:text-zinc-300 block">
            Subject *
          </label>
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value as ContactSubject)}
            className="w-full bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-300 dark:border-zinc-700 rounded-md px-3.5 py-2.5 text-sm font-semibold text-zinc-900 dark:text-white focus:outline-none focus:border-brand dark:focus:border-brand"
          >
            <option value="advertising">Advertising</option>
            <option value="partnership">Partnership</option>
            <option value="general">General</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-700 dark:text-zinc-300 block">
            Message *
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tell us about your inquiry..."
            rows={6}
            required
            className="w-full bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-300 dark:border-zinc-700 rounded-md px-3.5 py-2.5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:border-brand dark:focus:border-brand resize-y"
          />
          <p className="text-[10px] text-zinc-400">
            Minimum 10 characters.
          </p>
        </div>

        {/* Honeypot — hidden from humans, irresistible to bots */}
        <div className="hidden" aria-hidden="true">
          <label>
            Website
            <input
              type="text"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
            />
          </label>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-brand hover:bg-brand/90 text-white font-black text-xs uppercase tracking-widest py-3.5 rounded-md shadow-sm flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Sending...</span>
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                <span>Send Message</span>
              </>
            )}
          </button>
        </div>
      </form>

      <AnimatePresence>
        {showSuccessToast && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            onClick={() => setShowSuccessToast(false)}
            role="status"
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-2.5 bg-emerald-600 text-white text-xs font-black uppercase tracking-widest px-5 py-3 rounded-full shadow-xl cursor-pointer"
          >
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>Message sent successfully!</span>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
