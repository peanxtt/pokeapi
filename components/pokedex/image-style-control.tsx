"use client";
import { Image as ImageIcon, Grid2X2 } from "lucide-react";
import { ControlPopover } from "./control-popover";
import { useGuidePreferences } from "./guide-preferences";

export function ImageStyleControl({
  compact = false,
  source,
}: {
  compact?: boolean;
  source?: string;
}) {
  const { imageStyle, setImageStyle } = useGuidePreferences();
  const options = (close?: () => void) => (
    <div
      className={compact ? "menu-options" : "appearance-buttons"}
      role="group"
      aria-label="Image style"
    >
      {(["artwork", "pixels"] as const).map((style) => (
        <button
          key={style}
          type="button"
          className={
            compact
              ? `menu-option ${imageStyle === style ? "selected" : ""}`
              : `fg-button ${imageStyle === style ? "primary" : ""}`
          }
          aria-pressed={imageStyle === style}
          onClick={() => {
            setImageStyle(style);
            close?.();
          }}
        >
          {compact &&
            (style === "artwork" ? (
              <ImageIcon size={17} aria-hidden />
            ) : (
              <Grid2X2 size={17} aria-hidden />
            ))}
          {style === "artwork" ? "Artwork" : "Pixels"}
        </button>
      ))}
    </div>
  );
  if (compact)
    return (
      <ControlPopover
        hideChevron
        className="image-style-popover"
        title="Image style"
        label={
          <>
            <ImageIcon size={18} aria-hidden />
            <span className="sr-only">Image style</span>
          </>
        }
      >
        {(close) => options(close)}
      </ControlPopover>
    );
  return (
    <section
      className="image-style-section"
      aria-label="Image style preference"
    >
      <h2 className="uppercase-label">Image style</h2>
      {options()}
      <p className="image-source" aria-live="polite">
        {source ||
          (imageStyle === "pixels"
            ? "Black/White pixels, with sprite and artwork fallbacks."
            : "Official artwork.")}{" "}
        Applies across the guide.
      </p>
    </section>
  );
}
