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
    <div className="bg-white text-slate-900 min-h-screen pt-20">
      
      {/* SECTION 1: Premium Hero Banner */}
      <section className="bg-slate-50 border-b border-slate-100 py-20 md:py-28 relative overflow-hidden">
        {/* Subtle decorative grid/shapes */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000003_1px,transparent_1px),linear-gradient(to_bottom,#00000003_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-accent/5 blur-3xl pointer-events-none" />
        
        <div className="max-w-[1280px] mx-auto px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-accent/40 bg-accent/[0.03] text-accent text-[10px] sm:text-xs font-bold tracking-wider uppercase font-sans mb-6">
            Guiding Future Medical Professionals
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-extrabold text-[#0B132B] mb-6">
            About ADHITYA NEET ACADEMY
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-slate-500 font-sans leading-relaxed max-w-3xl mx-auto">
            Building Future Medical Professionals Through Excellence, Discipline, and Guidance
          </p>
          <div className="w-16 h-[3px] bg-accent rounded mx-auto mt-8" />
        </div>
      </section>

      {/* SECTION 2 & 3: ACADEMY OVERVIEW & VISUAL CONTENT (Side-by-side) */}
      <section className="py-20 md:py-28">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            
            {/* Left Column: Academy Overview (Luxury Reading Layout) */}
            <div className="lg:col-span-7 max-w-[900px] space-y-8">
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-[#0B132B] tracking-tight border-b border-slate-100 pb-4">
                About Us
              </h2>
              
              <div className="space-y-6 text-[#1E293B] font-sans text-[18px] leading-[1.9] text-justify">
                <p>
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

            {/* Right Column: Visual Content (Editorial/Magazine Layout) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="grid grid-cols-12 gap-4 items-end">
                {/* Building Photo */}
                <div className="col-span-8 overflow-hidden rounded-[24px] rounded-tl-[80px] rounded-br-[40px] border border-slate-100 shadow-md group relative h-44 sm:h-56">
                  <Image 
                    src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=1000" 
                    alt="Academy Campus Building" 
                    fill
                    sizes="(max-width: 1024px) 60vw, 30vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.03]" 
                    loading="lazy"
                  />
                </div>
                {/* Classroom Photo */}
                <div className="col-span-4 overflow-hidden rounded-full border border-slate-100 shadow-md aspect-square group relative">
                  <Image 
                    src="https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=1000" 
                    alt="Academy Classroom" 
                    fill
                    sizes="(max-width: 1024px) 30vw, 15vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.03]" 
                    loading="lazy"
                  />
                </div>
              </div>
              
              {/* Faculty Interaction Photo */}
              <div className="overflow-hidden rounded-[24px] rounded-tr-[40px] rounded-bl-[80px] border border-slate-100 shadow-md group relative h-56 sm:h-72">
                <Image 
                  src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=1000" 
                  alt="Faculty and Student Interaction" 
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.03]" 
                  loading="lazy"
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 4: COURSES OFFERED */}
      <section className="bg-slate-50 py-20 md:py-28 border-t border-b border-slate-100">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-[#0B132B] mb-4">
              Courses Offered
            </h2>
            <p className="text-slate-600 font-sans text-base sm:text-lg">
              One Destination for NEET Aspirants – Repeaters, Test Series & Crash Courses
            </p>
            <div className="w-12 h-1 bg-accent rounded mx-auto mt-4" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            
            {/* Card 1: NEET Repeaters Program */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 md:p-10 flex flex-col justify-between hover:shadow-md hover:border-accent/20 transition-all duration-300 relative border-t-2 border-t-accent">
              <div>
                <h3 className="text-xl sm:text-2xl font-heading font-bold text-[#0B132B] mb-4">
                  NEET Repeaters Program
                </h3>
                <p className="text-slate-600 font-sans text-sm sm:text-base leading-relaxed mb-6">
                  Specialized coaching for repeaters and re-repeaters with expert guidance, regular tests, and focused preparation to secure MBBS admissions.
                </p>
              </div>
              <div className="space-y-3 pt-6 border-t border-slate-100 text-xs sm:text-sm font-sans text-slate-500">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-accent shrink-0" />
                  <span><strong>Timing:</strong> Monday to Saturday | 9:30 AM – 5:00 PM</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-accent shrink-0" />
                  <span><strong>Mode:</strong> Classroom Coaching | Erode</span>
                </div>
              </div>
            </div>

            {/* Card 2: NEET Weekend Program (Classes 9–12) */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 md:p-10 flex flex-col justify-between hover:shadow-md hover:border-accent/20 transition-all duration-300 relative border-t-2 border-t-accent">
              <div>
                <h3 className="text-xl sm:text-2xl font-heading font-bold text-[#0B132B] mb-4">
                  NEET Weekend Program (Classes 9–12)
                </h3>
                <p className="text-slate-600 font-sans text-sm sm:text-base leading-relaxed mb-6">
                  Neet coaching for students of Classes 9, 10, 11, and 12 to build strong concepts in Physics, Chemistry, and Biology for NEET success.
                </p>
              </div>
              <div className="space-y-3 pt-6 border-t border-slate-100 text-xs sm:text-sm font-sans text-slate-500">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-accent shrink-0" />
                  <span><strong>Schedule:</strong> Thursday, Friday & Saturday | 6:30 PM – 8:30 PM</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-accent shrink-0" />
                  <span><strong>Mode:</strong> Classroom Coaching | Erode</span>
                </div>
              </div>
            </div>

            {/* Card 3: NEET Test Batch */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 md:p-10 flex flex-col justify-between hover:shadow-md hover:border-accent/20 transition-all duration-300 relative border-t-2 border-t-accent">
              <div>
                <h3 className="text-xl sm:text-2xl font-heading font-bold text-[#0B132B] mb-4">
                  NEET Test Batch
                </h3>
                <p className="text-slate-600 font-sans text-sm sm:text-base leading-relaxed mb-6">
                  Comprehensive test series with chapter-wise tests, mock exams, and performance analysis.
                </p>
              </div>
              <div className="space-y-3 pt-6 border-t border-slate-100 text-xs sm:text-sm font-sans text-slate-500">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-accent shrink-0" />
                  <span><strong>Mode:</strong> Classroom Coaching | Erode</span>
                </div>
              </div>
            </div>

            {/* Card 4: NEET Crash Course (35 Days) */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 md:p-10 flex flex-col justify-between hover:shadow-md hover:border-accent/20 transition-all duration-300 relative border-t-2 border-t-accent">
              <div>
                <h3 className="text-xl sm:text-2xl font-heading font-bold text-[#0B132B] mb-4">
                  NEET Crash Course (35 Days)
                </h3>
                <p className="text-slate-600 font-sans text-sm sm:text-base leading-relaxed mb-6">
                  Intensive revision program with daily practice tests, concept revision, and exam-focused preparation.
                </p>
              </div>
              <div className="space-y-3 pt-6 border-t border-slate-100 text-xs sm:text-sm font-sans text-slate-500">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-accent shrink-0" />
                  <span><strong>Mode:</strong> Classroom Coaching | Erode</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* SECTION 5: HIGHLIGHT STRIP */}
      <section className="bg-white py-10 md:py-12 border-b border-slate-150">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-8">
          <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-4 text-xs sm:text-sm font-bold text-[#0B132B] tracking-wider uppercase font-sans">
            <span className="flex items-center gap-2">
              <span className="text-accent text-lg">✓</span> Expert Faculty
            </span>
            <span className="flex items-center gap-2">
              <span className="text-accent text-lg">✓</span> Regular Assessments
            </span>
            <span className="flex items-center gap-2">
              <span className="text-accent text-lg">✓</span> Personalized Guidance
            </span>
            <span className="flex items-center gap-2">
              <span className="text-accent text-lg">✓</span> Strong Academic Foundation
            </span>
            <span className="flex items-center gap-2">
              <span className="text-accent text-lg">✓</span> Medical Entrance Focused Training
            </span>
          </div>
        </div>
      </section>

    </div>
  );
}
