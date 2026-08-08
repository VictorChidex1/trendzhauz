import * as React from "react";
import { Scale, Sparkles, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function TermsOfServicePage() {
  const lastUpdated = "August 8, 2026";

  const sections = [
    {
      title: "1. Agreement to Terms",
      content: (
        <p>
          By accessing or using our Services, you agree to be bound by these Terms. If you disagree with any part of the terms, then you may not access the Service.
        </p>
      ),
    },
    {
      title: "2. Intellectual Property Rights",
      content: (
        <>
          <p className="mb-4">
            Unless otherwise indicated, the Site is our proprietary property and all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics on the Site (collectively, the "Content") and the trademarks, service marks, and logos contained therein (the "Marks") are owned or controlled by us or licensed to us.
          </p>
          <p>
            The Content and the Marks are provided on the Site "AS IS" for your information and personal use only. No part of the Site and no Content or Marks may be copied, reproduced, aggregated, republished, uploaded, posted, publicly displayed, encoded, translated, transmitted, distributed, sold, licensed, or otherwise exploited for any commercial purpose whatsoever, without our express prior written permission.
          </p>
        </>
      ),
    },
    {
      title: "3. User Representations",
      content: (
        <>
          <p className="mb-4">
            By using the Site, you represent and warrant that:
          </p>
          <ul className="list-disc list-inside space-y-2 text-zinc-500 dark:text-zinc-400">
            <li>You have the legal capacity and you agree to comply with these Terms of Service.</li>
            <li>You will not access the Site through automated or non-human means, whether through a bot, script, or otherwise.</li>
            <li>You will not use the Site for any illegal or unauthorized purpose.</li>
            <li>Your use of the Site will not violate any applicable law or regulation.</li>
          </ul>
        </>
      ),
    },
    {
      title: "4. Prohibited Activities",
      content: (
        <>
          <p className="mb-4">
            You may not access or use the Site for any purpose other than that for which we make the Site available. The Site may not be used in connection with any commercial endeavors except those that are specifically endorsed or approved by us.
          </p>
          <p className="mb-4">
            As a user of the Site, you agree not to:
          </p>
          <ul className="list-disc list-inside space-y-2 text-zinc-500 dark:text-zinc-400">
            <li>Systematically retrieve data or other content from the Site to create or compile, directly or indirectly, a collection, compilation, database, or directory without written permission from us.</li>
            <li>Trick, defraud, or mislead us and other users, especially in any attempt to learn sensitive account information such as user passwords.</li>
            <li>Circumvent, disable, or otherwise interfere with security-related features of the Site, including features that prevent or restrict the use or copying of any Content.</li>
            <li>Use the Site in a manner inconsistent with any applicable laws or regulations.</li>
          </ul>
        </>
      ),
    },
    {
      title: "5. Third-Party Websites and Content",
      content: (
        <>
          <p className="mb-4">
            The Site may contain (or you may be sent via the Site) links to other websites ("Third-Party Websites") as well as articles, photographs, text, graphics, pictures, designs, music, sound, video, information, applications, software, and other content or items belonging to or originating from third parties ("Third-Party Content"). 
          </p>
          <p>
            Such Third-Party Websites and Third-Party Content are not investigated, monitored, or checked for accuracy, appropriateness, or completeness by us, and we are not responsible for any Third-Party Websites accessed through the Site or any Third-Party Content posted on, available through, or installed from the Site.
          </p>
        </>
      ),
    },
    {
      title: "6. Limitation of Liability",
      content: (
        <p>
          In no event will we or our directors, employees, or agents be liable to you or any third party for any direct, indirect, consequential, exemplary, incidental, special, or punitive damages, including lost profit, lost revenue, loss of data, or other damages arising from your use of the site, even if we have been advised of the possibility of such damages.
        </p>
      ),
    },
  ];

  return (
    <div className="bg-background selection:bg-brand/30">
      
      {/* 1. HERO SECTION */}
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
            <Scale className="h-3 w-3 text-brand" />
            <span>Legal & Compliance • Updated {lastUpdated}</span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tighter text-white max-w-4xl drop-shadow-lg leading-[1.1]">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand to-amber-400">Terms</span> of Service
          </h1>
          
          <p className="mt-6 text-base sm:text-lg text-zinc-400 font-medium leading-relaxed max-w-2xl">
            These Terms of Service constitute a legally binding agreement made between you and TrendzHauz Media concerning your access to and use of our website and services.
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
               Have questions about our terms?
             </h3>
             <p className="text-zinc-500 dark:text-zinc-400 mb-8 max-w-md mx-auto font-medium">
               Our legal and support team is ready to assist you with any inquiries regarding the use of our platform.
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
