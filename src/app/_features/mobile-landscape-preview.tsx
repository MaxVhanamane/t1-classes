"use client";

import Image from "next/image";
import { Expand, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Dialog, DialogContent, DialogTitle } from "@/src/components/ui/dialog";

interface MobileLandscapePreviewProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  priority?: boolean;
  className?: string;
}

export function MobileLandscapePreview({
  src,
  alt,
  width,
  height,
  priority,
  className,
}: MobileLandscapePreviewProps) {
  const [open, setOpen] = useState(false);
  const [portrait, setPortrait] = useState(true);

  // Tracks whether THIS component added a history entry.
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

  // Handle Android/browser back button.
  useEffect(() => {
    if (!open) return;

    const onPopState = () => {
      pushedHistory.current = false;
      setOpen(false);
    };

    window.addEventListener("popstate", onPopState);

    return () => {
      window.removeEventListener("popstate", onPopState);
    };
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

  return (
    <>
      <button
        type="button"
        onClick={openPreview}
        className="group relative block w-full"
      >
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
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
          if (next) {
            setOpen(true);
          } else {
            closePreview();
          }
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
                  src={src}
                  alt={alt}
                  width={width}
                  height={height}
                  priority={priority}
                  draggable={false}
                  className="h-full w-full select-none object-contain"
                />
              </div>
            </div>
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Image
                src={src}
                alt={alt}
                width={width}
                height={height}
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
