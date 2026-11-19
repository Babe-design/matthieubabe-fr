function initWorkPreviews() {
  const list = document.querySelector<HTMLElement>(".work-list");
  const previews = document.querySelector<HTMLElement>(".work-previews");
  if (!list || !previews) return;
  const controller = new AbortController();
  const { signal } = controller;
  const desktop = matchMedia("(min-width: 1024px) and (any-hover: hover)");
  const cards = [...previews.querySelectorAll<HTMLElement>("[data-preview-card]")];
  const rows = [...list.querySelectorAll<HTMLElement>(".work-row")];
  let imagesWarmed = false;
  let hovered: HTMLElement | undefined;
  let focused: HTMLElement | undefined;
  let highlightExit = 0;

  const updatePreview = () => {
    previews.hidden = !desktop.matches;
    if (desktop.matches && !imagesWarmed) {
      imagesWarmed = true;
      previews.querySelectorAll<HTMLImageElement>("img").forEach(image => {
        image.loading = "eager";
        void image.decode().catch(() => {});
      });
    }
    const active = desktop.matches ? (hovered ?? focused)?.dataset.preview : undefined;
    cards.forEach(card => card.toggleAttribute("data-visible", card.dataset.previewCard === active));
    if (active) {
      const height = cards.find(card => card.dataset.previewCard === active)?.offsetHeight || 0;
      const top = (innerHeight - height) / 2;
      previews.style.top = `${Math.max(32, Math.min(top, innerHeight - height - 32))}px`;
    }
  };

  const updateHighlight = () => {
    list.toggleAttribute("data-work-highlight-ready", desktop.matches);
    const row = hovered?.matches(".work-link:hover") ? hovered : focused?.matches(":focus-visible") ? focused : undefined;
    if (!desktop.matches || !row) {
      list.removeAttribute("data-work-highlight-visible");
      return;
    }

    // After a complete fade, place the highlight immediately under its new row.
    const stillVisible = Number(getComputedStyle(list, "::before").opacity) > 0;
    list.toggleAttribute("data-work-highlight-moving", stillVisible);
    const bounds = list.getBoundingClientRect();
    const { left, top, width, height } = row.getBoundingClientRect();
    list.style.setProperty("--work-highlight-x", `${left - bounds.left}px`);
    list.style.setProperty("--work-highlight-y", `${top - bounds.top}px`);
    list.style.setProperty("--work-highlight-width", `${width}px`);
    list.style.setProperty("--work-highlight-height", `${height}px`);
    list.setAttribute("data-work-highlight-visible", "");
  };

  const update = () => {
    updateHighlight();
    updatePreview();
  };

  for (const row of rows) {
    row.addEventListener("pointerenter", event => {
      if (event.pointerType === "touch") return;
      clearTimeout(highlightExit);
      hovered = row;
      update();
    }, { signal });
    row.addEventListener("pointerleave", event => {
      if (event.pointerType === "touch") return;
      clearTimeout(highlightExit);
      // Let the pointer cross the small gap between rows before fading out.
      highlightExit = window.setTimeout(updateHighlight, 40);
    }, { signal });
    row.addEventListener("focus", () => {
      if (row.matches(":focus-visible")) hovered = undefined;
      focused = row;
      update();
    }, { signal });
    row.addEventListener("blur", () => { focused = undefined; update(); }, { signal });
  }
  list.addEventListener("pointerleave", event => {
    clearTimeout(highlightExit);
    const rowBounds = hovered?.getBoundingClientRect();
    const { top, bottom } = list.getBoundingClientRect();
    // The links extend past the list's edge, so a row gap can also leave the list.
    const crossingGap = rowBounds && event.clientX >= rowBounds.left && event.clientX <= rowBounds.right
      && event.clientY >= top && event.clientY <= bottom;
    hovered = undefined;
    if (crossingGap) highlightExit = window.setTimeout(updateHighlight, 40);
    else updateHighlight();
    updatePreview();
  }, { signal });
  const resize = new ResizeObserver(updateHighlight);
  resize.observe(list);
  rows.forEach(row => resize.observe(row));
  desktop.addEventListener("change", update, { signal });
  window.addEventListener("resize", update, { signal });
  window.addEventListener("scroll", updatePreview, { passive: true, signal });
  const cleanup = () => {
    clearTimeout(highlightExit);
    resize.disconnect();
    list.removeAttribute("data-work-highlight-ready");
    list.removeAttribute("data-work-highlight-visible");
    controller.abort();
  };
  document.addEventListener("astro:before-swap", cleanup, { once: true, signal });
  window.addEventListener("pagehide", cleanup, { once: true, signal });
  update();
}
document.addEventListener("astro:page-load", initWorkPreviews);
window.addEventListener("pageshow", event => { if (event.persisted) initWorkPreviews(); });
