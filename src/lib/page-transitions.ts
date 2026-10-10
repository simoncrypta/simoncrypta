/* ─────────────────────────────────────────────────────────
 * ANIMATION STORYBOARD — after Astro has prepared the next page
 *
 *    0ms   old content fades 1 → 0
 *  100ms   pause the playhead; Astro swaps documents
 *  180ms   new content slides x -12px → 0 and fades 0 → 1
 *  320ms   children slide x -9px → 0 (40ms stagger, capped at 110ms)
 *  890ms   all children have settled; clear animation styles
 *
 * Fetching precedes the storyboard, so slow requests keep the
 * old page readable. Header, footer, and background stay steady.
 * ───────────────────────────────────────────────────────── */
import type {
  TransitionBeforePreparationEvent,
  TransitionBeforeSwapEvent,
} from "astro:transitions/client";
import { createDialTimeline, DialStore, type DialTimelineValues } from "dialkit/vanilla";

const TIMING = {
  fadeOutMs: 100, // old content's fade duration
  enterPauseMs: 80, // pause after the document swap
  slideInMs: 350, // new content's settling duration
  childrenDelayMs: 140, // children start after the parent
  childDurationMs: 460, // each child's settling duration
  staggerMs: 40, // interval between children
  staggerWindowMs: 110, // limit the delay on long pages
};

const CONTENT = {
  offsetX: 12, // parent's initial distance to the left, px
  childOffsetX: 9, // each child's initial distance to the left, px
  bounce: 0, // smooth spring settling without overshoot
  exitEase: [0.4, 0, 1, 1] as [number, number, number, number],
};

export const TRANSITION_DEFAULTS = {
  ...TIMING,
  offsetX: CONTENT.offsetX,
  childOffsetX: CONTENT.childOffsetX,
};
export type TransitionSettings = typeof TRANSITION_DEFAULTS;

const seconds = (ms: number) => ms / 1000;

function entrance(at: number, duration: number, offsetX: number) {
  return {
    at: seconds(at),
    duration: seconds(duration),
    from: { opacity: 0, x: -offsetX },
    to: { opacity: 1, x: 0 },
    transition: {
      type: "spring" as const,
      visualDuration: seconds(duration),
      bounce: CONTENT.bounce,
    },
  };
}

function storyboard(settings: TransitionSettings, childCount: number) {
  const enterAt = settings.fadeOutMs + settings.enterPauseMs;
  const children: Record<string, ReturnType<typeof entrance>> = {};
  for (let index = 0; index < childCount; index++) {
    children[`child${index}`] = entrance(
      enterAt +
        settings.childrenDelayMs +
        Math.min(index * settings.staggerMs, settings.staggerWindowMs),
      settings.childDurationMs,
      settings.childOffsetX,
    );
  }
  return {
    exit: {
      at: 0,
      duration: seconds(settings.fadeOutMs),
      from: { opacity: 1 },
      to: { opacity: 0 },
      transition: {
        type: "easing" as const,
        duration: seconds(settings.fadeOutMs),
        ease: CONTENT.exitEase,
      },
    },
    swap: { at: seconds(settings.fadeOutMs), duration: 0 },
    enter: entrance(enterAt, settings.slideInMs, settings.offsetX),
    children,
  };
}

function getScene() {
  const container = document.querySelector<HTMLElement>("#main-content")!;
  const children = [...container.querySelectorAll<HTMLElement>("content > *, section > *")];
  return { container, children };
}

