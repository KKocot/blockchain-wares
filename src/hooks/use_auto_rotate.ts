import { useCallback, useEffect, useRef, useState } from "react";

const AUTO_ROTATE_INTERVAL = 5000;
const PAUSE_AFTER_CLICK = 8000;

interface UseAutoRotateOptions {
  /** Total number of items to cycle through */
  count: number;
  /** Current active index */
  active_index: number;
  /** Callback to change the active index */
  on_change: (index: number) => void;
}

interface UseAutoRotateReturn {
  /** Whether auto-rotation is currently playing (not paused) */
  is_auto_playing: boolean;
  /** Incremented on every section change — use as CSS animation reset key */
  progress_key: number;
  /** Call when user manually selects a section */
  handle_user_select: (index: number) => void;
}

/**
 * Hook for auto-rotating through sections with progress tracking.
 *
 * - Cycles forward every AUTO_ROTATE_INTERVAL ms
 * - Pauses for PAUSE_AFTER_CLICK ms after user interaction
 * - Pauses when document tab is hidden
 */
export function useAutoRotate({
  count,
  active_index,
  on_change,
}: UseAutoRotateOptions): UseAutoRotateReturn {
  const [is_auto_playing, set_is_auto_playing] = useState(true);
  const [progress_key, set_progress_key] = useState(0);

  const timer_ref = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pause_timer_ref = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clear_timers = useCallback(() => {
    if (timer_ref.current) {
      clearTimeout(timer_ref.current);
      timer_ref.current = null;
    }
    if (pause_timer_ref.current) {
      clearTimeout(pause_timer_ref.current);
      pause_timer_ref.current = null;
    }
  }, []);

  /** Schedule the next auto-rotation tick */
  const schedule_next = useCallback(() => {
    if (timer_ref.current) clearTimeout(timer_ref.current);
    timer_ref.current = setTimeout(() => {
      const next_index = (active_index + 1) % count;
      on_change(next_index);
      set_progress_key((k) => k + 1);
    }, AUTO_ROTATE_INTERVAL);
  }, [active_index, count, on_change]);

  /** Handle user manually selecting a section */
  const handle_user_select = useCallback(
    (index: number) => {
      clear_timers();
      on_change(index);

      // Pause auto-rotation
      set_is_auto_playing(false);
      set_progress_key((k) => k + 1);

      // Resume after PAUSE_AFTER_CLICK
      pause_timer_ref.current = setTimeout(() => {
        set_is_auto_playing(true);
        set_progress_key((k) => k + 1);
        // schedule_next will be triggered by the useEffect below
      }, PAUSE_AFTER_CLICK);
    },
    [clear_timers, on_change]
  );

  /** Main effect: keep the rotation timer in sync with state */
  useEffect(() => {
    if (!is_auto_playing) return;
    schedule_next();
    return () => {
      if (timer_ref.current) {
        clearTimeout(timer_ref.current);
        timer_ref.current = null;
      }
    };
  }, [is_auto_playing, schedule_next]);

  /** Pause/resume on document visibility change */
  useEffect(() => {
    function handle_visibility_change() {
      if (document.hidden) {
        set_is_auto_playing(false);
      } else {
        // Resume from where we paused — restart the cycle
        set_is_auto_playing(true);
        set_progress_key((k) => k + 1);
      }
    }

    document.addEventListener("visibilitychange", handle_visibility_change);
    return () => {
      document.removeEventListener(
        "visibilitychange",
        handle_visibility_change
      );
    };
  }, []);

  /** Cleanup on unmount */
  useEffect(() => {
    return clear_timers;
  }, [clear_timers]);

  return { is_auto_playing, progress_key, handle_user_select };
}
