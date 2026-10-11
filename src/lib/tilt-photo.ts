/* ─────────────────────────────────────────────────────────
 * TILT PHOTO — a small photo that leans towards the pointer
 *
 * Mouse and pen only: the card tilts a few degrees in 3D and a
 * holographic sheen follows the pointer (see PagePhoto.astro). On
 * leave it eases back flat. Touch does nothing; reduced motion gets
 * the static sheen from CSS and no tilt.
 * ───────────────────────────────────────────────────────── */

const MAX_TILT = 8; // degrees at the edges

/** Wire up one [data-tilt-photo] element; returns a dispose function. */
export function mountTiltPhoto(card: HTMLElement): () => void {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let frame = 0;

  function onMove(event: PointerEvent) {
    if (event.pointerType === "touch" || reducedMotion.matches) return;
    const rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width; // 0..1
    const y = (event.clientY - rect.top) / rect.height;
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      card.dataset.tilt = "active";
      card.style.setProperty("--rx", `${((0.5 - y) * 2 * MAX_TILT).toFixed(2)}deg`);
      card.style.setProperty("--ry", `${((x - 0.5) * 2 * MAX_TILT).toFixed(2)}deg`);
      card.style.setProperty("--mx", `${(x * 100).toFixed(1)}%`);
      card.style.setProperty("--my", `${(y * 100).toFixed(1)}%`);
    });
  }

  function onLeave() {
    cancelAnimationFrame(frame);
    delete card.dataset.tilt;
    // Ease back flat; the sheen fades out where it was.
    card.style.removeProperty("--rx");
    card.style.removeProperty("--ry");
  }

  card.addEventListener("pointermove", onMove);
  card.addEventListener("pointerleave", onLeave);
  return () => {
    onLeave();
    card.removeEventListener("pointermove", onMove);
    card.removeEventListener("pointerleave", onLeave);
  };
}
