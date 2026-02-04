import { useEffect, useState } from "react";

interface BlockNode {
  id: string;
  x: number;
  y: number;
}

interface BlockConnection {
  from: string;
  to: string;
}

const BLOCK_NODES: BlockNode[] = [
  { id: "b1", x: 10, y: 20 },
  { id: "b2", x: 25, y: 35 },
  { id: "b3", x: 40, y: 15 },
  { id: "b4", x: 55, y: 40 },
  { id: "b5", x: 70, y: 25 },
  { id: "b6", x: 85, y: 45 },
  { id: "b7", x: 15, y: 60 },
  { id: "b8", x: 35, y: 75 },
  { id: "b9", x: 50, y: 55 },
  { id: "b10", x: 65, y: 80 },
  { id: "b11", x: 80, y: 65 },
  { id: "b12", x: 92, y: 85 },
];

const CONNECTIONS: BlockConnection[] = [
  { from: "b1", to: "b2" },
  { from: "b2", to: "b3" },
  { from: "b3", to: "b4" },
  { from: "b4", to: "b5" },
  { from: "b5", to: "b6" },
  { from: "b2", to: "b7" },
  { from: "b7", to: "b8" },
  { from: "b4", to: "b9" },
  { from: "b8", to: "b9" },
  { from: "b9", to: "b10" },
  { from: "b9", to: "b11" },
  { from: "b10", to: "b12" },
  { from: "b11", to: "b12" },
  { from: "b5", to: "b11" },
];

interface BlockchainBackgroundProps {
  id?: string;
}

export function BlockchainBackground({ id = "default" }: BlockchainBackgroundProps) {
  const [active_path, set_active_path] = useState<number | null>(null);
  const [active_node, set_active_node] = useState<string | null>(null);

  useEffect(() => {
    const animate_transaction = () => {
      const path_index = Math.floor(Math.random() * CONNECTIONS.length);
      set_active_path(path_index);
      set_active_node(CONNECTIONS[path_index].from);

      setTimeout(() => {
        set_active_node(CONNECTIONS[path_index].to);
      }, 600);

      setTimeout(() => {
        set_active_path(null);
        set_active_node(null);
      }, 1200);
    };

    animate_transaction();
    const interval = setInterval(animate_transaction, 4000);
    return () => clearInterval(interval);
  }, []);

  const get_node = (node_id: string) => BLOCK_NODES.find((n) => n.id === node_id);

  const glow_filter_id = `block-glow-${id}`;
  const line_gradient_id = `line-gradient-${id}`;
  const active_gradient_id = `active-gradient-${id}`;

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none opacity-15"
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <filter id={glow_filter_id}>
          <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id={line_gradient_id} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="oklch(71% 0.143 215.221)" stopOpacity="0.3" />
          <stop offset="100%" stopColor="oklch(71% 0.143 215.221)" stopOpacity="0.3" />
        </linearGradient>
        <linearGradient id={active_gradient_id} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="oklch(71% 0.143 215.221)" stopOpacity="0.6" />
          <stop offset="100%" stopColor="oklch(85% 0.143 215.221)" stopOpacity="0.6" />
        </linearGradient>
      </defs>

      {/* Connection lines */}
      {CONNECTIONS.map((conn, index) => {
        const from_node = get_node(conn.from);
        const to_node = get_node(conn.to);
        if (!from_node || !to_node) return null;

        const is_active = active_path === index;

        return (
          <g key={`${conn.from}-${conn.to}`}>
            <line
              x1={from_node.x}
              y1={from_node.y}
              x2={to_node.x}
              y2={to_node.y}
              stroke={`url(#${line_gradient_id})`}
              strokeWidth="0.3"
            />
            {is_active && (
              <line
                x1={from_node.x}
                y1={from_node.y}
                x2={to_node.x}
                y2={to_node.y}
                stroke={`url(#${active_gradient_id})`}
                strokeWidth="0.6"
                filter={`url(#${glow_filter_id})`}
                strokeDasharray="100"
                strokeDashoffset="100"
                className="blockchain-line-active"
              />
            )}
          </g>
        );
      })}

      {/* Block nodes */}
      {BLOCK_NODES.map((node) => {
        const is_active = active_node === node.id;

        return (
          <g key={node.id}>
            {/* Block shape (rounded rectangle) */}
            <rect
              x={node.x - 2}
              y={node.y - 1.5}
              width="4"
              height="3"
              rx="0.5"
              fill="oklch(71% 0.143 215.221)"
              stroke="oklch(71% 0.143 215.221)"
              strokeWidth="0.2"
              filter={is_active ? `url(#${glow_filter_id})` : undefined}
              className={`blockchain-block ${is_active ? "blockchain-block-active" : "blockchain-block-inactive"}`}
              style={{ transformOrigin: `${node.x}px ${node.y}px` }}
            />
            {/* Hash lines inside block */}
            <line
              x1={node.x - 1.2}
              y1={node.y - 0.5}
              x2={node.x + 1.2}
              y2={node.y - 0.5}
              stroke="oklch(71% 0.143 215.221)"
              strokeWidth="0.15"
              className={`blockchain-hash-line ${is_active ? "blockchain-hash-line-active" : ""}`}
            />
            <line
              x1={node.x - 1.2}
              y1={node.y + 0.5}
              x2={node.x + 1.2}
              y2={node.y + 0.5}
              stroke="oklch(71% 0.143 215.221)"
              strokeWidth="0.15"
              className={`blockchain-hash-line ${is_active ? "blockchain-hash-line-active" : ""}`}
            />
          </g>
        );
      })}
    </svg>
  );
}
