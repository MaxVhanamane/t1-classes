"use client";

import { useEffect, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { MobileLandscapePreview } from "./mobile-landscape-preview";

// Extracting the props from your existing component
type SliderImage = {
  src: string;
  mobileSrc?: string;
  alt: string;
  width: number;
  height: number;
  mobileWidth?: number;
  mobileHeight?: number;
  priority?: boolean;
  className?: string;
};

interface PremiumImageSliderProps {
  images: SliderImage[];
  interval?: number; // How long each slide shows (in ms)
}

export function PremiumImageSlider({
  images,
  interval = 5000,
}: PremiumImageSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Swipe State
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Minimum swipe distance (in pixels) to trigger a slide change
  const minSwipeDistance = 50;

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  // Handle Autoplay
  useEffect(() => {
    // Don't run interval if paused, or if there's only 1 image
    if (isPaused || images.length <= 1) return;

    const timer = setInterval(nextSlide, interval);
    return () => clearInterval(timer);
  }, [isPaused, images.length, interval, nextSlide]);

  // --- Touch Handlers ---
  const onTouchStart = (e: React.TouchEvent) => {
    setIsPaused(true);
    setTouchEnd(null); // Reset touch end to avoid false positives
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    setIsPaused(false);

    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      nextSlide();
    }
    if (isRightSwipe) {
      prevSlide();
    }
  };

  if (!images?.length) return null;

  return (
    <div
      className="group relative w-full overflow-hidden rounded-md sm:rounded-xl"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      // Updated touch event listeners for swipe
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Slider Track */}
      <div
        className="flex items-center w-full transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {images.map((img, idx) => (
          <div key={idx} className="w-full shrink-0 relative">
            <MobileLandscapePreview {...img} className={img.className} />
          </div>
        ))}
      </div>

      {/* Navigation Arrows (Hidden until hover on desktop) */}
      {images.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white opacity-0 backdrop-blur-md transition-all duration-300 hover:bg-white/20 hover:scale-105 group-hover:opacity-100 sm:p-3 z-10"
            aria-label="Previous image"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white opacity-0 backdrop-blur-md transition-all duration-300 hover:bg-white/20 hover:scale-105 group-hover:opacity-100 sm:p-3 z-10"
            aria-label="Next image"
          >
            <ChevronRight className="size-5" />
          </button>
        </>
      )}

      {/* Pagination Indicators (Expanding Pills) */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2 z-10">
          {images.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-1.5 rounded-full transition-all duration-500 ease-out ${
                currentIndex === idx
                  ? "w-6 bg-white"
                  : "w-1.5 bg-white/50 hover:bg-white/80"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
