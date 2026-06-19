"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, GraduationCap, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cmsContent } from "@/data/cmsContent";
import { Logo } from "@/components/shared/Logo";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "Courses", href: "/courses" },
  { name: "Achievements", href: "/achievements" },
  { name: "Gallery", href: "/gallery" },
  { name: "Contact", href: "/contact" },
];

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  
  // Only make home page transparent initially
  const isHome = pathname === "/";

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const headerBgClass = "bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm text-foreground";
    
  const textColorClass = "text-[#0B132B]";

  return (
    <header className={`fixed top-0 w-full z-50 transition-all duration-500 ${headerBgClass}`}>
      <div className="max-w-[1280px] mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center h-20 sm:h-24">
          {/* Logo */}
          <Logo />

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-10">
            <ul className="flex items-center gap-8">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href}
                    className={`text-sm font-medium transition-colors hover:text-accent relative py-2 group ${textColorClass}`}
                  >
                    {link.name}
                    <span className={`absolute -bottom-1 left-0 w-0 h-[2px] bg-accent transition-all duration-300 group-hover:w-full ${pathname === link.href ? "w-full" : ""}`}></span>
                  </Link>
                </li>
              ))}
            </ul>
            <div className="flex items-center gap-6">
              <a href={`tel:${cmsContent.global.phonePrimary.replace(/[^\d+]/g, '')}`} className={`flex items-center gap-2 text-sm font-medium hover:text-accent transition-colors ${textColorClass}`}>
                <Phone className="w-4 h-4 text-accent" />
                <span>{cmsContent.global.phonePrimary}</span>
              </a>
              <Button asChild className="bg-gradient-to-r from-accent to-[#D4AF37] hover:from-[#D4AF37] hover:to-[#B89047] text-[#0B132B] hover:text-[#0B132B] font-bold border border-accent/20 rounded-xl transition-all duration-300 hover:shadow-md hover:shadow-accent/10">
                <Link href="/contact">Apply Now</Link>
              </Button>
            </div>
          </nav>

          {/* Mobile Phone Pill & Hamburger Button */}
          <div className="flex items-center gap-2 sm:gap-4 md:hidden">
            <a 
              href={`tel:${cmsContent.global.phonePrimary.replace(/[^\d+]/g, '')}`} 
              className="flex items-center gap-1.5 font-bold text-[11px] sm:text-xs text-[#0B132B] hover:text-accent transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-[#0B132B] flex items-center justify-center shrink-0">
                <Phone className="w-3.5 h-3.5 text-accent fill-accent" />
              </div>
              <span className="font-sans font-bold whitespace-nowrap">{cmsContent.global.phonePrimary}</span>
            </a>
            
            <button 
              className="p-1.5 text-[#0B132B] focus:outline-none"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            style={{ willChange: "transform, opacity" }}
            className="md:hidden bg-background border-b border-border overflow-hidden"
          >
            <div className="px-6 py-6 flex flex-col gap-6">
              <nav className="flex flex-col gap-2">
                {navLinks.map((link) => (
                  <Link 
                    key={link.name}
                    href={link.href}
                    className={`px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${pathname === link.href ? "bg-muted text-accent" : "text-foreground hover:bg-muted"}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                ))}
              </nav>
              <div className="flex flex-col gap-3">
                <Button variant="outline" className="w-full justify-center" asChild>
                  <a href={`tel:${cmsContent.global.phonePrimary.replace(/[^\d+]/g, '')}`}>
                    <Phone className="w-4 h-4 mr-2 text-accent" />
                    {cmsContent.global.phonePrimary}
                  </a>
                </Button>
                <Button className="w-full justify-center bg-gradient-to-r from-accent to-[#D4AF37] hover:from-[#D4AF37] hover:to-[#B89047] text-[#0B132B] font-bold border border-accent/20 rounded-xl h-12" asChild>
                  <Link href="/contact" onClick={() => setMobileMenuOpen(false)}>
                    Apply Now
                  </Link>
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
