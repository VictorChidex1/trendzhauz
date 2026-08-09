import { useState } from "react";
import {
  Megaphone,
  Headphones,
  Radio,
  Star,
  Eye,
  Music,
  TrendingUp,
  Users,
  FileText,
  Check,
  ArrowRight,
  Zap,
  Globe,
  Clock,
  ChevronDown,
  Mail,
} from "lucide-react";
import { ContactForm } from "@/components/contact/ContactForm";

const AUDIENCE_STATS = [
  {
    icon: FileText,
    label: "Editorial Output",
    value: "4 Weekly",
    detail: "Published Reviews & Stories",
    progress: "w-[80%]",
  },
  {
    icon: Users,
    label: "Monthly Readers",
    value: "300K+",
    detail: "Growing Across All Categories",
    progress: "w-[95%]",
  },
  {
    icon: Radio,
    label: "Content Categories",
    value: "4",
    detail: "Music, Videos, Reviews & News",
    progress: "w-[100%]",
  },
  {
    icon: TrendingUp,
    label: "Entertainment Focus",
    value: "100%",
    detail: "Premium Entertainment Coverage",
    progress: "w-[100%]",
  },
];

const PACKAGES = [
  {
    icon: Star,
    title: "Sponsored Review",
    tagline: "Get your project reviewed by our editorial desk.",
    isPopular: false,
    features: [
      "In-depth album / single / EP review",
      "Rating + verdict published in Reviews",
      "Featured on the homepage feed",
      "Shareable across our social channels",
    ],
  },
  {
    icon: Music,
    title: "Artist Release Feature",
    tagline: "Launch your music to our full audience.",
    isPopular: true,
    features: [
      "New release announcement story",
      "Music embed in the article body",
      "Category placement (Music / Videos)",
      "Trending visibility boost",
    ],
  },
  {
    icon: Megaphone,
    title: "Banner & Display Ads",
    tagline: "Put your brand in front of music fans.",
    isPopular: false,
    features: [
      "Premium homepage placement",
      "Category page placements",
      "Analytics & click reporting",
      "Flexible campaign durations",
    ],
  },
];

const VALUE_PILLARS = [
  {
    icon: Globe,
    title: "Direct Fan Engagement",
    description:
      "Connect instantly with high-intent Afrobeats & African music enthusiasts actively looking for new sounds and trends.",
  },
  {
    icon: Radio,
    title: "Multi-Channel Distribution",
    description:
      "Your campaign is amplified across our web platform, Google News index, social media channels, and BioLinks.",
  },
  {
    icon: Clock,
    title: "Fast 48-Hour Turnaround",
    description:
      "We move at the speed of culture. Get your campaign reviewed, approved, and published within 48 to 72 hours.",
  },
];

const FAQS = [
  {
    question: "What is the turnaround time for a sponsored review?",
    answer:
      "Once we receive your assets and payment, our editorial desk typically publishes sponsored reviews within 48 to 72 hours.",
  },
  {
    question: "Can I provide custom banner assets?",
    answer:
      "Yes! We accept custom banner designs (JPG, PNG, GIF) that meet our sizing guidelines. If you don't have a designer, our team can create basic banners for an additional fee.",
  },
  {
    question: "How do payment and invoices work?",
    answer:
      "We accept payments via bank transfer, PayPal, and major credit cards. A secure payment link and official invoice will be provided once your campaign details are confirmed.",
  },
  {
    question: "Do you offer custom campaign bundles?",
    answer:
      "Absolutely. If you want a combination of a Sponsored Reviews, Article Posts, Display Ads, Playlist Placements, and Social Media Blasts into one powerful promotional package. Tell us what you need through our inquiry form, and we’ll create a custom package tailored to your goals with a special discounted rate when you bundle multiple services.",
  },
];

