"use client";

import { useState, useEffect } from "react";
import { Logo } from "@/components/shared/Logo";
import { MapPin, Phone, Mail } from "lucide-react";
import { cmsContent } from "@/data/cmsContent";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export function Footer() {
  const currentYear = new Date().getFullYear();
  const [settings, setSettings] = useState(cmsContent.global);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from("contact_information")
          .select("*")
          .eq("id", "main")
          .single();
        if (data) {
          setSettings({
            ...cmsContent.global,
            phonePrimary: data.phone || cmsContent.global.phonePrimary,
            emailPrimary: data.email || cmsContent.global.emailPrimary,
            address: data.address || cmsContent.global.address,
            whatsappNumber: data.whatsapp || "9600607680",
            socialLinks: {
              facebook: data.facebook || cmsContent.global.socialLinks.facebook,
              instagram: data.instagram || cmsContent.global.socialLinks.instagram,
              twitter: data.twitter || cmsContent.global.socialLinks.twitter,
              youtube: data.youtube || cmsContent.global.socialLinks.youtube,
            }
          });
        }
      } catch (e) {
        console.error(e);
      }
    };
    loadSettings();
  }, []);

  const quickLinks = [
    { name: "About Us", href: "/about" },
    { name: "Our Courses", href: "/courses" },
    { name: "Achievements", href: "/achievements" },
    { name: "Gallery", href: "/gallery" },
    { name: "Contact", href: "/contact" },
  ];

  const programs = [
    { name: "NEET Repeater", href: "/courses#course-1" },
    { name: "Weekend Program", href: "/courses#course-2" },
    { name: "Test Batch", href: "/courses#course-3" },
    { name: "Crash Course", href: "/courses#course-4" },
  ];

  return (
    <footer className="bg-[#0B132B] text-white/60 relative overflow-hidden">
      {/* Subtle gold glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[1px] bg-gradient-to-r from-transparent via-accent/40 to-transparent" />

      <div className="max-w-[1280px] mx-auto px-5 sm:px-6 lg:px-8">
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 pt-20 pb-16">
          {/* Brand — Takes more space */}
          <div className="lg:col-span-5 space-y-6 pr-0 lg:pr-8">
            <Logo light={true} />
            <p className="text-sm leading-[1.8] text-white/40 max-w-md font-sans">
              {cmsContent.global.footerDescription}
            </p>
            {/* Social Icons */}
            <div className="flex gap-2.5 pt-2">
              {settings.socialLinks.instagram && (
                <a href={settings.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center hover:bg-accent hover:border-accent hover:text-[#0B132B] transition-all duration-300 text-white/40" title="Instagram">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </svg>
                </a>
              )}
              {settings.socialLinks.facebook && (
                <a href={settings.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center hover:bg-accent hover:border-accent hover:text-[#0B132B] transition-all duration-300 text-white/40" title="Facebook">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  </svg>
                </a>
              )}
            </div>
          </div>

          {/* Navigation */}
          <div className="lg:col-span-2">
            <h4 className="text-white/90 font-sans text-xs font-semibold tracking-[0.15em] uppercase mb-6">
              Navigation
            </h4>
            <ul className="space-y-3.5">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-[13px] text-white/40 hover:text-accent transition-colors duration-300 font-sans"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Programs */}
          <div className="lg:col-span-2">
            <h4 className="text-white/90 font-sans text-xs font-semibold tracking-[0.15em] uppercase mb-6">
              Programs
            </h4>
            <ul className="space-y-3.5">
              {programs.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-[13px] text-white/40 hover:text-accent transition-colors duration-300 font-sans"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Details */}
          <div className="lg:col-span-3">
            <h4 className="text-white/90 font-sans text-xs font-semibold tracking-[0.15em] uppercase mb-6">
              Contact
            </h4>
            <ul className="space-y-5">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                <span className="text-[13px] text-white/40 leading-relaxed whitespace-pre-line font-sans">
                  {settings.address}
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-accent shrink-0" />
                <a href={`tel:${settings.phonePrimary.replace(/\s+/g, '')}`} className="text-[13px] text-white/40 hover:text-accent transition-colors font-sans">
                  {settings.phonePrimary}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-accent shrink-0" />
                <a href={`mailto:${settings.emailPrimary}`} className="text-[13px] text-white/40 hover:text-accent transition-colors font-sans">
                  {settings.emailPrimary}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <svg className="w-4 h-4 text-accent shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                </svg>
                <a href={`https://wa.me/91${settings.whatsappNumber}?text=Hello%20ADHITYA%20NEET%20ACADEMY`} target="_blank" rel="noopener noreferrer" className="text-[13px] text-white/40 hover:text-accent transition-colors font-sans">
                  {settings.whatsappNumber}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-white/[0.06] flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-white/25 font-sans">
            &copy; {currentYear} {settings.academyName}. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-xs text-white/25 font-sans">
            <Link href="/privacy" className="hover:text-white/60 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white/60 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
