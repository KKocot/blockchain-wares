import { useEffect, useRef } from "react";

interface GridPoint {
  x: number;
  y: number;
  base_z: number;
  z: number;
}

/**
 * Animated 3D blockchain grid background using HTML5 Canvas
 * Features:
 * - Perspective 3D grid with wave animation
 * - Mouse interaction (grid follows cursor)
 * - Smooth flowing motion like terrain
 */
export function BlockchainGrid() {
  const canvas_ref = useRef<HTMLCanvasElement>(null);
  const animation_ref = useRef<number>(0);
  const mouse_ref = useRef({ x: 0.5, y: 0.5 });
  const target_mouse_ref = useRef({ x: 0.5, y: 0.5 });

  useEffect(() => {
    const canvas = canvas_ref.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let grid: GridPoint[][] = [];
    const cols = 40;
    const rows = 25;
    let time = 0;

    const resize_canvas = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      init_grid(rect.width, rect.height);
    };

    const init_grid = (width: number, height: number) => {
      grid = [];
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

    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);

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

      time += 0.015;

      // Update z values with wave animation and mouse influence
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const point = grid[row][col];

          // Base wave animation - multiple overlapping waves
          const wave1 = Math.sin(col * 0.15 + time) * 15;
          const wave2 = Math.sin(row * 0.12 + time * 0.8) * 12;
          const wave3 = Math.sin((col + row) * 0.1 + time * 0.6) * 8;

          // Mouse influence - creates a ripple effect around cursor
          const mouse_x = mouse_ref.current.x * rect.width;
          const mouse_y = mouse_ref.current.y * rect.height;
          const dx = point.x - mouse_x;
          const dy = point.y - mouse_y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const max_dist = 300;
          const mouse_influence =
            dist < max_dist
              ? Math.sin(dist * 0.03 - time * 2) * (1 - dist / max_dist) * 25
              : 0;

          point.z = wave1 + wave2 + wave3 + mouse_influence;
        }
      }

      // Draw grid lines with perspective
      ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
      ctx.lineWidth = 1;

      // Horizontal lines
      for (let row = 0; row < rows; row++) {
        ctx.beginPath();
        for (let col = 0; col < cols; col++) {
          const point = grid[row][col];
          const perspective_y = point.y + point.z * 0.5;

          if (col === 0) {
            ctx.moveTo(point.x, perspective_y);
          } else {
            ctx.lineTo(point.x, perspective_y);
          }
        }
        ctx.stroke();
      }

      // Vertical lines
      for (let col = 0; col < cols; col++) {
        ctx.beginPath();
        for (let row = 0; row < rows; row++) {
          const point = grid[row][col];
          const perspective_y = point.y + point.z * 0.5;

          if (row === 0) {
            ctx.moveTo(point.x, perspective_y);
          } else {
            ctx.lineTo(point.x, perspective_y);
          }
        }
        ctx.stroke();
      }

      // Draw intersection points with glow effect on peaks
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const point = grid[row][col];
          const perspective_y = point.y + point.z * 0.5;
          const intensity = Math.abs(point.z) / 40;

          if (intensity > 0.2) {
            ctx.beginPath();
            ctx.arc(point.x, perspective_y, 2 + intensity * 3, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(100, 200, 255, ${intensity * 0.5})`;
            ctx.fill();
          }
        }
      }

      // Draw blockchain chain links at certain intersections
      draw_chain_links(ctx, rect.width, rect.height);

      animation_ref.current = requestAnimationFrame(draw);
    };

    const draw_chain_links = (
      ctx: CanvasRenderingContext2D,
      width: number,
      height: number
    ) => {
      const link_positions = [
        { x: 0.2, y: 0.3 },
        { x: 0.5, y: 0.5 },
        { x: 0.8, y: 0.4 },
        { x: 0.35, y: 0.7 },
        { x: 0.65, y: 0.25 },
      ];

      ctx.strokeStyle = "rgba(100, 200, 255, 0.25)";
      ctx.lineWidth = 2;

      // Draw connections between links
      ctx.beginPath();
      for (let i = 0; i < link_positions.length - 1; i++) {
        const start = link_positions[i];
        const end = link_positions[i + 1];
        const offset_y = Math.sin(time + i) * 5;

        ctx.moveTo(start.x * width, start.y * height + offset_y);
        ctx.lineTo(end.x * width, end.y * height + offset_y);
      }
      ctx.stroke();

      // Draw hexagonal nodes
      for (let i = 0; i < link_positions.length; i++) {
        const pos = link_positions[i];
        const x = pos.x * width;
        const y = pos.y * height + Math.sin(time + i * 0.5) * 5;
        const size = 12 + Math.sin(time * 2 + i) * 3;

        draw_hexagon(ctx, x, y, size, i);
      }
    };

    const draw_hexagon = (
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      size: number,
      index: number
    ) => {
      const rotation = time * 0.3 + index * 0.5;

      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i + rotation;
        const px = x + Math.cos(angle) * size;
        const py = y + Math.sin(angle) * size;

        if (i === 0) {
          ctx.moveTo(px, py);
        } else {
          ctx.lineTo(px, py);
        }
      }
      ctx.closePath();

      const pulse = 0.15 + Math.sin(time * 2 + index) * 0.1;
      ctx.strokeStyle = `rgba(100, 200, 255, ${pulse + 0.2})`;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Inner glow
      ctx.fillStyle = `rgba(100, 200, 255, ${pulse * 0.5})`;
      ctx.fill();
    };

    resize_canvas();
    window.addEventListener("resize", resize_canvas);
    canvas.addEventListener("mousemove", handle_mouse_move);
    canvas.addEventListener("mouseleave", handle_mouse_leave);
    draw();

    return () => {
      window.removeEventListener("resize", resize_canvas);
      canvas.removeEventListener("mousemove", handle_mouse_move);
      canvas.removeEventListener("mouseleave", handle_mouse_leave);
      cancelAnimationFrame(animation_ref.current);
    };
  }, []);

  return (
    <canvas
      ref={canvas_ref}
      className="absolute inset-0 w-full h-full"
      style={{ background: "#080808" }}
    />
  );
}
