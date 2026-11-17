export const site = {
  name: "Matthieu Babe",
  url: "https://matthieubabe.fr",
  email: null as string | null,
  intro: "Design leader",
  company: { name: "Datadog", href: "https://www.datadoghq.com/product/security-platform/" },
  about: [
    "I’m Matthieu, currently in Paris, leading design for Security at Datadog.",
    "I take optimism quite seriously. I like curious people, good ideas, and the energy of making things together. Good ideas tend to start with a “what if?”",
    "I care about the details, the people, and making room for joy along the way."
  ],
  aboutNickname: "But usually people call me Babe",
  colophon: "I try to update this space regularly with new experiments and things I’m working on.",
  links: [
    { name: "LinkedIn", href: "https://www.linkedin.com/in/matthieubabe" },
    { name: "X", href: "https://x.com/BabeMatthieu" },
    { name: "Threads", href: "https://www.threads.com/@matthieubabe" },
    { name: "Dribbble", href: "https://dribbble.com/matthieubabe" }
  ]
};

export const work = [
  {
    id: "ai-guard",
    title: "AI Guard",
    detail: "Datadog · 2026",
    href: "https://www.datadoghq.com/products/security/ai-guard/",
    preview: { image: "/images/work/ai-guard-signals.webp", width: 1600, height: 900, caption: "AI Guard · Datadog" }
  },
  {
    id: "the-care-era",
    title: "The care era",
    detail: "Writing · 2026",
    href: "https://medium.com/@MatthieuBabe/the-care-era-7342fbb5f832",
    preview: { image: "/images/work/the-care-era.webp", width: 1024, height: 1024, caption: "The care era · Medium" }
  }
] as const;

// Newest first. Use an ISO timestamp with a timezone for every published update.
// One descriptive title, then up to three short bullets.
type ChangelogEntry = {
  date: string;
  title: string;
  changes: [string] | [string, string] | [string, string, string];
};

export const changelog: ChangelogEntry[] = [
  {
    date: "2026-11-17T03:59:11Z",
    title: "Type credit",
    changes: ["Allo credited in the colophon."]
  },
  {
    date: "2026-11-16T22:25:30Z",
    title: "A tighter intro",
    changes: ["Less space below Babe."]
  },
  {
    date: "2026-11-16T21:38:08Z",
    title: "Hello, Allo",
    changes: [
      "Allo across the site.",
      "A more balanced introduction.",
      "Matching link previews."
    ]
  },
  {
    date: "2026-11-16T17:59:19Z",
    title: "A gentler entrance",
    changes: [
      "Babe, one letter at a time.",
      "A reset icon inside Experiment.",
      "Softer shadows between magnets."
    ]
  },
  {
    date: "2026-11-16T17:28:38Z",
    title: "Experiment",
    changes: [
      "A larger, serif Babe.",
      "Draggable magnets in Experiment.",
      "A clean white canvas."
    ]
  },
  {
    date: "2026-11-16T03:15:13Z",
    title: "Hello, Babe",
    changes: [
      "Textured fridge-magnet letters.",
      "A softer, staged entrance.",
      "A matching B favicon."
    ]
  },
  {
    date: "2026-11-15T03:43:59Z",
    title: "B for Babe",
    changes: [
      "A book-inspired B favicon.",
      "A personal note in About."
    ]
  },
  {
    date: "2026-11-15T03:15:32Z",
    title: "More personality",
    changes: [
      "Paris, optimism and joy.",
      "Blue tape and new previews.",
      "Soft motion, no footer glow."
    ]
  },
  {
    date: "2026-11-15T02:29:00Z",
    title: "A little more space",
    changes: [
      "Refined type and spacing.",
      "A fuller About and colophon.",
      "Slower entrance, real previews."
    ]
  },
  {
    date: "2026-11-15T02:09:00Z",
    title: "Work and About",
    changes: [
      "AI Guard and The care era.",
      "Bio, links and changelog.",
      "A simpler white canvas."
    ]
  },
  {
    date: "2026-11-15T01:47:12Z",
    title: "Compact update line",
    changes: [
      "Minute-only counter.",
      "Inline changelog link."
    ]
  },
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
