import { Metadata } from "next";
import { FadeIn } from "@/components/shared/FadeIn";
import { getGlobalSettings } from "@/lib/cms-loader";
import { createClient } from "@/lib/supabase/server";
import { cmsContent } from "@/data/cmsContent";
import { MapPin, Phone, Mail, MessageCircle, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Contact Us | Adhithya NEET Academy",
  description: "Get in touch with Adhithya NEET Academy for admissions and inquiries.",
};

export default async function ContactPage() {
  const supabase = await createClient();
  const settings = await getGlobalSettings(supabase);

  return (
    <div className="pt-24 pb-[120px] min-h-screen bg-background text-foreground animate-fadeIn relative overflow-hidden">
      {/* Background spotlights */}
      <div className="absolute top-[15%] right-[5%] w-[350px] h-[350px] bg-accent/5 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[20%] left-[10%] w-[350px] h-[350px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none z-0"></div>

      {/* Header */}
      <div className="bg-[#0B132B] text-white py-[120px] relative overflow-hidden border-b border-slate-800">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none z-10"></div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=2070')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
        <div className="max-w-[1280px] mx-auto px-6 lg:px-8 text-center max-w-3xl relative z-20">
          <FadeIn>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/10 border border-accent/25 text-accent text-[10px] font-bold tracking-widest uppercase mb-6">
              <Sparkles className="w-3.5 h-3.5 fill-accent text-accent animate-pulse" /> ADMISSIONS OPEN
            </div>
            <h1 className="text-5xl md:text-6xl font-heading font-bold mb-8">
              {cmsContent.contactPage.hero.title ? (
                <span>
                  {cmsContent.contactPage.hero.title.split(" ").map((w: string, i: number) => {
                    const match = ["contact", "us", "academy", "admissions", "inquiries"].includes(w.toLowerCase());
                    return match ? (
                      <span key={i} className="bg-gradient-to-r from-accent via-[#FDF0A6] to-[#D4AF37] bg-clip-text text-transparent italic font-bold">
                        {w}{" "}
                      </span>
                    ) : w + " ";
                  })}
                </span>
              ) : "Contact Us"}
            </h1>
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-sans max-w-2xl mx-auto">
              {cmsContent.contactPage.hero.description}
            </p>
          </FadeIn>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-6 lg:px-8 py-[120px] relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          
          {/* Contact Information */}
          <div className="lg:col-span-1 space-y-8">
            <FadeIn delay={0.1}>
              <h2 className="text-3xl font-heading font-bold text-[#0B132B] mb-8">Contact Info</h2>
            </FadeIn>
            
            <FadeIn delay={0.2} className="space-y-6">
              {/* Address Card */}
              <Card className="border border-slate-100 shadow-sm hover:shadow-xl hover:border-accent/25 hover:border-t-2 hover:border-t-accent transition-all duration-500 bg-white group rounded-[20px]">
                <CardContent className="p-8 flex items-start gap-5">
                  <div className="p-3 bg-accent/10 text-accent rounded-xl shrink-0 group-hover:bg-accent/20 transition-all duration-300 border border-accent/10">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-lg mb-2 text-[#0B132B]">Office Address</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed font-sans whitespace-pre-line">
                      {settings.address}
                    </p>
                  </div>
                </CardContent>
              </Card>
 
              {/* Phone Card */}
              <Card className="border border-slate-100 shadow-sm hover:shadow-xl hover:border-accent/25 hover:border-t-2 hover:border-t-accent transition-all duration-500 bg-white group rounded-[20px]">
                <CardContent className="p-8 flex items-start gap-5">
                  <div className="p-3 bg-accent/10 text-accent rounded-xl shrink-0 group-hover:bg-accent/20 transition-all duration-300 border border-accent/10">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-lg mb-2 text-[#0B132B]">Phone Number</h3>
                    <a href={`tel:${settings.phonePrimary}`} className="block text-muted-foreground text-sm font-semibold hover:text-accent transition-colors mt-1 font-sans">
                      {settings.phonePrimary}
                    </a>
                  </div>
                </CardContent>
              </Card>
 
              {/* Email Card */}
              <Card className="border border-slate-100 shadow-sm hover:shadow-xl hover:border-accent/25 hover:border-t-2 hover:border-t-accent transition-all duration-500 bg-white group rounded-[20px]">
                <CardContent className="p-8 flex items-start gap-5">
                  <div className="p-3 bg-accent/10 text-accent rounded-xl shrink-0 group-hover:bg-accent/20 transition-all duration-300 border border-accent/10">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-lg mb-2 text-[#0B132B]">Email Address</h3>
                    <a href={`mailto:${settings.emailPrimary}`} className="block text-muted-foreground text-sm font-semibold hover:text-accent transition-colors mt-1 font-sans">
                      {settings.emailPrimary}
                    </a>
                  </div>
                </CardContent>
              </Card>
 
              {/* WhatsApp Card */}
              <Card className="border border-slate-100 shadow-sm hover:shadow-xl hover:border-accent/25 hover:border-t-2 hover:border-t-accent transition-all duration-500 bg-white group rounded-[20px]">
                <CardContent className="p-8 flex items-start gap-5">
                  <div className="p-3 bg-accent/10 text-accent rounded-xl shrink-0 group-hover:bg-accent/20 transition-all duration-300 border border-accent/10">
                    <MessageCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-lg mb-2 text-[#0B132B]">WhatsApp Quick Contact</h3>
                    <a 
                      href={`https://wa.me/91${settings.whatsappNumber}?text=Hello%20ADHITYA%20NEET%20ACADEMY%2C%20I%20would%20like%20to%20know%20more%20about%2520your%2520courses.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm font-bold text-accent hover:text-[#0B132B] transition-colors mt-2 font-sans"
                    >
                      Chat Now <ArrowRight className="w-4 h-4" />
                    </a>
                  </div>
                </CardContent>
              </Card>
            </FadeIn>
          </div>
 
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <FadeIn delay={0.2} className="h-full">
              <Card className="h-full border border-slate-100 shadow-sm bg-white rounded-[32px] hover:border-accent/10 transition-all duration-500">
                <CardContent className="p-8 md:p-12">
                  <h2 className="text-3xl font-heading font-bold text-[#0B132B] mb-3">{cmsContent.contactPage.form.title}</h2>
                  <p className="text-muted-foreground mb-10 leading-relaxed font-sans">{cmsContent.contactPage.form.description}</p>
                  
                  <form className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label htmlFor="firstName" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-sans">First Name</label>
                        <input 
                          type="text" 
                          id="firstName" 
                          className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:border-accent focus:ring-1 focus:ring-accent outline-none bg-background text-foreground transition-all duration-300 font-sans"
                          placeholder="John"
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="lastName" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-sans">Last Name</label>
                        <input 
                          type="text" 
                          id="lastName" 
                          className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:border-accent focus:ring-1 focus:ring-accent outline-none bg-background text-foreground transition-all duration-300 font-sans"
                          placeholder="Doe"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-sans">Email Address</label>
                        <input 
                          type="email" 
                          id="email" 
                          className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:border-accent focus:ring-1 focus:ring-accent outline-none bg-background text-foreground transition-all duration-300 font-sans"
                          placeholder="john@example.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="phone" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-sans">Phone Number</label>
                        <input 
                          type="tel" 
                          id="phone" 
                          className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:border-accent focus:ring-1 focus:ring-accent outline-none bg-background text-foreground transition-all duration-300 font-sans"
                          placeholder="+91 XXXXX XXXXX"
                        />
                      </div>
                    </div>
 
                    <div className="space-y-2">
                      <label htmlFor="course" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-sans">Interested Course</label>
                      <select 
                        id="course" 
                        className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:border-accent focus:ring-1 focus:ring-accent outline-none bg-background text-muted-foreground transition-all duration-300 font-sans"
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
                        className="w-full p-4 rounded-xl border border-slate-200 focus:border-accent focus:ring-1 focus:ring-accent outline-none bg-background text-foreground transition-all duration-300 resize-none font-sans"
                        placeholder="How can we help you?"
                      ></textarea>
                    </div>
 
                    <Button type="button" size="lg" className="w-full h-12 rounded-xl bg-gradient-to-r from-accent to-[#D4AF37] hover:from-[#D4AF37] hover:to-[#B89047] text-[#0B132B] font-bold text-sm tracking-wide shadow-md shadow-accent/5">
                      Send Message
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </FadeIn>
          </div>
        </div>
 
        {/* Map Section */}
        <FadeIn delay={0.3} className="mt-[120px]">
          <div className="flex flex-col md:flex-row flex-wrap gap-4 justify-center items-center mb-8">
            <Button asChild size="lg" variant="default" className="h-12 px-6 rounded-full bg-[#0B132B] hover:bg-slate-800 text-white font-bold transition-all shadow-md">
               <a href={`tel:${settings.phonePrimary.replace(/\s+/g, '')}`}><Phone className="w-5 h-5 mr-2" /> Click-to-Call</a>
            </Button>
            <Button asChild size="lg" className="h-12 px-6 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold transition-all shadow-md">
               <a href={`https://wa.me/91${settings.whatsappNumber}?text=Hello%20ADHITYA%20NEET%20ACADEMY`} target="_blank" rel="noopener noreferrer">
                 <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                 </svg> WhatsApp
               </a>
            </Button>
            <Button asChild size="lg" variant="accent" className="h-12 px-6 rounded-full bg-gradient-to-r from-accent to-[#D4AF37] hover:from-[#D4AF37] hover:to-[#B89047] text-[#0B132B] font-bold transition-all shadow-md">
               <a href="https://maps.app.goo.gl/3QyqFwGqf1L9oP3i6" target="_blank" rel="noopener noreferrer"><MapPin className="w-5 h-5 mr-2" /> Get Directions</a>
            </Button>
          </div>
          <Card className="border border-slate-100 shadow-sm overflow-hidden rounded-[32px] hover:border-accent/10 transition-all duration-500">
            <div className="h-[450px] w-full relative">
              <iframe 
                src={settings.mapEmbed}
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen={false} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title="Google Maps Location"
                className="filter grayscale contrast-125 opacity-90"
              ></iframe>
            </div>
          </Card>
        </FadeIn>
 
      </div>
    </div>
  );
}
