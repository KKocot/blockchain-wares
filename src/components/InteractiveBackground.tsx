import { useEffect, useRef } from "react";

interface GridPoint {
  x: number;
  y: number;
  z: number;
}

interface EnergyPulse {
  // Direction: 0 = right, 1 = down
  direction: number;
  // Fixed row or column (depending on direction)
  fixed_index: number;
  // Current position along the line (in grid units)
  position: number;
  // Speed (grid units per frame)
  speed: number;
  // How many grid units to travel total
  travel_distance: number;
  // How far we've traveled (0 to travel_distance)
  traveled: number;
  // Base intensity
  intensity: number;
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
  const gradient_cache_ref = useRef<Map<string, CanvasGradient>>(new Map());
  const pulses_ref = useRef<EnergyPulse[]>([]);

  useEffect(() => {
    const canvas = canvas_ref.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let time = 0;
    let frame_count = 0;

    // Detect low-end devices
    const is_low_end_device =
      (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) ||
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );

    // Frame skip: render every 2nd frame on low-end devices
    const frame_skip = is_low_end_device ? 2 : 1;

    // Increased GRID_SPACING to reduce point count (48-64 instead of 32)
    const calculate_grid_density = (width: number, height: number) => {
      const base_cols = width < 640 ? 15 : width < 1024 ? 20 : width < 1440 ? 26 : 32;
      // Calculate rows based on page height
      const cell_size = width / (base_cols - 1);
      const rows = Math.ceil(height / cell_size) + 1;
      return { cols: base_cols, rows };
    };

    // Helper to get or create cached gradients with LRU size limit
    const gradient_cache = gradient_cache_ref.current;
    const MAX_CACHE_SIZE = 100;

    const get_or_create_gradient = (
      key: string,
      create_fn: () => CanvasGradient
    ) => {
      if (gradient_cache.has(key)) {
        // Move to end (refresh LRU position)
        const value = gradient_cache.get(key)!;
        gradient_cache.delete(key);
        gradient_cache.set(key, value);
        return value;
      }

      // Evict oldest if at limit
      if (gradient_cache.size >= MAX_CACHE_SIZE) {
        const first_key = gradient_cache.keys().next().value;
        if (first_key) gradient_cache.delete(first_key);
      }

      const value = create_fn();
      gradient_cache.set(key, value);
      return value;
    };

    // Spawn a new energy pulse - starts somewhere on grid, travels a few cells, fades out
    const spawn_pulse = () => {
      const { cols, rows } = dimensions_ref.current;
      if (cols === 0 || rows === 0) return;

      // Get visible viewport rows
      const scroll_y = window.scrollY;
      const viewport_height = window.innerHeight;
      const cell_height = dimensions_ref.current.height / (rows - 1);
      const visible_start_row = Math.max(0, Math.floor(scroll_y / cell_height));
      const visible_end_row = Math.min(rows - 1, Math.ceil((scroll_y + viewport_height) / cell_height));

      // Mostly horizontal (0), occasionally vertical (1)
      const direction = Math.random() < 0.75 ? 0 : 1;
      let fixed_index: number;
      let position: number;

      if (direction === 0) {
        // Horizontal - pick random visible row, start from left side
        fixed_index = visible_start_row + Math.floor(Math.random() * (visible_end_row - visible_start_row + 1));
        position = Math.floor(Math.random() * (cols * 0.3)); // Start in left 30%
      } else {
        // Vertical - pick random column, start from top of visible area
        fixed_index = Math.floor(Math.random() * cols);
        position = visible_start_row + Math.floor(Math.random() * 3);
      }

      pulses_ref.current.push({
        direction,
        fixed_index,
        position,
        speed: 0.025 + Math.random() * 0.025, // Slow: 0.025-0.05 per frame
        travel_distance: 5 + Math.floor(Math.random() * 6), // Travel 5-10 cells
        traveled: 0,
        intensity: 0.7 + Math.random() * 0.3,
      });
    };

    // Update and draw energy pulses
    const update_and_draw_pulses = (ctx: CanvasRenderingContext2D) => {
      const grid = grid_ref.current;
      const { cols, rows, width, height } = dimensions_ref.current;
      if (grid.length === 0) return;

      const pulses = pulses_ref.current;

      // Spawn new pulses occasionally (roughly every 2-3 seconds)
      if (Math.random() < 0.006) {
        spawn_pulse();
      }

      // Limit max pulses
      const max_pulses = is_low_end_device ? 3 : 5;
      while (pulses.length > max_pulses) {
        pulses.shift();
      }

      const cell_width = width / (cols - 1);
      const cell_height_px = height / (rows - 1);

      // Update and draw each pulse
      for (let i = pulses.length - 1; i >= 0; i--) {
        const pulse = pulses[i];

        // Update position
        pulse.position += pulse.speed;
        pulse.traveled += pulse.speed;

        // Remove if traveled full distance
        if (pulse.traveled >= pulse.travel_distance) {
          pulses.splice(i, 1);
          continue;
        }

        // Draw the pulse
        draw_pulse_line(ctx, pulse, grid, cols, rows, cell_width, cell_height_px);
      }
    };

    const draw_pulse_line = (
      ctx: CanvasRenderingContext2D,
      pulse: EnergyPulse,
      grid: GridPoint[][],
      cols: number,
      rows: number,
      cell_width: number,
      cell_height_px: number
    ) => {
      const is_horizontal = pulse.direction === 0;

      // Calculate fade based on travel progress (fade in at start, fade out at end)
      const progress = pulse.traveled / pulse.travel_distance;
      let fade = 1;
      if (progress < 0.15) {
        fade = progress / 0.15; // Fade in during first 15%
      } else if (progress > 0.6) {
        fade = 1 - (progress - 0.6) / 0.4; // Fade out during last 40%
      }

      const alpha = pulse.intensity * fade;
      if (alpha < 0.02) return;

      // Trail length (shorter as it fades)
      const trail_length = 3 * fade;

      // Get the fixed grid line index
      const fixed_idx = Math.round(pulse.fixed_index);

      if (is_horizontal) {
        // Horizontal pulse along a row
        if (fixed_idx < 0 || fixed_idx >= rows) return;
        const row = grid[fixed_idx];
        if (!row) return;

        const head_col = pulse.position;
        const tail_col = Math.max(0, head_col - trail_length);

        // Get Y position with wave effect
        const sample_col = Math.max(0, Math.min(cols - 1, Math.round(head_col)));
        const point = row[sample_col];
        if (!point) return;
        const y = point.y + point.z * 0.35;

        const x1 = tail_col * cell_width;
        const x2 = head_col * cell_width;

        if (x2 <= x1 || x1 < 0) return;

        // Gradient from tail to head
        const gradient = ctx.createLinearGradient(x1, y, x2, y);
        gradient.addColorStop(0, `rgba(80, 160, 255, 0)`);
        gradient.addColorStop(0.5, `rgba(100, 190, 255, ${alpha * 0.3})`);
        gradient.addColorStop(0.85, `rgba(130, 210, 255, ${alpha * 0.6})`);
        gradient.addColorStop(1, `rgba(170, 230, 255, ${alpha})`);

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1.5;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(x1, y);
        ctx.lineTo(x2, y);
        ctx.stroke();

        // Small glow at head
        const glow = ctx.createRadialGradient(x2, y, 0, x2, y, 10);
        glow.addColorStop(0, `rgba(170, 230, 255, ${alpha * 0.5})`);
        glow.addColorStop(0.5, `rgba(120, 200, 255, ${alpha * 0.2})`);
        glow.addColorStop(1, "rgba(100, 180, 255, 0)");

        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(x2, y, 10, 0, Math.PI * 2);
        ctx.fill();

      } else {
        // Vertical pulse along a column
        if (fixed_idx < 0 || fixed_idx >= cols) return;

        const head_row = pulse.position;
        const tail_row = Math.max(0, head_row - trail_length);

        // Get positions
        const head_row_idx = Math.max(0, Math.min(rows - 1, Math.round(head_row)));
        const tail_row_idx = Math.max(0, Math.min(rows - 1, Math.round(tail_row)));

        const head_point = grid[head_row_idx]?.[fixed_idx];
        const tail_point = grid[tail_row_idx]?.[fixed_idx];
        if (!head_point || !tail_point) return;

        const x = head_point.x;
        const y1 = tail_point.y + tail_point.z * 0.35;
        const y2 = head_point.y + head_point.z * 0.35;

        if (y2 <= y1) return;

        // Gradient from tail to head
        const gradient = ctx.createLinearGradient(x, y1, x, y2);
        gradient.addColorStop(0, `rgba(80, 160, 255, 0)`);
        gradient.addColorStop(0.5, `rgba(100, 190, 255, ${alpha * 0.3})`);
        gradient.addColorStop(0.85, `rgba(130, 210, 255, ${alpha * 0.6})`);
        gradient.addColorStop(1, `rgba(170, 230, 255, ${alpha})`);

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1.5;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(x, y1);
        ctx.lineTo(x, y2);
        ctx.stroke();

        // Small glow at head
        const glow = ctx.createRadialGradient(x, y2, 0, x, y2, 10);
        glow.addColorStop(0, `rgba(170, 230, 255, ${alpha * 0.5})`);
        glow.addColorStop(0.5, `rgba(120, 200, 255, ${alpha * 0.2})`);
        glow.addColorStop(1, "rgba(100, 180, 255, 0)");

        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(x, y2, 10, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.lineWidth = 1;
      ctx.lineCap = "butt";
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

    // Throttled mouse move handler (max 60fps = 16ms)
    let last_mouse_update = 0;
    const handle_mouse_move = (e: MouseEvent) => {
      const now = performance.now();
      if (now - last_mouse_update < 16) return; // 60fps throttle
      last_mouse_update = now;

      const height = document.documentElement.scrollHeight;
      target_mouse_ref.current = {
        x: e.clientX / window.innerWidth,
        y: (e.clientY + window.scrollY) / height,
      };
    };

    const lerp = (start: number, end: number, factor: number) => {
      return start + (end - start) * factor;
    };

    const draw = () => {
      check_and_resize();

      const { width, height, cols, rows } = dimensions_ref.current;
      if (width === 0 || height === 0) {
        animation_ref.current = requestAnimationFrame(draw);
        return;
      }

      // Frame skipping for low-end devices
      frame_count++;
      if (frame_count % frame_skip !== 0) {
        animation_ref.current = requestAnimationFrame(draw);
        return;
      }

      ctx.clearRect(0, 0, width, height);
      time += 0.012 * frame_skip;

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

      // Draw grid - continuous lines without gaps
      ctx.strokeStyle = "rgba(100, 200, 255, 0.06)";
      ctx.lineWidth = 1;

      // Horizontal lines
      for (let row = 0; row < rows; row++) {
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

      // Vertical lines
      for (let col = 0; col < cols; col++) {
        ctx.beginPath();
        for (let row = 0; row < rows; row++) {
          const point = grid[row][col];
          const perspective_y = point.y + point.z * 0.35;

          if (row === 0) {
            ctx.moveTo(point.x, perspective_y);
          } else {
            ctx.lineTo(point.x, perspective_y);
          }
        }
        ctx.stroke();
      }

      // Draw energy pulses (animated lines running along grid)
      update_and_draw_pulses(ctx);

      // Draw intersection highlights near mouse
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const point = grid[row][col];
          const perspective_y = point.y + point.z * 0.35;

          const dx = point.x - mouse_x;
          const dy = perspective_y - mouse_y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 280) {
            const intensity = 1 - dist / 280;
            const alpha = intensity * 0.25;

            // Outer glow gradient - create directly (perspective_y changes every frame)
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

            // Inner glow gradient - create directly (perspective_y changes every frame)
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

    // Named resize handler to ensure same reference in cleanup
    const handle_resize = () => check_and_resize();

    // Event listeners
    window.addEventListener("mousemove", handle_mouse_move);
    window.addEventListener("resize", handle_resize);

    // Watch for DOM changes that might affect page height
    const resize_observer = new ResizeObserver(() => {
      check_and_resize();
    });
    resize_observer.observe(document.body);

    return () => {
      window.removeEventListener("mousemove", handle_mouse_move);
      window.removeEventListener("resize", handle_resize);
      resize_observer.disconnect();
      cancelAnimationFrame(animation_ref.current);
      gradient_cache_ref.current.clear();
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
