import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { FadeIn } from "@/components/shared/FadeIn";
import { getDynamicCourses, getSectionContent, getGlobalSettings } from "@/lib/cms-loader";
import { createClient } from "@/lib/supabase/server";
import { cmsContent } from "@/data/cmsContent";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, BookOpen, Calendar, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Courses | Adhithya NEET Academy",
  description: "Explore our comprehensive NEET coaching programs designed for all medical aspirants.",
};

export default async function CoursesPage() {
  const supabase = await createClient();
  const dbCourses = await getDynamicCourses(supabase);
  const heroContent = await getSectionContent("courses_hero", cmsContent.coursesPage.hero, supabase);
  const settings = await getGlobalSettings(supabase);

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-foreground">

      {/* Hero Banner */}
      <section className="relative bg-[#0B132B] overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,#ffffff03_25%,transparent_25%,transparent_50%,#ffffff03_50%,#ffffff03_75%,transparent_75%)] bg-[size:40px_40px] pointer-events-none" />
        <div className="absolute top-0 right-0 w-[40%] h-full bg-gradient-to-l from-accent/[0.04] to-transparent pointer-events-none" />

        <div className="max-w-[1280px] mx-auto px-5 sm:px-6 lg:px-8 pt-40 pb-20 sm:pt-44 sm:pb-24 text-center relative z-10">
          <FadeIn>
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-accent/30 bg-accent/[0.06] text-accent text-xs font-semibold tracking-[0.15em] uppercase font-sans mb-8">
              <BookOpen className="w-3.5 h-3.5" /> Academic Programs
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold text-white leading-[1.1] mb-6 text-balance">
              {heroContent.title || "Our Coaching Programs"}
            </h1>
            <p className="text-base sm:text-lg text-white/50 leading-[1.8] font-sans max-w-2xl mx-auto">
              {heroContent.description}
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Courses Grid */}
      <div className="max-w-[1280px] mx-auto px-5 sm:px-6 lg:px-8 py-20 sm:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {dbCourses.map((course: any, index: number) => (
            <FadeIn key={course.id || index} delay={index * 0.08}>
              <div id={`course-${index + 1}`} className="scroll-mt-24 h-full">
                <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden card-hover h-full flex flex-col group">
                  {course.image && (
                    <div className="p-6 pb-0">
                      <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-[#0B132B] border border-slate-100/50 shadow-inner flex items-center justify-center">
                        <Image
                          src={course.image}
                          alt={course.title}
                          fill
                          sizes="(max-width: 1024px) 100vw, 50vw"
                          className="object-contain transition-transform duration-700 group-hover:scale-[1.02]"
                          loading="lazy"
                        />
                      </div>
                    </div>
                  )}
                  <div className="flex h-full flex-grow">
                    {/* Gold left accent */}
                    <div className="w-1 bg-accent shrink-0" />
                    <div className="flex-1 p-6 sm:p-8 flex flex-col">
                      {/* Meta row */}
                      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                        <span className="px-2.5 py-1 rounded-md text-[9px] uppercase tracking-wider font-bold bg-[#0B132B]/5 text-[#0B132B] border border-[#0B132B]/10 font-sans">
                          {course.target}
                        </span>
                        <span className="text-xs text-accent font-bold uppercase tracking-wider flex items-center gap-1 font-sans">
                          <Clock className="w-3.5 h-3.5" /> {course.duration}
                        </span>
                      </div>

                      {/* Title */}
                      <h2 className="text-2xl font-heading font-bold text-[#0B132B] mb-2 group-hover:text-accent transition-colors duration-300">
                        {course.title}
                      </h2>

                      {/* Schedule metadata */}
                      <div className="flex flex-col gap-1.5 text-[11px] text-slate-500 font-semibold uppercase tracking-wider border-t border-b border-slate-100 py-4 my-4 font-sans">
                        {course.days && (
                          <p className="flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 text-accent shrink-0" />
                            <span className="font-bold text-[#0B132B]">Schedule:</span>
                            <span className="font-medium text-slate-600 normal-case">{course.days}</span>
                          </p>
                        )}
                        <p className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-accent shrink-0" />
                          <span className="font-bold text-[#0B132B]">Timing:</span>
                          <span className="font-medium text-slate-600 normal-case">{course.classTiming}</span>
                        </p>
                        {course.eligibility && (
                          <p className="flex items-center gap-2">
                            <BookOpen className="w-3.5 h-3.5 text-accent shrink-0" />
                            <span className="font-bold text-[#0B132B]">Eligibility:</span>
                            <span className="font-medium text-slate-600 normal-case">{course.eligibility}</span>
                          </p>
                        )}
                      </div>

                      {/* Description */}
                      <p className="text-muted-foreground mb-8 leading-[1.8] text-sm font-sans">
                        {course.description}
                      </p>

                      {/* Highlights */}
                      <div className="mb-8 flex-grow">
                        <h4 className="font-sans font-semibold text-[#0B132B] text-xs uppercase tracking-wider flex items-center gap-2 mb-5">
                          <BookOpen className="w-4 h-4 text-accent" /> Course Highlights
                        </h4>
                        <ul className="space-y-3">
                          {course.highlights.map((highlight: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-600 font-sans">
                              <CheckCircle2 className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                              <span className="leading-relaxed">{highlight}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* CTA */}
                      <div className="flex flex-col sm:flex-row gap-3 mt-auto pt-6 border-t border-slate-100">
                        <Button className="flex-1 h-12 rounded-xl bg-accent hover:bg-accent/90 text-[#0B132B] font-bold text-sm transition-all duration-300 gap-2" asChild>
                          <a href={`https://wa.me/91${settings.whatsappNumber}?text=Hello%20ADHITYA%20NEET%20ACADEMY%2C%20I%20would%20like%20to%20know%20more%20about%20your%20courses.`}>
                            Inquire Now <ArrowRight className="w-4 h-4" />
                          </a>
                        </Button>
                        <Button variant="outline" className="flex-1 h-12 rounded-xl border-slate-200 text-[#0B132B] font-semibold text-sm hover:bg-slate-50 transition-all duration-300" asChild>
                          <Link href="/contact">Contact Us</Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </div>
  );
}
