"use client";
import { usePathname } from "next/navigation";
import { GuideEmblem } from "@/components/pokedex/guide-shell";
export function EmptyDetail(): React.JSX.Element | null {
  const path = usePathname();
  if (path !== "/") return null;
  return (
    <section
      className="detail-pane plate empty-detail"
      aria-label="Species details"
    >
      <div className="state-content">
        <GuideEmblem size={48} />
        <h2>Choose a species</h2>
        <p>
          Select a species from the index to explore its forms, stats and
          evolution.
        </p>
      </div>
    </section>
  );
}
