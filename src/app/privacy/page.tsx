import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy | Adhithya NEET Academy",
  description: "Read our privacy policy to understand how we protect and manage student information at Adhithya NEET Academy.",
}

export default function PrivacyPage() {
  return (
    <div className="bg-white text-slate-900 min-h-screen pt-20">
      {/* Premium Hero Banner */}
      <section className="bg-slate-50 border-b border-slate-100 py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000003_1px,transparent_1px),linear-gradient(to_bottom,#00000003_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
        <div className="max-w-[1280px] mx-auto px-6 lg:px-8 text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-heading font-extrabold text-[#0B132B] tracking-tight mb-4">
            Privacy Policy
          </h1>
          <p className="text-slate-500 text-sm max-w-xl mx-auto font-sans">
            Last Updated: June 19, 2026 • Adhithya NEET Academy
          </p>
        </div>
      </section>

      {/* Luxury Reading Layout */}
      <section className="py-20">
        <div className="max-w-[850px] mx-auto px-6 font-sans leading-relaxed text-slate-700 space-y-10">
          <div className="space-y-4">
            <h2 className="text-2xl font-heading font-extrabold text-[#0B132B]">1. Overview</h2>
            <p className="text-base">
              At Adhithya NEET Academy, we value your privacy and are committed to protecting your personal data. This Privacy Policy details how we collect, process, secure, and share personal information obtained from students, parents, and website visitors.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-heading font-extrabold text-[#0B132B]">2. Information We Collect</h2>
            <p className="text-base">
              We collect information that you voluntarily provide to us when registering for admissions, submitting inquiries, or communicating with us. This may include:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-sm">
              <li>Student Name, age, grade level, and school details.</li>
              <li>Parent/Guardian contact information including phone numbers, email addresses, and home address.</li>
              <li>Academic scores, mock test results, and attendance records.</li>
              <li>Billing details, transaction logs, and fee receipt information.</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-heading font-extrabold text-[#0B132B]">3. How We Use Your Information</h2>
            <p className="text-base">
              Your information is processed to support our educational mission and operational efficiency. Specific uses include:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-sm">
              <li>Managing admissions, class schedules, and academic progress tracking.</li>
              <li>Sending performance updates, test evaluations, and administrative notices to parents.</li>
              <li>Processing fee payments and providing receipts.</li>
              <li>Improving our curriculum programs and website usability.</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-heading font-extrabold text-[#0B132B]">4. Data Protection & Security</h2>
            <p className="text-base">
              We implement industry-standard administrative, technical, and physical security measures to safeguard student information. Our storage systems and databases (powered by secure platforms like Supabase) are subject to continuous monitoring and strict access privileges to prevent unauthorized access or disclosure.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-heading font-extrabold text-[#0B132B]">5. Sharing and Disclosure</h2>
            <p className="text-base">
              Adhithya NEET Academy does not sell or lease student information to third parties. We share data only in limited circumstances, such as:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-sm">
              <li>With trust-worthy service providers (like payment processors and analytical databases) under strict confidentiality agreements.</li>
              <li>When required by governing bodies or legal processes.</li>
              <li>To celebrate academic achievements (AIR ranks and student profiles) on our website and marketing channels, only with explicit student/parent consent.</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-heading font-extrabold text-[#0B132B]">6. Contact Information</h2>
            <p className="text-base">
              If you have any questions or concerns regarding this Privacy Policy or your data, please reach out to us at:
            </p>
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 text-sm space-y-2 font-medium">
              <p className="text-[#0B132B] font-bold">Adhithya NEET Academy (Erode Campus)</p>
              <p>📍 Royal Theatre, 24/8, Near Nalli Hospital Road, Municipal Colony, Erode - 638011</p>
              <p>📞 Phone: +91 96006 07680</p>
              <p>✉️ Email: admissions@adhityaneetacademy.com</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
