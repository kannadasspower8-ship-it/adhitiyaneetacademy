import { Metadata } from "next";
import { FadeIn } from "@/components/shared/FadeIn";
import { getGlobalSettings } from "@/lib/cms-loader";
import { createClient } from "@/lib/supabase/server";
import { cmsContent } from "@/data/cmsContent";
import { MapPin, Phone, Mail, MessageCircle, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Contact Us | Adhithya NEET Academy",
  description: "Get in touch with Adhithya NEET Academy for admissions and inquiries.",
};

export default async function ContactPage() {
  const supabase = await createClient();
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
              <Sparkles className="w-3.5 h-3.5 fill-accent text-accent" /> Admissions Open
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold text-white leading-[1.1] mb-6 text-balance">
              {cmsContent.contactPage.hero.title}
            </h1>
            <p className="text-base sm:text-lg text-white/50 leading-[1.8] font-sans max-w-2xl mx-auto">
              {cmsContent.contactPage.hero.description}
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-[1280px] mx-auto px-5 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">

          {/* Contact Information — Left Column */}
          <div className="lg:col-span-1">
            <FadeIn delay={0.1}>
              <h2 className="text-2xl font-heading font-bold text-[#0B132B] mb-8">Contact Info</h2>
            </FadeIn>

            <FadeIn delay={0.15}>
              <div className="space-y-6">
                {/* Address */}
                <div className="flex items-start gap-4 group">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0 group-hover:bg-accent/20 transition-colors">
                    <MapPin className="w-4 h-4 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-sans font-semibold text-sm text-[#0B132B] mb-1">Office Address</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed font-sans whitespace-pre-line">
                      {settings.address}
                    </p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start gap-4 group">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0 group-hover:bg-accent/20 transition-colors">
                    <Phone className="w-4 h-4 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-sans font-semibold text-sm text-[#0B132B] mb-1">Phone Number</h3>
                    <a href={`tel:${settings.phonePrimary}`} className="text-muted-foreground text-sm hover:text-accent transition-colors font-sans">
                      {settings.phonePrimary}
                    </a>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-4 group">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0 group-hover:bg-accent/20 transition-colors">
                    <Mail className="w-4 h-4 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-sans font-semibold text-sm text-[#0B132B] mb-1">Email Address</h3>
                    <a href={`mailto:${settings.emailPrimary}`} className="text-muted-foreground text-sm hover:text-accent transition-colors font-sans">
                      {settings.emailPrimary}
                    </a>
                  </div>
                </div>

                {/* WhatsApp */}
                <div className="flex items-start gap-4 group">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0 group-hover:bg-accent/20 transition-colors">
                    <MessageCircle className="w-4 h-4 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-sans font-semibold text-sm text-[#0B132B] mb-1">WhatsApp</h3>
                    <a
                      href={`https://wa.me/91${settings.whatsappNumber}?text=Hello%20ADHITYA%20NEET%20ACADEMY%2C%20I%20would%20like%20to%20know%20more%20about%20your%20courses.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:text-[#0B132B] transition-colors font-sans"
                    >
                      Chat Now <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>

          {/* Contact Form — Right Column */}
          <div className="lg:col-span-2">
            <FadeIn delay={0.2}>
              <div className="bg-white border border-slate-100 rounded-2xl p-8 md:p-12">
                <h2 className="text-2xl font-heading font-bold text-[#0B132B] mb-2">{cmsContent.contactPage.form.title}</h2>
                <p className="text-muted-foreground mb-10 leading-relaxed font-sans text-sm">{cmsContent.contactPage.form.description}</p>

                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label htmlFor="firstName" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-sans">First Name</label>
                      <input
                        type="text"
                        id="firstName"
                        className="w-full h-13 px-4 rounded-xl border border-slate-200 focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none bg-white text-foreground transition-all duration-300 font-sans text-sm"
                        placeholder="John"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="lastName" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-sans">Last Name</label>
                      <input
                        type="text"
                        id="lastName"
                        className="w-full h-13 px-4 rounded-xl border border-slate-200 focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none bg-white text-foreground transition-all duration-300 font-sans text-sm"
                        placeholder="Doe"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-sans">Email Address</label>
                      <input
                        type="email"
                        id="email"
                        className="w-full h-13 px-4 rounded-xl border border-slate-200 focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none bg-white text-foreground transition-all duration-300 font-sans text-sm"
                        placeholder="john@example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="phone" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-sans">Phone Number</label>
                      <input
                        type="tel"
                        id="phone"
                        className="w-full h-13 px-4 rounded-xl border border-slate-200 focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none bg-white text-foreground transition-all duration-300 font-sans text-sm"
                        placeholder="+91 XXXXX XXXXX"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="course" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-sans">Interested Course</label>
                    <select
                      id="course"
                      className="w-full h-13 px-4 rounded-xl border border-slate-200 focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none bg-white text-muted-foreground transition-all duration-300 font-sans text-sm"
                    >
                      <option value="">Select a Course</option>
                      <option value="weekend">NEET Weekend</option>
                      <option value="test-batch">Test Batch</option>
                      <option value="crash">Crash Course</option>
                      <option value="repeater">NEET Repeater</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="message" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-sans">Message</label>
                    <textarea
                      id="message"
                      rows={5}
                      className="w-full p-4 rounded-xl border border-slate-200 focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none bg-white text-foreground transition-all duration-300 resize-none font-sans text-sm"
                      placeholder="How can we help you?"
                    ></textarea>
                  </div>

                  <Button type="button" size="lg" className="w-full h-13 rounded-xl bg-[#0B132B] hover:bg-[#1a2744] text-white font-semibold text-sm tracking-wide shadow-lg shadow-[#0B132B]/10 transition-all duration-300 gap-2">
                    Send Message
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </form>
              </div>
            </FadeIn>
          </div>

        </div>

        {/* Quick Action Buttons + Map */}
        <FadeIn delay={0.25} className="mt-16 sm:mt-24">
          <div className="flex flex-col md:flex-row flex-wrap gap-3 justify-center items-center mb-8">
            <Button asChild size="lg" className="h-12 px-6 rounded-xl bg-[#0B132B] hover:bg-[#1a2744] text-white font-semibold transition-all shadow-md gap-2">
              <a href={`tel:${settings.phonePrimary.replace(/\s+/g, '')}`}>
                <Phone className="w-4 h-4" /> Call Now
              </a>
            </Button>
            <Button asChild size="lg" className="h-12 px-6 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-semibold transition-all shadow-md gap-2">
              <a href={`https://wa.me/91${settings.whatsappNumber}?text=Hello%20ADHITYA%20NEET%20ACADEMY`} target="_blank" rel="noopener noreferrer">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                </svg>
                WhatsApp
              </a>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 px-6 rounded-xl border-slate-200 text-[#0B132B] font-semibold hover:bg-slate-50 transition-all gap-2">
              <a href="https://maps.app.goo.gl/3QyqFwGqf1L9oP3i6" target="_blank" rel="noopener noreferrer">
                <MapPin className="w-4 h-4 text-accent" /> Get Directions
              </a>
            </Button>
          </div>

          <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-sm bg-white">
            <div className="h-[400px] sm:h-[450px] w-full relative">
              <iframe
                src={settings.mapEmbed}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Google Maps Location"
                className="opacity-95"
              ></iframe>
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
