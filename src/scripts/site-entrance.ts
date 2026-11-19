const wait = (duration: number) => new Promise<void>(resolve => setTimeout(resolve, duration));
const initializedWords = new WeakSet<HTMLElement>();

function loadArt(root: HTMLElement, word: HTMLElement) {
  return Array.from(word.querySelectorAll<HTMLElement>(".identity-art"), art => {
    const image = art.querySelector("img");
    if (!image) return;
    if (image.dataset.materialSrc) image.src = image.dataset.materialSrc;
    return image.decode().then(() => {
      art.dataset.loaded = "";
      if (root.dataset.entrance !== "ready") return;
      const entrance = art.getAnimations().find(animation =>
        animation instanceof CSSAnimation && animation.animationName.startsWith("identity-art-")
      );
      const start = entrance?.effect?.getTiming().delay;
      // Late images can join up to the start of their own letter's slot.
      if (entrance && start !== undefined && Number(entrance.currentTime) + 24 < start) {
        art.dataset.entranceArt = "";
      }
    }, () => {});
  });
}

async function playEntrance(root: HTMLElement, word: HTMLElement, images: ReturnType<typeof loadArt>) {
  if (root.dataset.entrance !== "pending") return;
  const font = document.fonts.load('720 120px "Allo"', "Babe").catch(() => {});
  await Promise.all([
    Promise.race([font, wait(700)]),
    Promise.race([Promise.all(images.slice(0, 2)), wait(240)])
  ]);
  await wait(130);
  if (root.dataset.entrance !== "pending") return;

  word.querySelectorAll<HTMLElement>(".identity-art[data-loaded]").forEach(art => { art.dataset.entranceArt = ""; });
  root.dataset.entrance = "ready";
  const complete = () => {
    clearTimeout(fallback);
    if (root.dataset.entrance === "ready") root.dataset.entrance = "complete";
  };
  const fallback = setTimeout(complete, 4100);
  requestAnimationFrame(() => {
    const animations = document.getAnimations().filter(animation =>
      animation instanceof CSSAnimation && (animation.animationName.startsWith("identity-") || animation.animationName === "portfolio-entry-in")
    );
    void Promise.allSettled(animations.map(animation => animation.finished)).then(complete);
  });
}

function enableLetterPreviews(root: HTMLElement, word: HTMLElement) {
  const media = matchMedia("(any-hover: hover) and (any-pointer: fine) and (prefers-reduced-motion: no-preference)");
  let active: HTMLElement | undefined;
  let frame = 0;

  function reset() {
    cancelAnimationFrame(frame);
    if (!active) return;
    delete active.dataset.preview;
    active.style.removeProperty("--pointer-pose");
    active = undefined;
  }

  word.addEventListener("pointermove", event => {
    const letter = (event.target as Element).closest<HTMLElement>(".identity-letter");
    const entrance = root.dataset.entrance;
    if (!letter || event.pointerType !== "mouse" || !media.matches || !document.body.classList.contains("is-home") ||
        entrance === "pending" || entrance === "ready" || word.matches(":focus-visible")) {
      reset();
      return;
    }

    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      if (active !== letter) {
        reset();
        active = letter;
      }

      const { left, top, width, height } = letter.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (event.clientX - left) / width));
      const y = Math.max(0, Math.min(1, (event.clientY - top) / height));
      // Give the current material some room around the midpoint to avoid flickering.
      const midpoint = letter.dataset.preview === "1" ? .56 : letter.dataset.preview === "2" ? .44 : .5;
      const variant = x < midpoint ? "1" : "2";
      const art = letter.querySelector<HTMLElement>(`[data-variant="${variant}"][data-loaded]`) ??
        letter.querySelector<HTMLElement>(".identity-art[data-loaded]");
      if (!art) return;

      if (letter.dataset.preview !== art.dataset.variant) {
        art.dataset.popping = "";
        letter.dataset.preview = art.dataset.variant;
      }
      letter.style.setProperty("--pointer-pose", `translate(${(x - .5) * 8}px, ${(y - .5) * 7}px) rotate(${(x - .5) * 8}deg)`);
    });
  });

  for (const type of ["animationend", "animationcancel"] as const) {
    word.addEventListener(type, event => {
      if (event.animationName === "identity-art-pop" && event.target instanceof HTMLElement) {
        delete event.target.dataset.popping;
      }
    });
  }
  word.addEventListener("pointerleave", reset);
  word.addEventListener("pointercancel", reset);
  word.addEventListener("focusin", () => { if (word.matches(":focus-visible")) reset(); });
  document.addEventListener("astro:before-preparation", reset);
  window.addEventListener("pagehide", reset);
  window.addEventListener("blur", reset);
  media.addEventListener("change", reset);
}

function initIdentity() {
  if (!document.body.classList.contains("is-home")) return;
  const word = document.querySelector<HTMLElement>(".identity-name");
  if (!word || initializedWords.has(word)) return;
  initializedWords.add(word);
  const root = document.documentElement;
  const images = loadArt(root, word);
  enableLetterPreviews(root, word);
  void playEntrance(root, word, images);
}

// The first entrance is independent of window.load, which also waits for images.
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initIdentity, { once: true });
} else {
  initIdentity();
}
document.addEventListener("astro:page-load", initIdentity);