export default function AdvertisePage() {
  const [activeFaqIndex, setActiveFaqIndex] = useState<number | null>(0);

  const scrollToForm = () => {
    document
      .getElementById("advertise-form")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="bg-background">
      {/* 1. HERO SECTION */}
      <section className="relative w-full bg-zinc-950 overflow-hidden min-h-[80vh] flex flex-col justify-center">
        {/* Dynamic Backgrounds */}
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-zinc-950/90 to-background z-0" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:4rem_4rem] z-0 opacity-50" />

        {/* Glowing Orbs */}
        <div className="absolute -top-32 -left-32 h-[500px] w-[500px] bg-brand/20 blur-[100px] rounded-full z-0 pointer-events-none" />
        <div className="absolute top-1/2 -right-32 h-[400px] w-[400px] bg-amber-500/10 blur-[100px] rounded-full z-0 pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 flex flex-col items-center sm:items-start text-center sm:text-left">
          {/* Live Status Pill */}
          <div className="inline-flex items-center space-x-2 bg-zinc-900/50 backdrop-blur-md border border-white/10 text-zinc-300 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full mb-8 shadow-2xl">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span>Direct Ad Desk Open • Q3 Rates Live</span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tighter text-white max-w-4xl drop-shadow-lg leading-[1.1]">
            Reach Africa's <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand to-amber-400">
              Music-First
            </span>{" "}
            Audience
          </h1>

          <p className="mt-6 text-base sm:text-lg text-zinc-400 font-medium leading-relaxed max-w-2xl">
            TrendzHauz Media delivers premium reviews, artist features, and
            entertainment news. Partner with us to put your brand or release in
            front of an engaged, music-loving audience.
          </p>

          <div className="mt-10 flex flex-wrap justify-center sm:justify-start gap-4">
            <button
              onClick={scrollToForm}
              className="bg-brand hover:bg-brand/90 text-white font-black text-sm uppercase tracking-widest px-8 py-4 rounded-full shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:shadow-[0_0_30px_rgba(249,115,22,0.5)] flex items-center space-x-2 transition-all cursor-pointer transform hover:-translate-y-1"
            >
              <Zap className="h-4 w-4 fill-white" />
              <span>Book a Campaign</span>
            </button>
            <a
              href="#audience"
              className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-700/50 text-zinc-300 hover:text-white hover:bg-zinc-800 font-black text-sm uppercase tracking-widest px-8 py-4 rounded-full transition-all flex items-center space-x-2"
            >
              <Eye className="h-4 w-4" />
              <span>View Audience Stats</span>
            </a>
          </div>

          {/* Channel Marquee / Pill Strip */}
          <div className="mt-16 pt-8 border-t border-zinc-300 dark:border-white/10 w-full max-w-4xl flex flex-wrap justify-center sm:justify-start gap-3">
            {[
              "Afrobeats",
              "Amapiano",
              "Street Hop",
              "Brand Partnerships",
              "Executive Reviews",
              "Artist Spotlights",
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

      {/* 2. AUDIENCE STATS */}
      <section
        id="audience"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 scroll-mt-24"
      >
        <div className="text-center sm:text-left mb-12">
          <div className="inline-flex items-center space-x-2 bg-brand/10 text-brand px-3 py-1 rounded-full mb-4">
            <Eye className="h-4 w-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">
              Our Reach & Impact
            </span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-black uppercase tracking-tight text-zinc-900 dark:text-white">
            Our Audience
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {AUDIENCE_STATS.map((stat) => (
            <div
              key={stat.label}
              className="group relative bg-white dark:bg-zinc-900/50 backdrop-blur-sm border border-zinc-200 dark:border-white/10 rounded-2xl p-8 shadow-sm hover:shadow-[0_0_30px_rgba(249,115,22,0.1)] hover:border-brand/40 transition-all duration-300 overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-zinc-100 dark:bg-white/5">
                <div
                  className={`h-full bg-brand ${stat.progress} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                />
              </div>
              <div className="p-3 bg-zinc-100 dark:bg-white/5 text-zinc-900 dark:text-white rounded-xl w-fit group-hover:bg-brand/10 group-hover:text-brand transition-colors duration-300">
                <stat.icon className="h-6 w-6" />
              </div>
              <p className="text-4xl font-black text-zinc-900 dark:text-white mt-6 mb-2">
                {stat.value}
              </p>
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-brand">
                  {stat.label}
                </p>
                <p className="text-[12px] text-zinc-500 dark:text-zinc-400 font-medium mt-1">
                  {stat.detail}
                </p>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-8 text-[11px] text-center sm:text-left text-zinc-400 dark:text-zinc-500 font-medium">
          * Audience figures are illustrative and updated as the platform grows.
          Contact us for the latest media kit.
        </p>
      </section>

      {/* 3. ADVERTISING PACKAGES */}
      <section className="bg-zinc-50 dark:bg-zinc-950/50 py-24 border-y border-zinc-200 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-brand/10 text-brand px-3 py-1 rounded-full mb-4">
              <Headphones className="h-4 w-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">
                Choose Your Campaign
              </span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-black uppercase tracking-tight text-zinc-900 dark:text-white">
              Advertising Packages
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            {PACKAGES.map((pkg) => (
              <div
                key={pkg.title}
                className={`relative bg-white dark:bg-zinc-900 border rounded-3xl p-8 flex flex-col transition-all duration-300 ${
                  pkg.isPopular
                    ? "border-brand shadow-xl shadow-brand/10 md:-translate-y-4 md:scale-105 z-10"
                    : "border-zinc-200 dark:border-zinc-800 shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700"
                }`}
              >
                {pkg.isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-brand text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-md whitespace-nowrap">
                    🔥 Most Popular For Artists
                  </div>
                )}

                <div
                  className={`p-4 rounded-2xl w-fit mb-6 ${pkg.isPopular ? "bg-brand/10 text-brand" : "bg-zinc-100 dark:bg-white/5 text-zinc-900 dark:text-white"}`}
                >
                  <pkg.icon className="h-7 w-7" />
                </div>

                <h3 className="text-xl font-black uppercase tracking-tight text-zinc-900 dark:text-white">
                  {pkg.title}
                </h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium mt-2">
                  {pkg.tagline}
                </p>

                <div className="w-full h-px bg-zinc-100 dark:bg-white/5 my-6" />

                <ul className="space-y-4 flex-1 mb-8">
                  {pkg.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start space-x-3 text-sm font-medium text-zinc-700 dark:text-zinc-300"
                    >
                      <div
                        className={`mt-0.5 rounded-full p-1 ${pkg.isPopular ? "bg-brand/10" : "bg-zinc-100 dark:bg-white/5"}`}
                      >
                        <Check
                          className={`h-3 w-3 ${pkg.isPopular ? "text-brand" : "text-zinc-500 dark:text-zinc-400"}`}
                        />
                      </div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={scrollToForm}
                  className={`w-full font-black text-xs uppercase tracking-widest py-4 rounded-xl transition-all cursor-pointer ${
                    pkg.isPopular
                      ? "bg-brand hover:bg-brand/90 text-white shadow-lg shadow-brand/20"
                      : "bg-zinc-100 hover:bg-zinc-200 dark:bg-white/5 dark:hover:bg-white/10 text-zinc-900 dark:text-white"
                  }`}
                >
                  Book This Package
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. WHY PARTNER WITH US */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-1">
            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-zinc-900 dark:text-white mb-4">
              Why Partner <br className="hidden lg:block" /> With Us?
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400 font-medium text-sm leading-relaxed mb-8">
              We don't just post links. We craft compelling editorial narratives
              that resonate with a dedicated music community.
            </p>
            <button
              onClick={scrollToForm}
              className="text-brand font-black text-xs uppercase tracking-widest hover:underline flex items-center space-x-2 cursor-pointer"
            >
              <span>Get in touch</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-8">
            {VALUE_PILLARS.map((pillar, i) => (
              <div key={i} className="flex flex-col space-y-3">
                <div className="h-10 w-10 bg-brand/10 text-brand rounded-lg flex items-center justify-center">
                  <pillar.icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-black uppercase tracking-tight text-zinc-900 dark:text-white">
                  {pillar.title}
                </h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. FAQ SECTION */}
      <section className="bg-zinc-50 dark:bg-zinc-950/50 py-24 border-t border-zinc-200 dark:border-white/5">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-zinc-900 dark:text-white">
              Frequently Asked Questions
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
                    <div
                      className={`p-1.5 rounded-full bg-zinc-100 dark:bg-white/5 transition-transform duration-300 ${isOpen ? "rotate-180 bg-brand/10 text-brand" : "text-zinc-500"}`}
                    >
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

      {/* 6. INQUIRY FORM */}
      <section
        id="advertise-form"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 scroll-mt-10"
      >
        <div className="bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-white/10 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            {/* Left Sidebar of Form */}
            <div className="lg:col-span-5 bg-zinc-50 dark:bg-zinc-950/50 p-10 sm:p-12 border-b lg:border-b-0 lg:border-r border-zinc-200 dark:border-white/10 flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center space-x-2 bg-brand/10 text-brand px-3 py-1 rounded-full mb-6">
                  <Megaphone className="h-4 w-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    Get In Touch
                  </span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-zinc-900 dark:text-white mb-6">
                  Start Your Campaign
                </h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed mb-8">
                  Tell us about your brand, release, or campaign goals. Our team
                  will get back to you with a tailored proposal, rates, and
                  availability.
                </p>

                <div className="p-4 bg-brand/5 border border-brand/20 rounded-2xl flex items-start space-x-3">
                  <Music className="h-5 w-5 text-brand shrink-0 mt-0.5" />
                  <p className="text-xs text-zinc-700 dark:text-zinc-300 font-medium leading-relaxed">
                    <strong>Artists:</strong> include your streaming links and
                    release date in the message so we can review your project
                    faster.
                  </p>
                </div>
              </div>

              <div className="mt-12 pt-8 border-t border-zinc-200 dark:border-white/10">
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-4">
                  Direct Contact
                </p>
                <a
                  href="mailto:trendzhauz@gmail.com"
                  className="flex items-center space-x-3 text-zinc-900 dark:text-white hover:text-brand transition-colors group"
                >
                  <div className="h-10 w-10 bg-zinc-200 dark:bg-white/5 rounded-full flex items-center justify-center group-hover:bg-brand/10 group-hover:text-brand transition-colors">
                    <Mail className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-bold tracking-wide">
                    trendzhauz@gmail.com
                  </span>
                </a>
              </div>
            </div>

            {/* Right Side: The Form */}
            <div className="lg:col-span-7 p-10 sm:p-12">
              <ContactForm subjectPreset="advertising" sourcePage="advertise" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
