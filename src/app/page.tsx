import Link from "next/link";
import Image from "next/image";
import dynamicImport from "next/dynamic";
import { ArrowRight, CheckCircle2, Star, Trophy, Users, BookOpen, GraduationCap, Sparkles, Clock, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/shared/FadeIn";
import { getGlobalSettings, getSectionContent, getDynamicCourses, getDynamicAchievements } from "@/lib/cms-loader";
import { createClient } from "@/lib/supabase/server";
import { features, testimonials as fallbackTestimonials } from "@/data/mockData";
import { cmsContent } from "@/data/cmsContent";
import { Metadata } from "next";

const TestimonialsSlider = dynamicImport(
  () => import("@/components/shared/TestimonialsSlider").then((mod) => mod.TestimonialsSlider),
  { ssr: true, loading: () => <div className="h-[300px] bg-slate-50 rounded-2xl animate-pulse" /> }
);

export const dynamic = "force-dynamic";

function formatTitle(text: string) {
  if (!text) return "Where Future Doctors Begin Their Journey";
  const parts = text.split(/(\*[^*]+\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("*") && part.endsWith("*")) {
      return (
        <span key={i} className="text-accent italic font-serif">
          {part.slice(1, -1)}
        </span>
      );
    }
    return part;
  });
}

export async function generateMetadata(): Promise<Metadata> {
  try {
    const supabase = await createClient();
    const { data } = await supabase.from("website_home").select("seo_title, seo_description").eq("id", "main").single();
    if (data) {
      return {
        title: data.seo_title || "Adhitya NEET Academy | Premium NEET Coaching in Erode",
        description: data.seo_description || "Secure your MBBS seat with Adhitya NEET Academy in Erode.",
      };
    }
  } catch {}
  return {
    title: "Adhitya NEET Academy | Premium NEET Coaching in Erode",
    description: "Secure your MBBS seat with Adhitya NEET Academy in Erode. Elite weekend programs, repeater batches, crash courses, and comprehensive test series with expert guidance.",
  };
}

