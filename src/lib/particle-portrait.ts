/* ─────────────────────────────────────────────────────────
 * PARTICLE PORTRAIT — the hero photo as a field of drifting dots
 *
 * The photo is sampled into a dense circular grid of dots that keep
 * its colour; each dot's size follows its contrast with the page
 * background and shrinks towards the edge of the circle.
 *
 * Space physics: dots keep their momentum and feel little drag. The
 * pointer is a body passing through them: it repels and swirls nearby
 * dots and drags them along its wake; a tap or click sends out a
 * shockwave. A weak spring brings every dot home on a slow, floaty
 * path. The canvas extends past the photo and sits under the page
 * text, so the furthest flung dots drift beneath it.
 *
 * The loop sleeps once everything has settled or the portrait is off
 * screen. Reduced motion: static dots, no input.
 * ───────────────────────────────────────────────────────── */

const GRID = {
  spacing: 3, // distance between dot centres, CSS px
  minScale: 0.7, // radius of a dot matching the background, × half spacing
  fadeFrom: 0.62, // dots shrink from this share of the radius to the edge
  overflow: 0.75, // room around the photo for drifting dots, × photo size
};

const PHYSICS = {
  spring: 0.008, // pull towards home, per frame
  drag: 0.982, // velocity kept per frame while drifting
  settleDrag: 0.93, // velocity kept per frame close to home
  settleDistance: 3, // px from home where settleDrag takes over
  maxSpeed: 16, // px/frame
  pointerRadius: 70, // px
  pointerForce: 1.5, // repulsion at the pointer, px/frame²
  pointerSwirl: 0.25, // tangential share of the repulsion
  pointerWake: 0.08, // share of the pointer's velocity given to nearby dots
  shockRadius: 110, // px
  shockForce: 6, // px/frame kick at the centre
};

interface Dot {
  homeX: number;
  homeY: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
}

interface Pointer {
  x: number;
  y: number;
  vx: number;
  vy: number;
  time: number;
}

function luminance(red: number, green: number, blue: number) {
  return (0.2126 * red + 0.7152 * green + 0.0722 * blue) / 255;
}

function backgroundLuminance() {
  const [red = 0, green = 0, blue = 0] = (
    getComputedStyle(document.body).backgroundColor.match(/\d+(\.\d+)?/g) ?? []
  ).map(Number);
  return luminance(red, green, blue);
}

/**
 * Turns a `<figure>` holding an `<img>` and a `<canvas>` into a particle
 * portrait. Pointer input is read on the figure; the canvas ignores it.
 */
