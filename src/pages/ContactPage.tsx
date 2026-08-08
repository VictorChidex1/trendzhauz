import * as React from "react";
import { Mail, MessageSquareHeart, Clock3 } from "lucide-react";
import { ContactForm } from "@/components/contact/ContactForm";

function InstagramIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function FacebookIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function TikTokIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
    </svg>
  );
}

const SOCIALS = [
  {
    name: "Instagram",
    url: "https://www.instagram.com/trendzhauzmedia/",
    icon: InstagramIcon,
  },
  {
    name: "Facebook",
    url: "https://www.facebook.com/trendzhauz",
    icon: FacebookIcon,
  },
  {
    name: "TikTok",
    url: "https://www.tiktok.com/@trendzhauzmedia?_r=1&_t=ZS-98fDHyRIgT3",
    icon: TikTokIcon,
  },
];

export default function ContactPage() {
  return (
    <div className="bg-background">
      {/* Hero Section */}
      <section className="relative w-full bg-zinc-950 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-zinc-900/90 to-background" />
        <div className="absolute -top-32 -right-32 h-96 w-96 bg-brand/20 blur-3xl rounded-full" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <span className="inline-flex items-center bg-brand/15 border border-brand/30 text-brand text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-sm">
            Contact Us
          </span>
          <h1 className="mt-5 text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tighter text-white max-w-3xl">
            Let's Talk Music, <span className="text-brand">Partnerships</span> & Ideas
          </h1>
          <p className="mt-5 text-sm sm:text-base text-zinc-400 font-medium leading-relaxed max-w-xl">
            Whether you're an artist dropping a new project, a brand looking to
            sponsor a review, or a fan with feedback — we'd love to hear from
            you.
          </p>
        </div>
      </section>

      {/* Contact Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Contact Info Sidebar */}
          <div className="lg:col-span-5 space-y-5">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-7 shadow-xs space-y-6">
              <div className="border-b border-zinc-100 dark:border-zinc-800 pb-4">
                <h2 className="text-sm font-black uppercase tracking-wider text-zinc-900 dark:text-white">
                  Contact Information
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-1">
                  Reach the TrendzHauz editorial desk directly.
                </p>
              </div>

              <a
                href="mailto:trendzhauz@gmail.com"
                className="flex items-start space-x-4 group"
              >
                <div className="p-2.5 bg-brand/10 text-brand rounded-lg shrink-0">
                  <Mail className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                    Email Us
                  </p>
                  <p className="text-sm font-bold text-zinc-900 dark:text-white group-hover:text-brand transition-colors break-all">
                    trendzhauz@gmail.com
                  </p>
                </div>
              </a>

              <div className="flex items-start space-x-4">
                <div className="p-2.5 bg-brand/10 text-brand rounded-lg shrink-0">
                  <MessageSquareHeart className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                    What We Cover
                  </p>
                  <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 leading-relaxed">
                    Music reviews, artist submissions, entertainment news, video
                    premieres, and advertising inquiries.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="p-2.5 bg-brand/10 text-brand rounded-lg shrink-0">
                  <Clock3 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                    Response Time
                  </p>
                  <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    Usually within 24 hours.
                  </p>
                </div>
              </div>
            </div>

            {/* Social Cards */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-7 shadow-xs">
              <h3 className="text-sm font-black uppercase tracking-wider text-zinc-900 dark:text-white mb-4">
                Follow & Message Us
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {SOCIALS.map((social) => (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center space-x-2 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-md py-3 text-zinc-700 dark:text-zinc-300 hover:text-brand hover:border-brand/40 transition-colors"
                  >
                    <social.icon className="h-4 w-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      {social.name}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-7">
            <ContactForm subjectPreset="general" sourcePage="contact" />
          </div>
        </div>
      </section>
    </div>
  );
}
