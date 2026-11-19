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

type WorkEntry = {
  id: string;
  title: string;
  detail: string;
  href?: string;
  preview?: { image: string; width: number; height: number; caption: string };
};

export const work: readonly WorkEntry[] = [
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
    preview: { image: "/images/work/the-care-era.webp", width: 1024, height: 1024, caption: "“The surprise is that abundance is demanding.”" }
  },
  {
    id: "luko",
    title: "Luko",
    detail: "Lead Design · 2022",
    href: "https://www.fr.luko.eu/",
    preview: { image: "/images/work/luko-staging-icon.webp", width: 1600, height: 1200, caption: "Simplifying home insurance claims" }
  },
  {
    id: "weweb",
    title: "WeWeb",
    detail: "Design system · 2020",
    href: "https://www.weweb.io/",
    preview: { image: "/images/work/weweb-cube.webp", width: 1600, height: 1200, caption: "Cube Design System" }
  },
  {
    id: "cityscoot",
    title: "Cityscoot",
    detail: "Product design · 2019"
  },
  {
    id: "pinpo",
    title: "Pinpo",
    detail: "Co-founder Design · 2015"
  }
];

// Newest first. Use an ISO timestamp with a timezone for every published update.
// One descriptive title, then up to three short bullets.
type ChangelogEntry = {
  date: string;
  title: string;
  changes: [string] | [string, string] | [string, string, string];
};

export const changelog: ChangelogEntry[] = [
  {
    date: "2026-11-19T18:36:56Z",
    title: "A shared entrance and lighter tabs",
    changes: ["Work and About come into focus in sequence.", "A soft gray highlight glides between the navigation tabs."]
  },
  {
    date: "2026-11-19T18:25:55Z",
    title: "Magnets slide back into place",
    changes: ["Reset animates the letters back to their starting positions."]
  },
  {
    date: "2026-11-19T18:20:13Z",
    title: "A quieter entrance for Experiment",
    changes: ["Cards come into focus in order, and the gauge flexes against the edge you pull toward.", "Cityscoot and Pinpo are now plain entries in Work."]
  },
  {
    date: "2026-11-19T18:08:22Z",
    title: "Softer stops for the gauge",
    changes: ["The thumb squashes at the ends and snaps from a little farther away."]
  },
  {
    date: "2026-11-19T18:06:28Z",
    title: "Project links in Work",
    changes: ["Luko and WeWeb now link to their official homepages."]
  },
  {
    date: "2026-11-19T17:59:30Z",
    title: "Softer motion in Work and Experiment",
    changes: ["A sliding highlight follows the pointer across Work.", "The gauge has a plain grey backdrop and snaps to nearby marks on release."]
  },
  {
    date: "2026-11-19T17:50:05Z",
    title: "Magnetic stops and softer hovers",
    changes: ["A thicker gradient rail with three magnetic stops.", "A hint of grey on Work rows when hovered."]
  },
  {
    date: "2026-11-19T17:41:44Z",
    title: "A richer sensitivity gauge",
    changes: ["A full-size card, a brighter rail and marks that grow on hover."]
  },
  {
    date: "2026-11-19T17:35:10Z",
    title: "New captions in Work",
    changes: ["Updated project credits and added an excerpt from The care era."]
  },
  {
    date: "2026-11-19T17:18:54Z",
    title: "A sensitivity slider",
    changes: ["Explore AI Guard’s detection threshold in a compact Experiment card."]
  },
  {
    date: "2026-11-19T17:10:52Z",
    title: "Earlier projects in Work",
    changes: ["Added Luko, WeWeb, Cityscoot and Pinpo to the portfolio."]
  },
  {
    date: "2026-11-19T17:00:12Z",
    title: "A springier landing",
    changes: ["The letters arrive closer together in time, then compress and rebound as a word."]
  },
  {
    date: "2026-11-19T16:38:43Z",
    title: "A wider entrance",
    changes: ["The gaps open from left to right before Babe springs back together."]
  },
  {
    date: "2026-11-19T16:32:13Z",
    title: "A softer landing",
    changes: ["Wider spacing, shorter overlaps and a small rebound as Babe settles."]
  },
  {
    date: "2026-11-19T16:26:25Z",
    title: "A quicker opening",
    changes: ["Babe arrives faster, with more room between the letters as they move."]
  },
  {
    date: "2026-11-19T15:10:56Z",
    title: "A rolling entrance",
    changes: ["Each letter starts as the previous one settles."]
  },
  {
    date: "2026-11-19T14:58:25Z",
    title: "A gummy letter to play with",
    changes: ["Grab, stretch and release the yellow b in Experiment."]
  },
  {
    date: "2026-11-19T14:41:10Z",
    title: "A smoother opening",
    changes: ["The materials blend along a single motion, with more room between the letters."]
  },
  {
    date: "2026-11-19T14:26:00Z",
    title: "Babe, in eight materials",
    changes: ["The letters bounce into Allo. Move across each one to revisit its two forms."]
  },
  {
    date: "2026-11-19T14:00:48Z",
    title: "Four letters, four textures",
    changes: ["Folded paper, green tiles, a smoother blue gel and a mint ribbon."]
  },
  {
    date: "2026-11-19T13:50:42Z",
    title: "A gummy b",
    changes: ["Blue gel fills the second b. Lemon, lime and mint color the other letters."]
  },
  {
    date: "2026-11-19T13:31:53Z",
    title: "Babe, letter by letter",
    changes: [
      "Each letter goes from outline to sticker to Allo.",
      "The red drawing pad leads Experiment.",
      "Magnets lift as you drag and stop at contact."
    ]
  },
  {
    date: "2026-11-19T12:55:27Z",
    title: "Temporary drawing pad",
    changes: ["Draw with a pointer or keyboard in Experiment. Your strokes fade away."]
  },
  {
    date: "2026-11-17T04:30:24Z",
    title: "Hello first",
    changes: ["I’m Matthieu, then Babe, then the page."]
  },
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
