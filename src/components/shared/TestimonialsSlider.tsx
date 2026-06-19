"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

interface Testimonial {
  name: string;
  role: string;
  content: string;
  rating: number;
}

export function TestimonialsSlider({ testimonials }: { testimonials: Testimonial[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(3);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setVisibleCount(1);
      } else if (window.innerWidth < 1024) {
        setVisibleCount(2);
      } else {
        setVisibleCount(3);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const nextSlide = () => {
    setCurrentIndex((prev) => {
      const maxIndex = testimonials.length - visibleCount;
      return prev >= maxIndex ? 0 : prev + 1;
    });
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => {
      const maxIndex = testimonials.length - visibleCount;
      return prev <= 0 ? Math.max(0, maxIndex) : prev - 1;
    });
  };

  const gap = 24; // gap-6 is 24px
  const translateValue = `calc(-${currentIndex} * (100% + ${gap}px) / ${visibleCount})`;

  return (
    <div className="relative w-full">
      {/* Navigation Buttons */}
      <div className="flex justify-end gap-3 mb-8">
        <button
          onClick={prevSlide}
          className="w-12 h-12 rounded-full border border-slate-200 bg-white text-slate-700 flex items-center justify-center hover:bg-[#0B132B] hover:text-white hover:border-[#0B132B] hover:scale-105 transition-all duration-300 shadow-sm cursor-pointer active:scale-95"
          aria-label="Previous testimonials"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={nextSlide}
          className="w-12 h-12 rounded-full border border-slate-200 bg-white text-slate-700 flex items-center justify-center hover:bg-[#0B132B] hover:text-white hover:border-[#0B132B] hover:scale-105 transition-all duration-300 shadow-sm cursor-pointer active:scale-95"
          aria-label="Next testimonials"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Slider Window */}
      <div className="relative overflow-hidden w-full py-4 -my-4 px-2 -mx-2">
        <div 
          className="flex transition-transform duration-500 ease-out gap-6"
          style={{ 
            transform: `translate3d(${translateValue}, 0px, 0px)`,
          }}
        >
          {testimonials.map((testimonial, index) => {
            const slideWidth = `calc((100% - ${(visibleCount - 1) * gap}px) / ${visibleCount})`;
            return (
              <div 
                key={index} 
                className="shrink-0"
                style={{ width: slideWidth }}
              >
                <Card className="h-full border border-slate-100 bg-white shadow-sm flex flex-col justify-between hover:shadow-xl hover:border-accent/20 transition-all duration-500 rounded-3xl overflow-hidden relative border-t-2 border-t-transparent hover:border-t-accent min-h-[280px]">
                  <CardContent className="pt-8 flex-grow">
                    <div className="flex gap-1 mb-5">
                      {[...Array(testimonial.rating || 5)].map((_, starIdx) => (
                        <Star key={starIdx} className="w-4 h-4 fill-accent text-accent" />
                      ))}
                    </div>
                    <p className="text-foreground italic mb-6 leading-relaxed text-sm md:text-base font-sans">
                      &quot;{testimonial.content}&quot;
                    </p>
                  </CardContent>
                  <CardFooter className="pt-4 bg-slate-50/50 border-t border-slate-100/50 mt-auto">
                    <div>
                      <h4 className="font-heading font-bold text-[#0B132B] text-base">{testimonial.name}</h4>
                      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mt-1 font-sans">{testimonial.role}</p>
                    </div>
                  </CardFooter>
                </Card>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Pagination Dots */}
      <div className="flex justify-center gap-2 mt-8">
        {[...Array(testimonials.length - visibleCount + 1)].map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
              currentIndex === idx 
                ? "w-6 bg-accent" 
                : "w-2 bg-slate-200 hover:bg-slate-300"
            }`}
            aria-label={`Go to testimonial slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
