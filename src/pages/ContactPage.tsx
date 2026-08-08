import * as React from "react";
import { useState } from "react";
import { Mail, MessageSquareHeart, Clock3, MapPin, ChevronDown, Sparkles } from "lucide-react";
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

function XIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="currentColor" 
      {...props}
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
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
    name: "Twitter (X)",
    url: "https://x.com/trendzhzmedia?s=11",
    icon: XIcon,
  },
];

const FAQS = [
  {
    question: "How do I submit my music for review?",
    answer: "You can submit your music using the form above. Select 'General' or 'Feedback' (or head to our Advertising page for a guaranteed Sponsored Review). Make sure to include streaming links, release dates, and press photos."
  },
  {
    question: "Are you currently hiring writers or creators?",
    answer: "We are always on the lookout for talented music journalists and content creators. Send an email to trendzhauz@gmail.com with your portfolio and a brief introduction."
  },
  {
    question: "How do I report a bug or issue with the website?",
    answer: "Please select 'Feedback' in the form above and provide a detailed description of the issue, including what device and browser you are using. Our technical team will look into it."
  },
  {
    question: "Can I request an interview with TrendzHauz?",
    answer: "Yes, for press and media inquiries regarding the platform itself, please reach out directly via email with 'Press Inquiry' in the subject line."
  }
];

