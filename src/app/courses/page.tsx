import { Metadata } from "next";
import Link from "next/link";
import { FadeIn } from "@/components/shared/FadeIn";
import { getDynamicCourses, getSectionContent, getGlobalSettings } from "@/lib/cms-loader";
import { createClient } from "@/lib/supabase/server";
import { cmsContent } from "@/data/cmsContent";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, BookOpen, Calendar } from "lucide-react";

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
    <div className="pt-24 pb-[120px] min-h-screen bg-background text-foreground animate-fadeIn relative overflow-hidden">
      {/* Background spotlights */}
      <div className="absolute top-[10%] right-[10%] w-[350px] h-[350px] bg-accent/5 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[30%] left-[5%] w-[350px] h-[350px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none z-0"></div>

      {/* Header */}
      <div className="bg-[#0B132B] text-white py-[120px] mb-24 overflow-hidden relative border-b border-slate-800">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none z-10"></div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=2070')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
        <div className="max-w-[1280px] mx-auto px-6 lg:px-8 text-center max-w-4xl relative z-20">
          <FadeIn>
            <h1 className="text-5xl md:text-6xl font-heading font-bold mb-8">
              {heroContent.title ? (
                <span>
                  {heroContent.title.split(" ").map((w: string, i: number) => {
                    const match = ["courses", "programs", "neet", "coaching"].includes(w.toLowerCase());
                    return match ? (
                      <span key={i} className="bg-gradient-to-r from-accent via-[#FDF0A6] to-[#D4AF37] bg-clip-text text-transparent italic font-bold">
                        {w}{" "}
                      </span>
                    ) : w + " ";
                  })}
                </span>
              ) : "Our Coaching Programs"}
            </h1>
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-sans max-w-2xl mx-auto">
              {heroContent.description}
            </p>
          </FadeIn>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {dbCourses.map((course: any, index: number) => (
            <FadeIn key={course.id || index} delay={index * 0.1}>
              <Card id={course.id} className="h-full flex flex-col border border-slate-100/80 bg-white shadow-sm hover:shadow-xl hover:border-accent/35 hover:-translate-y-1.5 transition-all duration-500 group overflow-hidden relative border-t-4 border-t-accent">
                <CardHeader className="pb-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
                    <div className="px-2.5 py-1 rounded-md text-[9px] uppercase tracking-wider font-extrabold bg-[#0B132B]/5 text-[#0B132B] border border-[#0B132B]/10 max-w-full">
                      {course.target}
                    </div>
                    <div className="flex items-center text-accent text-xs font-bold uppercase tracking-wider font-sans">
                      <Clock className="w-4 h-4 mr-1.5" /> {course.duration}
                    </div>
                  </div>
                  <CardTitle className="text-2xl font-heading font-bold text-[#0B132B] group-hover:text-accent transition-colors duration-300 mb-2">{course.title}</CardTitle>
                  <div className="flex flex-col gap-1.5 text-[11px] text-slate-500 font-semibold uppercase tracking-wider border-t border-slate-100 pt-3 mt-3 font-sans">
                    {course.days && (
                      <p className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-accent shrink-0" /><span className="font-bold text-[#0B132B]">Schedule:</span> <span className="font-medium text-slate-600">{course.days}</span></p>
                    )}
                    <p className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-accent shrink-0" /><span className="font-bold text-[#0B132B]">Timing:</span> <span className="font-medium text-slate-600">{course.classTiming}</span></p>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-slate-600/90 mb-8 leading-relaxed text-sm md:text-base font-sans">
                    {course.description}
                  </p>
                  
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-bold text-[#0B132B] text-sm uppercase tracking-wider flex items-center gap-2 mb-4 font-sans border-b border-slate-100 pb-2">
                        <BookOpen className="w-4 h-4 text-accent" /> Course Highlights
                      </h4>
                      <ul className="space-y-3">
                        {course.highlights.map((highlight: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-600 font-sans">
                            <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5 fill-accent/10" />
                            <span className="leading-snug font-medium">{highlight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-6 border-t border-slate-50 bg-slate-50/30">
                  <div className="w-full flex flex-col sm:flex-row gap-4">
                    <Button className="w-full sm:flex-1 h-12 rounded-xl bg-gradient-to-r from-accent to-[#D4AF37] hover:from-[#D4AF37] hover:to-[#B89047] text-[#0B132B] font-bold text-sm tracking-wide shadow-md shadow-accent/5 border border-accent/20 hover:-translate-y-0.5 transition-all duration-300" variant="default" asChild>
                      <a href={`https://wa.me/91${settings.whatsappNumber}?text=Hello%20ADHITYA%20NEET%20ACADEMY%2C%20I%20would%20like%20to%20know%20more%2520about%2520your%2520courses.`}>WhatsApp Now</a>
                    </Button>
                    <Button variant="outline" className="w-full sm:flex-1 h-12 rounded-xl border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 hover:text-[#0B132B] font-bold text-sm hover:-translate-y-0.5 transition-all duration-300 shadow-sm" asChild>
                      <Link href="/contact">Contact Us</Link>
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </FadeIn>
          ))}
        </div>
      </div>
    </div>
  );
}
