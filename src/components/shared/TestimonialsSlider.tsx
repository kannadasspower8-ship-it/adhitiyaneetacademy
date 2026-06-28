"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";

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

  const gap = 24;
  const translateValue = `calc(-${currentIndex} * (100% + ${gap}px) / ${visibleCount})`;

  return (
    <div className="relative w-full">
      {/* Slider Window */}
      <div className="relative overflow-hidden w-full py-4 -my-4 px-2 -mx-2">
        <div
          className="flex transition-transform duration-500 ease-out gap-6"
          style={{ transform: `translate3d(${translateValue}, 0px, 0px)` }}
        >
          {testimonials.map((testimonial, index) => {
            const slideWidth = `calc((100% - ${(visibleCount - 1) * gap}px) / ${visibleCount})`;
            return (
              <div key={index} className="shrink-0" style={{ width: slideWidth }}>
                <div className="h-full bg-white border border-slate-100 rounded-2xl p-8 md:p-10 flex flex-col justify-between card-hover relative overflow-hidden min-h-[300px]">
                  {/* Decorative Gold Quote Mark */}
                  <svg className="absolute top-6 right-6 w-10 h-10 text-accent/10" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>

                  <div className="relative z-10">
                    {/* Stars */}
                    <div className="flex gap-0.5 mb-6">
                      {[...Array(testimonial.rating || 5)].map((_, starIdx) => (
                        <Star key={starIdx} className="w-4 h-4 fill-accent text-accent" />
                      ))}
                    </div>

                    {/* Content */}
                    <p className="text-[#0B132B]/80 leading-[1.8] text-sm md:text-[15px] font-sans mb-8">
                      &ldquo;{testimonial.content}&rdquo;
                    </p>
                  </div>

                  {/* Author */}
                  <div className="mt-auto pt-6 border-t border-slate-100 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent font-heading font-bold text-sm">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-heading font-bold text-[#0B132B] text-[15px]">{testimonial.name}</h4>
                      <p className="text-xs text-muted-foreground font-sans mt-0.5">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Controls Row: Dots + Navigation */}
      <div className="flex items-center justify-between mt-10">
        {/* Pagination Dots */}
        <div className="flex gap-2">
          {[...Array(Math.max(1, testimonials.length - visibleCount + 1))].map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                currentIndex === idx
                  ? "w-8 bg-accent"
                  : "w-2 bg-slate-200 hover:bg-slate-300"
              }`}
              aria-label={`Go to testimonial slide ${idx + 1}`}
            />
          ))}
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-2">
          <button
            onClick={prevSlide}
            className="w-11 h-11 rounded-xl border border-slate-200 bg-white text-slate-500 flex items-center justify-center hover:bg-[#0B132B] hover:text-white hover:border-[#0B132B] transition-all duration-300 cursor-pointer"
            aria-label="Previous testimonials"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={nextSlide}
            className="w-11 h-11 rounded-xl border border-slate-200 bg-white text-slate-500 flex items-center justify-center hover:bg-[#0B132B] hover:text-white hover:border-[#0B132B] transition-all duration-300 cursor-pointer"
            aria-label="Next testimonials"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
