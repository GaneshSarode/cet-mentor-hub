"use client";

import { useEffect, useRef } from "react";
import "katex/dist/katex.min.css";
// @ts-ignore
import renderMathInElement from "katex/dist/contrib/auto-render.js";

interface MathRendererProps {
  html: string;
  className?: string;
}

export function MathRenderer({ html, className = "" }: MathRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      try {
        renderMathInElement(containerRef.current, {
          delimiters: [
            { left: "$$", right: "$$", display: true },
            { left: "\\[", right: "\\]", display: true },
            { left: "$", right: "$", display: false },
            { left: "\\(", right: "\\)", display: false }
          ],
          throwOnError: false,
          errorColor: "#cc0000",
          strict: "ignore",
        });
      } catch (err) {
        console.error("KaTeX rendering error:", err);
      }
    }
  }, [html]);

  return (
    <div
      ref={containerRef}
      className={className}
      dangerouslySetInnerHTML={{ __html: html || "" }}
    />
  );
}
