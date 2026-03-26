"use client";

import { useEffect, useRef, useState } from "react";

import type { EngineSnapshot } from "@/lib/analysis/types";

type AnalyzeOptions = {
  fen: string;
  depth: number;
  multiPv: number;
  moveTime?: number;
};

export function useStockfishEngine() {
  const workerRef = useRef<Worker | null>(null);
  const debounceRef = useRef<number | null>(null);
  const [snapshot, setSnapshot] = useState<EngineSnapshot>({
    fen: "start",
    depth: 0,
    lines: [],
    loading: false
  });

  useEffect(() => {
    const worker = new Worker(new URL("../workers/stockfish.worker.ts", import.meta.url), {
      type: "module"
    });
    workerRef.current = worker;

    worker.onmessage = (event: MessageEvent<EngineSnapshot>) => {
      setSnapshot(event.data);
    };

    worker.postMessage({ type: "init" });

    return () => {
      if (debounceRef.current) {
        window.clearTimeout(debounceRef.current);
      }
      worker.postMessage({ type: "quit" });
      worker.terminate();
      workerRef.current = null;
    };
  }, []);

  const analyze = (options: AnalyzeOptions, debounceMs = 180) => {
    if (!workerRef.current) {
      return;
    }

    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
    }

    debounceRef.current = window.setTimeout(() => {
      workerRef.current?.postMessage({ type: "analyze", ...options });
    }, debounceMs);
  };

  const stop = () => workerRef.current?.postMessage({ type: "stop" });

  return {
    snapshot,
    analyze,
    stop
  };
}
