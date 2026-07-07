"use client";

import Image from "next/image";
import { Expand, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Dialog, DialogContent, DialogTitle } from "@/src/components/ui/dialog";

interface MobileLandscapePreviewProps {
  src: string;
  mobileSrc?: string; // optional 4:3 image for mobile — only this gets downloaded on small screens
  alt: string;
  width: number;
  height: number;
  mobileWidth?: number;
  mobileHeight?: number;
  priority?: boolean;
  className?: string;
}

function ResponsiveImage({
  src,
  mobileSrc,
  alt,
  width,
  height,
  mobileWidth,
  mobileHeight,
  priority,
  className,
}: MobileLandscapePreviewProps) {
  if (!mobileSrc) {
    return (
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        className={className}
      />
    );
  }

  // <picture> ensures only one image is downloaded per breakpoint
  return (
    <picture>
      {/* Desktop — 16:9 (Added width and height here!) */}
      <source
        media="(min-width: 640px)"
        srcSet={src}
        width={width}
        height={height}
      />
      {/* Mobile — 4:3, this is also the <img> fallback */}
      <img
        src={mobileSrc}
        alt={alt}
        width={mobileWidth ?? width}
        height={mobileHeight ?? height}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        className={className}
        style={{
          maxWidth: "100%",
          height: "auto",
        }} /* height: auto ensures it scales proportionally */
      />
    </picture>
  );
}

export function MobileLandscapePreview({
  src,
  mobileSrc,
  alt,
  width,
  height,
  mobileWidth,
  mobileHeight,
  priority,
  className,
}: MobileLandscapePreviewProps) {
  const [open, setOpen] = useState(false);
  const [portrait, setPortrait] = useState(true);
  const pushedHistory = useRef(false);

  useEffect(() => {
    const update = () => {
      setPortrait(window.innerHeight > window.innerWidth);
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onPopState = () => {
      pushedHistory.current = false;
      setOpen(false);
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [open]);

  const openPreview = () => {
    if (window.innerWidth >= 640) return;
    window.history.pushState({ imagePreview: true }, "");
    pushedHistory.current = true;
    setOpen(true);
  };

  const closePreview = () => {
    setOpen(false);
    if (pushedHistory.current) {
      pushedHistory.current = false;
      window.history.back();
    }
  };

  // The src shown in the fullscreen dialog on mobile is always the mobileSrc if available
  const dialogSrc = mobileSrc ?? src;
  const dialogWidth = mobileWidth ?? width;
  const dialogHeight = mobileHeight ?? height;

  return (
    <>
      <button
        type="button"
        onClick={openPreview}
        className="group relative block w-full"
      >
        <ResponsiveImage
          src={src}
          mobileSrc={mobileSrc}
          alt={alt}
          width={width}
          height={height}
          mobileWidth={mobileWidth}
          mobileHeight={mobileHeight}
          priority={priority}
          className={className}
        />
        <div className="absolute bottom-3 right-3 flex items-center gap-2 rounded-full bg-black/70 p-2 text-xs font-medium text-white backdrop-blur sm:hidden">
          <Expand className="size-3.5" />
        </div>
      </button>

      <Dialog
        open={open}
        onOpenChange={(next) => {
          if (next) setOpen(true);
          else closePreview();
        }}
      >
        <DialogContent className="h-dvh w-screen max-w-none border-0 bg-black p-0 sm:hidden">
          <DialogTitle className="sr-only">{alt}</DialogTitle>

          <button
            onClick={closePreview}
            className="absolute right-4 top-4 z-50 rounded-full bg-white/10 p-2 text-white backdrop-blur transition hover:bg-white/20"
          >
            <X className="size-5" />
          </button>

          {portrait ? (
            <div className="absolute left-1/2 top-1/2">
              <div
                className="relative"
                style={{
                  width: "100dvh",
                  height: "100dvw",
                  transform: "translate(-50%, -50%) rotate(90deg)",
                  transformOrigin: "center",
                }}
              >
                <Image
                  src={dialogSrc}
                  alt={alt}
                  width={dialogWidth}
                  height={dialogHeight}
                  priority={priority}
                  draggable={false}
                  className="h-full w-full select-none object-contain"
                />
              </div>
            </div>
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Image
                src={dialogSrc}
                alt={alt}
                width={dialogWidth}
                height={dialogHeight}
                priority={priority}
                draggable={false}
                className="max-h-full w-full select-none object-contain"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
