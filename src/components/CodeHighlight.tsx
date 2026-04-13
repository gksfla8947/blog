"use client";

import { useEffect } from "react";
import hljs from "highlight.js";

export default function CodeHighlight() {
  useEffect(() => {
    document.querySelectorAll("pre code").forEach((el) => {
      const codeEl = el as HTMLElement;
      if (codeEl.dataset.highlighted === "yes") return;
      // bn-inline-content 클래스 제거 (hljs 방해)
      codeEl.classList.remove("bn-inline-content");
      hljs.highlightElement(codeEl);
    });
  }, []);

  return null;
}
