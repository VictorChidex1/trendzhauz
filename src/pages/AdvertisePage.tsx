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
} from "lucide-react";
import { ContactForm } from "@/components/contact/ContactForm";

const AUDIENCE_STATS = [
  {
    icon: FileText,
    label: "Editorial Output",
    value: "4 Weekly",
    detail: "Published Reviews & Stories",
  },
  {
    icon: Users,
    label: "Monthly Readers",
    value: "10K+",
    detail: "Growing Across All Categories",
  },
  {
    icon: Radio,
    label: "Content Categories",
    value: "4",
    detail: "Music, Videos, Reviews & News",
  },
  {
    icon: TrendingUp,
    label: "African Focus",
    value: "100%",
    detail: "Premium African Music Coverage",
  },
];

const PACKAGES = [
  {
    icon: Star,
    title: "Sponsored Review",
    tagline: "Get your project reviewed by our editorial desk.",
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
    features: [
      "Premium homepage placement",
      "Category page placements",
      "Analytics & click reporting",
      "Flexible campaign durations",
    ],
  },
];

export default function AdvertisePage() {
  const scrollToForm = () => {
    document
      .getElementById("advertise-form")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="bg-background">
      {/* Hero Section */}
      <section className="relative w-full bg-zinc-950 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-zinc-900/90 to-background" />
        <div className="absolute -top-32 -left-32 h-96 w-96 bg-brand/20 blur-3xl rounded-full" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <span className="inline-flex items-center bg-brand/15 border border-brand/30 text-brand text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-sm">
            Advertise With Us
          </span>
          <h1 className="mt-5 text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tighter text-white max-w-3xl">
            Reach Africa's <span className="text-brand">Music-First</span> Audience
          </h1>
          <p className="mt-5 text-sm sm:text-base text-zinc-400 font-medium leading-relaxed max-w-xl">
            TrendzHauz Media delivers premium reviews, artist features, and
            entertainment news. Partner with us to put your brand or release in
            front of an engaged, music-loving audience.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              onClick={scrollToForm}
              className="bg-brand hover:bg-brand/90 text-white font-black text-xs uppercase tracking-widest px-6 py-3.5 rounded-full shadow-md flex items-center space-x-2 transition-all cursor-pointer"
            >
              <span>Book a Campaign</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            <a
              href="#audience"
              className="border border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-500 font-black text-xs uppercase tracking-widest px-6 py-3.5 rounded-full transition-colors"
            >
              View Audience Stats
            </a>
          </div>
        </div>
      </section>

      {/* Audience Stats */}
      <section id="audience" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 scroll-mt-24">
        <div className="border-b-2 border-zinc-900 dark:border-white pb-4 mb-8 flex items-center space-x-3">
          <Eye className="h-5 w-5 text-brand" />
          <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-zinc-900 dark:text-white">
            Our Audience
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {AUDIENCE_STATS.map((stat) => (
            <div
              key={stat.label}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-3"
            >
              <div className="p-2.5 bg-brand/10 text-brand rounded-lg w-fit">
                <stat.icon className="h-5 w-5" />
              </div>
              <p className="text-3xl font-black text-zinc-900 dark:text-white">
                {stat.value}
              </p>
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-brand">
                  {stat.label}
                </p>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium mt-0.5">
                  {stat.detail}
                </p>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-6 text-[11px] text-zinc-400 dark:text-zinc-500 font-medium">
          Audience figures are illustrative and updated as the platform grows.
          Contact us for the latest media kit.
        </p>
      </section>

      {/* Packages */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="border-b-2 border-zinc-900 dark:border-white pb-4 mb-8 flex items-center space-x-3">
          <Headphones className="h-5 w-5 text-brand" />
          <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-zinc-900 dark:text-white">
            Advertising Packages
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PACKAGES.map((pkg) => (
            <div
              key={pkg.title}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-7 shadow-xs flex flex-col"
            >
              <div className="p-3 bg-brand/10 text-brand rounded-xl w-fit mb-4">
                <pkg.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-black uppercase tracking-tight text-zinc-900 dark:text-white">
                {pkg.title}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-1">
                {pkg.tagline}
              </p>

              <ul className="mt-5 space-y-2.5 flex-1">
                {pkg.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start space-x-2.5 text-xs font-medium text-zinc-700 dark:text-zinc-300"
                  >
                    <Check className="h-3.5 w-3.5 text-brand shrink-0 mt-px" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={scrollToForm}
                className="mt-6 w-full border-2 border-brand text-brand hover:bg-brand hover:text-white font-black text-xs uppercase tracking-widest py-3 rounded-md transition-all cursor-pointer"
              >
                Book This Package
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Inquiry Form */}
      <section
        id="advertise-form"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 scroll-mt-24"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5">
            <div className="border-b-2 border-zinc-900 dark:border-white pb-4 mb-6 flex items-center space-x-3">
              <Megaphone className="h-5 w-5 text-brand" />
              <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-zinc-900 dark:text-white">
                Start Your Campaign
              </h2>
            </div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed">
              Tell us about your brand, release, or campaign goals. Our team
              will get back to you with a tailored proposal, rates, and
              availability.
            </p>
            <div className="mt-6 p-4 bg-brand/5 border border-brand/20 rounded-xl flex items-start space-x-3">
              <Music className="h-4 w-4 text-brand shrink-0 mt-0.5" />
              <p className="text-xs text-zinc-600 dark:text-zinc-300 font-medium leading-relaxed">
                Artists: include your streaming links and release date in the
                message so we can review your project faster.
              </p>
            </div>
          </div>

          <div className="lg:col-span-7">
            <ContactForm subjectPreset="advertising" sourcePage="advertise" />
          </div>
        </div>
      </section>
    </div>
  );
}
