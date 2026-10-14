import { Suspense } from "react";
import { StateView } from "@/components/pokedex/state-view";
export default function NotFound(): React.JSX.Element {
  return (
    <Suspense>
      <StateView kind="not-found" pane />
    </Suspense>
  );
}
