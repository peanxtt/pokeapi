"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  appendCatalogPage,
  fetchCatalogPage,
} from "@/lib/pokedex/catalog-client";
import { getBrowsePath } from "@/lib/pokedex/query";
import type {
  CatalogScope,
  PokemonCatalog,
  PokemonTypeName,
} from "@/lib/pokedex/types";

type PageState = {
  key: string;
  catalog: PokemonCatalog;
  error: "first" | "more" | null;
};
export function useCatalogPages(
  initial: PokemonCatalog,
  initialKey: string,
  scope: CatalogScope,
  query: string,
  types: PokemonTypeName[],
) {
  const key = getBrowsePath(scope, query, types);
  const [seedKey, setSeedKey] = useState(initialKey);
  const [state, setState] = useState<PageState>({
    key: initialKey,
    catalog: initial,
    error: null,
  });
  if (seedKey !== initialKey) {
    setSeedKey(initialKey);
    setState({ key: initialKey, catalog: initial, error: null });
  }
  const [attempt, setAttempt] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const previous = useRef({ key: initialKey, attempt: 0 });
  const moreRequest = useRef<AbortController | null>(null);

  useEffect(() => {
    if (previous.current.key === key && previous.current.attempt === attempt)
      return;
    previous.current = { key, attempt };
    moreRequest.current?.abort();
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const catalog = await fetchCatalogPage(key, 0, controller.signal);
        if (!controller.signal.aborted) setState({ key, catalog, error: null });
      } catch {
        if (!controller.signal.aborted)
          setState((current) => ({ ...current, key, error: "first" }));
      }
    }, 200);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [key, attempt]);

  useEffect(() => () => moreRequest.current?.abort(), []);
  const loadMore = useCallback(async () => {
    const offset = state.catalog.nextOffset;
    if (state.key !== key || offset === null || moreRequest.current) return;
    const controller = new AbortController();
    moreRequest.current = controller;
    setLoadingMore(true);
    setState((current) => ({ ...current, error: null }));
    try {
      const incoming = await fetchCatalogPage(key, offset, controller.signal);
      if (!controller.signal.aborted)
        setState((current) =>
          current.key === key
            ? {
                key,
                catalog: appendCatalogPage(current.catalog, incoming),
                error: null,
              }
            : current,
        );
    } catch {
      if (!controller.signal.aborted)
        setState((current) =>
          current.key === key ? { ...current, error: "more" } : current,
        );
    } finally {
      if (moreRequest.current === controller) {
        moreRequest.current = null;
        setLoadingMore(false);
      }
    }
  }, [state.key, state.catalog.nextOffset, key]);
  function retry() {
    if (state.error === "more") void loadMore();
    else {
      setState((current) => ({ ...current, key: "", error: null }));
      setAttempt((current) => current + 1);
    }
  }
  return {
    catalog: state.catalog,
    pending: state.key !== key,
    error: state.key === key ? state.error : null,
    loadingMore,
    loadMore,
    retry,
  };
}
