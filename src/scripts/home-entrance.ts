import { createStatusTypewriter } from "./status-typewriter";

const root = document.documentElement;
const typewriter = createStatusTypewriter();

if (root.dataset.entrance === "pending") {
  const tape = document.querySelector<HTMLImageElement>(".name-tape img");
  const assetsReady = Promise.allSettled([
    tape?.decode(),
    document.fonts.load('18px Inter'),
    document.fonts.load('15px "IBM Plex Mono"')
  ]);
  const timeout = new Promise<void>(resolve => window.setTimeout(resolve, 900));

  void Promise.race([assetsReady, timeout]).then(() => {
    window.setTimeout(() => {
      if (root.dataset.entrance === "pending") root.dataset.entrance = "ready";
      typewriter.startAfterEntrance();
    }, 180);
  });
}
