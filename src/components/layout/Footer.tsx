import { Logo } from "@/components/shared/Logo";
import { MapPin, Phone, Mail } from "lucide-react";
import { cmsContent } from "@/data/cmsContent";
import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary text-slate-400 pt-28 pb-12 border-t border-accent/25 relative overflow-hidden">
      {/* Background spotlights */}
      <div className="absolute top-0 left-[-10%] w-[400px] h-[400px] bg-accent/3 rounded-full blur-[130px] pointer-events-none z-0"></div>
      <div className="max-w-[1280px] mx-auto px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-16">
          
          {/* Brand Info */}
          <div className="space-y-6">
            <Logo light={true} />
            <p className="text-sm leading-relaxed text-slate-400 font-sans">
              {cmsContent.global.footerDescription}
            </p>
            <div className="flex gap-3 pt-2">
              {cmsContent.global.socialLinks.instagram && (
                <a href={cmsContent.global.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-secondary flex items-center justify-center hover:bg-accent hover:border-accent hover:text-primary transition-all duration-300 text-slate-400" title="Instagram">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </svg>
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-heading font-semibold text-base tracking-wider uppercase mb-6">Quick Links</h4>
            <ul className="space-y-4">
              {[
                { name: "About Us", href: "/about" },
                { name: "Our Courses", href: "/courses" },
                { name: "Student Achievements", href: "/achievements" },
                { name: "Photo Gallery", href: "/gallery" },
                { name: "Contact Us", href: "/contact" },
              ].map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm hover:text-accent transition-colors flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary group-hover:bg-accent transition-all duration-300"></span>
                    <span className="group-hover:translate-x-1 transition-transform duration-300 text-slate-400 group-hover:text-accent">{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Courses */}
          <div>
            <h4 className="text-white font-heading font-semibold text-base tracking-wider uppercase mb-6">Our Programs</h4>
            <ul className="space-y-4">
              {[
                { name: "NEET Weekend", href: "/courses#course-2" },
                { name: "Test Batch", href: "/courses#course-3" },
                { name: "Crash Course", href: "/courses#course-4" },
                { name: "NEET Repeater", href: "/courses#course-1" },
              ].map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm hover:text-accent transition-colors flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary group-hover:bg-accent transition-all duration-300"></span>
                    <span className="text-slate-400 group-hover:text-accent transition-all duration-300">{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-white font-heading font-semibold text-base tracking-wider uppercase mb-6">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 mb-4">
                <MapPin className="w-5 h-5 text-accent shrink-0 mt-1" />
                <span className="text-sm text-slate-400 leading-relaxed whitespace-pre-line">
                  {cmsContent.global.address}
                </span>
              </li>
              <li className="flex items-center gap-3 mb-3">
                <Phone className="w-5 h-5 text-accent shrink-0" />
                <a href={`tel:${cmsContent.global.phonePrimary.replace(/\s+/g, '')}`} className="text-sm text-slate-400 hover:text-accent transition-colors flex gap-2">
                  <span className="font-semibold text-slate-300">Phone:</span> {cmsContent.global.phonePrimary}
                </a>
              </li>
              <li className="flex items-center gap-3 mb-3">
                <svg className="w-5 h-5 text-accent shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                </svg>
                <a href={`https://wa.me/91${cmsContent.global.whatsappNumber}?text=Hello%20ADHITYA%20NEET%20ACADEMY`} target="_blank" rel="noopener noreferrer" className="text-sm text-slate-400 hover:text-accent transition-colors flex gap-2">
                  <span className="font-semibold text-slate-300">WhatsApp:</span> {cmsContent.global.whatsappNumber}
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-secondary flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-slate-500">
            &copy; {currentYear} Adhithya NEET Academy. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-xs text-slate-500">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
