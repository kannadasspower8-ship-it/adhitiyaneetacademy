import { Metadata } from "next";
import { FadeIn } from "@/components/shared/FadeIn";
import { getDynamicAchievements } from "@/lib/cms-loader";
import { createClient } from "@/lib/supabase/server";
import { cmsContent } from "@/data/cmsContent";
import { Star, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
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
    <div className="pt-24 pb-[120px] min-h-screen bg-background text-foreground animate-fadeIn relative overflow-hidden">
      {/* Background spotlights */}
      <div className="absolute top-[10%] right-[10%] w-[350px] h-[350px] bg-accent/5 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[30%] left-[5%] w-[350px] h-[350px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none z-0"></div>

      <div className="max-w-[1280px] mx-auto px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-24 pt-20">
          <FadeIn>
            <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 border border-accent/25 text-accent text-[10px] font-bold tracking-widest uppercase mb-4">
              <Star className="w-3.5 h-3.5 fill-accent text-accent" /> ACADEMY HALL OF FAME
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-[#0B132B] mb-8">
              {cmsContent.achievementsPage.hero.title ? (
                <span>
                  {cmsContent.achievementsPage.hero.title.split(" ").map((w: string, i: number) => {
                    const match = ["achievements", "performers", "outstanding", "results", "neet"].includes(w.toLowerCase());
                    return match ? (
                      <span key={i} className="bg-gradient-to-r from-accent via-[#FDF0A6] to-[#D4AF37] bg-clip-text text-transparent italic font-bold">
                        {w}{" "}
                      </span>
                    ) : w + " ";
                  })}
                </span>
              ) : "Outstanding Achievements"}
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed font-sans max-w-2xl mx-auto">
              {cmsContent.achievementsPage.hero.description}
            </p>
          </FadeIn>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-[120px]">
          {cmsContent.achievementsPage.stats.map((stat, index) => (
            <FadeIn key={index} delay={index * 0.1}>
              <Card className="border border-slate-100 bg-white text-center shadow-sm hover:shadow-xl hover:border-accent/20 transition-all duration-500 rounded-2xl overflow-hidden relative border-t-2 border-t-transparent hover:border-t-accent">
                <CardContent className="p-8">
                  <h3 className="text-4xl md:text-5xl font-heading font-bold text-[#0B132B] mb-3">{stat.value}</h3>
                  <p className="text-muted-foreground font-bold text-[10px] tracking-widest uppercase font-sans">{stat.label}</p>
                </CardContent>
              </Card>
            </FadeIn>
          ))}
        </div>

        {/* Top Ranks Showcase */}
        <div className="mb-[120px]">
          <FadeIn className="mb-12">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-[#0B132B] flex items-center gap-3">
              <Star className="text-accent fill-accent" /> {cmsContent.achievementsPage.performers.title}
            </h2>
          </FadeIn>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {dbAchievements.map((student: any, index: number) => (
              <FadeIn key={index} delay={index * 0.1}>
                <div className="relative group rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-slate-100 bg-white">
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
                    <p className="font-bold text-accent text-sm">{student.score}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>

        {/* Year wise trend */}
        <FadeIn>
          <Card className="bg-[#0B132B] rounded-[32px] border border-slate-800 shadow-2xl overflow-hidden text-white relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent to-[#D4AF37]"></div>
            <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
              <TrendingUp className="w-64 h-64 text-white" />
            </div>
            <CardContent className="p-8 md:p-16 relative z-10">
              <div className="max-w-2xl space-y-4">
                <h2 className="text-3xl md:text-4xl font-heading font-bold text-white leading-tight">{cmsContent.achievementsPage.trend.title}</h2>
                <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-sans font-medium">
                  {cmsContent.achievementsPage.trend.description}
                </p>
              </div>
            </CardContent>
          </Card>
        </FadeIn>
      </div>
    </div>
  );
}
