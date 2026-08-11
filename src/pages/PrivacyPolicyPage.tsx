
import { Shield, Sparkles, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { PageSeo } from "@/components/seo/PageSeo";

export default function PrivacyPolicyPage() {
  const lastUpdated = "August 8, 2026";

  const sections = [
    {
      title: "1. Information We Collect",
      content: (
        <>
          <p className="mb-4">
            We collect personal information that you voluntarily provide to us when you express an interest in obtaining information about us or our products and Services, when you participate in activities on the Services, or otherwise when you contact us.
          </p>
          <ul className="list-disc list-inside space-y-2 text-zinc-500 dark:text-zinc-400">
            <li><strong className="text-zinc-700 dark:text-zinc-300">Personal Information Provided by You:</strong> We collect names, email addresses, contact preferences, and other similar information when you use our contact or advertising forms.</li>
            <li><strong className="text-zinc-700 dark:text-zinc-300">Automatically Collected Information:</strong> Some information — such as your Internet Protocol (IP) address and/or browser and device characteristics — is collected automatically when you visit our Services for security and analytics purposes.</li>
          </ul>
        </>
      ),
    },
    {
      title: "2. How We Use Your Information",
      content: (
        <>
          <p className="mb-4">
            We process your information for purposes based on legitimate business interests, the fulfillment of our contract with you, compliance with our legal obligations, and/or your consent. Specifically, we use your data to:
          </p>
          <ul className="list-disc list-inside space-y-2 text-zinc-500 dark:text-zinc-400">
            <li>Respond to your inquiries and offer support.</li>
            <li>Deliver and facilitate delivery of services to the user.</li>
            <li>Send administrative information to you.</li>
            <li>Protect our Services and prevent fraud.</li>
          </ul>
        </>
      ),
    },
    {
      title: "3. Cookies and Tracking Technologies",
      content: (
        <p>
          We may use cookies and similar tracking technologies (like web beacons and pixels) to access or store information. Specific information about how we use such technologies and how you can refuse certain cookies is set out in our Cookie Policy.
        </p>
      ),
    },
    {
      title: "4. Third-Party Services & Analytics",
      content: (
        <>
          <p className="mb-4">
            We may share your data with third-party vendors, service providers, contractors, or agents who perform services for us or on our behalf and require access to such information to do that work. Examples include: data analysis, email delivery, hosting services, customer service, and marketing efforts. 
          </p>
          <p>
            We may use third-party analytics platforms (such as Google Analytics) to track and analyze website traffic.
          </p>
        </>
      ),
    },
    {
      title: "5. How Long We Keep Your Information",
      content: (
        <p>
          We will only keep your personal information for as long as it is necessary for the purposes set out in this privacy notice, unless a longer retention period is required or permitted by law (such as tax, accounting, or other legal requirements).
        </p>
      ),
    },
    {
      title: "6. How We Keep Your Information Safe",
      content: (
        <p>
          We have implemented appropriate technical and organizational security measures designed to protect the security of any personal information we process. However, despite our safeguards and efforts to secure your information, no electronic transmission over the Internet or information storage technology can be guaranteed to be 100% secure.
        </p>
      ),
    },
    {
      title: "7. Your Privacy Rights",
      content: (
        <p>
          Depending on your location, you may have the right to request access to the personal information we collect from you, change that information, or delete it in some circumstances. To request to review, update, or delete your personal information, please submit a request via our Contact page.
        </p>
      ),
    },
  ];

  return (
    <div className="bg-background selection:bg-brand/30">
      <PageSeo
        title="Privacy Policy"
        description="Learn how TrendzHauz Media collects, uses, and protects your personal data — our privacy commitment to every visitor."
        path="/privacy"
      />
      
      {/* 1. HERO SECTION (Identical styling to ContactPage) */}
      <section className="relative w-full bg-zinc-950 overflow-hidden min-h-[60vh] flex flex-col justify-center">
        {/* Dynamic Backgrounds */}
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-zinc-950/90 to-background z-0" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:4rem_4rem] z-0 opacity-50" />
        
        {/* Glowing Orbs */}
        <div className="absolute -top-32 -right-32 h-[500px] w-[500px] bg-brand/20 blur-[100px] rounded-full z-0 pointer-events-none" />
        <div className="absolute top-1/2 -left-32 h-[400px] w-[400px] bg-blue-500/10 blur-[100px] rounded-full z-0 pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 flex flex-col items-center sm:items-start text-center sm:text-left">
          
          {/* Live Status Pill */}
          <div className="inline-flex items-center space-x-2 bg-zinc-900/50 backdrop-blur-md border border-white/10 text-zinc-300 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full mb-8 shadow-2xl">
            <Shield className="h-3 w-3 text-brand" />
            <span>Legal & Compliance • Updated {lastUpdated}</span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tighter text-white max-w-4xl drop-shadow-lg leading-[1.1]">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand to-amber-400">Privacy</span> Policy
          </h1>
          
          <p className="mt-6 text-base sm:text-lg text-zinc-400 font-medium leading-relaxed max-w-2xl">
            At TrendzHauz Media, we are committed to protecting your personal information and your right to privacy. This policy explains how we collect, use, and share your data.
          </p>

        </div>
      </section>

      {/* 2. CONTENT SECTION (Glassmorphic Card) */}
      <section className="relative z-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 pb-20">
        <div className="bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-white/10 rounded-3xl p-8 sm:p-12 shadow-2xl backdrop-blur-xl">
          <div className="space-y-12">
            {sections.map((section, index) => (
              <div key={index} className="group">
                <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-zinc-900 dark:text-white mb-4 group-hover:text-brand transition-colors">
                  {section.title}
                </h2>
                <div className="text-sm sm:text-base text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
                  {section.content}
                </div>
              </div>
            ))}
          </div>

          {/* Dedicated Call-To-Action for Contact */}
          <div className="mt-16 pt-12 border-t border-zinc-200 dark:border-white/10 text-center">
             <div className="inline-flex items-center justify-center p-4 bg-brand/10 rounded-full mb-6">
                <Sparkles className="h-8 w-8 text-brand" />
             </div>
             <h3 className="text-2xl font-black uppercase tracking-tight text-zinc-900 dark:text-white mb-4">
               Have questions about your data?
             </h3>
             <p className="text-zinc-500 dark:text-zinc-400 mb-8 max-w-md mx-auto font-medium">
               Our Data Protection team is ready to assist you with any inquiries regarding your privacy rights.
             </p>
             <Link 
               to="/contact" 
               className="inline-flex items-center space-x-2 bg-brand hover:bg-brand/90 text-white font-black text-sm uppercase tracking-widest px-8 py-4 rounded-full shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:shadow-[0_0_30px_rgba(249,115,22,0.5)] transition-all cursor-pointer transform hover:-translate-y-1"
             >
               <span>Contact Us</span>
               <ArrowRight className="h-4 w-4" />
             </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