export function setupPageTransitions() {
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  let settings = { ...TRANSITION_DEFAULTS };
  let scene = getScene();
  let pendingEntrance = false;
  let disposed = false;
  let disposeControls: (() => void) | undefined;
  // TODO(production): Keep sampled clip.current bindings for scrubbing while
  // authoring. When finalized, replace these with the tuned animation runtime
  // before removing DialKit's timeline controller and local authoring surfaces.
  const timeline = createDialTimeline(
    "Page transition",
    storyboard(settings, scene.children.length),
    {
      id: "page-transition",
      autoplay: false,
    },
  );
  timeline.seek(timeline.values.duration);

  function clearStyles() {
    for (const element of [scene.container, ...scene.children]) {
      element.style.removeProperty("opacity");
      element.style.removeProperty("transform");
    }
  }

  function render(values: DialTimelineValues<ReturnType<typeof storyboard>>) {
    if (reducedMotion.matches || values.time >= values.duration) {
      clearStyles();
      delete scene.container.dataset.transitionStage;
      return;
    }
    // Stages derive from the reversible swap marker, so backwards scrubbing
    // restores the outgoing scene as well as the incoming scene.
    const stage = values.swap.started ? 2 : 1;
    scene.container.dataset.transitionStage = String(stage);
    if (stage === 1) {
      clearStyles();
      scene.container.style.opacity = String(values.exit.current.opacity);
      return;
    }
    scene.container.style.opacity = String(values.enter.done ? 1 : values.enter.current.opacity);
    scene.container.style.transform = `translateX(${values.enter.done ? 0 : values.enter.current.x}px)`;
    scene.children.forEach((element, index) => {
      const clip = values.children[`child${index}`];
      if (!clip) return;
      element.style.opacity = String(clip.done ? 1 : clip.current.opacity);
      element.style.transform = `translateX(${clip.done ? 0 : clip.current.x}px)`;
    });
  }

  const unsubscribe = timeline.subscribe(render);

  function settle() {
    timeline.pause();
    timeline.seek(timeline.values.duration);
    clearStyles();
    delete scene.container.dataset.transitionStage;
  }

  function fadeOut(signal: AbortSignal) {
    return new Promise<void>((resolve) => {
      function finish() {
        unsubscribeExit();
        signal.removeEventListener("abort", finish);
        timeline.pause();
        if (signal.aborted) settle();
        else timeline.seek(timeline.values.swap.at);
        resolve();
      }
      const unsubscribeExit = timeline.subscribe((values) => {
        if (values.swap.started) finish();
      }, false);
      signal.addEventListener("abort", finish, { once: true });
      timeline.replay();
    });
  }

  function beforePreparation(event: Event) {
    const navigation = event as TransitionBeforePreparationEvent;
    pendingEntrance = false;
    settle();
    const load = navigation.loader;
    navigation.loader = async () => {
      await load();
      if (navigation.signal.aborted || navigation.defaultPrevented || reducedMotion.matches) return;
      await fadeOut(navigation.signal);
      pendingEntrance = !navigation.signal.aborted && !reducedMotion.matches;
    };
  }

  function beforeSwap(event: Event) {
    const navigation = event as TransitionBeforeSwapEvent;
    // Astro owns fetching, history, focus, and the swap. Our storyboard animates
    // the live content instead of a second, full-page snapshot crossfade.
    if (pendingEntrance) {
      const incoming = navigation.newDocument.querySelector<HTMLElement>("#main-content");
      if (incoming) incoming.style.opacity = "0";
    }
  }

  function afterSwap() {
    scene = getScene();
    timeline.updateConfig(storyboard(settings, scene.children.length));
    if (pendingEntrance && !reducedMotion.matches) {
      timeline.seek(timeline.values.swap.at);
      timeline.play();
    } else settle();
    pendingEntrance = false;
  }

  document.addEventListener("astro:before-preparation", beforePreparation);
  document.addEventListener("astro:before-swap", beforeSwap);
  document.addEventListener("astro:after-swap", afterSwap);
  reducedMotion.addEventListener("change", settle);

  if (import.meta.env.DEV) {
    void import("./transition-controls").then(({ mountTransitionControls }) => {
      if (disposed) return;
      disposeControls = mountTransitionControls(timeline, (values) => {
        settings = values;
        const playing = timeline.values.playing;
        timeline.updateConfig(storyboard(settings, scene.children.length));
        // updateConfig preserves authored overrides; panel edits deliberately
        // replace those overrides with the newly computed storyboard defaults.
        DialStore.resetValues(timeline.id);
        if (!playing) settle();
      });
    });
  }

  return () => {
    disposed = true;
    document.removeEventListener("astro:before-preparation", beforePreparation);
    document.removeEventListener("astro:before-swap", beforeSwap);
    document.removeEventListener("astro:after-swap", afterSwap);
    reducedMotion.removeEventListener("change", settle);
    disposeControls?.();
    unsubscribe();
    settle();
    timeline.destroy();
  };
}
