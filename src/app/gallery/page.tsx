"use client";

import { useState, useEffect } from "react";
import { FadeIn } from "@/components/shared/FadeIn";
import { ZoomIn, X, Loader2, Sparkles } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cmsContent } from "@/data/cmsContent";
import { getDynamicGallery } from "@/lib/cms-loader";
import Image from "next/image";

export default function GalleryPage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [galleryImages, setGalleryImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadGallery = async () => {
      try {
        const data = await getDynamicGallery();
        setGalleryImages(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadGallery();
  }, []);

  return (
    <div className="pt-24 pb-[120px] min-h-screen bg-background text-foreground animate-fadeIn relative overflow-hidden">
      {/* Background spotlights */}
      <div className="absolute top-[10%] right-[10%] w-[350px] h-[350px] bg-accent/5 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[30%] left-[5%] w-[350px] h-[350px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none z-0"></div>

      <div className="max-w-[1280px] mx-auto px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-24 pt-20">
          <FadeIn>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/10 border border-accent/25 text-accent text-[10px] font-bold tracking-widest uppercase mb-6">
              <Sparkles className="w-3.5 h-3.5 fill-accent text-accent animate-pulse" /> MEMORIES & EVENTS
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-[#0B132B] mb-8">
              {cmsContent.galleryPage.hero.title ? (
                <span>
                  {cmsContent.galleryPage.hero.title.split(" ").map((w: string, i: number) => {
                    const match = ["gallery", "campus", "moments", "memories", "life", "academy"].includes(w.toLowerCase());
                    return match ? (
                      <span key={i} className="bg-gradient-to-r from-accent via-[#FDF0A6] to-[#D4AF37] bg-clip-text text-transparent italic font-bold">
                        {w}{" "}
                      </span>
                    ) : w + " ";
                  })}
                </span>
              ) : "Our Gallery"}
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed font-sans max-w-2xl mx-auto">
              {cmsContent.galleryPage.hero.description}
            </p>
          </FadeIn>
        </div>


        {/* Masonry Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20 text-slate-400 font-sans">
            <Loader2 className="w-8 h-8 text-accent animate-spin mr-2" />
            Loading academy gallery...
          </div>
        ) : galleryImages.length === 0 ? (
          <div className="text-center py-20 text-slate-450 font-sans">No images found in the gallery.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode="popLayout">
              {galleryImages.map((image) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  key={image.id}
                  className="relative group rounded-[24px] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer border border-slate-100 bg-white aspect-[4/3] w-full"
                  onClick={() => setSelectedImage(image.src)}
                >
                  <Image 
                    src={image.src} 
                    alt={image.alt} 
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-[#0B132B]/85 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col items-center justify-center p-6 text-center">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-accent via-[#FDF0A6] to-[#D4AF37] flex items-center justify-center text-[#0B132B] mb-4 transform scale-75 group-hover:scale-100 transition-transform duration-500 shadow-lg shadow-accent/20">
                      <ZoomIn className="w-5 h-5" />
                    </div>
                    <p className="text-white font-heading font-bold text-base tracking-wide transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-75">
                      {image.alt}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-[#0B132B]/95 backdrop-blur-md flex items-center justify-center p-6"
            onClick={() => setSelectedImage(null)}
          >
            <button 
              className="absolute top-6 right-6 p-3 rounded-full bg-white/10 text-white hover:bg-accent hover:text-[#0B132B] transition-all duration-300 cursor-pointer border border-white/10"
              onClick={() => setSelectedImage(null)}
            >
              <X className="w-6 h-6" />
            </button>
            <motion.img
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              src={selectedImage}
              alt="Enlarged gallery view"
              className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl border-2 border-accent/40"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
