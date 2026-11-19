(() => {
  // The Vercel Astro components read their browser-side hooks from window.
  const stripUrlDetails = (event) => typeof event.url === "string"
    ? { ...event, url: event.url.split(/[?#]/, 1)[0] }
    : null;
  window.webAnalyticsBeforeSend = stripUrlDetails;
  window.speedInsightsBeforeSend = stripUrlDetails;

  // Client-side navigation keeps the identity in place. Play only once.
  const entrance = Symbol.for("matthieubabe:entrance");
  if (Reflect.get(window, entrance)) return;
  Reflect.set(window, entrance, true);
  if (document.documentElement.hasAttribute("data-home") && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    document.documentElement.dataset.entrance = "pending";
    // Reveal even if the module or font fails to load.
    setTimeout(() => {
      if (document.documentElement.dataset.entrance === "pending") document.documentElement.dataset.entrance = "complete";
    }, 1600);
  }
})();
