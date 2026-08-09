import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "T1 classes",
    short_name: "T1 classes",
    id: "/",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a0a",
    theme_color: "#0a0a0a",
    icons: [
      // 1. Standard icons (purpose: "any") - This satisfies Chrome's installability criteria
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any"
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any"
      },

      // 2. Maskable icons (purpose: "maskable") - This satisfies Android's adaptive icons
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable"
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable"
      },

      // 3. Monochrome icon
      {
        src: "/icons/icon-512x512-monochrome.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "monochrome"
      }
    ],
  };
}
