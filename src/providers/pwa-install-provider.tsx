"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

// 1. Extend the global Navigator interface for Apple's proprietary iOS property
declare global {
  interface Navigator {
    standalone?: boolean;
  }
}

// 2. Standard TypeScript interface for the beforeinstallprompt event
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface PWAInstallContextType {
  isInstallable: boolean;
  installApp: () => Promise<void>;
}

const PWAInstallContext = createContext<PWAInstallContextType>({
  isInstallable: false,
  installApp: async () => {},
});

export function PWAInstallProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    // Robustly check all possible PWA display modes & iOS
    const checkIsRunningAsPWA = () => {
      const isStandalone = window.matchMedia(
        "(display-mode: standalone)",
      ).matches;
      const isMinimalUi = window.matchMedia(
        "(display-mode: minimal-ui)",
      ).matches;
      const isFullscreen = window.matchMedia(
        "(display-mode: fullscreen)",
      ).matches;
      const isWindowControls = window.matchMedia(
        "(display-mode: window-controls-overlay)",
      ).matches;

      // Fully typed iOS Safari check
      const isIosStandalone = !!window.navigator.standalone;

      return (
        isStandalone ||
        isMinimalUi ||
        isFullscreen ||
        isWindowControls ||
        isIosStandalone
      );
    };

    // Bail out early if they are already inside the installed PWA
    if (checkIsRunningAsPWA()) {
      return;
    }

    // Capture the install prompt event (Chromium / Android)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    // Listen for successful installation via the browser API
    const handleAppInstalled = () => {
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    // Create a dynamic observer for display-mode changes.
    const displayModeQuery = window.matchMedia("(display-mode: standalone)");
    const handleDisplayModeChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        setIsInstallable(false);
        setDeferredPrompt(null);
      }
    };

    // Attach all listeners
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    // Modern matchMedia API check
    if (displayModeQuery.addEventListener) {
      displayModeQuery.addEventListener("change", handleDisplayModeChange);
    } else {
      // Fallback for legacy browsers
      displayModeQuery.addListener(handleDisplayModeChange);
    }

    return () => {
      // Cleanup on unmount
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
      window.removeEventListener("appinstalled", handleAppInstalled);

      if (displayModeQuery.removeEventListener) {
        displayModeQuery.removeEventListener("change", handleDisplayModeChange);
      } else {
        displayModeQuery.removeListener(handleDisplayModeChange);
      }
    };
  }, []);

  const installApp = async () => {
    if (!deferredPrompt) return;

    // Show the native install prompt
    await deferredPrompt.prompt();

    // Wait for the user to respond
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setIsInstallable(false);
    }

    setDeferredPrompt(null);
  };

  return (
    <PWAInstallContext.Provider value={{ isInstallable, installApp }}>
      {children}
    </PWAInstallContext.Provider>
  );
}

export const usePWAInstall = () => useContext(PWAInstallContext);
