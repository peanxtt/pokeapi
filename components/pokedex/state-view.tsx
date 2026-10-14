"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { AlertTriangle } from "lucide-react";
import { GuideEmblem } from "@/components/pokedex/guide-shell";
import { parseReturnPath } from "@/lib/pokedex/query";

export function StateView({
  kind,
  retry,
  pane = false,
}: {
  kind: "error" | "not-found";
  retry?: () => void;
  pane?: boolean;
}): React.JSX.Element {
  const params = useSearchParams();
  const context = params.toString();
  const failedContext = useRef(context);
  useEffect(() => {
    if (failedContext.current !== context) {
      failedContext.current = context;
      retry?.();
    }
  }, [context, retry]);
  let from = "/?generation=1";
  try {
    from = parseReturnPath(params.get("from") || undefined);
  } catch {}
  return (
    <>
      {!pane && (
        <div className="scope-strip">
          <div className="scope-inner">
            <span>Pokédex / Field guide</span>
          </div>
        </div>
      )}
      <section
        className={pane ? "detail-pane plate" : "shell-error plate"}
        aria-label={
          kind === "error" ? "Reference unavailable" : "Species not found"
        }
      >
        {pane && (
          <Link href={from} scroll={false} className="fg-button detail-back">
            ← Back to index
          </Link>
        )}
        <div
          className="state-content"
          role={kind === "error" ? "alert" : undefined}
        >
          {kind === "error" ? (
            <AlertTriangle className="error-icon" size={40} aria-hidden />
          ) : (
            <GuideEmblem size={48} />
          )}
          <h1>
            {kind === "error"
              ? "Couldn’t load the reference."
              : "Species not found."}
          </h1>
          <p>
            {kind === "error"
              ? "Your browsing context is saved. Try loading the data again."
              : "Check the species URL or return to the index."}
          </p>
          {retry ? (
            <button type="button" onClick={retry} className="fg-button primary">
              Try again
            </button>
          ) : (
            <Link href={from} className="fg-button primary" scroll={false}>
              Back to index
            </Link>
          )}
        </div>
      </section>
    </>
  );
}
