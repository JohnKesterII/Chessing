"use client";

import { useCallback, useRef } from "react";

export function useMoveSounds(enabled: boolean) {
  const audioContextRef = useRef<AudioContext | null>(null);

  const playTone = useCallback(
    (frequency: number, duration = 0.06) => {
      if (!enabled || typeof window === "undefined") {
        return;
      }

      const audioContext =
        audioContextRef.current ?? new window.AudioContext({ latencyHint: "interactive" });
      audioContextRef.current = audioContext;

      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      oscillator.frequency.value = frequency;
      gain.gain.value = 0.02;
      oscillator.connect(gain);
      gain.connect(audioContext.destination);
      oscillator.start();
      gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + duration);
      oscillator.stop(audioContext.currentTime + duration);
    },
    [enabled]
  );

  return {
    playMove: () => playTone(440),
    playCapture: () => playTone(320),
    playCheck: () => playTone(560, 0.1)
  };
}