export default async function Home() {
  const supabase = await createClient();
  const settings = await getGlobalSettings(supabase);
  const heroContent = await getSectionContent("home_hero", cmsContent.home.hero, supabase);
  const whyUsContent = await getSectionContent("home_why_choose_us", cmsContent.home.whyChooseUs, supabase);
  const dbCourses = await getDynamicCourses(supabase);
  const dbAchievements = await getDynamicAchievements(supabase);

  const displayCourses = dbCourses.slice(0, 2);
  const displayAchievements = dbAchievements.slice(0, 3);

  const fallbackStats = [
    { label: "Students Trained", value: "2,500+" },
    { label: "Success Rate", value: "95%" },
    { label: "Years of Experience", value: "15+" },
    { label: "Expert Faculty", value: "35+" }
  ];
  const homepageStats = heroContent.stats && heroContent.stats.length > 0 ? heroContent.stats : fallbackStats;

  return (
    <div className="flex flex-col w-full overflow-hidden bg-background">

      {/* ════════════════════════════════════════════
          1. HERO — Full Viewport, Asymmetric Layout
      ════════════════════════════════════════════ */}
      <section className="relative min-h-[90vh] flex items-center bg-[#FAFAF8] overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-[60%] h-full bg-gradient-to-l from-accent/[0.03] to-transparent pointer-events-none" />
        <div className="absolute bottom-0 left-[10%] w-[400px] h-[400px] bg-accent/[0.04] rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-[1280px] mx-auto px-5 sm:px-6 lg:px-8 w-full py-32 sm:py-36 lg:py-0 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

            {/* Content Column */}
            <div className="lg:col-span-7 xl:col-span-6">
              <FadeIn direction="up" delay={0.05}>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-accent/30 bg-accent/[0.04] mb-8">
                  <Star className="w-3 h-3 text-accent fill-accent" />
                  <span className="text-[10px] sm:text-xs font-semibold tracking-[0.15em] uppercase text-accent/90 font-sans">
                    {heroContent.subtitle || "Guiding Future Medical Professionals"}
                  </span>
                </div>
              </FadeIn>

              <FadeIn direction="up" delay={0.12}>
                <h1 className="font-heading font-bold text-[#0B132B] leading-[1.05] tracking-[-0.025em] text-3xl sm:text-4xl md:text-5xl lg:text-[3.5rem] xl:text-[4rem] text-balance">
                  {formatTitle(heroContent.titleHighlight)}
                </h1>
              </FadeIn>

              <FadeIn direction="up" delay={0.18}>
                <div className="w-12 h-[3px] bg-accent rounded-full mt-6 mb-6" />
                <p className="text-slate-500 text-sm sm:text-base lg:text-lg leading-[1.8] max-w-[520px] font-sans">
                  {heroContent.description}
                </p>
              </FadeIn>

              <FadeIn direction="up" delay={0.25}>
                <div className="flex flex-col sm:flex-row gap-3 mt-8">
                  <Button size="lg" asChild className="h-13 px-7 rounded-xl bg-[#0B132B] hover:bg-[#1a2744] text-white font-semibold text-sm shadow-lg shadow-[#0B132B]/10 transition-all duration-300 hover:-translate-y-[1px] gap-2">
                    <Link href={heroContent.primaryBtnLink || "/contact"}>
                      {heroContent.primaryBtnText || "Apply for Admission"}
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild className="h-13 px-7 rounded-xl border-slate-200 bg-white hover:bg-slate-50 text-[#0B132B] font-semibold text-sm transition-all duration-300 gap-2">
                    <a
                      href={heroContent.secondaryBtnLink || `https://wa.me/91${settings.whatsappNumber}?text=Hello%20ADHITYA%20NEET%20ACADEMY`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <svg className="w-4 h-4 text-[#25D366]" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                      </svg>
                      {heroContent.secondaryBtnText || "WhatsApp Now"}
                    </a>
                  </Button>
                </div>
              </FadeIn>
            </div>

            {/* Image Column */}
            <div className="lg:col-span-5 xl:col-span-6 relative">
              <FadeIn direction="left" delay={0.2}>
                <div className="relative">
                  {/* Gold frame offset behind */}
                  <div className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4 w-full h-full rounded-3xl border-2 border-accent/20 pointer-events-none" />
                  {/* Image */}
                  <div className="relative aspect-[4/3] lg:aspect-[3/4] xl:aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl shadow-[#0B132B]/10">
                    <Image
                      src={heroContent.image || "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=2070"}
                      alt="Students engaged in focused NEET preparation"
                      fill
                      priority
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-cover"
                    />
                  </div>
                </div>
              </FadeIn>
            </div>

          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          2. STATS BAR
      ════════════════════════════════════════════ */}
      <section className="bg-[#0B132B] relative">
        <div className="max-w-[1280px] mx-auto px-5 sm:px-6 lg:px-8 py-12 sm:py-16">
          <FadeIn direction="up" delay={0.05}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
              {homepageStats.map((stat: any, i: number) => (
                <div key={i} className="text-center">
                  <span className="block text-3xl sm:text-4xl md:text-[2.75rem] font-heading font-bold text-accent mb-2 leading-none">
                    {stat.value}
                  </span>
                  <div className="w-8 h-[2px] bg-accent/30 mx-auto mb-3" />
                  <span className="text-[11px] sm:text-xs font-sans font-medium text-white/50 tracking-wider uppercase">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          3. EDITORIAL QUOTE
      ════════════════════════════════════════════ */}
      <section className="bg-white">
        <div className="max-w-[900px] mx-auto px-5 sm:px-6 lg:px-8 py-20 sm:py-24 text-center">
          <FadeIn>
            <p className="font-heading italic text-xl sm:text-2xl md:text-3xl text-[#0B132B]/80 leading-[1.6]">
              <span className="text-accent">&mdash;</span>&ensp;Dream it. Believe it. Achieve it.&ensp;<span className="text-accent">&mdash;</span>
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          4. WHY CHOOSE US — Staggered 2+2 Grid
      ════════════════════════════════════════════ */}
      <section className="section-pad bg-[#FAFAF8] relative">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-accent/[0.03] rounded-full blur-[150px] pointer-events-none" />
        <div className="max-w-[1280px] mx-auto px-5 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-16 lg:mb-20">
            <FadeIn>
              <span className="text-accent font-sans text-xs font-semibold tracking-[0.2em] uppercase flex items-center gap-2 mb-4">
                <Sparkles className="w-3.5 h-3.5 fill-accent text-accent" /> Why Choose Us
              </span>
              <h2 className="text-[#0B132B] font-heading font-bold text-3xl md:text-4xl lg:text-[2.75rem] leading-[1.15] mb-5 text-balance">
                {whyUsContent.title}
              </h2>
              <p className="text-muted-foreground text-base leading-[1.8] font-sans">{whyUsContent.description}</p>
            </FadeIn>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {(whyUsContent.items || features).map((feature: any, index: number) => {
              const Icon = feature.icon === 'GraduationCap' ? GraduationCap :
                           feature.icon === 'BookOpen' ? BookOpen :
                           feature.icon === 'PenTool' ? CheckCircle2 : Users;
              return (
                <FadeIn key={index} delay={index * 0.08}>
                  <div className={`bg-white border border-slate-100 rounded-2xl p-8 lg:p-10 card-hover group ${index >= 2 ? 'md:mt-8' : ''}`}>
                    <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-6 group-hover:bg-accent/20 transition-colors duration-300">
                      <Icon className="w-5 h-5 text-accent" />
                    </div>
                    <h3 className="text-lg font-heading font-bold text-[#0B132B] mb-3 group-hover:text-accent transition-colors duration-300">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground leading-[1.8] text-sm font-sans">
                      {feature.description}
                    </p>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          5. TOP ACHIEVERS — Magazine Layout
      ════════════════════════════════════════════ */}
      <section className="section-pad bg-white relative overflow-hidden">
        <div className="max-w-[1280px] mx-auto px-5 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 lg:mb-20 gap-8">
            <FadeIn className="max-w-2xl">
              <span className="text-accent font-sans text-xs font-semibold tracking-[0.2em] uppercase flex items-center gap-2 mb-4">
                <Trophy className="w-3.5 h-3.5 text-accent" /> Hall of Fame
              </span>
              <h2 className="text-[#0B132B] font-heading font-bold text-3xl md:text-4xl lg:text-[2.75rem] leading-[1.15] mb-5 text-balance">
                {cmsContent.home.topAchievers.title}
              </h2>
              <p className="text-muted-foreground text-base leading-[1.8] font-sans">{cmsContent.home.topAchievers.description}</p>
            </FadeIn>
            <FadeIn delay={0.15} className="shrink-0">
              <Button asChild variant="outline" className="border-slate-200 hover:border-[#0B132B] hover:bg-[#0B132B] hover:text-white rounded-xl text-sm font-semibold h-12 transition-all duration-300 gap-2">
                <Link href="/achievements">View All Results <ArrowRight className="w-4 h-4" /></Link>
              </Button>
            </FadeIn>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {displayAchievements.map((student: any, index: number) => (
              <FadeIn key={index} delay={index * 0.1}>
                <div className="relative group rounded-2xl overflow-hidden card-hover bg-white border border-slate-100">
                  <div className="aspect-[3/4] relative overflow-hidden">
                    <Image
                      src={student.image}
                      alt={student.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0B132B]/90 via-[#0B132B]/20 to-transparent" />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 z-10">
                    <div className="inline-block px-2.5 py-1 rounded-lg bg-accent text-[#0B132B] font-bold text-[10px] mb-3 tracking-wide uppercase">
                      {student.rank}
                    </div>
                    <h3 className="text-white font-heading font-bold text-xl mb-1.5">{student.name}</h3>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-accent text-sm">{student.score}</span>
                      <span className="text-white/50 font-sans font-semibold text-[10px] tracking-wider uppercase">NEET {student.year}</span>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          6. COURSES PREVIEW — 2 Featured Programs
      ════════════════════════════════════════════ */}
      <section className="section-pad bg-[#FAFAF8] relative overflow-hidden">
        <div className="max-w-[1280px] mx-auto px-5 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-2xl mx-auto text-center mb-16 lg:mb-20">
            <FadeIn>
              <span className="text-accent font-sans text-xs font-semibold tracking-[0.2em] uppercase flex items-center justify-center gap-2 mb-4">
                <BookOpen className="w-3.5 h-3.5 text-accent" /> Academic Programs
              </span>
              <h2 className="font-heading font-bold text-3xl md:text-4xl lg:text-[2.75rem] text-[#0B132B] leading-[1.15] mb-5 text-balance">
                {cmsContent.home.courses.title}
              </h2>
              <p className="text-muted-foreground text-base leading-[1.8] font-sans">{cmsContent.home.courses.description}</p>
            </FadeIn>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {displayCourses.map((course: any, index: number) => (
              <FadeIn key={course.id || index} delay={index * 0.1}>
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
                    <div className="w-1 bg-accent shrink-0 rounded-l-2xl" />
                    <div className="flex-1 p-6 sm:p-8 flex flex-col">
                      <div className="flex items-center justify-between gap-3 mb-5">
                        <span className="px-2.5 py-1 rounded-md text-[9px] uppercase tracking-wider font-bold bg-[#0B132B]/5 text-[#0B132B] border border-[#0B132B]/10 font-sans">
                          {course.target}
                        </span>
                        <span className="text-xs text-accent font-bold uppercase tracking-wider flex items-center gap-1 font-sans">
                          <Clock className="w-3.5 h-3.5" /> {course.duration}
                        </span>
                      </div>

                      <h3 className="text-xl font-heading font-bold text-[#0B132B] mb-4">{course.title}</h3>
                      <p className="text-muted-foreground text-sm leading-[1.8] mb-6 font-sans">{course.description}</p>

                      <ul className="space-y-2.5 mb-8 flex-grow">
                        {course.highlights.slice(0, 4).map((h: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-600 font-sans">
                            <CheckCircle2 className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                            <span className="leading-relaxed">{h}</span>
                          </li>
                        ))}
                      </ul>

                      <Link
                        href="/courses"
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0B132B] hover:text-accent transition-colors font-sans group/link mt-auto"
                      >
                        Explore Program
                        <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>

          <FadeIn delay={0.2}>
            <div className="text-center mt-12">
              <Button asChild variant="outline" className="border-slate-200 hover:border-[#0B132B] hover:bg-[#0B132B] hover:text-white rounded-xl text-sm font-semibold h-12 px-8 transition-all duration-300 gap-2">
                <Link href="/courses">View All Programs <ArrowRight className="w-4 h-4" /></Link>
              </Button>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          7. TESTIMONIALS
      ════════════════════════════════════════════ */}
      <section className="section-pad bg-white relative overflow-hidden">
        <div className="max-w-[1280px] mx-auto px-5 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-16 lg:mb-20">
            <FadeIn>
              <span className="text-accent font-sans text-xs font-semibold tracking-[0.2em] uppercase flex items-center gap-2 mb-4">
                <Star className="w-3.5 h-3.5 fill-accent text-accent" /> Student Voices
              </span>
              <h2 className="text-[#0B132B] font-heading font-bold text-3xl md:text-4xl lg:text-[2.75rem] leading-[1.15] text-balance">
                {cmsContent.home.testimonials.title}
              </h2>
            </FadeIn>
          </div>

          <FadeIn delay={0.1}>
            <TestimonialsSlider testimonials={heroContent.testimonials && heroContent.testimonials.length > 0 ? heroContent.testimonials : fallbackTestimonials} />
          </FadeIn>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          8. CTA — Dark with Gold Glow
      ════════════════════════════════════════════ */}
      <section className="bg-[#0B132B] relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent/[0.06] rounded-full blur-[160px] pointer-events-none" />

        <div className="max-w-[1280px] mx-auto px-5 sm:px-6 lg:px-8 py-24 sm:py-32 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <FadeIn>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-white mb-6 leading-[1.15] text-balance">
                {cmsContent.home.cta.title}
              </h2>
              <p className="text-base sm:text-lg text-white/50 mb-10 leading-[1.8] max-w-xl mx-auto font-sans">
                {cmsContent.home.cta.description}
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button size="lg" asChild className="h-14 px-8 rounded-xl bg-accent hover:bg-accent/90 text-[#0B132B] font-bold text-sm tracking-wide shadow-lg shadow-accent/20 hover:-translate-y-[1px] transition-all duration-300">
                  <a href={`tel:${settings.phonePrimary}`}>Call Now</a>
                </Button>
                <Button size="lg" variant="outline" className="h-14 px-8 rounded-xl border-white/15 bg-white/5 hover:bg-white/10 text-white font-semibold backdrop-blur-sm hover:-translate-y-[1px] transition-all duration-300" asChild>
                  <a href={`https://wa.me/91${settings.whatsappNumber}?text=Hello%20ADHITYA%20NEET%20ACADEMY%2C%20I%20would%20like%20to%20know%20more%20about%20your%20courses.`}>WhatsApp Now</a>
                </Button>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

    </div>
  );
}
