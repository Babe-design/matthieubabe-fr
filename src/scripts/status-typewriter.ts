/** A visual-only, one-shot typing effect. The full sentence stays available to AT. */
export function createStatusTypewriter() {
  const note = document.querySelector<HTMLElement>(".status-note");
  const text = note?.querySelector<HTMLElement>(".typewriter-text");
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const noAnimation = { startAfterEntrance: () => {} };

  if (!note || !text || reduceMotion.matches || document.documentElement.dataset.entrance !== "pending") {
    return noAnimation;
  }

  const sentence = text.textContent || "";
  let index = 0;
  let timer: number | undefined;
  let started = false;
  let finished = false;

  const finish = () => {
    window.clearTimeout(timer);
    finished = true;
    text.textContent = sentence;
    note.dataset.typing = "done";
  };

  // Reserve the complete line's dimensions while only the visual copy changes.
  text.textContent = "";
  note.dataset.typing = "waiting";

  const typeNext = () => {
    if (finished) return;
    if (reduceMotion.matches || document.hidden) {
      finish();
      return;
    }
    index += 1;
    text.textContent = sentence.slice(0, index);
    if (index === sentence.length) {
      finish();
      return;
    }
    // Small variations, with a breath between words; no random pauses or replays.
    const rhythm = [54, 68, 46, 61, 49];
    const delay = sentence[index - 1] === " " ? 115 : rhythm[index % rhythm.length];
    timer = window.setTimeout(typeNext, delay);
  };

  const onMotionChange = () => {
    if (reduceMotion.matches) finish();
  };
  const onVisibilityChange = () => {
    note.toggleAttribute("data-typing-paused", document.hidden);
    if (document.hidden) finish();
  };
  reduceMotion.addEventListener("change", onMotionChange);
  document.addEventListener("visibilitychange", onVisibilityChange);
  window.addEventListener("pagehide", () => {
    finish();
    reduceMotion.removeEventListener("change", onMotionChange);
    document.removeEventListener("visibilitychange", onVisibilityChange);
    note.removeAttribute("data-typing-paused");
  }, { once: true });

  return {
    startAfterEntrance() {
      if (started || finished) return;
      started = true;
      const entrance = note.getAnimations().find(animation =>
        "animationName" in animation && animation.animationName === "home-enter"
      );
      const settled = entrance?.finished || Promise.resolve();
      void settled.then(() => {
        if (finished) return;
        note.dataset.typing = "typing";
        typeNext();
      }).catch(finish);
    }
  };
}