export default function ContactPage() {
  const [activeFaqIndex, setActiveFaqIndex] = useState<number | null>(0);

  const scrollToForm = () => {
    document
      .getElementById("contact-form")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="bg-background">
      {/* 1. HERO SECTION */}
      <section className="relative w-full bg-zinc-950 overflow-hidden min-h-[70vh] flex flex-col justify-center">
        {/* Dynamic Backgrounds */}
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-zinc-950/90 to-background z-0" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:4rem_4rem] z-0 opacity-50" />
        
        {/* Glowing Orbs */}
        <div className="absolute -top-32 -right-32 h-[500px] w-[500px] bg-brand/20 blur-[100px] rounded-full z-0 pointer-events-none" />
        <div className="absolute top-1/2 -left-32 h-[400px] w-[400px] bg-blue-500/10 blur-[100px] rounded-full z-0 pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 flex flex-col items-center sm:items-start text-center sm:text-left">
          
          {/* Live Status Pill */}
          <div className="inline-flex items-center space-x-2 bg-zinc-900/50 backdrop-blur-md border border-white/10 text-zinc-300 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full mb-8 shadow-2xl">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span>Editorial Desk Online • Usually replies in 24h</span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tighter text-white max-w-4xl drop-shadow-lg leading-[1.1]">
            Let's Talk Music, <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand to-amber-400">Partnerships</span> & Ideas
          </h1>
          
          <p className="mt-6 text-base sm:text-lg text-zinc-400 font-medium leading-relaxed max-w-2xl">
            Whether you're an artist dropping a new project, a brand looking to
            sponsor a review, or a fan with feedback — we'd love to hear from
            you.
          </p>

          <div className="mt-10">
            <button
              onClick={scrollToForm}
              className="bg-brand hover:bg-brand/90 text-white font-black text-sm uppercase tracking-widest px-8 py-4 rounded-full shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:shadow-[0_0_30px_rgba(249,115,22,0.5)] flex items-center space-x-2 transition-all cursor-pointer transform hover:-translate-y-1"
            >
              <Sparkles className="h-4 w-4 fill-white" />
              <span>Send a Message</span>
            </button>
          </div>

          {/* Channel Marquee / Pill Strip */}
          <div className="mt-16 pt-8 border-t border-zinc-300 dark:border-white/10 w-full max-w-4xl flex flex-wrap justify-center sm:justify-start gap-3">
            {[
              "Artist Submissions",
              "Advertising Inquiries",
              "Feedback",
              "Press & Media",
              "Bug Reports"
            ].map((tag) => (
              <span
                key={tag}
                className="text-[10px] font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 bg-zinc-200/80 dark:bg-white/5 px-3 py-1.5 rounded-sm border border-zinc-300 dark:border-white/10"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 2. INQUIRY FORM (The Grand Container) */}
      <section
        id="contact-form"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 scroll-mt-10"
      >
        <div className="bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-white/10 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            
            {/* Left Sidebar: The Editorial Desk */}
            <div className="lg:col-span-5 bg-zinc-50 dark:bg-zinc-950/50 p-10 sm:p-12 border-b lg:border-b-0 lg:border-r border-zinc-200 dark:border-white/10 flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center space-x-2 bg-brand/10 text-brand px-3 py-1 rounded-full mb-6">
                  <MapPin className="h-4 w-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Global Reach</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-zinc-900 dark:text-white mb-6">
                  The Editorial Desk
                </h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed mb-8">
                  Reach out directly to the TrendzHauz team. We cover music reviews, artist submissions, entertainment news, and advertising inquiries.
                </p>
                
                <div className="space-y-6 mt-8">
                  <a
                    href="mailto:trendzhauz@gmail.com"
                    className="flex items-start space-x-4 group p-4 bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-2xl hover:border-brand/40 hover:shadow-[0_0_20px_rgba(249,115,22,0.1)] transition-all cursor-pointer"
                  >
                    <div className="p-3 bg-brand/10 text-brand rounded-xl shrink-0 group-hover:scale-110 transition-transform">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">
                        Direct Email
                      </p>
                      <p className="text-sm font-bold text-zinc-900 dark:text-white group-hover:text-brand transition-colors break-all">
                        trendzhauz@gmail.com
                      </p>
                    </div>
                  </a>

                  <div className="flex items-start space-x-4 p-4 border border-transparent">
                    <div className="p-3 bg-zinc-200 dark:bg-white/5 text-zinc-500 dark:text-zinc-400 rounded-xl shrink-0">
                      <MessageSquareHeart className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">
                        What We Cover
                      </p>
                      <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 leading-relaxed">
                        Music reviews, artist submissions, entertainment news, video
                        premieres, and advertising inquiries.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4 p-4 border border-transparent">
                    <div className="p-3 bg-zinc-200 dark:bg-white/5 text-zinc-500 dark:text-zinc-400 rounded-xl shrink-0">
                      <Clock3 className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">
                        Response Time
                      </p>
                      <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                        Usually within 24 hours.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-12 pt-8 border-t border-zinc-200 dark:border-white/10">
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-4">Follow & Message Us</p>
                <div className="flex items-center space-x-3">
                  {SOCIALS.map((social) => (
                    <a
                      key={social.name}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-10 w-10 bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-full flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:text-brand hover:border-brand/40 hover:bg-brand/10 transition-all shadow-sm hover:shadow-[0_0_15px_rgba(249,115,22,0.2)]"
                      title={social.name}
                    >
                      <social.icon className="h-4 w-4" />
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Side: The Form */}
            <div className="lg:col-span-7 p-10 sm:p-12">
              <ContactForm subjectPreset="general" sourcePage="contact" />
            </div>
            
          </div>
        </div>
      </section>

      {/* 3. FAQ SECTION */}
      <section className="bg-zinc-50 dark:bg-zinc-950/50 py-24 border-y border-zinc-200 dark:border-white/5">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-zinc-900 dark:text-white">
              General Inquiries
            </h2>
          </div>
          
          <div className="space-y-4">
            {FAQS.map((faq, index) => {
              const isOpen = activeFaqIndex === index;
              return (
                <div 
                  key={index} 
                  className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl overflow-hidden transition-all duration-200"
                >
                  <button
                    onClick={() => setActiveFaqIndex(isOpen ? null : index)}
                    className="w-full flex items-center justify-between p-6 text-left cursor-pointer focus:outline-none"
                  >
                    <span className="text-sm sm:text-base font-black uppercase tracking-tight text-zinc-900 dark:text-white pr-4">
                      {faq.question}
                    </span>
                    <div className={`p-1.5 rounded-full bg-zinc-100 dark:bg-white/5 transition-transform duration-300 ${isOpen ? "rotate-180 bg-brand/10 text-brand" : "text-zinc-500"}`}>
                      <ChevronDown className="h-4 w-4" />
                    </div>
                  </button>
                  <div 
                    className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "max-h-48 pb-6 opacity-100" : "max-h-0 opacity-0"}`}
                  >
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
