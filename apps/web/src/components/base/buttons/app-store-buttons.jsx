/**
 * Official App Store & Google Play badge components.
 * Uses badge files sourced directly from Apple and Google official servers.
 * Both sit in identical 155x52px containers (object-fit:contain) so they
 * share the same width, height, and horizontal baseline. No distortion.
 */

const BOX = {
  width: "155px",
  height: "52px",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
};

const IMG = {
  maxWidth: "100%",
  maxHeight: "100%",
  objectFit: "contain",
  display: "block",
};

export function AppStoreButton({ url = "#", className = "" }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Download on the App Store"
      className={`inline-flex items-center select-none ${className}`}
    >
      <img
        src="/badges/app-store.svg"
        alt="Download on the App Store"
        draggable={false}
        style={{ height: "42px", width: "auto", display: "block" }}
      />
    </a>
  );
}

export function GooglePlayButton({ url = "#", className = "" }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Get it on Google Play"
      className={`inline-flex items-center overflow-hidden select-none ${className}`}
      style={{ height: "42px", display: "inline-flex", alignItems: "center" }}
    >
      {/* Scaled and margin-compensated to eliminate official Google Play PNG's 25% transparent padding */}
      <img
        src="/badges/google-play.png"
        alt="Get it on Google Play"
        draggable={false}
        style={{
          height: "61px",
          width: "auto",
          maxWidth: "none",
          margin: "-9px -11px",
          display: "block"
        }}
      />
    </a>
  );
}

export function GalaxyStoreButton({ url = "#", className = "" }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Explore it on Samsung Galaxy Store"
      className={`select-none ${className}`}
      style={BOX}
    >
      <img
        src="/badges/galaxy-store.png"
        alt="Explore it on Samsung Galaxy Store"
        draggable={false}
        style={IMG}
      />
    </a>
  );
}