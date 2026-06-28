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
    <div className="min-h-screen bg-[#FAFAF8] text-foreground">

      {/* Hero */}
      <section className="relative bg-[#0B132B] overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,#ffffff03_25%,transparent_25%,transparent_50%,#ffffff03_50%,#ffffff03_75%,transparent_75%)] bg-[size:40px_40px] pointer-events-none" />
        <div className="absolute top-0 right-0 w-[40%] h-full bg-gradient-to-l from-accent/[0.04] to-transparent pointer-events-none" />

        <div className="max-w-[1280px] mx-auto px-5 sm:px-6 lg:px-8 pt-40 pb-20 sm:pt-44 sm:pb-24 text-center relative z-10">
          <FadeIn>
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-accent/30 bg-accent/[0.06] text-accent text-xs font-semibold tracking-[0.15em] uppercase font-sans mb-8">
              <Sparkles className="w-3.5 h-3.5 fill-accent text-accent" /> Memories & Events
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold text-white leading-[1.1] mb-6 text-balance">
              {cmsContent.galleryPage.hero.title}
            </h1>
            <p className="text-base sm:text-lg text-white/50 leading-[1.8] font-sans max-w-2xl mx-auto">
              {cmsContent.galleryPage.hero.description}
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Gallery Grid */}
      <div className="max-w-[1280px] mx-auto px-5 sm:px-6 lg:px-8 py-16 sm:py-24">
        {loading ? (
          <div className="flex items-center justify-center py-24 text-slate-400 font-sans">
            <Loader2 className="w-6 h-6 text-accent animate-spin mr-3" />
            Loading academy gallery...
          </div>
        ) : galleryImages.length === 0 ? (
          <div className="text-center py-24 text-slate-400 font-sans">No images found in the gallery.</div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 space-y-5">
            <AnimatePresence mode="popLayout">
              {galleryImages.map((image, index) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, delay: index * 0.03 }}
                  key={image.id}
                  className="relative group rounded-2xl overflow-hidden cursor-pointer border border-slate-100 bg-white break-inside-avoid"
                  onClick={() => setSelectedImage(image.src)}
                >
                  <Image
                    src={image.src}
                    alt={image.alt}
                    width={600}
                    height={450}
                    className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                    loading="lazy"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  {/* Subtle hover overlay */}
                  <div className="absolute inset-0 bg-[#0B132B]/0 group-hover:bg-[#0B132B]/60 transition-all duration-500 flex items-center justify-center">
                    <div className="w-11 h-11 rounded-full bg-white/90 flex items-center justify-center text-[#0B132B] opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-500 shadow-lg">
                      <ZoomIn className="w-4 h-4" />
                    </div>
                  </div>
                  {/* Caption on hover */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                    <p className="text-white font-sans font-semibold text-sm truncate">
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
            className="fixed inset-0 z-[100] bg-[#0B132B]/95 backdrop-blur-xl flex items-center justify-center p-6"
            onClick={() => setSelectedImage(null)}
          >
            <button
              className="absolute top-6 right-6 w-11 h-11 rounded-xl bg-white/10 text-white hover:bg-accent hover:text-[#0B132B] transition-all duration-300 cursor-pointer border border-white/10 flex items-center justify-center"
              onClick={() => setSelectedImage(null)}
            >
              <X className="w-5 h-5" />
            </button>
            <motion.img
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              src={selectedImage}
              alt="Enlarged gallery view"
              className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
