import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms of Service | Adhithya NEET Academy",
  description: "Read our terms of service to understand the policies and guidelines at Adhithya NEET Academy.",
}

export default function TermsPage() {
  return (
    <div className="bg-white text-slate-900 min-h-screen pt-20">
      {/* Premium Hero Banner */}
      <section className="bg-slate-50 border-b border-slate-100 py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000003_1px,transparent_1px),linear-gradient(to_bottom,#00000003_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
        <div className="max-w-[1280px] mx-auto px-6 lg:px-8 text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-heading font-extrabold text-[#0B132B] tracking-tight mb-4">
            Terms of Service
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
            <h2 className="text-2xl font-heading font-extrabold text-[#0B132B]">1. Terms Acceptance</h2>
            <p className="text-base">
              By accessing our website or enrolling in any coaching programs at Adhithya NEET Academy, you agree to be bound by these Terms of Service. These terms constitute a legal agreement between the student (and parent/guardian) and the Academy.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-heading font-extrabold text-[#0B132B]">2. Admission & Enrollment Policies</h2>
            <p className="text-base">
              Enrollment in our competitive coaching batches (Weekend Program, Repeater Batch, Test Series, and Crash Courses) is subject to space availability and compliance with entry qualifications. The academy reserves the right to review academic standing before securing batch enrollment.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-heading font-extrabold text-[#0B132B]">3. Fee Structure and Payments</h2>
            <p className="text-base">
              Tuition fees must be paid in accordance with the schedule outlined at the time of admission. 
            </p>
            <ul className="list-disc pl-6 space-y-2 text-sm">
              <li>All payments are to be made online or through approved banking channels.</li>
              <li>Late fee penalties may apply for delayed installments.</li>
              <li>Fee refund claims are governed strictly by our Refund Policy, which is provided during physical registration.</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-heading font-extrabold text-[#0B132B]">4. Code of Conduct & Discipline</h2>
            <p className="text-base">
              Students are expected to maintain strict academic discipline and decorum at the Erode Campus.
            </p>
            <ul className="list-disc pl-6 space-y-2 text-sm">
              <li>Regular attendance in lectures and mock tests is mandatory.</li>
              <li>Any form of misconduct, academic dishonesty, or damage to campus property will result in disciplinary action, including suspension or termination of admission without refund.</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-heading font-extrabold text-[#0B132B]">5. Intellectual Property Rights</h2>
            <p className="text-base">
              All academic materials, course handouts, test papers, and digital content provided by Adhithya NEET Academy are the exclusive intellectual property of the academy. Students are prohibited from sharing, copying, selling, or distributing these materials outside the academy.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-heading font-extrabold text-[#0B132B]">6. Disclaimer of Warranties</h2>
            <p className="text-base">
              While Adhithya NEET Academy provides elite teaching methods, study structures, and extensive mock test batteries under qualified faculty, we do not guarantee admission into MBBS/BDS courses or specific ranks in the NEET entrance exam. Ranks are determined by the individual student's diligence, capability, and performance on the exam day.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-heading font-extrabold text-[#0B132B]">7. Amendments to Terms</h2>
            <p className="text-base">
              The Academy reserves the right to update these terms at any time. Changes will be posted directly on this webpage and take effect immediately.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
