import { useEffect, useRef } from "react";

interface GridPoint {
  x: number;
  y: number;
  z: number;
}

/**
 * Global interactive grid background
 * Absolute position - scrolls with page content
 * Fades between sections for visual depth
 */
export function InteractiveBackground() {
  const canvas_ref = useRef<HTMLCanvasElement>(null);
  const animation_ref = useRef<number>(0);
  const mouse_ref = useRef({ x: 0.5, y: 0.5 });
  const target_mouse_ref = useRef({ x: 0.5, y: 0.5 });
  const grid_ref = useRef<GridPoint[][]>([]);
  const dimensions_ref = useRef({ width: 0, height: 0, cols: 0, rows: 0 });

  useEffect(() => {
    const canvas = canvas_ref.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let time = 0;

    const calculate_grid_density = (width: number, height: number) => {
      const base_cols = width < 640 ? 20 : width < 1024 ? 28 : width < 1440 ? 36 : 44;
      // Calculate rows based on page height
      const cell_size = width / (base_cols - 1);
      const rows = Math.ceil(height / cell_size) + 1;
      return { cols: base_cols, rows };
    };

    const rebuild_grid = (width: number, height: number) => {
      const density = calculate_grid_density(width, height);
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
            z: 0,
          });
        }
        grid.push(row_points);
      }
      grid_ref.current = grid;
    };

    const setup_canvas = (width: number, height: number) => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const check_and_resize = () => {
      const width = window.innerWidth;
      const height = document.documentElement.scrollHeight;
      const prev = dimensions_ref.current;

      const width_changed = Math.abs(width - prev.width) > 30;
      const height_changed = Math.abs(height - prev.height) > 100;

      if (width_changed || height_changed || prev.width === 0) {
        setup_canvas(width, height);
        rebuild_grid(width, height);
        return true;
      }
      return false;
    };

    const handle_mouse_move = (e: MouseEvent) => {
      const height = document.documentElement.scrollHeight;
      target_mouse_ref.current = {
        x: e.clientX / window.innerWidth,
        y: (e.clientY + window.scrollY) / height,
      };
    };

    const lerp = (start: number, end: number, factor: number) => {
      return start + (end - start) * factor;
    };

    // Calculate fade opacity based on Y position (section boundaries)
    const get_section_fade = (y: number, height: number): number => {
      const viewport_height = window.innerHeight;
      const section_index = y / viewport_height;
      const position_in_section = section_index % 1;

      // Fade near section boundaries (top 10% and bottom 10%)
      const fade_zone = 0.12;

      if (position_in_section < fade_zone) {
        // Fade in at top of section
        return 0.4 + (position_in_section / fade_zone) * 0.6;
      } else if (position_in_section > (1 - fade_zone)) {
        // Fade out at bottom of section
        return 0.4 + ((1 - position_in_section) / fade_zone) * 0.6;
      }

      return 1;
    };

    const draw = () => {
      check_and_resize();

      const { width, height, cols, rows } = dimensions_ref.current;
      if (width === 0 || height === 0) {
        animation_ref.current = requestAnimationFrame(draw);
        return;
      }

      ctx.clearRect(0, 0, width, height);
      time += 0.012;

      const grid = grid_ref.current;
      if (grid.length === 0) {
        animation_ref.current = requestAnimationFrame(draw);
        return;
      }

      // Smooth mouse following
      mouse_ref.current.x = lerp(
        mouse_ref.current.x,
        target_mouse_ref.current.x,
        0.06
      );
      mouse_ref.current.y = lerp(
        mouse_ref.current.y,
        target_mouse_ref.current.y,
        0.06
      );

      const mouse_x = mouse_ref.current.x * width;
      const mouse_y = mouse_ref.current.y * height;

      // Update z values
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const point = grid[row][col];

          // Wave animations
          const wave1 = Math.sin(col * 0.18 + time * 0.5 + row * 0.05) * 8;
          const wave2 = Math.sin(row * 0.14 + time * 0.4) * 6;
          const wave3 = Math.sin((col + row) * 0.1 + time * 0.3) * 4;

          // Mouse ripple effect
          const dx = point.x - mouse_x;
          const dy = point.y - mouse_y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const max_dist = 350;
          const mouse_influence =
            dist < max_dist
              ? Math.sin(dist * 0.02 - time * 2) * (1 - dist / max_dist) * 18
              : 0;

          point.z = wave1 + wave2 + wave3 + mouse_influence;
        }
      }

      // Draw grid with section fading
      for (let row = 0; row < rows; row++) {
        const point_y = grid[row][0].y;
        const section_fade = get_section_fade(point_y, height);
        const base_alpha = 0.06 * section_fade;

        ctx.strokeStyle = `rgba(100, 200, 255, ${base_alpha})`;
        ctx.lineWidth = 1;

        // Horizontal line
        ctx.beginPath();
        for (let col = 0; col < cols; col++) {
          const point = grid[row][col];
          const perspective_y = point.y + point.z * 0.35;

          if (col === 0) {
            ctx.moveTo(point.x, perspective_y);
          } else {
            ctx.lineTo(point.x, perspective_y);
          }
        }
        ctx.stroke();
      }

      // Vertical lines with fading
      for (let col = 0; col < cols; col++) {
        ctx.beginPath();
        let last_alpha = 0;

        for (let row = 0; row < rows; row++) {
          const point = grid[row][col];
          const perspective_y = point.y + point.z * 0.35;
          const section_fade = get_section_fade(point.y, height);
          const current_alpha = 0.06 * section_fade;

          if (row === 0) {
            ctx.moveTo(point.x, perspective_y);
            last_alpha = current_alpha;
          } else {
            // If alpha changed significantly, end current path and start new
            if (Math.abs(current_alpha - last_alpha) > 0.01) {
              ctx.strokeStyle = `rgba(100, 200, 255, ${last_alpha})`;
              ctx.stroke();
              ctx.beginPath();
              ctx.moveTo(point.x, perspective_y);
            } else {
              ctx.lineTo(point.x, perspective_y);
            }
            last_alpha = current_alpha;
          }
        }
        ctx.strokeStyle = `rgba(100, 200, 255, ${last_alpha})`;
        ctx.stroke();
      }

      // Draw intersection highlights near mouse
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const point = grid[row][col];
          const perspective_y = point.y + point.z * 0.35;

          const dx = point.x - mouse_x;
          const dy = perspective_y - mouse_y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 280) {
            const section_fade = get_section_fade(point.y, height);
            const intensity = 1 - dist / 280;
            const alpha = intensity * 0.25 * section_fade;

            // Outer glow
            const outer_gradient = ctx.createRadialGradient(
              point.x,
              perspective_y,
              0,
              point.x,
              perspective_y,
              16
            );
            outer_gradient.addColorStop(0, `rgba(100, 200, 255, ${alpha * 0.6})`);
            outer_gradient.addColorStop(0.5, `rgba(100, 200, 255, ${alpha * 0.2})`);
            outer_gradient.addColorStop(1, "rgba(100, 200, 255, 0)");
            ctx.fillStyle = outer_gradient;
            ctx.beginPath();
            ctx.arc(point.x, perspective_y, 16, 0, Math.PI * 2);
            ctx.fill();

            // Inner glow
            const inner_gradient = ctx.createRadialGradient(
              point.x,
              perspective_y,
              0,
              point.x,
              perspective_y,
              6
            );
            inner_gradient.addColorStop(0, `rgba(150, 220, 255, ${alpha})`);
            inner_gradient.addColorStop(1, "rgba(100, 200, 255, 0)");
            ctx.fillStyle = inner_gradient;
            ctx.beginPath();
            ctx.arc(point.x, perspective_y, 6, 0, Math.PI * 2);
            ctx.fill();

            // Bright center dot
            ctx.fillStyle = `rgba(200, 240, 255, ${alpha * 1.5})`;
            ctx.beginPath();
            ctx.arc(point.x, perspective_y, 2, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      animation_ref.current = requestAnimationFrame(draw);
    };

    // Initial setup
    check_and_resize();
    draw();

    // Event listeners
    window.addEventListener("mousemove", handle_mouse_move);
    window.addEventListener("resize", () => check_and_resize());

    // Watch for DOM changes that might affect page height
    const resize_observer = new ResizeObserver(() => {
      check_and_resize();
    });
    resize_observer.observe(document.body);

    return () => {
      window.removeEventListener("mousemove", handle_mouse_move);
      window.removeEventListener("resize", () => check_and_resize());
      resize_observer.disconnect();
      cancelAnimationFrame(animation_ref.current);
    };
  }, []);

  return (
    <canvas
      ref={canvas_ref}
      className="absolute top-0 left-0 w-full pointer-events-none"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    />
  );
}
