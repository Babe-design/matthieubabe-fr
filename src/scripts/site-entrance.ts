function initEntrance() {
  const root = document.documentElement;
  if (root.dataset.entrance !== "pending") return;
  const ready = document.fonts.load('700 132px "Bona Nova"', "Babe");
  const timeout = new Promise(resolve => setTimeout(resolve, 700));
  void Promise.race([ready.catch(() => {}), timeout]).then(() => {
    setTimeout(() => {
      if (root.dataset.entrance === "pending") root.dataset.entrance = "ready";
    }, 160);
  });
}
document.addEventListener("astro:page-load", initEntrance);
