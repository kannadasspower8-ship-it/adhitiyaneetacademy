"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Phone, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cmsContent } from "@/data/cmsContent";
import { Logo } from "@/components/shared/Logo";
import { createClient } from "@/lib/supabase/client";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "Courses", href: "/courses" },
  { name: "Achievements", href: "/achievements" },
  { name: "Gallery", href: "/gallery" },
  { name: "Contact", href: "/contact" },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
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
          });
        }
      } catch (e) {
        console.error(e);
      }
    };
    loadSettings();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Homepage gets transparent header, inner pages always solid
  const isHomepage = pathname === "/";
  const showSolid = scrolled || !isHomepage;

  return (
    <header
      className={`fixed top-0 w-full z-[100] transition-all duration-300 ease-out ${
        mobileMenuOpen
          ? "bg-white border-b border-slate-100"
          : showSolid
            ? "bg-white/95 backdrop-blur-xl border-b border-slate-100/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
            : "bg-white/80 backdrop-blur-md border-b border-slate-100/20"
      }`}
    >
      <div className="max-w-[1280px] mx-auto px-5 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-[72px] sm:h-20">
          {/* Logo */}
          <Logo />

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            <ul className="flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className={`relative px-3.5 py-2 text-[13px] font-medium tracking-wide transition-all duration-300 rounded-lg ${
                        isActive
                          ? "text-accent bg-accent/[0.06]"
                          : showSolid
                            ? "text-[#0B132B]/80 hover:text-[#0B132B] hover:bg-slate-50"
                            : "text-[#0B132B]/70 hover:text-[#0B132B]"
                      }`}
                    >
                      {link.name}
                    </Link>
                  </li>
                );
              })}
            </ul>

            <div className="flex items-center gap-5 pl-4 border-l border-slate-200/60">
              <a
                href={`tel:${settings.phonePrimary.replace(/[^\d+]/g, "")}`}
                className="flex items-center gap-2 text-[13px] font-semibold text-[#0B132B]/70 hover:text-accent transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                  <Phone className="w-3.5 h-3.5 text-accent" />
                </div>
                <span className="hidden xl:inline">{settings.phonePrimary}</span>
              </a>
              <Button
                asChild
                className="h-10 px-5 rounded-xl bg-[#0B132B] hover:bg-[#1a2744] text-white font-semibold text-[13px] tracking-wide transition-all duration-300 hover:shadow-lg hover:shadow-[#0B132B]/10 hover:-translate-y-[1px] gap-1.5"
              >
                <Link href="/contact">
                  Apply Now
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </Button>
            </div>
          </nav>

          {/* Mobile: Phone + Hamburger */}
          <div className="flex items-center gap-3 lg:hidden">
            <a
              href={`tel:${settings.phonePrimary.replace(/[^\d+]/g, "")}`}
              className="w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center hover:bg-accent/20 transition-colors"
            >
              <Phone className="w-4 h-4 text-accent" />
            </a>
            <button
              className="w-9 h-9 rounded-lg flex items-center justify-center text-[#0B132B] hover:bg-slate-100 transition-colors focus:outline-none"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation — Full-Screen Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden fixed inset-0 top-[72px] bg-white z-[99]"
          >
            <div className="flex flex-col h-full px-6 pt-8 pb-safe">
              <nav className="flex flex-col gap-1">
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.name}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.25 }}
                  >
                    <Link
                      href={link.href}
                      className={`flex items-center justify-between px-4 py-4 rounded-xl text-lg font-bold tracking-wide transition-all ${
                        pathname === link.href
                          ? "bg-accent/[0.08] text-accent"
                          : "text-[#0B132B] hover:bg-slate-50"
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {link.name}
                      <ArrowRight className={`w-4 h-4 ${pathname === link.href ? "text-accent" : "text-slate-300"}`} />
                    </Link>
                  </motion.div>
                ))}
              </nav>

              <div className="mt-auto pb-8 space-y-3">
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Button
                    variant="outline"
                    className="w-full h-13 justify-center rounded-xl text-sm font-semibold"
                    asChild
                  >
                    <a href={`tel:${settings.phonePrimary.replace(/[^\d+]/g, "")}`}>
                      <Phone className="w-4 h-4 mr-2 text-accent" />
                      {settings.phonePrimary}
                    </a>
                  </Button>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                >
                  <Button
                    className="w-full h-13 justify-center bg-[#0B132B] hover:bg-[#1a2744] text-white font-semibold rounded-xl text-sm gap-1.5"
                    asChild
                  >
                    <Link href="/contact" onClick={() => setMobileMenuOpen(false)}>
                      Apply Now
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
