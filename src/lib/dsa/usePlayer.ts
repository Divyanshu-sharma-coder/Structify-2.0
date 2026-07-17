import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Step } from "./types";

export function usePlayer(steps: Step[]) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1); // 0.25 - 4
  const timer = useRef<number | null>(null);

  const total = steps.length;

  const stop = useCallback(() => {
    if (timer.current !== null) {
      window.clearTimeout(timer.current);
      timer.current = null;
    }
  }, []);

  useEffect(() => {
    stop();
    if (!playing) return;
    if (index >= total - 1) {
      setPlaying(false);
      return;
    }
    const delay = Math.max(60, 700 / speed);
    timer.current = window.setTimeout(() => {
      setIndex((i) => Math.min(total - 1, i + 1));
    }, delay);
    return stop;
  }, [playing, index, speed, total, stop]);

  useEffect(() => stop, [stop]);

  const reset = useCallback(() => {
    stop();
    setPlaying(false);
    setIndex(0);
  }, [stop]);

  const stepForward = useCallback(() => {
    setPlaying(false);
    setIndex((i) => Math.min(total - 1, i + 1));
  }, [total]);

  const stepBack = useCallback(() => {
    setPlaying(false);
    setIndex((i) => Math.max(0, i - 1));
  }, []);

  const current = useMemo(() => steps[index] ?? steps[0], [steps, index]);

  return {
    index,
    total,
    playing,
    speed,
    current,
    setSpeed,
    setIndex,
    play: () => setPlaying(true),
    pause: () => setPlaying(false),
    toggle: () => setPlaying((p) => !p),
    reset,
    stepForward,
    stepBack,
  };
}
