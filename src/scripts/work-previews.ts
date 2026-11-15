function initWorkPreviews() {
  const list = document.querySelector<HTMLElement>(".work-list");
  const previews = document.querySelector<HTMLElement>(".work-previews");
  if (!list || !previews) return;
  const controller = new AbortController();
  const { signal } = controller;
  const desktop = matchMedia("(min-width: 1024px) and (any-hover: hover)");
  const cards = [...previews.querySelectorAll<HTMLElement>("[data-preview-card]")];
  let hovered: string | undefined;
  let focused: string | undefined;
  const update = () => {
    previews.hidden = !desktop.matches;
    const active = desktop.matches ? hovered || focused : undefined;
    cards.forEach(card => card.toggleAttribute("data-visible", card.dataset.previewCard === active));
    if (active) {
      const top = list.getBoundingClientRect().top;
      const height = previews.getBoundingClientRect().height;
      previews.style.top = `${Math.max(24, Math.min(top, innerHeight - height - 24))}px`;
    }
  };
  list.querySelectorAll<HTMLAnchorElement>("[data-preview]").forEach(link => {
    link.addEventListener("pointerenter", event => {
      if (event.pointerType === "touch") return;
      hovered = link.dataset.preview;
      update();
    }, { signal });
    link.addEventListener("focus", () => { focused = link.dataset.preview; update(); }, { signal });
    link.addEventListener("blur", () => { focused = undefined; update(); }, { signal });
  });
  list.addEventListener("pointerleave", () => { hovered = undefined; update(); }, { signal });
  desktop.addEventListener("change", update, { signal });
  window.addEventListener("resize", update, { signal });
  window.addEventListener("scroll", update, { passive: true, signal });
  const cleanup = () => controller.abort();
  document.addEventListener("astro:before-swap", cleanup, { once: true, signal });
  window.addEventListener("pagehide", cleanup, { once: true, signal });
  update();
}
document.addEventListener("astro:page-load", initWorkPreviews);
window.addEventListener("pageshow", event => { if (event.persisted) initWorkPreviews(); });
