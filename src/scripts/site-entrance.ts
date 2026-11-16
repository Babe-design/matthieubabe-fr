function initEntrance() {
  const root = document.documentElement;
  if (root.dataset.entrance !== "pending") return;
  const ready = document.fonts.load('720 120px "Allo"', "Babe");
  const timeout = new Promise(resolve => setTimeout(resolve, 700));
  void Promise.race([ready.catch(() => {}), timeout]).then(() => {
    setTimeout(() => {
      if (root.dataset.entrance !== "pending") return;
      root.dataset.entrance = "ready";
      const complete = () => {
        if (root.dataset.entrance === "ready") root.dataset.entrance = "complete";
      };
      // Release the copy masks and animation styles when the entrance settles.
      requestAnimationFrame(() => {
        const animations = document.getAnimations().filter(animation =>
          animation instanceof CSSAnimation && animation.animationName.startsWith("identity-")
        );
        void Promise.allSettled(animations.map(animation => animation.finished)).then(complete);
      });
      setTimeout(complete, 2200);
    }, 160);
  });
}
document.addEventListener("astro:page-load", initEntrance);
