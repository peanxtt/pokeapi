"use client";

import Link from "next/link";
import { useState, type ComponentProps } from "react";
import { useGuidePreferences } from "./guide-preferences";

// Warm a species only after pointer or keyboard intent, rather than every visible row.
export function IntentLink(
  props: Omit<ComponentProps<typeof Link>, "prefetch">,
) {
  const [intended, setIntended] = useState(false);
  const { requestSpecies } = useGuidePreferences();
  return (
    <Link
      {...props}
      prefetch={intended}
      onClick={(event) => {
        props.onClick?.(event);
        if (
          event.defaultPrevented ||
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey
        )
          return;
        if (typeof props.href === "string") {
          const match = new URL(
            props.href,
            window.location.href,
          ).pathname.match(/^\/pokemon\/([^/]+)$/);
          if (match) requestSpecies(decodeURIComponent(match[1]));
        }
      }}
      onPointerEnter={(event) => {
        if (event.pointerType !== "touch") setIntended(true);
        props.onPointerEnter?.(event);
      }}
      onFocus={(event) => {
        setIntended(true);
        props.onFocus?.(event);
      }}
    />
  );
}
