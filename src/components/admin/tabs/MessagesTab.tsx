import {
  Inbox,
  Trash2,
  Mail,
  Loader2,
  ExternalLink,
  AlertTriangle,
} from "lucide-react";
import type { Timestamp } from "firebase/firestore";
import type {
  ContactMessageRecord,
  ContactSubject,
  ContactSourcePage,
} from "@/services/contact";

interface MessagesTabProps {
  messages: ContactMessageRecord[];
  isLoadingMessages: boolean;
  deletingMessageId: string | null;
  onRequestDelete: (message: ContactMessageRecord) => void;
}

const SUBJECT_PILL_CLASSES: Record<ContactSubject, string> = {
  advertising: "bg-amber-50 text-amber-700 border border-amber-200",
  partnership: "bg-purple-50 text-purple-700 border border-purple-200",
  general: "bg-zinc-100 text-zinc-600 border border-zinc-200",
};

function formatDate(ts: Timestamp | null): string {
  if (!ts || typeof ts.toDate !== "function") return "Just now";
  const date = ts.toDate();
  return `${date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })} · ${date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  })}`;
}

function SourceBadge({ sourcePage }: { sourcePage: ContactSourcePage }) {
  return (
    <span
      className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${
        sourcePage === "advertise"
          ? "bg-brand/10 text-brand border-brand/20"
          : "bg-sky-50 text-sky-700 border-sky-200"
      }`}
    >
      {sourcePage === "advertise" ? "Advertise" : "Contact"}
    </span>
  );
}

export function MessagesTab({
  messages,
  isLoadingMessages,
  deletingMessageId,
  onRequestDelete,
}: MessagesTabProps) {
  return (
    <div className="bg-white border border-zinc-200 rounded-lg shadow-xs overflow-hidden space-y-4 p-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
        <div>
          <h2 className="text-sm font-black uppercase tracking-wider text-zinc-900 flex items-center space-x-2">
            <Inbox className="h-4 w-4 text-brand" />
            <span>Contact & Ad Inbox</span>
            <span className="bg-brand/10 text-brand px-2 py-0.5 rounded-full text-[10px] font-bold">
              {messages.length}
            </span>
          </h2>
          <p className="text-xs text-zinc-500 font-medium">
            Inquiries submitted from the public Advertise and Contact pages.
          </p>
        </div>
      </div>

      {/* Loading State */}
      {isLoadingMessages ? (
        <div className="py-12 text-center flex items-center justify-center space-x-2 text-xs text-zinc-400 font-medium">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Loading messages from Firestore...</span>
        </div>
      ) : messages.length === 0 ? (
        <div className="py-12 text-center space-y-3">
          <div className="mx-auto w-12 h-12 bg-zinc-100 text-zinc-400 rounded-full flex items-center justify-center">
            <Inbox className="h-6 w-6" />
          </div>
          <p className="text-xs text-zinc-500 font-medium">
            No messages yet. Inquiries from the Advertise and Contact pages
            will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((message) => (
            <div
              key={message.id}
              className="border border-zinc-200 rounded-lg p-4 sm:p-5 space-y-3 hover:border-brand/30 hover:bg-zinc-50/50 transition-colors"
            >
              {/* Sender Row */}
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="h-9 w-9 bg-brand/10 text-brand rounded-full font-black text-xs flex items-center justify-center border border-brand/20 shrink-0">
                    {message.name ? message.name.charAt(0).toUpperCase() : "U"}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-zinc-900 truncate">
                      {message.name}
                    </p>
                    <a
                      href={`mailto:${message.email}`}
                      className="text-[10px] text-brand font-semibold hover:underline flex items-center space-x-1"
                    >
                      <Mail className="h-3 w-3" />
                      <span className="truncate">{message.email}</span>
                    </a>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <SourceBadge sourcePage={message.sourcePage} />
                  <span
                    className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                      SUBJECT_PILL_CLASSES[message.subject] ||
                      SUBJECT_PILL_CLASSES.general
                    }`}
                  >
                    {message.subject}
                  </span>
                  <span className="text-[10px] text-zinc-400 font-medium hidden sm:inline">
                    {formatDate(message.createdAt)}
                  </span>
                </div>
              </div>

              {/* Message Body */}
              <p className="text-xs text-zinc-700 leading-relaxed whitespace-pre-wrap break-words">
                {message.message}
              </p>

              {/* Footer Row */}
              <div className="flex items-center justify-between pt-2 border-t border-zinc-100">
                <a
                  href={`mailto:${message.email}?subject=Re:%20${message.subject}%20inquiry`}
                  className="text-[10px] font-black uppercase tracking-widest text-brand hover:underline flex items-center space-x-1"
                >
                  <ExternalLink className="h-3 w-3" />
                  <span>Reply by Email</span>
                </a>

                <button
                  onClick={() => onRequestDelete(message)}
                  disabled={deletingMessageId === message.id}
                  className="p-1.5 text-zinc-400 hover:text-red-600 rounded hover:bg-red-50 transition-colors disabled:opacity-50 cursor-pointer"
                  title="Delete Message"
                >
                  {deletingMessageId === message.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {messages.length > 0 && (
        <p className="text-[10px] text-zinc-400 flex items-center space-x-1.5">
          <AlertTriangle className="h-3 w-3" />
          <span>
            Deleting a message removes it from the Inbox only — already
            delivered emails cannot be recalled.
          </span>
        </p>
      )}
    </div>
  );
}
