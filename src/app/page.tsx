import Link from "next/link";
import Image from "next/image";
import dynamicImport from "next/dynamic";
import { ArrowRight, CheckCircle2, Star, Trophy, Users, BookOpen, GraduationCap, Sparkles, Award, Target, User, Building, Clock, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { FadeIn } from "@/components/shared/FadeIn";
import { getGlobalSettings, getSectionContent, getDynamicCourses, getDynamicAchievements } from "@/lib/cms-loader";
import { createClient } from "@/lib/supabase/server";
import { academyStats, features, testimonials } from "@/data/mockData";
import { cmsContent } from "@/data/cmsContent";

const TestimonialsSlider = dynamicImport(
  () => import("@/components/shared/TestimonialsSlider").then((mod) => mod.TestimonialsSlider),
  { ssr: true, loading: () => <div className="h-[250px] bg-slate-50/55 rounded-3xl animate-pulse flex items-center justify-center text-slate-350">Loading student reviews...</div> }
);

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = await createClient();
  const settings = await getGlobalSettings(supabase);
  const heroContent = await getSectionContent("home_hero", cmsContent.home.hero, supabase);
  const whyUsContent = await getSectionContent("home_why_choose_us", cmsContent.home.whyChooseUs, supabase);
  const dbCourses = await getDynamicCourses(supabase);
  const dbAchievements = await getDynamicAchievements(supabase);

  const displayCourses = dbCourses.slice(0, 4);
  const displayAchievements = dbAchievements.slice(0, 4);

  return (
    <div className="flex flex-col w-full overflow-hidden bg-background">
      {/* ═══════════════════════════════════════════════════════
          HERO — LIGHT TWO-COLUMN WITH ORGANIC IMAGE COMPOSITION
      ═══════════════════════════════════════════════════════ */}
      <section className="relative bg-gradient-to-br from-white via-slate-50 to-blue-50/30 pt-24 sm:pt-32 md:pt-40 pb-12 overflow-hidden">
        {/* Decorative background shapes */}
        <div className="absolute top-0 right-0 w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] bg-accent/[0.04] rounded-full blur-[80px] sm:blur-[100px] -translate-y-1/3 translate-x-1/4 pointer-events-none" />
        
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-12 gap-3 sm:gap-6 items-center">
            
            {/* LEFT COLUMN — Content */}
            <div className="col-span-7 pr-1 sm:pr-4">
              {/* Premium Badge */}
              <FadeIn direction="up" delay={0.05}>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-accent/40 bg-accent/[0.03] mb-4 sm:mb-6">
                  <Star className="w-3 h-3 text-accent fill-accent" />
                  <span className="text-[7.5px] sm:text-[10px] md:text-[11px] font-bold tracking-wider sm:tracking-[0.2em] uppercase text-accent font-sans">
                    Guiding Future Medical Professionals
                  </span>
                </div>
              </FadeIn>

              {/* Headline */}
              <FadeIn direction="up" delay={0.12}>
                <h1 className="font-heading font-bold text-[#0B132B] leading-[1.1] tracking-[-0.02em]">
                  <span className="block text-[21px] xs:text-[24px] sm:text-4xl md:text-5xl lg:text-[4rem] xl:text-[4.5rem]">
                    Where Future
                  </span>
                  <span className="block text-[21px] xs:text-[24px] sm:text-4xl md:text-5xl lg:text-[4rem] xl:text-[4.5rem] mt-0.5 sm:mt-1">
                    <span className="text-accent italic font-serif">Doctors</span> Begin
                  </span>
                  <span className="block text-[21px] xs:text-[24px] sm:text-4xl md:text-5xl lg:text-[4rem] xl:text-[4.5rem] mt-0.5 sm:mt-1">
                    Their Journey
                  </span>
                </h1>
                {/* Gold accent line */}
                <div className="w-10 sm:w-16 h-[3px] bg-accent/80 rounded mt-2.5 sm:mt-4 mb-4 sm:mb-6" />
              </FadeIn>

              {/* Description */}
              <FadeIn direction="up" delay={0.2}>
                <p className="text-slate-500 text-[10px] sm:text-sm md:text-base lg:text-lg leading-relaxed max-w-lg font-sans">
                  Expert faculty, structured mentorship, rigorous assessments and a focused environment to help you achieve excellence in NEET.
                </p>
              </FadeIn>

              {/* CTA Buttons */}
              <FadeIn direction="up" delay={0.28}>
                <div className="flex flex-col gap-2 w-full max-w-[170px] sm:max-w-xs mt-4 sm:mt-6">
                  <Button size="sm" asChild className="h-9 sm:h-12 px-3 sm:px-6 rounded-lg sm:rounded-xl bg-[#0B132B] hover:bg-[#1a2744] text-white font-bold text-[10px] sm:text-sm shadow-md transition-all duration-300 gap-1.5 w-full justify-center">
                    <Link href="/contact">
                      <GraduationCap className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-accent" />
                      Apply for Admission
                    </Link>
                  </Button>
                  
                  <Button size="sm" variant="outline" asChild className="h-9 sm:h-12 px-3 sm:px-6 rounded-lg sm:rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-[#0B132B] font-bold text-[10px] sm:text-sm transition-all duration-300 gap-1.5 w-full justify-center">
                    <a href={`https://wa.me/91${settings.whatsappNumber}?text=Hello%20ADHITYA%20NEET%20ACADEMY`} target="_blank" rel="noopener noreferrer">
                      <svg className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-[#25D366]" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                      </svg>
                      WhatsApp Now
                    </a>
                  </Button>
                </div>
              </FadeIn>
            </div>

            {/* RIGHT COLUMN — Organic Image Composition (Visible on all screens) */}
            <div className="col-span-5 relative w-full h-[180px] xs:h-[220px] sm:h-[350px] md:h-[480px] lg:h-[580px]">
              <FadeIn direction="left" delay={0.2} className="w-full h-full">
                <div className="w-full h-full overflow-hidden bg-slate-100 relative" style={{ clipPath: "ellipse(115% 115% at 115% 50%)" }}>
                  <Image 
                    src={heroContent.image || "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=2070"} 
                    alt="Students engaged in focused NEET preparation" 
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, 40vw"
                    className="object-cover"
                  />
                </div>
              </FadeIn>
            </div>

          </div>

          {/* 5-Column Trust Indicators Row */}
          <FadeIn direction="up" delay={0.35}>
            <div className="mt-8 bg-white rounded-2xl border border-slate-100 shadow-sm py-4 px-1 sm:px-6">
              <div className="grid grid-cols-5 divide-x divide-slate-100">
                {[
                  { icon: Users, label: "Expert Faculty" },
                  { icon: BookOpen, label: "Weekly Tests" },
                  { icon: GraduationCap, label: "Personalized Mentorship" },
                  { icon: Star, label: "Performance Tracking" },
                  { icon: CheckCircle2, label: "Student-Focused Learning" },
                ].map((item, i) => (
                  <div key={i} className="flex flex-col items-center justify-center text-center px-1">
                    <div className="w-7 h-7 sm:w-12 sm:h-12 rounded-full bg-[#0B132B]/5 flex items-center justify-center hover:bg-accent/15 transition-all duration-300">
                      <item.icon className="w-3.5 h-3.5 sm:w-6 sm:h-6 text-[#0B132B]/85 group-hover:text-accent transition-colors" />
                    </div>
                    <span className="text-[7.5px] sm:text-xs font-bold text-[#0B132B]/80 mt-2 max-w-[70px] sm:max-w-none leading-tight font-sans">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>

        </div>
      </section>

      {/* Dark Trust Bar Section */}
      <section className="bg-white pb-12">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn direction="up" delay={0.05}>
            <div className="bg-[#0B132B] rounded-2xl border border-accent/20 shadow-xl py-6 px-1 sm:px-6">
              <div className="grid grid-cols-4 divide-x divide-white/10">
                {[
                  { icon: Target, title: "Focused Preparation" },
                  { icon: User, title: "Individual Attention" },
                  { icon: Award, title: "Proven Results" },
                  { icon: Building, title: "Trusted by Parents & Students" },
                ].map((item, i) => (
                  <div key={i} className="flex flex-col items-center justify-center text-center px-1">
                    <item.icon className="w-4 h-4 sm:w-8 sm:h-8 text-accent mb-2" />
                    <span className="text-[7.5px] sm:text-xs font-bold text-white max-w-[80px] sm:max-w-none leading-tight font-sans">
                      {item.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
          
          {/* Accent text and success banner */}
          <FadeIn direction="up" delay={0.1}>
            <div className="flex items-center justify-center gap-4 my-8">
              <div className="h-[1px] bg-accent/40 w-12 sm:w-32" />
              <span className="font-serif italic text-xs sm:text-lg text-accent text-center whitespace-nowrap">
                Dream it. Believe it. Achieve it.
              </span>
              <div className="h-[1px] bg-accent/40 w-12 sm:w-32" />
            </div>

            <h3 className="font-heading font-bold text-base sm:text-2xl md:text-3xl text-[#0B132B] text-center">
              Your NEET Success Starts Here!
            </h3>
            <div className="w-12 h-1 bg-accent/80 rounded mx-auto mt-2 mb-8" />

            {/* Trophy banner */}
            <div className="bg-[#0B132B] rounded-2xl border border-accent/20 p-5 sm:p-6 flex items-center gap-4 sm:gap-6 relative overflow-hidden shadow-xl max-w-4xl mx-auto">
              <div className="w-12 h-12 sm:w-20 sm:h-20 shrink-0 flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-full h-full text-accent fill-accent">
                  <path d="M 30,75 C 10,65 10,35 30,25 M 70,75 C 90,65 90,35 70,25" fill="none" stroke="#D4AF37" strokeWidth="3" />
                  <path d="M 22,65 Q 16,62 19,57 C 22,58 23,61 22,65 Z" fill="#D4AF37" />
                  <path d="M 18,53 Q 12,51 15,46 C 18,47 19,50 18,53 Z" fill="#D4AF37" />
                  <path d="M 78,65 Q 84,62 81,57 C 78,58 77,61 78,65 Z" fill="#D4AF37" />
                  <path d="M 82,53 Q 88,51 85,46 C 82,47 81,50 82,53 Z" fill="#D4AF37" />
                  
                  <path d="M 35,30 L 65,30 L 62,50 C 60,60 40,60 38,50 Z" fill="#D4AF37" />
                  <path d="M 35,35 C 28,35 28,45 35,45" fill="none" stroke="#D4AF37" strokeWidth="3" />
                  <path d="M 65,35 C 72,35 72,45 65,45" fill="none" stroke="#D4AF37" strokeWidth="3" />
                  <path d="M 46,57 L 54,57 L 54,68 L 46,68 Z" fill="#D4AF37" />
                  <path d="M 40,68 L 60,68 L 62,75 L 38,75 Z" fill="#B89047" />
                  <rect x="42" y="70" width="16" height="4" fill="#5c4308" />
                  <polygon points="50,37 52,42 57,42 53,45 55,50 50,47 45,50 47,45 43,42 48,42" fill="#0b132b" />
                </svg>
              </div>
              <div className="flex-grow pr-8 z-10">
                <h4 className="text-accent font-extrabold text-[11px] sm:text-lg mb-0.5 sm:mb-1">Excellence. Guidance. Results.</h4>
                <p className="text-white text-[9px] sm:text-sm font-semibold leading-snug">
                  Empowering NEET Aspirants to Secure a Successful Medical Career.
                </p>
              </div>
              <div className="absolute right-0 bottom-0 w-20 h-20 sm:w-28 sm:h-28 opacity-15 sm:opacity-25 pointer-events-none z-0">
                <svg viewBox="0 0 100 100" className="w-full h-full text-accent" fill="none" stroke="currentColor" strokeWidth="5">
                  <path d="M 10,90 L 35,70 L 55,55 L 75,30 L 90,10" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M 70,10 L 90,10 L 90,30" fill="currentColor" />
                </svg>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* 3. WHY CHOOSE US */}
      <section className="py-[120px] bg-[#FAFAF8] relative">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[150px] pointer-events-none"></div>
        <div className="max-w-[1280px] mx-auto px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <FadeIn>
              <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 border border-accent/25 text-accent text-[10px] font-bold tracking-widest uppercase mb-4">
                <Sparkles className="w-3.5 h-3.5 fill-accent text-accent" /> ACADEMY VALUE PREPOSITION
              </div>
              <h2 className="text-[#0B132B] font-heading font-bold text-3xl md:text-4xl lg:text-5xl mb-6">{whyUsContent.title}</h2>
              <p className="text-muted-foreground text-base leading-relaxed max-w-2xl mx-auto font-sans">{whyUsContent.description}</p>
            </FadeIn>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon === 'GraduationCap' ? GraduationCap : 
                           feature.icon === 'BookOpen' ? BookOpen : 
                           feature.icon === 'PenTool' ? CheckCircle2 : Users;
                           
              return (
                <FadeIn key={index} delay={index * 0.1}>
                  <Card className="h-full border border-slate-100 bg-white shadow-sm hover:shadow-xl hover:border-accent/20 transition-all duration-500 group overflow-hidden relative border-t-2 border-t-transparent hover:border-t-accent">
                    <CardHeader className="pb-4">
                      <div className="w-14 h-14 rounded-2xl bg-slate-50 text-[#0B132B] flex items-center justify-center mb-6 group-hover:bg-[#0B132B] group-hover:text-accent transition-all duration-500 shadow-sm border border-slate-100/50">
                        <Icon className="w-6 h-6 text-[#0B132B] group-hover:text-accent transition-colors" />
                      </div>
                      <CardTitle className="text-lg text-[#0B132B] font-heading font-bold group-hover:text-accent transition-colors duration-300">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground leading-relaxed text-sm font-sans">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. TOP ACHIEVERS */}
      <section className="py-[120px] bg-white border-b border-slate-100 overflow-hidden relative">
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="max-w-[1280px] mx-auto px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-20 gap-8">
            <FadeIn className="max-w-2xl">
              <div className="text-accent font-semibold tracking-widest text-xs uppercase mb-4 flex items-center gap-2 font-sans">
                <Trophy className="w-4 h-4 text-accent" /> {cmsContent.home.topAchievers.title.toUpperCase()}
              </div>
              <h2 className="text-[#0B132B] font-heading font-bold text-3xl md:text-4xl lg:text-5xl mb-6">{cmsContent.home.topAchievers.title}</h2>
              <p className="text-muted-foreground text-base leading-relaxed font-sans">{cmsContent.home.topAchievers.description}</p>
            </FadeIn>
            <FadeIn delay={0.2} className="shrink-0 w-full sm:w-auto">
              <Button asChild variant="outline" className="border-slate-200 hover:border-accent hover:text-accent rounded-xl text-sm font-bold h-12 w-full sm:w-auto justify-center transition-all duration-300">
                <Link href="/achievements" className="flex items-center gap-2">View All Results <ArrowRight className="w-4 h-4" /></Link>
              </Button>
            </FadeIn>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {displayAchievements.map((student: any, index: number) => (
              <FadeIn key={index} delay={index * 0.1}>
                <div className="relative group rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-slate-100 bg-background">
                  <div className="aspect-[4/5] relative overflow-hidden bg-slate-50">
                    <Image 
                      src={student.image} 
                      alt={student.name} 
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover transition-transform duration-1000 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0B132B]/85 via-[#0B132B]/15 to-transparent z-10"></div>
                  </div>
                  {/* Glassmorphic Card Overlay */}
                  <div className="absolute bottom-4 left-4 right-4 p-5 rounded-2xl bg-[#0B132B]/75 backdrop-blur-md border border-white/10 z-20 transition-all duration-500 group-hover:bg-[#0B132B]/85">
                    <div className="inline-block px-2.5 py-0.5 rounded-lg bg-accent text-[#0B132B] font-bold text-[10px] mb-3 shadow-md">
                      {student.rank}
                    </div>
                    <h3 className="text-white font-heading font-bold text-lg mb-1 leading-snug">{student.name}</h3>
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-accent">{student.score}</span>
                      <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">NEET {student.year}</span>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* 5. COURSES */}
      <section className="py-[120px] bg-slate-50 text-[#0B132B] relative border-b border-slate-100 overflow-hidden">
        {/* Decorative Grid and glows */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0b132b03_1px,transparent_1px),linear-gradient(to_bottom,#0b132b03_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none z-10"></div>
        <div className="absolute top-[20%] right-[10%] w-[350px] h-[350px] bg-accent/5 rounded-full blur-[120px] pointer-events-none z-0"></div>

        <div className="max-w-[1280px] mx-auto px-6 lg:px-8 relative z-20">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <FadeIn>
              <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-[#0B132B] text-[10px] font-bold tracking-widest uppercase mb-4">
                <Award className="w-3.5 h-3.5 fill-accent text-accent animate-pulse" /> ACADEMIC PROGRAMS
              </div>
              <h2 className="font-heading font-bold text-3xl md:text-4xl lg:text-5xl text-[#0B132B] mb-6">{cmsContent.home.courses.title}</h2>
              <p className="text-slate-600 text-base leading-relaxed max-w-2xl mx-auto font-sans">{cmsContent.home.courses.description}</p>
            </FadeIn>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {displayCourses.map((course: any, index: number) => (
              <FadeIn key={course.id || index} delay={index * 0.1}>
                <Card className="h-full bg-white border border-slate-100/80 text-slate-800 shadow-md shadow-slate-100/40 hover:shadow-xl hover:border-accent/35 hover:-translate-y-1.5 transition-all duration-500 flex flex-col justify-between overflow-hidden relative border-t-4 border-t-accent">
                  <CardHeader className="pb-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                      <div className="px-2.5 py-1 rounded-md text-[9px] uppercase tracking-wider font-extrabold bg-[#0B132B]/5 text-[#0B132B] border border-[#0B132B]/10 max-w-full">
                        {course.target}
                      </div>
                      <span className="text-[10px] text-accent font-bold uppercase tracking-wider flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {course.duration}
                      </span>
                    </div>
                    <CardTitle className="text-xl text-[#0B132B] font-heading font-bold mb-2 leading-snug">{course.title}</CardTitle>
                    <div className="flex flex-col gap-1.5 text-[11px] text-slate-500 font-semibold uppercase tracking-wider border-t border-slate-100 pt-3 mt-3 font-sans">
                      {course.days && (
                        <p className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-accent shrink-0" /><span className="font-bold text-[#0B132B]">Schedule:</span> <span className="font-medium text-slate-600">{course.days}</span></p>
                      )}
                      <p className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-accent shrink-0" /><span className="font-bold text-[#0B132B]">Timing:</span> <span className="font-medium text-slate-600">{course.classTiming}</span></p>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-slate-600/90 mb-6 text-sm leading-relaxed font-sans">{course.description}</p>
                    <ul className="space-y-3">
                      {course.highlights.map((highlight: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-600 font-sans">
                          <CheckCircle2 className="w-4.5 h-4.5 text-accent shrink-0 mt-0.5 fill-accent/10" />
                          <span className="leading-relaxed font-medium">{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter className="pt-4 w-full flex flex-col xl:flex-row gap-3 border-t border-slate-50 bg-slate-50/30">
                    <Button className="w-full xl:flex-1 h-12 rounded-xl bg-gradient-to-r from-accent to-[#D4AF37] hover:from-[#D4AF37] hover:to-[#B89047] text-[#0B132B] font-bold text-sm tracking-wide shadow-md shadow-accent/5 border border-accent/20 hover:-translate-y-0.5 transition-all duration-300" variant="accent" asChild>
                      <a href={`https://wa.me/91${settings.whatsappNumber}?text=Hello%20ADHITYA%20NEET%20ACADEMY%2C%20I%2520would%2520like%2520to%2520know%2520more%2520about%2520your%2520courses.`}>WhatsApp</a>
                    </Button>
                    <Button className="w-full xl:flex-1 h-12 rounded-xl border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 hover:text-[#0B132B] font-bold text-sm hover:-translate-y-0.5 transition-all duration-300 shadow-sm" variant="outline" asChild>
                      <Link href="/contact">Contact</Link>
                    </Button>
                  </CardFooter>
                </Card>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* 6. TESTIMONIALS */}
      <section className="py-[120px] bg-background border-b border-slate-100 relative overflow-hidden">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <FadeIn>
              <h2 className="text-[#0B132B] font-heading font-bold text-3xl md:text-4xl lg:text-5xl mb-6">{cmsContent.home.testimonials.title}</h2>
              <p className="text-muted-foreground text-base leading-relaxed max-w-2xl mx-auto font-sans">{cmsContent.home.testimonials.description}</p>
            </FadeIn>
          </div>

          <FadeIn delay={0.1}>
            <TestimonialsSlider testimonials={testimonials} />
          </FadeIn>
        </div>
      </section>

      {/* 7. CTA SECTION */}
      <section className="py-[120px] bg-[#0B132B] relative overflow-hidden text-white border-t border-slate-800">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff01_1px,transparent_1px),linear-gradient(to_bottom,#ffffff01_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none z-10"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[160px] pointer-events-none z-0"></div>

        <div className="max-w-[1280px] mx-auto px-6 lg:px-8 relative z-20">
          <div className="max-w-3xl mx-auto text-center">
            <FadeIn>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-white mb-6 leading-snug">{cmsContent.home.cta.title}</h2>
              <p className="text-base sm:text-lg text-slate-300/90 mb-10 leading-relaxed max-w-xl mx-auto font-sans">{cmsContent.home.cta.description}</p>
              <div className="flex flex-col sm:flex-row justify-center gap-5">
                <Button size="lg" variant="accent" asChild className="h-14 px-8 rounded-xl bg-gradient-to-r from-accent to-[#D4AF37] hover:from-[#D4AF37] hover:to-[#B89047] text-[#0B132B] font-bold text-sm tracking-wide shadow-lg shadow-accent/10 border border-accent/20 hover:-translate-y-0.5 transition-all duration-300">
                  <a href={`tel:${settings.phonePrimary}`}>Call Now</a>
                </Button>
                <Button size="lg" variant="outline" className="h-14 px-8 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/40 text-white font-bold backdrop-blur-md hover:-translate-y-0.5 transition-all duration-300 shadow-inner" asChild>
                  <a href={`https://wa.me/91${settings.whatsappNumber}?text=Hello%20ADHITYA%20NEET%20ACADEMY%2C%20I%20would%2520like%2520to%2520know%2520more%2520about%2520your%2520courses.`}>WhatsApp Now</a>
                </Button>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

    </div>
  );
}
