function loadGelWhileOpening(root: HTMLElement) {
  const letter = document.querySelector<HTMLElement>('.identity-letter[data-material="gel"]');
  const image = letter?.querySelector("img");
  if (!letter || !image) return;

  void image.decode().then(() => {
    const face = letter.querySelector(".identity-face");
    const entrance = face?.getAnimations().find(animation =>
      animation instanceof CSSAnimation && animation.animationName === "identity-gel-face"
    );
    // Enable the texture before this letter starts, or finish with its blue sticker.
    const delay = entrance?.effect?.getTiming().delay;
    const waitingForLetter = entrance && delay !== undefined && Number(entrance.currentTime) < delay;
    if (root.dataset.entrance === "pending" || (root.dataset.entrance === "ready" && waitingForLetter)) {
      letter.dataset.gelReady = "";
    }
  }, () => {});
}

function initEntrance() {
  const root = document.documentElement;
  if (root.dataset.entrance !== "pending") return;
  loadGelWhileOpening(root);
  const ready = document.fonts.load('720 120px "Allo"', "Babe");
  const timeout = new Promise(resolve => setTimeout(resolve, 700));
  void Promise.race([ready.catch(() => {}), timeout]).then(() => {
    setTimeout(() => {
      if (root.dataset.entrance !== "pending") return;
      root.dataset.entrance = "ready";
      const complete = () => {
        clearTimeout(fallback);
        if (root.dataset.entrance === "ready") root.dataset.entrance = "complete";
      };
      const fallback = setTimeout(complete, 3700);
      // Release the copy masks and animation styles when the entrance settles.
      requestAnimationFrame(() => {
        const animations = document.getAnimations().filter(animation =>
          animation instanceof CSSAnimation && animation.animationName.startsWith("identity-")
        );
        void Promise.allSettled(animations.map(animation => animation.finished)).then(complete);
      });
    }, 160);
  });
}
// The first entrance is independent of window.load, which also waits for images.
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initEntrance, { once: true });
} else {
  initEntrance();
}
