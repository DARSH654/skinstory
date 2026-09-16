/**
 * Official App Store & Google Play badge components.
 * Uses official vector SVG badge files directly from Apple and Google with zero artificial cropping or negative margins.
 * Both render crisply at 42px height with natural aspect ratios.
 */

export function AppStoreButton({ url = null, className = "" }) {
  return (
    <span
      aria-label="Download on the App Store — Coming Soon"
      className={`inline-flex items-center select-none opacity-90 cursor-default ${className}`}
    >
      <img
        src="/badges/app-store.svg"
        alt="Download on the App Store"
        draggable={false}
        style={{ height: "42px", width: "auto", display: "block" }}
      />
    </span>
  );
}

export function GooglePlayButton({ url = null, className = "" }) {
  return (
    <span
      aria-label="Get it on Google Play — Coming Soon"
      className={`inline-flex items-center select-none opacity-90 cursor-default ${className}`}
    >
      <img
        src="/badges/google-play.svg"
        alt="Get it on Google Play"
        draggable={false}
        style={{ height: "42px", width: "auto", display: "block" }}
      />
    </span>
  );
}

export function GalaxyStoreButton({ url = "#", className = "" }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Explore it on Samsung Galaxy Store"
      className={`inline-flex items-center select-none hover:opacity-90 active:scale-[0.98] transition-all ${className}`}
    >
      <img
        src="/badges/galaxy-store.png"
        alt="Explore it on Samsung Galaxy Store"
        draggable={false}
        style={{ height: "42px", width: "auto", display: "block" }}
      />
    </a>
  );
}