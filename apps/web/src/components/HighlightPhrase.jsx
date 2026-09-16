"use client";

import { useState, useCallback, useRef, useEffect } from 'react';

export default function HighlightPhrase({
  words,
}) {
  const [positions, setPositions] = useState({});
  const containerRef = useRef(null);

  const calculatePositions = useCallback(() => {
    if (!containerRef.current) return;
    const spans = containerRef.current.querySelectorAll('.highlight-word-container');
    const newPositions = {};
    let changed = false;
    
    spans.forEach((span, index) => {
      const y = Math.round(span.offsetTop);
      if (positions[index] !== y) {
        newPositions[index] = y;
        changed = true;
      } else {
        newPositions[index] = positions[index];
      }
    });

    if (changed) {
      setPositions(newPositions);
    }
  }, [positions]);

  useEffect(() => {
    calculatePositions();
    const observer = new ResizeObserver(calculatePositions);
    if (containerRef.current) {
      observer.observe(document.body);
    }
    return () => observer.disconnect();
  }, [calculatePositions]);

  return (
    <span ref={containerRef} className="inline">
      {words.map((wordObj, index) => {
        const { text, hasSpace } = wordObj;
        const currentY = positions[index];
        const prevY = index > 0 ? positions[index - 1] : undefined;
        const nextY = index < words.length - 1 ? positions[index + 1] : undefined;

        // Same line checks (tolerance of 5px for subpixel variances)
        const connectedToPrev = prevY !== undefined && currentY !== undefined && Math.abs(currentY - prevY) < 5;
        const connectedToNext = nextY !== undefined && currentY !== undefined && Math.abs(currentY - nextY) < 5;

        return (
          <span key={`highlight-${index}`} className="inline">
            <span className="highlight-word-container relative inline-block whitespace-nowrap">
              <span className="relative z-10 font-medium text-zinc-950 dark:text-white">
                {text}
              </span>
              <span
                className="absolute bottom-1 h-3 sm:h-3.5 bg-[#d6cbe8] dark:bg-[#5f4982] -z-0"
                style={{
                  left: connectedToPrev ? '-5px' : '-2px',
                  right: connectedToNext ? '-5px' : '-2px',
                  borderTopLeftRadius: connectedToPrev ? '0px' : '2px',
                  borderBottomLeftRadius: connectedToPrev ? '0px' : '2px',
                  borderTopRightRadius: connectedToNext ? '0px' : '2px',
                  borderBottomRightRadius: connectedToNext ? '0px' : '2px',
                }}
                aria-hidden="true"
              />
            </span>
            {hasSpace && <span className="whitespace-pre"> </span>}
          </span>
        );
      })}
    </span>
  );
}
