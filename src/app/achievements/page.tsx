import { Metadata } from "next";
import { FadeIn } from "@/components/shared/FadeIn";
import { getDynamicAchievements } from "@/lib/cms-loader";
import { createClient } from "@/lib/supabase/server";
import { cmsContent } from "@/data/cmsContent";
import { Star, GraduationCap } from "lucide-react";
import Image from "next/image";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Achievements | Adhithya NEET Academy",
  description: "View our student's outstanding results and top NEET ranks.",
};

export default async function AchievementsPage() {
  const supabase = await createClient();
  const dbAchievements = await getDynamicAchievements(supabase);

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-foreground">

      {/* Hero Banner */}
      <section className="relative bg-[#0B132B] overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,#ffffff03_25%,transparent_25%,transparent_50%,#ffffff03_50%,#ffffff03_75%,transparent_75%)] bg-[size:40px_40px] pointer-events-none" />
        <div className="absolute top-0 right-0 w-[40%] h-full bg-gradient-to-l from-accent/[0.04] to-transparent pointer-events-none" />

        <div className="max-w-[1280px] mx-auto px-5 sm:px-6 lg:px-8 pt-40 pb-20 sm:pt-44 sm:pb-24 text-center relative z-10">
          <FadeIn>
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-accent/30 bg-accent/[0.06] text-accent text-xs font-semibold tracking-[0.15em] uppercase font-sans mb-8">
              <Star className="w-3.5 h-3.5 fill-accent text-accent" /> Hall of Fame
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold text-white leading-[1.1] mb-6 text-balance">
              {cmsContent.achievementsPage.hero.title}
            </h1>
            <p className="text-base sm:text-lg text-white/50 leading-[1.8] font-sans max-w-2xl mx-auto">
              {cmsContent.achievementsPage.hero.description}
            </p>
          </FadeIn>
        </div>
      </section>

      <div className="max-w-[1280px] mx-auto px-5 sm:px-6 lg:px-8">

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-16 sm:py-20">
          {cmsContent.achievementsPage.stats.map((stat, index) => (
            <FadeIn key={index} delay={index * 0.08}>
              <div className="text-center bg-white border border-slate-100 rounded-2xl p-8 card-hover">
                <h3 className="text-3xl md:text-4xl font-heading font-bold text-[#0B132B] mb-2">{stat.value}</h3>
                <div className="w-8 h-[2px] bg-accent/40 mx-auto mb-3" />
                <p className="text-muted-foreground font-sans font-semibold text-[10px] tracking-widest uppercase">{stat.label}</p>
              </div>
            </FadeIn>
          ))}
        </div>

        {/* Top Ranks Showcase */}
        <div className="pb-20 sm:pb-28">
          <FadeIn className="mb-12 lg:mb-16">
            <span className="text-accent font-sans text-xs font-semibold tracking-[0.2em] uppercase flex items-center gap-2 mb-4">
              <Star className="w-3.5 h-3.5 fill-accent text-accent" /> Top Performers
            </span>
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-[#0B132B] text-balance">
              {cmsContent.achievementsPage.performers.title}
            </h2>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {dbAchievements.map((student: any, index: number) => (
              <FadeIn key={index} delay={index * 0.08}>
                <div className="relative group rounded-2xl overflow-hidden card-hover bg-white border border-slate-100">
                  <div className="aspect-[3/4] relative overflow-hidden">
                    <Image
                      src={student.image}
                      alt={student.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0B132B]/90 via-[#0B132B]/20 to-transparent" />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6 z-10">
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <span className="inline-block px-2.5 py-1 rounded-lg bg-accent text-[#0B132B] font-bold text-[10px] tracking-wide uppercase">
                        {student.rank}
                      </span>
                      <span className="text-[10px] text-white/50 font-sans font-semibold tracking-wider uppercase">
                        NEET {student.year}
                      </span>
                    </div>
                    <h3 className="text-white font-heading font-bold text-lg mb-1">{student.name}</h3>
                    <p className="font-bold text-accent text-sm mb-1">{student.score}</p>
                    {student.medical_college && (
                      <p className="text-[10px] text-emerald-400/80 font-sans font-semibold uppercase tracking-wide mt-2 flex items-center gap-1.5">
                        <GraduationCap className="w-3.5 h-3.5 text-accent shrink-0" /> {student.medical_college}
                      </p>
                    )}
                    {student.description && (
                      <p className="text-[10px] text-white/40 italic leading-relaxed mt-2 pt-2 border-t border-white/10 line-clamp-2 group-hover:line-clamp-none transition-all duration-500 font-sans">
                        &quot;{student.description}&quot;
                      </p>
                    )}
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>

        {/* Trend Card */}
        <FadeIn>
          <div className="bg-[#0B132B] rounded-2xl overflow-hidden relative mb-20">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-accent via-accent/60 to-transparent" />
            <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-accent/[0.04] rounded-full blur-[100px] pointer-events-none" />
            <div className="p-10 md:p-16 relative z-10">
              <div className="max-w-2xl space-y-5">
                <h2 className="text-3xl md:text-4xl font-heading font-bold text-white leading-tight text-balance">
                  {cmsContent.achievementsPage.trend.title}
                </h2>
                <p className="text-white/40 text-sm sm:text-base leading-[1.8] font-sans">
                  {cmsContent.achievementsPage.trend.description}
                </p>
              </div>
            </div>
          </div>
        </FadeIn>

      </div>
    </div>
  );
}
