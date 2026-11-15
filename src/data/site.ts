export const site = {
  name: "Matthieu Babe",
  url: "https://matthieubabe.fr",
  email: null as string | null,
  intro: "Design leader",
  company: { name: "Datadog", href: "https://www.datadoghq.com/product/security-platform/" },
  about: [
    "I lead design for Security at Datadog, turning complex problems into clear products.",
    "I care about thoughtful details and teams where people have the space to do their best work.",
    "I think through making: sketches on paper, rough prototypes, and ideas you can actually try.",
    "AI is changing how we build. I’m interested in the intention and care we bring to the work."
  ],
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
    preview: { image: "/images/work/ai-guard.webp", width: 1200, height: 675, caption: "AI Guard · Datadog" }
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
