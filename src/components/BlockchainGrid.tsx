import { useEffect, useRef, useCallback } from "react";

interface Block {
  x: number;
  y: number;
  rel_x: number;
  rel_y: number;
  hash: string;
  prev_hash: string;
  confirmed: boolean;
  pulse: number;
  data_lines: number;
}

interface Transaction {
  from_block: number;
  to_block: number;
  progress: number;
  speed: number;
  y_offset: number;
}

interface GridPoint {
  x: number;
  y: number;
  base_z: number;
  z: number;
}

/**
 * Animated blockchain visualization background using HTML5 Canvas
 */
export function BlockchainGrid() {
  const canvas_ref = useRef<HTMLCanvasElement>(null);
  const animation_ref = useRef<number>(0);
  const mouse_ref = useRef({ x: 0.5, y: 0.5 });
  const target_mouse_ref = useRef({ x: 0.5, y: 0.5 });
  const blocks_ref = useRef<Block[]>([]);
  const grid_ref = useRef<GridPoint[][]>([]);
  const dimensions_ref = useRef({ width: 0, height: 0, cols: 0, rows: 0 });

  const is_in_exclusion_zone = useCallback((rel_x: number, rel_y: number) => {
    const center_x = 0.5;
    const center_y = 0.45;
    const zone_width = 0.4;
    const zone_height = 0.25;
    return (
      Math.abs(rel_x - center_x) < zone_width / 2 &&
      Math.abs(rel_y - center_y) < zone_height / 2
    );
  }, []);

  useEffect(() => {
    const canvas = canvas_ref.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let time = 0;
    let transactions: Transaction[] = [];

    const generate_hash = () => {
      const chars = "0123456789abcdef";
      let hash = "0x";
      for (let i = 0; i < 8; i++) {
        hash += chars[Math.floor(Math.random() * chars.length)];
      }
      return hash;
    };

    const calculate_block_count = (width: number) => {
      if (width < 640) return 6;
      if (width < 1024) return 8;
      if (width < 1440) return 12;
      return 16;
    };

    const rebuild_blocks = (width: number, height: number) => {
      const target_count = calculate_block_count(width);
      const current_count = blocks_ref.current.length;
      const padding_x = 0.08;
      const padding_y = 0.1;
      const min_rel_distance = 0.12;

      // Update existing block positions
      for (const block of blocks_ref.current) {
        block.x = block.rel_x * width;
        block.y = block.rel_y * height;
      }

      // Add new blocks if needed
      if (current_count < target_count) {
        const existing_positions = blocks_ref.current.map((b) => ({
          rel_x: b.rel_x,
          rel_y: b.rel_y,
        }));

        const last_hash =
          blocks_ref.current.length > 0
            ? blocks_ref.current[blocks_ref.current.length - 1].hash
            : "0x00000000";
        let prev_hash = last_hash;

        for (let i = current_count; i < target_count; i++) {
          let attempts = 0;
          let rel_x: number, rel_y: number;

          do {
            rel_x = padding_x + Math.random() * (1 - padding_x * 2);
            rel_y = padding_y + Math.random() * (1 - padding_y * 2);
            attempts++;
          } while (
            attempts < 100 &&
            (is_in_exclusion_zone(rel_x, rel_y) ||
              existing_positions.some(
                (p) => Math.hypot(p.rel_x - rel_x, p.rel_y - rel_y) < min_rel_distance
              ))
          );

          if (attempts < 100) {
            existing_positions.push({ rel_x, rel_y });
            const hash = generate_hash();
            blocks_ref.current.push({
              x: rel_x * width,
              y: rel_y * height,
              rel_x,
              rel_y,
              hash,
              prev_hash,
              confirmed: Math.random() > 0.3,
              pulse: Math.random() * Math.PI * 2,
              data_lines: 2 + Math.floor(Math.random() * 3),
            });
            prev_hash = hash;
          }
        }
      }

      // Remove excess blocks if needed (when shrinking)
      if (current_count > target_count) {
        blocks_ref.current = blocks_ref.current.slice(0, target_count);
      }
    };

    const init_transactions = () => {
      transactions = [];
      for (let i = 0; i < 3; i++) {
        spawn_transaction();
      }
    };

    const spawn_transaction = () => {
      const blocks = blocks_ref.current;
      if (blocks.length < 2) return;

      const from_idx = Math.floor(Math.random() * blocks.length);
      let to_idx: number;
      do {
        to_idx = Math.floor(Math.random() * blocks.length);
      } while (to_idx === from_idx);

      transactions.push({
        from_block: from_idx,
        to_block: to_idx,
        progress: Math.random(),
        speed: 0.002 + Math.random() * 0.003,
        y_offset: (Math.random() - 0.5) * 10,
      });
    };

    const setup_canvas = (width: number, height: number) => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const check_and_resize = () => {
      const rect = canvas.getBoundingClientRect();
      const prev = dimensions_ref.current;

      // Check if size changed enough to warrant rebuild
      const width_changed = Math.abs(rect.width - prev.width) > 20;
      const height_changed = Math.abs(rect.height - prev.height) > 20;

      if (width_changed || height_changed || prev.width === 0) {
        setup_canvas(rect.width, rect.height);
        rebuild_grid(rect.width, rect.height);
        rebuild_blocks(rect.width, rect.height);

        if (transactions.length === 0) {
          init_transactions();
        }
        return true;
      }
      return false;
    };

    const calculate_grid_density = (width: number) => {
      if (width < 640) return { cols: 20, rows: 14 };
      if (width < 1024) return { cols: 25, rows: 16 };
      if (width < 1440) return { cols: 30, rows: 20 };
      return { cols: 40, rows: 24 };
    };

    const rebuild_grid = (width: number, height: number) => {
      const density = calculate_grid_density(width);
      const cols = density.cols;
      const rows = density.rows;

      dimensions_ref.current = { width, height, cols, rows };

      const grid: GridPoint[][] = [];
      const cell_width = width / (cols - 1);
      const cell_height = height / (rows - 1);

      for (let row = 0; row < rows; row++) {
        const row_points: GridPoint[] = [];
        for (let col = 0; col < cols; col++) {
          row_points.push({
            x: col * cell_width,
            y: row * cell_height,
            base_z: 0,
            z: 0,
          });
        }
        grid.push(row_points);
      }
      grid_ref.current = grid;
    };

    const handle_mouse_move = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      target_mouse_ref.current = {
        x: (e.clientX - rect.left) / rect.width,
        y: (e.clientY - rect.top) / rect.height,
      };
    };

    const handle_mouse_leave = () => {
      target_mouse_ref.current = { x: 0.5, y: 0.5 };
    };

    const lerp = (start: number, end: number, factor: number) => {
      return start + (end - start) * factor;
    };

    const draw_background_grid = (
      ctx: CanvasRenderingContext2D,
      width: number,
      height: number
    ) => {
      const grid = grid_ref.current;
      if (grid.length === 0) return;

      // Smooth mouse following
      mouse_ref.current.x = lerp(
        mouse_ref.current.x,
        target_mouse_ref.current.x,
        0.05
      );
      mouse_ref.current.y = lerp(
        mouse_ref.current.y,
        target_mouse_ref.current.y,
        0.05
      );

      const current_rows = grid.length;
      const current_cols = grid[0]?.length || 0;

      // Update z values with wave animation
      for (let row = 0; row < current_rows; row++) {
        for (let col = 0; col < current_cols; col++) {
          const point = grid[row][col];

          const wave1 = Math.sin(col * 0.2 + time * 0.5) * 8;
          const wave2 = Math.sin(row * 0.15 + time * 0.4) * 6;

          const mouse_x = mouse_ref.current.x * width;
          const mouse_y = mouse_ref.current.y * height;
          const dx = point.x - mouse_x;
          const dy = point.y - mouse_y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const max_dist = 250;
          const mouse_influence =
            dist < max_dist
              ? Math.sin(dist * 0.025 - time * 1.5) * (1 - dist / max_dist) * 15
              : 0;

          point.z = wave1 + wave2 + mouse_influence;
        }
      }

      // Draw subtle grid
      ctx.strokeStyle = "rgba(100, 200, 255, 0.04)";
      ctx.lineWidth = 1;

      for (let row = 0; row < current_rows; row++) {
        ctx.beginPath();
        for (let col = 0; col < current_cols; col++) {
          const point = grid[row][col];
          const perspective_y = point.y + point.z * 0.3;

          if (col === 0) {
            ctx.moveTo(point.x, perspective_y);
          } else {
            ctx.lineTo(point.x, perspective_y);
          }
        }
        ctx.stroke();
      }

      for (let col = 0; col < current_cols; col++) {
        ctx.beginPath();
        for (let row = 0; row < current_rows; row++) {
          const point = grid[row][col];
          const perspective_y = point.y + point.z * 0.3;

          if (row === 0) {
            ctx.moveTo(point.x, perspective_y);
          } else {
            ctx.lineTo(point.x, perspective_y);
          }
        }
        ctx.stroke();
      }
    };

    const draw_chain_connection = (
      ctx: CanvasRenderingContext2D,
      from: Block,
      to: Block
    ) => {
      const gradient = ctx.createLinearGradient(from.x, from.y, to.x, to.y);
      gradient.addColorStop(0, "rgba(100, 200, 255, 0.12)");
      gradient.addColorStop(0.5, "rgba(100, 200, 255, 0.06)");
      gradient.addColorStop(1, "rgba(100, 200, 255, 0.12)");

      ctx.strokeStyle = gradient;
      ctx.lineWidth = 1;
      ctx.setLineDash([6, 6]);

      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();

      ctx.setLineDash([]);
    };

    const draw_block = (ctx: CanvasRenderingContext2D, block: Block) => {
      const block_width = 90;
      const block_height = 54;
      const x = block.x - block_width / 2;
      const y = block.y - block_height / 2 + Math.sin(time + block.pulse) * 3;

      // Soft circular shadow/glow (zamiast kwadratowego)
      const shadow_radius = Math.max(block_width, block_height) * 1.2;
      const shadow_gradient = ctx.createRadialGradient(
        block.x,
        block.y + 8,
        0,
        block.x,
        block.y + 8,
        shadow_radius
      );
      shadow_gradient.addColorStop(0, "rgba(0, 0, 0, 0.25)");
      shadow_gradient.addColorStop(0.4, "rgba(0, 0, 0, 0.1)");
      shadow_gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = shadow_gradient;
      ctx.beginPath();
      ctx.arc(block.x, block.y + 8, shadow_radius, 0, Math.PI * 2);
      ctx.fill();

      // Block glow effect (subtelniejszy)
      if (block.confirmed) {
        const glow_intensity = 0.08 + Math.sin(time * 2 + block.pulse) * 0.04;
        const glow_gradient = ctx.createRadialGradient(
          block.x,
          block.y,
          0,
          block.x,
          block.y,
          block_width * 0.9
        );
        glow_gradient.addColorStop(0, `rgba(100, 200, 255, ${glow_intensity})`);
        glow_gradient.addColorStop(1, "rgba(100, 200, 255, 0)");
        ctx.fillStyle = glow_gradient;
        ctx.beginPath();
        ctx.arc(block.x, block.y, block_width * 0.9, 0, Math.PI * 2);
        ctx.fill();
      }

      // Block background (mniejsza opacity)
      const bg_gradient = ctx.createLinearGradient(x, y, x, y + block_height);
      bg_gradient.addColorStop(0, "rgba(20, 30, 50, 0.6)");
      bg_gradient.addColorStop(1, "rgba(10, 20, 35, 0.7)");

      ctx.fillStyle = bg_gradient;
      ctx.beginPath();
      ctx.roundRect(x, y, block_width, block_height, 8);
      ctx.fill();

      // Block border (subtelniejszy)
      const border_color = block.confirmed
        ? "rgba(100, 200, 255, 0.25)"
        : "rgba(255, 200, 100, 0.2)";
      ctx.strokeStyle = border_color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(x, y, block_width, block_height, 8);
      ctx.stroke();

      // Block header line (cieńsza)
      ctx.fillStyle = border_color;
      ctx.fillRect(x + 4, y, block_width - 8, 1);

      // Hash text (mniejsza opacity)
      ctx.fillStyle = "rgba(100, 200, 255, 0.6)";
      ctx.font = "bold 8px monospace";
      ctx.textAlign = "center";
      ctx.fillText(block.hash, block.x, y + 15);

      // Prev hash (jeszcze subtelniejszy)
      ctx.fillStyle = "rgba(100, 200, 255, 0.25)";
      ctx.font = "6px monospace";
      ctx.fillText(`← ${block.prev_hash}`, block.x, y + 26);

      // Data lines (subtelniejsze)
      ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
      for (let i = 0; i < block.data_lines; i++) {
        const line_width = 35 + Math.random() * 25;
        const line_x = x + 8;
        const line_y = y + 32 + i * 7;
        ctx.fillRect(line_x, line_y, line_width, 2);
      }

      // Confirmation indicator (mniejszy, subtelniejszy)
      if (block.confirmed) {
        ctx.fillStyle = "rgba(100, 255, 150, 0.5)";
        ctx.beginPath();
        ctx.arc(x + block_width - 10, y + 10, 3, 0, Math.PI * 2);
        ctx.fill();
      } else {
        const pending_alpha = 0.25 + Math.sin(time * 4) * 0.15;
        ctx.fillStyle = `rgba(255, 200, 100, ${pending_alpha})`;
        ctx.beginPath();
        ctx.arc(x + block_width - 10, y + 10, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const draw_transactions = (ctx: CanvasRenderingContext2D) => {
      const blocks = blocks_ref.current;

      for (let i = transactions.length - 1; i >= 0; i--) {
        const tx = transactions[i];
        tx.progress += tx.speed;

        if (tx.progress >= 1) {
          transactions.splice(i, 1);
          spawn_transaction();
          continue;
        }

        const from_block = blocks[tx.from_block];
        const to_block = blocks[tx.to_block];

        if (!from_block || !to_block) continue;

        const x = lerp(from_block.x, to_block.x, tx.progress);
        const y =
          lerp(from_block.y, to_block.y, tx.progress) +
          tx.y_offset +
          Math.sin(tx.progress * Math.PI) * -10;

        // Transaction packet glow (subtelniejszy)
        const glow_gradient = ctx.createRadialGradient(x, y, 0, x, y, 12);
        glow_gradient.addColorStop(0, "rgba(100, 200, 255, 0.35)");
        glow_gradient.addColorStop(0.5, "rgba(100, 200, 255, 0.1)");
        glow_gradient.addColorStop(1, "rgba(100, 200, 255, 0)");
        ctx.fillStyle = glow_gradient;
        ctx.beginPath();
        ctx.arc(x, y, 12, 0, Math.PI * 2);
        ctx.fill();

        // Transaction packet (mniejszy, subtelniejszy)
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(Math.PI / 4 + time * 2);

        ctx.fillStyle = "rgba(100, 200, 255, 0.5)";
        ctx.fillRect(-3, -3, 6, 6);

        ctx.restore();

        // Trail effect (subtelniejszy)
        for (let t = 1; t <= 3; t++) {
          const trail_progress = tx.progress - t * 0.04;
          if (trail_progress < 0) continue;

          const trail_x = lerp(from_block.x, to_block.x, trail_progress);
          const trail_y =
            lerp(from_block.y, to_block.y, trail_progress) +
            tx.y_offset +
            Math.sin(trail_progress * Math.PI) * -10;

          ctx.fillStyle = `rgba(100, 200, 255, ${0.15 - t * 0.04})`;
          ctx.beginPath();
          ctx.arc(trail_x, trail_y, 2.5 - t * 0.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };

    const draw_network_nodes = (
      ctx: CanvasRenderingContext2D,
      width: number,
      height: number
    ) => {
      const blocks = blocks_ref.current;
      if (blocks.length === 0) return;

      // More nodes on larger screens
      const base_nodes = [
        { x: 0.08, y: 0.12 },
        { x: 0.92, y: 0.18 },
        { x: 0.04, y: 0.85 },
        { x: 0.96, y: 0.78 },
      ];

      const extra_nodes =
        width >= 1024
          ? [
              { x: 0.15, y: 0.5 },
              { x: 0.85, y: 0.45 },
            ]
          : [];

      const wide_nodes =
        width >= 1440
          ? [
              { x: 0.02, y: 0.35 },
              { x: 0.98, y: 0.65 },
            ]
          : [];

      const nodes = [...base_nodes, ...extra_nodes, ...wide_nodes];

      ctx.strokeStyle = "rgba(100, 200, 255, 0.04)";
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 10]);

      for (const node of nodes) {
        const nx = node.x * width;
        const ny = node.y * height + Math.sin(time * 0.4 + node.x * 10) * 8;

        let nearest_block = blocks[0];
        let min_dist = Infinity;
        for (const block of blocks) {
          const dist = Math.hypot(block.x - nx, block.y - ny);
          if (dist < min_dist) {
            min_dist = dist;
            nearest_block = block;
          }
        }

        ctx.beginPath();
        ctx.moveTo(nx, ny);
        ctx.lineTo(nearest_block.x, nearest_block.y);
        ctx.stroke();

        const pulse = 0.15 + Math.sin(time * 1.5 + node.x * 5) * 0.08;
        ctx.fillStyle = `rgba(100, 200, 255, ${pulse})`;
        ctx.beginPath();
        ctx.arc(nx, ny, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = `rgba(100, 200, 255, ${pulse + 0.1})`;
        ctx.lineWidth = 1;
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.arc(nx, ny, 6, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([4, 10]);
      }

      ctx.setLineDash([]);
    };

    const draw = () => {
      check_and_resize();

      const { width, height } = dimensions_ref.current;
      if (width === 0 || height === 0) {
        animation_ref.current = requestAnimationFrame(draw);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      time += 0.016;
      const blocks = blocks_ref.current;

      draw_background_grid(ctx, width, height);
      draw_network_nodes(ctx, width, height);

      const drawn_connections = new Set<string>();
      for (let i = 0; i < blocks.length; i++) {
        const distances = blocks
          .map((b, idx) => ({ idx, dist: Math.hypot(b.x - blocks[i].x, b.y - blocks[i].y) }))
          .filter((d) => d.idx !== i)
          .sort((a, b) => a.dist - b.dist)
          .slice(0, 2);

        for (const { idx } of distances) {
          const key = [Math.min(i, idx), Math.max(i, idx)].join("-");
          if (!drawn_connections.has(key)) {
            drawn_connections.add(key);
            draw_chain_connection(ctx, blocks[i], blocks[idx]);
          }
        }
      }

      draw_transactions(ctx);

      for (const block of blocks) {
        draw_block(ctx, block);
      }

      animation_ref.current = requestAnimationFrame(draw);
    };

    draw();
    canvas.addEventListener("mousemove", handle_mouse_move);
    canvas.addEventListener("mouseleave", handle_mouse_leave);

    return () => {
      canvas.removeEventListener("mousemove", handle_mouse_move);
      canvas.removeEventListener("mouseleave", handle_mouse_leave);
      cancelAnimationFrame(animation_ref.current);
    };
  }, [is_in_exclusion_zone]);

  return (
    <canvas
      ref={canvas_ref}
      className="absolute inset-0 w-full h-full"
    />
  );
}
