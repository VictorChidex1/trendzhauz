import * as React from "react";
import { Scale } from "lucide-react";
import { Link } from "react-router-dom";

export default function TermsOfServicePage() {
  const lastUpdated = "August 8, 2026";

  return (
    <div className="min-h-screen bg-background relative selection:bg-brand/30">
      {/* Background Gradients */}
      <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-brand/5 via-background to-background pointer-events-none" />

      <main className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
        {/* Header */}
        <div className="mb-16 text-center sm:text-left">
          <div className="inline-flex items-center space-x-2 bg-brand/10 text-brand px-3 py-1 rounded-full mb-6">
            <Scale className="h-4 w-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">
              Legal & Compliance
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tighter text-zinc-900 dark:text-white mb-6">
            Terms of Service
          </h1>
          <p className="text-sm sm:text-base text-zinc-500 dark:text-zinc-400 font-medium max-w-2xl">
            These Terms of Service constitute a legally binding agreement made between you and TrendzHauz Media concerning your access to and use of our website and services.
          </p>
          <p className="mt-4 text-xs font-bold tracking-widest text-zinc-400 uppercase">
            Last Updated: {lastUpdated}
          </p>
        </div>

        {/* Content Body */}
        <div className="prose prose-zinc dark:prose-invert max-w-none prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tight prose-a:text-brand hover:prose-a:text-brand/80 prose-p:leading-relaxed prose-p:text-sm sm:prose-p:text-base">
          
          <h2>1. Agreement to Terms</h2>
          <p>
            By accessing or using our Services, you agree to be bound by these Terms. If you disagree with any part of the terms, then you may not access the Service.
          </p>

          <h2>2. Intellectual Property Rights</h2>
          <p>
            Unless otherwise indicated, the Site is our proprietary property and all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics on the Site (collectively, the "Content") and the trademarks, service marks, and logos contained therein (the "Marks") are owned or controlled by us or licensed to us.
          </p>
          <p>
            The Content and the Marks are provided on the Site "AS IS" for your information and personal use only. No part of the Site and no Content or Marks may be copied, reproduced, aggregated, republished, uploaded, posted, publicly displayed, encoded, translated, transmitted, distributed, sold, licensed, or otherwise exploited for any commercial purpose whatsoever, without our express prior written permission.
          </p>

          <h2>3. User Representations</h2>
          <p>
            By using the Site, you represent and warrant that:
          </p>
          <ul>
            <li>You have the legal capacity and you agree to comply with these Terms of Service.</li>
            <li>You will not access the Site through automated or non-human means, whether through a bot, script, or otherwise.</li>
            <li>You will not use the Site for any illegal or unauthorized purpose.</li>
            <li>Your use of the Site will not violate any applicable law or regulation.</li>
          </ul>

          <h2>4. Prohibited Activities</h2>
          <p>
            You may not access or use the Site for any purpose other than that for which we make the Site available. The Site may not be used in connection with any commercial endeavors except those that are specifically endorsed or approved by us.
          </p>
          <p>
            As a user of the Site, you agree not to:
          </p>
          <ul>
            <li>Systematically retrieve data or other content from the Site to create or compile, directly or indirectly, a collection, compilation, database, or directory without written permission from us.</li>
            <li>Trick, defraud, or mislead us and other users, especially in any attempt to learn sensitive account information such as user passwords.</li>
            <li>Circumvent, disable, or otherwise interfere with security-related features of the Site, including features that prevent or restrict the use or copying of any Content.</li>
            <li>Use the Site in a manner inconsistent with any applicable laws or regulations.</li>
          </ul>

          <h2>5. Third-Party Websites and Content</h2>
          <p>
            The Site may contain (or you may be sent via the Site) links to other websites ("Third-Party Websites") as well as articles, photographs, text, graphics, pictures, designs, music, sound, video, information, applications, software, and other content or items belonging to or originating from third parties ("Third-Party Content"). 
          </p>
          <p>
            Such Third-Party Websites and Third-Party Content are not investigated, monitored, or checked for accuracy, appropriateness, or completeness by us, and we are not responsible for any Third-Party Websites accessed through the Site or any Third-Party Content posted on, available through, or installed from the Site.
          </p>

          <h2>6. Limitation of Liability</h2>
          <p>
            In no event will we or our directors, employees, or agents be liable to you or any third party for any direct, indirect, consequential, exemplary, incidental, special, or punitive damages, including lost profit, lost revenue, loss of data, or other damages arising from your use of the site, even if we have been advised of the possibility of such damages.
          </p>

          <h2>7. Contact Us</h2>
          <p>
            In order to resolve a complaint regarding the Site or to receive further information regarding use of the Site, please contact us at: <strong>trendzhauz@gmail.com</strong> or via our <Link to="/contact">Contact Form</Link>.
          </p>
        </div>
      </main>
    </div>
  );
}
