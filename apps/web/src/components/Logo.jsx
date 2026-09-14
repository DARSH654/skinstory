import React from "react";

/**
 * Skin Story / Applo Minimalist Two-Square Logo Component
 * - Top-Right: larger square (~62% size)
 * - Bottom-Left: smaller square (~38% size)
 */
export default function Logo({ size = 24, color = "currentColor", className = "" }) {
  const largeSize = size * 0.62;
  const smallSize = size * 0.38;

  return (
    <div
      className={`relative inline-block ${className}`}
      style={{ width: size, height: size }}
      aria-label="Skin Story Logo"
    >
      {/* Top Right (Larger Square) */}
      <div
        className="absolute"
        style={{
          backgroundColor: color,
          width: largeSize,
          height: largeSize,
          top: 0,
          right: 0,
        }}
      />
      {/* Bottom Left (Smaller Square) */}
      <div
        className="absolute"
        style={{
          backgroundColor: color,
          width: smallSize,
          height: smallSize,
          bottom: 0,
          left: 0,
        }}
      />
    </div>
  );
}