export function mountParticlePortrait(figure: HTMLElement): () => void {
  const image = figure.querySelector("img");
  const canvas = figure.querySelector("canvas");
  const context = canvas?.getContext("2d");
  if (!image || !canvas || !context) return () => {};

  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const darkScheme = matchMedia("(prefers-color-scheme: dark)");
  let dots: Dot[] = [];
  let pointer: Pointer | null = null;
  let size = 0; // photo size, CSS px
  let margin = 0; // canvas overflow left, above and below, CSS px
  let marginRight = 0; // overflow to the right, limited by the viewport
  let pixelRatio = 1; // devicePixelRatio the canvas was sized for
  let frame = 0;
  let lastTime = 0;
  let visible = true; // the canvas intersects the viewport
  let disposed = false;

  /** Overflow to the right that stays inside the viewport (no sideways scroll). */
  function rightRoom() {
    const right = figure.getBoundingClientRect().right;
    // Leave slack for the page transitions' horizontal slide.
    return Math.max(0, Math.floor(document.documentElement.clientWidth - right - 24));
  }

  function build() {
    size = figure.clientWidth;
    if (disposed || !size || !image!.naturalWidth) return;
    margin = Math.round(size * GRID.overflow);
    marginRight = Math.min(margin, rightRoom());
    const width = size + margin + marginRight;
    const height = size + margin * 2;
    const ratio = (pixelRatio = devicePixelRatio || 1);
    Object.assign(canvas!.style, {
      inset: `${-margin}px auto auto ${-margin}px`,
      width: `${width}px`,
      height: `${height}px`,
    });
    canvas!.width = Math.round(width * ratio);
    canvas!.height = Math.round(height * ratio);
    context!.setTransform(ratio, 0, 0, ratio, 0, 0);

    const columns = Math.max(16, Math.round(size / GRID.spacing));
    const step = size / columns;
    const sampler = document.createElement("canvas");
    sampler.width = sampler.height = columns;
    const samplerContext = sampler.getContext("2d", { willReadFrequently: true });
    if (!samplerContext) return;
    samplerContext.drawImage(image!, 0, 0, columns, columns);
    const { data } = samplerContext.getImageData(0, 0, columns, columns);

    const background = backgroundLuminance();
    const center = size / 2;
    dots = [];
    for (let row = 0; row < columns; row++) {
      for (let column = 0; column < columns; column++) {
        const x = (column + 0.5) * step;
        const y = (row + 0.5) * step;
        const edge = Math.hypot(x - center, y - center) / center;
        const fade = Math.min(1, Math.max(0, (1 - edge) / (1 - GRID.fadeFrom)));
        if (fade < 0.15) continue;
        const index = (row * columns + column) * 4;
        const [red = 0, green = 0, blue = 0] = data.subarray(index, index + 3);
        const contrast = Math.abs(luminance(red, green, blue) - background);
        dots.push({
          homeX: x + margin,
          homeY: y + margin,
          x: x + margin,
          y: y + margin,
          vx: 0,
          vy: 0,
          radius:
            (step / 2) * (GRID.minScale + (1 - GRID.minScale) * Math.sqrt(contrast)) * fade ** 0.75,
          color: `rgb(${red} ${green} ${blue})`,
        });
      }
    }
    draw();
    figure.dataset.ready = "";
  }

  function draw() {
    context!.clearRect(0, 0, size + margin + marginRight, size + margin * 2);
    for (const dot of dots) {
      context!.fillStyle = dot.color;
      context!.beginPath();
      context!.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2);
      context!.fill();
    }
  }

  function tick(now: number) {
    const dt = Math.min(2, (now - lastTime) / (1000 / 60));
    lastTime = now;
    const drift = PHYSICS.drag ** dt;
    const settle = PHYSICS.settleDrag ** dt;
    // The pointer only pushes while it moves; at rest it leaves a calm hole.
    const push = pointer && now - pointer.time < 120 ? pointer : null;
    let moving = false;
    let displaced = false;

    for (const dot of dots) {
      let ax = (dot.homeX - dot.x) * PHYSICS.spring;
      let ay = (dot.homeY - dot.y) * PHYSICS.spring;
      const field = push ?? pointer;
      if (field) {
        const dx = dot.x - field.x;
        const dy = dot.y - field.y;
        const distance = Math.hypot(dx, dy);
        if (distance > 0.01 && distance < PHYSICS.pointerRadius) {
          const falloff = (1 - distance / PHYSICS.pointerRadius) ** 2;
          const force = PHYSICS.pointerForce * falloff;
          ax += ((dx - dy * PHYSICS.pointerSwirl) / distance) * force;
          ay += ((dy + dx * PHYSICS.pointerSwirl) / distance) * force;
          if (push) {
            ax += push.vx * PHYSICS.pointerWake * falloff;
            ay += push.vy * PHYSICS.pointerWake * falloff;
          }
        }
      }

      const offset = Math.hypot(dot.x - dot.homeX, dot.y - dot.homeY);
      const keep = offset < PHYSICS.settleDistance ? settle : drift;
      dot.vx = (dot.vx + ax * dt) * keep;
      dot.vy = (dot.vy + ay * dt) * keep;
      const speed = Math.hypot(dot.vx, dot.vy);
      if (speed > PHYSICS.maxSpeed) {
        dot.vx *= PHYSICS.maxSpeed / speed;
        dot.vy *= PHYSICS.maxSpeed / speed;
      }
      dot.x += dot.vx * dt;
      dot.y += dot.vy * dt;
      if (speed > 0.02) moving = true;
      if (offset > 0.1) displaced = true;
    }

    // Asleep: nothing moves, and dots are home or held by a resting pointer.
    const active = moving || push !== null || (displaced && !pointer);
    if (!active && !pointer) {
      for (const dot of dots) {
        dot.x = dot.homeX;
        dot.y = dot.homeY;
        dot.vx = dot.vy = 0;
      }
    }
    draw();
    frame = active && visible ? requestAnimationFrame(tick) : 0;
  }

  function wake() {
    if (frame || !visible || reducedMotion.matches || !dots.length) return;
    lastTime = performance.now();
    frame = requestAnimationFrame(tick);
  }

  function sleep() {
    cancelAnimationFrame(frame);
    frame = 0;
  }

  function position(event: PointerEvent) {
    const rect = figure.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * size + margin,
      y: ((event.clientY - rect.top) / rect.height) * size + margin,
    };
  }

  function onPointerMove(event: PointerEvent) {
    if (reducedMotion.matches || !size) return;
    const { x, y } = position(event);
    const now = performance.now();
    const frames = pointer ? Math.max(1, (now - pointer.time) / (1000 / 60)) : 1;
    pointer = {
      x,
      y,
      vx: pointer ? (x - pointer.x) / frames : 0,
      vy: pointer ? (y - pointer.y) / frames : 0,
      time: now,
    };
    wake();
  }

  function onPointerDown(event: PointerEvent) {
    if (reducedMotion.matches || !size) return;
    const { x, y } = position(event);
    for (const dot of dots) {
      const dx = dot.x - x;
      const dy = dot.y - y;
      const distance = Math.hypot(dx, dy);
      if (distance < 0.01 || distance > PHYSICS.shockRadius) continue;
      const kick = PHYSICS.shockForce * (1 - distance / PHYSICS.shockRadius) ** 1.5;
      dot.vx += (dx / distance) * kick;
      dot.vy += (dy / distance) * kick;
    }
    pointer = { x, y, vx: 0, vy: 0, time: performance.now() };
    wake();
  }

  function onPointerLeave() {
    pointer = null;
    wake();
  }

  function onMotionChange() {
    sleep();
    pointer = null;
    build();
  }

  const resizeObserver = new ResizeObserver(() => {
    if (figure.clientWidth !== size) build();
  });
  let resizeFrame = 0;
  function onWindowResize() {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(() => {
      // Zooming changes devicePixelRatio; the canvas must follow to stay sharp.
      const changed =
        Math.min(margin, rightRoom()) !== marginRight || (devicePixelRatio || 1) !== pixelRatio;
      if (dots.length && changed) build();
    });
  }
  const intersectionObserver = new IntersectionObserver(([entry]) => {
    visible = entry?.isIntersecting ?? true;
    if (visible) wake();
    else sleep();
  });

  figure.addEventListener("pointermove", onPointerMove);
  figure.addEventListener("pointerdown", onPointerDown);
  figure.addEventListener("pointerleave", onPointerLeave);
  figure.addEventListener("pointercancel", onPointerLeave);
  reducedMotion.addEventListener("change", onMotionChange);
  darkScheme.addEventListener("change", build);
  addEventListener("resize", onWindowResize);
  image
    .decode()
    .then(() => {
      if (disposed) return;
      build();
      resizeObserver.observe(figure);
      // The canvas covers the whole drift area, not just the photo.
      intersectionObserver.observe(canvas);
    })
    .catch(() => {
      // Keep the plain photo.
    });

  return () => {
    disposed = true;
    sleep();
    cancelAnimationFrame(resizeFrame);
    resizeObserver.disconnect();
    intersectionObserver.disconnect();
    figure.removeEventListener("pointermove", onPointerMove);
    figure.removeEventListener("pointerdown", onPointerDown);
    figure.removeEventListener("pointerleave", onPointerLeave);
    figure.removeEventListener("pointercancel", onPointerLeave);
    reducedMotion.removeEventListener("change", onMotionChange);
    darkScheme.removeEventListener("change", build);
    removeEventListener("resize", onWindowResize);
    delete figure.dataset.ready;
  };
}
