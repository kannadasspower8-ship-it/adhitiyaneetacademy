import { Metadata } from "next";
import { BookOpen, Clock, Calendar } from "lucide-react";
import Image from "next/image";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "About Us | Adhithya NEET Academy",
  description: "Learn about the mission, vision, and core values of Adhithya NEET Academy in Erode.",
};

export default function AboutPage() {
  return (
    <div className="bg-white text-slate-900 min-h-screen">

      {/* HERO BANNER */}
      <section className="relative bg-[#0B132B] overflow-hidden">
        {/* Pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(135deg,#ffffff03_25%,transparent_25%,transparent_50%,#ffffff03_50%,#ffffff03_75%,transparent_75%)] bg-[size:40px_40px] pointer-events-none" />
        <div className="absolute top-0 right-0 w-[40%] h-full bg-gradient-to-l from-accent/[0.04] to-transparent pointer-events-none" />

        <div className="max-w-[1280px] mx-auto px-5 sm:px-6 lg:px-8 pt-40 pb-24 sm:pt-44 sm:pb-28 text-center relative z-10">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-accent/30 bg-accent/[0.06] text-accent text-xs font-semibold tracking-[0.15em] uppercase font-sans mb-8">
            About Our Academy
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold text-white leading-[1.1] mb-6 text-balance">
            About ADHITYA NEET ACADEMY
          </h1>
          <p className="text-base sm:text-lg text-white/50 font-sans leading-[1.8] max-w-2xl mx-auto">
            Building Future Medical Professionals Through Excellence, Discipline, and Guidance
          </p>
          <div className="w-12 h-[3px] bg-accent rounded-full mx-auto mt-8" />
        </div>
      </section>

      {/* ACADEMY OVERVIEW — Editorial Layout */}
      <section className="section-pad">
        <div className="max-w-[1280px] mx-auto px-5 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">

            {/* Text Column */}
            <div className="lg:col-span-7 max-w-[680px]">
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-[#0B132B] tracking-tight mb-10 pb-4 border-b border-slate-100">
                About Us
              </h2>

              <div className="space-y-7 text-[#1E293B] font-sans text-[17px] leading-[1.9]">
                <p className="first-letter:text-5xl first-letter:font-heading first-letter:font-bold first-letter:text-accent first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:leading-[0.8]">
                  ADHITYA NEET Academy was established in March 2025 in Erode with a clear mission—to guide and empower aspiring students, Class 12 students, repeaters, and re-repeaters to achieve their dream of securing MBBS seats through quality education, expert mentorship, and focused NEET preparation.
                </p>
                <p>
                  Our academy is built on the strong educational foundation of HOSUR Public School, Hosur, and AKV Public School, Namakkal, institutions known for their commitment to academic excellence and student success. Further strengthening our academic vision, the academy is powered by the guidance and expertise of experienced doctors and professors currently serving in reputed hospitals and medical colleges, bringing real-world medical knowledge and exam-oriented teaching to our students.
                </p>
                <p>
                  Our roots in Erode date back to 2000 through Kongu Blood Bank, a trusted organization dedicated to healthcare and community service. This long-standing commitment to society reflects our passion for supporting future healthcare professionals.
                </p>
                <p>
                  At ADHITYA NEET Academy, Erode, we combine experienced faculty, personalized guidance, regular assessments, and a student-centered approach to help every aspirant succeed in NEET. We are committed to building confidence, improving performance, and helping students secure admission to top medical colleges.
                </p>
              </div>
            </div>

            {/* Image Column */}
            <div className="lg:col-span-5">
              <div className="sticky top-32 space-y-6">
                <div className="relative">
                  <div className="absolute -top-3 -left-3 w-full h-full rounded-[32px] border-2 border-accent/15 pointer-events-none" />
                  <div className="overflow-hidden rounded-[32px] border border-slate-100 shadow-lg relative aspect-[4/5]">
                    <Image
                      src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=1000"
                      alt="Academy Campus Building"
                      fill
                      sizes="(max-width: 1024px) 100vw, 40vw"
                      className="object-cover"
                      loading="lazy"
                    />
                  </div>
                </div>
                <div className="overflow-hidden rounded-2xl border border-slate-100 shadow-lg relative aspect-[16/9]">
                  <Image
                    src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=1000"
                    alt="Faculty and Student Interaction"
                    fill
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    className="object-cover"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* COURSES OFFERED */}
      <section className="section-pad bg-[#FAFAF8] border-t border-b border-slate-100">
        <div className="max-w-[1280px] mx-auto px-5 sm:px-6 lg:px-8">

          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-[#0B132B] mb-4 text-balance">
              Courses Offered
            </h2>
            <p className="text-muted-foreground font-sans text-base leading-[1.8]">
              One Destination for NEET Aspirants – Repeaters, Test Series &amp; Crash Courses
            </p>
            <div className="w-12 h-[2px] bg-accent rounded-full mx-auto mt-5" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {[
              {
                title: "NEET Repeaters Program",
                description: "Specialized coaching for repeaters with expert guidance, regular tests, and focused preparation to secure MBBS admissions.",
                timing: "Monday to Saturday | 9:30 AM – 5:00 PM",
                mode: "Classroom Coaching | Erode",
                icon: Clock,
              },
              {
                title: "NEET Weekend Program (Classes 9–12)",
                description: "Neet coaching for students of Classes 9, 10, 11, and 12 to build strong concepts in Physics, Chemistry, and Biology for NEET success.",
                schedule: "Thursday, Friday & Saturday | 6:30 PM – 8:30 PM",
                mode: "Classroom Coaching | Erode",
                icon: Calendar,
              },
              {
                title: "NEET Test Batch",
                description: "Comprehensive test series with chapter-wise tests, mock exams, and performance analysis.",
                mode: "Classroom Coaching | Erode",
                icon: BookOpen,
              },
              {
                title: "NEET Crash Course (35 Days)",
                description: "Intensive revision program with daily practice tests, concept revision, and exam-focused preparation.",
                mode: "Classroom Coaching | Erode",
                icon: BookOpen,
              },
            ].map((course, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-slate-100 p-8 md:p-10 card-hover group flex flex-col"
              >
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center mb-5">
                  <course.icon className="w-4.5 h-4.5 text-accent" />
                </div>
                <h3 className="text-xl font-heading font-bold text-[#0B132B] mb-3 group-hover:text-accent transition-colors duration-300">
                  {course.title}
                </h3>
                <p className="text-muted-foreground font-sans text-sm leading-[1.8] mb-6">
                  {course.description}
                </p>
                <div className="mt-auto space-y-2 pt-5 border-t border-slate-100 text-xs font-sans text-slate-500">
                  {course.timing && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-accent shrink-0" />
                      <span><strong className="text-[#0B132B]">Timing:</strong> {course.timing}</span>
                    </div>
                  )}
                  {course.schedule && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-accent shrink-0" />
                      <span><strong className="text-[#0B132B]">Schedule:</strong> {course.schedule}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-3.5 h-3.5 text-accent shrink-0" />
                    <span><strong className="text-[#0B132B]">Mode:</strong> {course.mode}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HIGHLIGHT STRIP */}
      <section className="bg-white py-12 border-b border-slate-100">
        <div className="max-w-[1280px] mx-auto px-5 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center items-center gap-x-10 gap-y-4 text-xs sm:text-sm font-semibold text-[#0B132B]/70 tracking-wider uppercase font-sans">
            {["Expert Faculty", "Regular Assessments", "Personalized Guidance", "Strong Academic Foundation", "Medical Entrance Focused Training"].map((item, i) => (
              <span key={i} className="flex items-center gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
