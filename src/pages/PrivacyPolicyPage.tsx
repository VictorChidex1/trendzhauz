import * as React from "react";
import { Shield } from "lucide-react";
import { Link } from "react-router-dom";

export default function PrivacyPolicyPage() {
  const lastUpdated = "August 8, 2026";

  return (
    <div className="min-h-screen bg-background relative selection:bg-brand/30">
      {/* Background Gradients */}
      <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-brand/5 via-background to-background pointer-events-none" />

      <main className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
        {/* Header */}
        <div className="mb-16 text-center sm:text-left">
          <div className="inline-flex items-center space-x-2 bg-brand/10 text-brand px-3 py-1 rounded-full mb-6">
            <Shield className="h-4 w-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">
              Legal & Compliance
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tighter text-zinc-900 dark:text-white mb-6">
            Privacy Policy
          </h1>
          <p className="text-sm sm:text-base text-zinc-500 dark:text-zinc-400 font-medium max-w-2xl">
            At TrendzHauz Media, we are committed to protecting your personal information and your right to privacy. This policy explains how we collect, use, and share your data.
          </p>
          <p className="mt-4 text-xs font-bold tracking-widest text-zinc-400 uppercase">
            Last Updated: {lastUpdated}
          </p>
        </div>

        {/* Content Body */}
        <div className="prose prose-zinc dark:prose-invert max-w-none prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tight prose-a:text-brand hover:prose-a:text-brand/80 prose-p:leading-relaxed prose-p:text-sm sm:prose-p:text-base">
          
          <h2>1. Information We Collect</h2>
          <p>
            We collect personal information that you voluntarily provide to us when you express an interest in obtaining information about us or our products and Services, when you participate in activities on the Services, or otherwise when you contact us.
          </p>
          <ul>
            <li><strong>Personal Information Provided by You:</strong> We collect names, email addresses, contact preferences, and other similar information when you use our contact or advertising forms.</li>
            <li><strong>Automatically Collected Information:</strong> Some information — such as your Internet Protocol (IP) address and/or browser and device characteristics — is collected automatically when you visit our Services for security and analytics purposes.</li>
          </ul>

          <h2>2. How We Use Your Information</h2>
          <p>
            We process your information for purposes based on legitimate business interests, the fulfillment of our contract with you, compliance with our legal obligations, and/or your consent. Specifically, we use your data to:
          </p>
          <ul>
            <li>Respond to your inquiries and offer support.</li>
            <li>Deliver and facilitate delivery of services to the user.</li>
            <li>Send administrative information to you.</li>
            <li>Protect our Services and prevent fraud.</li>
          </ul>

          <h2>3. Cookies and Tracking Technologies</h2>
          <p>
            We may use cookies and similar tracking technologies (like web beacons and pixels) to access or store information. Specific information about how we use such technologies and how you can refuse certain cookies is set out in our Cookie Policy.
          </p>

          <h2>4. Third-Party Services & Analytics</h2>
          <p>
            We may share your data with third-party vendors, service providers, contractors, or agents who perform services for us or on our behalf and require access to such information to do that work. Examples include: data analysis, email delivery, hosting services, customer service, and marketing efforts. 
          </p>
          <p>
            We may use third-party analytics platforms (such as Google Analytics) to track and analyze website traffic.
          </p>

          <h2>5. How Long We Keep Your Information</h2>
          <p>
            We will only keep your personal information for as long as it is necessary for the purposes set out in this privacy notice, unless a longer retention period is required or permitted by law (such as tax, accounting, or other legal requirements).
          </p>

          <h2>6. How We Keep Your Information Safe</h2>
          <p>
            We have implemented appropriate technical and organizational security measures designed to protect the security of any personal information we process. However, despite our safeguards and efforts to secure your information, no electronic transmission over the Internet or information storage technology can be guaranteed to be 100% secure.
          </p>

          <h2>7. Your Privacy Rights</h2>
          <p>
            Depending on your location, you may have the right to request access to the personal information we collect from you, change that information, or delete it in some circumstances. To request to review, update, or delete your personal information, please submit a request via our Contact page.
          </p>

          <h2>8. Contact Us</h2>
          <p>
            If you have questions or comments about this notice, you may email us at <strong>trendzhauz@gmail.com</strong> or by using our <Link to="/contact">Contact Form</Link>.
          </p>
        </div>
      </main>
    </div>
  );
}
