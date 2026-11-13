export const site = {
  name: "Matthieu Babe",
  url: "https://matthieubabe.fr",
  email: null as string | null,
  intro: "I bring creativity to products and the people who shape them.",
  currentRole: "Currently leading design for Security at Datadog.",
  links: [
    { name: "X", href: "https://x.com/BabeMatthieu" },
    { name: "Threads", href: "https://www.threads.com/@matthieubabe" },
    { name: "Dribbble", href: "https://dribbble.com/matthieubabe" },
    { name: "LinkedIn", href: "https://www.linkedin.com/in/matthieubabe" }
  ]
};

// Newest first. Use an ISO timestamp with a timezone for every published update.
// One descriptive title, then up to three short bullets.
type ChangelogEntry = {
  date: string;
  title: string;
  changes: [string] | [string, string] | [string, string, string];
};

export const changelog: ChangelogEntry[] = [
  {
    date: "2026-11-13T01:26:14Z",
    title: "Simpler changelog",
    changes: [
      "Shorter entries.",
      "No subtitles or separators."
    ]
  },
  {
    date: "2026-11-12T22:28:37Z",
    title: "Mobile wireframe fix",
    changes: [
      "Connected line junctions.",
      "Sharper Retina lines."
    ]
  },
  {
    date: "2026-11-12T20:04:55Z",
    title: "Lighter wireframe",
    changes: [
      "Finer strokes.",
      "Sequential drawing.",
      "Softer dotted ends."
    ]
  },
  {
    date: "2026-11-10T21:08:32Z",
    title: "Wireframe guides",
    changes: [
      "Drawn after the status.",
      "Aligned with the text."
    ]
  },
  {
    date: "2026-11-10T02:06:50Z",
    title: "Typing status",
    changes: [
      "Blinking block cursor.",
      "No trailing dots."
    ]
  },
  {
    date: "2026-11-10T01:57:40Z",
    title: "Smoother loading",
    changes: [
      "Staggered text entrance.",
      "Monospace status.",
      "Datadog Security link."
    ]
  },
  {
    date: "2026-11-10T01:32:04Z",
    title: "Changelog modal",
    changes: [
      "Slide-up changelog.",
      "Grey handwritten status.",
      "Light from the screen edge."
    ]
  },
  {
    date: "2026-11-10T01:24:31Z",
    title: "Layout refinements",
    changes: [
      "Aligned name and text.",
      "Handwritten status note.",
      "Moving light below."
    ]
  },
  {
    date: "2026-11-10T01:15:23Z",
    title: "New home layout",
    changes: [
      "A centered text column.",
      "Personal intro and links.",
      "Changelog and timer."
    ]
  },
  {
    date: "2026-11-10T00:45:16Z",
    title: "Random backgrounds",
    changes: [
      "Paper, mat or blueprint."
    ]
  }
];
