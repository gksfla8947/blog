import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "DEVS VLTRA",
    short_name: "DEVS VLTRA",
    description: "배운것들 정리합니다 — 개발 블로그",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#1e6e3e",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
