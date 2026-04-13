"use client";

import { useState, useCallback } from "react";

interface PdfExportButtonProps {
  title: string;
  date: string;
  category: string;
  tags: string[];
  author: string;
}

export default function PdfExportButton({
  title,
  date,
  category,
  tags,
  author,
}: PdfExportButtonProps) {
  const [exporting, setExporting] = useState(false);

  const handleExport = useCallback(async () => {
    setExporting(true);
    try {
      const html2pdf = (await import("html2pdf.js")).default;

      // Find the prose content
      const proseEl = document.querySelector(".prose");
      if (!proseEl) return;

      // Build a wrapper with header + content for the PDF
      const wrapper = document.createElement("div");
      wrapper.style.cssText =
        "font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #1a1a1a; padding: 0;";

      // Header section
      const header = document.createElement("div");
      header.style.cssText = "margin-bottom: 32px; padding-bottom: 24px; border-bottom: 2px solid #e5e5e5;";
      header.innerHTML = `
        <div style="font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 12px;">${category}</div>
        <h1 style="font-size: 28px; font-weight: 800; line-height: 1.3; margin: 0 0 12px 0; color: #111;">${title}</h1>
        <div style="font-size: 13px; color: #666; margin-bottom: 8px;">${author} · ${date}</div>
        ${tags.length > 0 ? `<div style="display: flex; flex-wrap: wrap; gap: 6px; margin-top: 12px;">${tags.map((t) => `<span style="font-size: 11px; padding: 3px 10px; border-radius: 999px; background: #f3f4f6; color: #555;">${t}</span>`).join("")}</div>` : ""}
      `;
      wrapper.appendChild(header);

      // Clone the prose content
      const contentClone = proseEl.cloneNode(true) as HTMLElement;

      // Clean up: remove interactive elements
      contentClone.querySelectorAll("button, select, [contenteditable]").forEach((el) => el.remove());

      // Fix code blocks for PDF readability
      contentClone.querySelectorAll("pre").forEach((pre) => {
        pre.style.cssText =
          "background: #1e1e1e; color: #d4d4d4; padding: 16px; border-radius: 8px; font-size: 12px; line-height: 1.5; overflow: visible; white-space: pre-wrap; word-break: break-all; page-break-inside: avoid;";
      });

      // Fix images
      contentClone.querySelectorAll("img").forEach((img) => {
        img.style.cssText = "max-width: 100%; height: auto; border-radius: 8px; page-break-inside: avoid;";
        img.crossOrigin = "anonymous";
      });

      wrapper.appendChild(contentClone);

      // Footer
      const footer = document.createElement("div");
      footer.style.cssText =
        "margin-top: 40px; padding-top: 16px; border-top: 1px solid #e5e5e5; font-size: 11px; color: #aaa; text-align: center;";
      footer.textContent = `DEVS VLTRA · ${window.location.href}`;
      wrapper.appendChild(footer);

      const slugified = title
        .replace(/[^a-zA-Z0-9가-힣\s]/g, "")
        .replace(/\s+/g, "-")
        .slice(0, 60);

      await html2pdf()
        .set({
          margin: [12, 14, 12, 14],
          filename: `${slugified}.pdf`,
          image: { type: "jpeg", quality: 0.95 },
          html2canvas: {
            scale: 2,
            useCORS: true,
            letterRendering: true,
            logging: false,
          },
          jsPDF: {
            unit: "mm",
            format: "a4",
            orientation: "portrait",
          },
          pagebreak: { mode: ["avoid-all", "css", "legacy"] },
        })
        .from(wrapper)
        .save();
    } catch (e) {
      console.error("PDF export failed:", e);
      alert("PDF 내보내기에 실패했습니다.");
    } finally {
      setExporting(false);
    }
  }, [title, date, category, tags, author]);

  return (
    <button
      onClick={handleExport}
      disabled={exporting}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full bg-white/15 backdrop-blur-sm border border-white/20 text-white/80 hover:bg-white/25 hover:text-white transition-colors disabled:opacity-50"
      title="PDF로 내보내기"
    >
      {exporting ? (
        <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
          <polyline points="10 9 9 9 8 9"/>
        </svg>
      )}
      {exporting ? "생성 중..." : "PDF"}
    </button>
  );
}
