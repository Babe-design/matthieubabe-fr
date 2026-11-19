function initPortfolioNav() {
  const nav = document.querySelector<HTMLElement>(".portfolio-nav");
  if (!nav || nav.hasAttribute("data-nav-highlight-ready")) return;

  const controller = new AbortController();
  const { signal } = controller;
  const links = [...nav.querySelectorAll<HTMLAnchorElement>("[data-section-link]")];
  const hover = matchMedia("(hover: hover)");
  let hovered = hover.matches ? nav.querySelector<HTMLAnchorElement>("[data-section-link]:hover") ?? undefined : undefined;
  let hoverExit = 0;

  const update = () => {
    const link = hovered ?? nav.querySelector<HTMLAnchorElement>("[data-section-link]:focus-visible");
    if (!link) {
      nav.removeAttribute("data-nav-highlight-visible");
      return;
    }

    // Position a fully faded highlight beneath its new link before showing it.
    nav.toggleAttribute("data-nav-highlight-moving", Number(getComputedStyle(nav, "::before").opacity) > 0);
    const { left, width } = link.getBoundingClientRect();
    nav.style.setProperty("--nav-highlight-x", `${left - nav.getBoundingClientRect().left}px`);
    nav.style.setProperty("--nav-highlight-width", `${width}px`);
    nav.setAttribute("data-nav-highlight-visible", "");
  };

  for (const link of links) {
    link.addEventListener("pointerenter", event => {
      if (event.pointerType === "touch") return;
      clearTimeout(hoverExit);
      hovered = link;
      update();
    }, { signal });
    link.addEventListener("pointerleave", event => {
      if (event.pointerType === "touch") return;
      clearTimeout(hoverExit);
      hovered = undefined;
      // Keep the highlight visible while crossing the gap to the next link.
      hoverExit = window.setTimeout(update, 40);
    }, { signal });
    link.addEventListener("focus", () => {
      if (!link.matches(":focus-visible")) return;
      clearTimeout(hoverExit);
      hovered = undefined;
      update();
    }, { signal });
    link.addEventListener("blur", update, { signal });
  }

  const resize = new ResizeObserver(update);
  links.forEach(link => resize.observe(link));
  const cleanup = () => {
    clearTimeout(hoverExit);
    resize.disconnect();
    nav.removeAttribute("data-nav-highlight-ready");
    nav.removeAttribute("data-nav-highlight-visible");
    controller.abort();
  };
  document.addEventListener("astro:before-swap", cleanup, { once: true, signal });
  window.addEventListener("pagehide", cleanup, { once: true, signal });

  nav.setAttribute("data-nav-highlight-ready", "");
  update();
}

document.addEventListener("astro:page-load", initPortfolioNav);
window.addEventListener("pageshow", event => { if (event.persisted) initPortfolioNav(); });
