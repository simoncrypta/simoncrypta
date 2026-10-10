import {
  createDialKit,
  createDialRoot,
  createDialTimelineRoot,
  type DialTimelineController,
  type TimelineConfig,
} from "dialkit/vanilla";
import styles from "dialkit/vanilla/styles.css?inline";
import { TRANSITION_DEFAULTS, type TransitionSettings } from "./page-transitions";

export function mountTransitionControls<T extends TimelineConfig>(
  timeline: DialTimelineController<T>,
  update: (settings: TransitionSettings) => void,
) {
  const target = document.querySelector<HTMLElement>("#transition-tools")!;
  // Keep the editor's stylesheet inside its persisted host; dynamically
  // imported head styles are otherwise removed by Astro's next document swap.
  const stylesheet = document.createElement("style");
  stylesheet.textContent = styles;
  target.append(stylesheet);
  const root = createDialRoot({ target, position: "bottom-right", defaultOpen: false });
  const dock = createDialTimelineRoot({ target, defaultVisible: false });
  const kit = createDialKit(
    "Page transition · milliseconds",
    {
      fadeOutMs: [TRANSITION_DEFAULTS.fadeOutMs, 0, 500, 10],
      enterPauseMs: [TRANSITION_DEFAULTS.enterPauseMs, 0, 250, 10],
      slideInMs: [TRANSITION_DEFAULTS.slideInMs, 100, 800, 10],
      childrenDelayMs: [TRANSITION_DEFAULTS.childrenDelayMs, 0, 300, 10],
      childDurationMs: [TRANSITION_DEFAULTS.childDurationMs, 100, 800, 10],
      staggerMs: [TRANSITION_DEFAULTS.staggerMs, 0, 100, 5],
      staggerWindowMs: [TRANSITION_DEFAULTS.staggerWindowMs, 0, 500, 5],
      offsetX: [TRANSITION_DEFAULTS.offsetX, 0, 40, 1],
      childOffsetX: [TRANSITION_DEFAULTS.childOffsetX, 0, 24, 1],
      replay: { type: "action", label: "Replay transition" },
    },
    {
      id: "page-transition-controls",
      persist: true,
      onAction: () => timeline.replay(),
    },
  );
  const unsubscribe = kit.subscribe(update);

  return () => {
    unsubscribe();
    kit.destroy();
    dock.destroy();
    root.destroy();
    stylesheet.remove();
  };
}
