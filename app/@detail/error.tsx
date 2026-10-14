"use client";
import { StateView } from "@/components/pokedex/state-view";
export default function ErrorPage({
  reset,
}: {
  reset: () => void;
}): React.JSX.Element {
  return <StateView kind="error" retry={reset} pane />;
}
