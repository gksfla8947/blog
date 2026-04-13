"use client";

import { useState, useCallback } from "react";

interface PdfExportButtonProps {
  slug: string;
}

export default function PdfExportButton({ slug }: PdfExportButtonProps) {
  const [exporting, setExporting] = useState(false);

  const handleExport = useCallback(async () => {
    setExporting(true);
    try {
      const res = await fetch(`/api/manage/posts/${slug}`);
      if (!res.ok) throw new Error("Failed to fetch post");
      const { post } = await res.json();

      const date = post.date ? new Date(post.date).toLocaleDateString("ko-KR") : "";
      const tags = (post.tags ?? []).join(", ");

      // Build clean HTML for printing
      const html = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="utf-8" />
  <title>${post.title}</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css" />
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #1a1a1a;
      line-height: 1.7;
      padding: 40px;
      max-width: 800px;
      margin: 0 auto;
    }
    .header {
      margin-bottom: 32px;
      padding-bottom: 24px;
      border-bottom: 2px solid #e5e5e5;
    }
    .category {
      font-size: 11px;
      color: #888;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      margin-bottom: 12px;
    }
    h1 {
      font-size: 26px;
      font-weight: 800;
      line-height: 1.3;
      margin-bottom: 12px;
    }
    .meta {
      font-size: 13px;
      color: #666;
    }
    .tags {
      margin-top: 10px;
      font-size: 12px;
      color: #888;
    }
    /* === BlockNote structure === */
    .content .bn-block-outer { margin: 0.15em 0; }
    .content .bn-block-group { padding-left: 24px; margin: 0; }

    /* === Headings === */
    .content h1 { font-size: 24px; margin: 1.5em 0 0.5em; font-weight: 700; }
    .content h2 { font-size: 20px; margin: 1.4em 0 0.5em; font-weight: 700; }
    .content h3 { font-size: 17px; margin: 1.3em 0 0.5em; font-weight: 600; }
    .content p { margin: 0.75em 0; }

    /* === Images === */
    .content img {
      max-width: 100%;
      height: auto;
      border-radius: 6px;
      margin: 1em 0;
    }

    /* === Code blocks === */
    .content pre {
      background: #f6f8fa;
      border: 1px solid #e1e4e8;
      border-radius: 6px;
      padding: 14px;
      font-size: 13px;
      line-height: 1.5;
      overflow-x: auto;
      white-space: pre-wrap;
      word-break: break-word;
      page-break-inside: avoid;
      margin: 1em 0;
    }
    .content code {
      font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
      font-size: 0.9em;
    }
    .content p > code, .content li > code, .content .bn-inline-content > code {
      background: #f0f0f0;
      padding: 2px 6px;
      border-radius: 3px;
    }

    /* === Blockquote / Quote === */
    .content blockquote {
      border-left: 4px solid #ddd;
      padding-left: 16px;
      color: #555;
      margin: 1em 0;
    }

    /* === Standard HTML lists (migrated posts) === */
    .content ul, .content ol {
      padding-left: 24px;
      margin: 0.75em 0;
    }
    .content li { margin: 0.3em 0; }

    /* === BlockNote bullet list === */
    .content [data-content-type="bulletListItem"] {
      display: list-item;
      list-style-type: disc;
      list-style-position: outside;
      margin-left: 20px;
    }
    /* Depth 2 */
    .content .bn-block-group [data-content-type="bulletListItem"] {
      list-style-type: circle;
    }
    /* Depth 3+ */
    .content .bn-block-group .bn-block-group [data-content-type="bulletListItem"] {
      list-style-type: square;
    }

    /* === BlockNote numbered list === */
    .content [data-content-type="numberedListItem"] {
      display: list-item;
      list-style: none;
      margin-left: 20px;
      position: relative;
      padding-left: 8px;
    }
    .content [data-content-type="numberedListItem"]::before {
      content: attr(data-index) ".";
      position: absolute;
      left: -22px;
      font-weight: 600;
    }

    /* === Callout === */
    .content [data-content-type="callout"] > div {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      padding: 12px 16px;
      border-radius: 8px;
      background: #f0f7ff;
      border: 1px solid #d0e3f5;
      margin: 0.75em 0;
    }
    .content [data-content-type="callout"] [contenteditable="false"] {
      display: none;
    }

    /* === Divider === */
    .content [data-content-type="divider"],
    .content hr {
      border: none;
      border-top: 1px solid #ddd;
      margin: 1.5em 0;
      height: 0;
    }
    .content [data-content-type="divider"] hr {
      border: none;
      border-top: 1px solid #ddd;
    }

    /* === Table === */
    .content table {
      width: 100%;
      border-collapse: collapse;
      margin: 1em 0;
      page-break-inside: avoid;
    }
    .content th, .content td {
      border: 1px solid #ddd;
      padding: 8px 12px;
      text-align: left;
    }
    .content th { background: #f6f8fa; font-weight: 600; }

    /* === Links === */
    .content a { color: #0969da; text-decoration: none; }

    /* === Footer === */
    .footer {
      margin-top: 40px;
      padding-top: 16px;
      border-top: 1px solid #e5e5e5;
      font-size: 11px;
      color: #aaa;
      text-align: center;
    }

    /* === Editor cleanup === */
    .content select,
    .content [contenteditable="false"] > select { display: none !important; }
    .content div[contenteditable="false"]:has(select) { display: none !important; }
    .content [data-node-view-wrapper] > div > [contenteditable="false"][aria-haspopup] { display: none !important; }

    @media print {
      body { padding: 20px; }
      pre { page-break-inside: avoid; }
      img { page-break-inside: avoid; }
      table { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="category">${post.category}</div>
    <h1>${post.title}</h1>
    <div class="meta">강건너물구경 · ${date}</div>
    ${tags ? `<div class="tags">${tags}</div>` : ""}
  </div>
  <div class="content">${post.contentHtml ?? ""}</div>
  <div class="footer">DEVS VLTRA · devs-vltra.vercel.app</div>
  <script>
    window.onafterprint = () => window.close();
    setTimeout(() => window.print(), 500);
  </script>
</body>
</html>`;

      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        alert("팝업이 차단되었습니다. 팝업을 허용해주세요.");
        return;
      }
      printWindow.document.write(html);
      printWindow.document.close();
    } catch (e) {
      console.error("PDF export failed:", e);
      alert("PDF 내보내기에 실패했습니다.");
    } finally {
      setExporting(false);
    }
  }, [slug]);

  return (
    <button
      onClick={handleExport}
      disabled={exporting}
      className="px-3 py-1.5 text-xs rounded-md border border-[var(--card-border)] text-[var(--muted)] hover:text-[var(--foreground)] hover:border-[var(--foreground)]/30 transition-colors disabled:opacity-50"
      title="PDF로 내보내기"
    >
      {exporting ? "생성 중..." : "PDF"}
    </button>
  );
}
