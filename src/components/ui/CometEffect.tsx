import { useEffect, useState, useRef, useId } from "react";

interface ActiveComet {
  target_id: string;
  edge: "top" | "bottom" | "left" | "right";
  length: number;
  offset: number;
  duration: number;
}

// Global state - shared across all CometEffect instances
const registered_cards: Set<string> = new Set();
let global_comet: ActiveComet | null = null;
let listeners: Set<() => void> = new Set();

function notify_listeners() {
  listeners.forEach((listener) => listener());
}

function spawn_global_comet() {
  if (registered_cards.size === 0) return;

  const cards = Array.from(registered_cards);
  const target_id = cards[Math.floor(Math.random() * cards.length)];
  const edges: ActiveComet["edge"][] = ["top", "bottom", "left", "right"];
  const edge = edges[Math.floor(Math.random() * edges.length)];
  const length = 30 + Math.random() * 50;
  const offset = Math.random() * 80;
  const duration = 2500 + Math.random() * 1500; // 2.5-4 seconds

  global_comet = { target_id, edge, length, offset, duration };
  notify_listeners();

  // Clear comet after animation
  setTimeout(() => {
    global_comet = null;
    notify_listeners();
  }, duration + 300);
}

// Start global spawner (only once)
let spawner_started = false;
function start_global_spawner() {
  if (spawner_started) return;
  spawner_started = true;

  const schedule_next = () => {
    // Random interval: 6-12 seconds between comets
    const interval = 6000 + Math.random() * 6000;
    setTimeout(() => {
      spawn_global_comet();
      schedule_next();
    }, interval);
  };

  // Initial spawn after 2-4 seconds
  setTimeout(() => {
    spawn_global_comet();
    schedule_next();
  }, 2000 + Math.random() * 2000);
}

/**
 * Renders subtle comet effect that travels along card edge
 * Uses global singleton - only ONE comet visible at a time across entire page
 */
export function CometEffect() {
  const card_id = useId();
  const [comet, setComet] = useState<ActiveComet | null>(null);
  const container_ref = useRef<HTMLDivElement>(null);

  // Register this card instance
  useEffect(() => {
    registered_cards.add(card_id);
    start_global_spawner();

    const listener = () => {
      if (global_comet?.target_id === card_id) {
        setComet(global_comet);
      } else {
        setComet(null);
      }
    };

    listeners.add(listener);

    return () => {
      registered_cards.delete(card_id);
      listeners.delete(listener);
    };
  }, [card_id]);

  if (!comet) return <div ref={container_ref} className="comet-container" />;

  const is_horizontal = comet.edge === "top" || comet.edge === "bottom";
  const style: React.CSSProperties = {
    ["--comet-length" as string]: `${comet.length}px`,
    ["--comet-offset" as string]: `${comet.offset}%`,
    ["--comet-duration" as string]: `${comet.duration}ms`,
  };

  return (
    <div ref={container_ref} className="comet-container">
      <div
        className={`comet comet-${comet.edge} ${is_horizontal ? "comet-h" : "comet-v"}`}
        style={style}
      />
    </div>
  );
}
