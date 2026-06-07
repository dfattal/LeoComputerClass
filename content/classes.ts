// Registry of all classes in the platform.
// Add new classes here to make them appear on the home page and in routing.

export interface ClassDef {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  accentColor: string; // Tailwind color name
  heroImage: string; // Path in /public
  studentName: string; // For AI prompts
  contentDir: string; // Directory name under content/classes/
  language: "python" | "latex";
  comingSoon?: boolean;
}

export const classes: ClassDef[] = [
  {
    slug: "pixels",
    name: "Pixel Wizards",
    tagline: "Make Pictures with Code",
    description:
      "Your very first code — no experience needed! Draw pictures on a grid and discover what variables, functions, and loops really are (and why we need them).",
    accentColor: "fuchsia",
    heroImage: "/hero-pixels.webp",
    studentName: "friend",
    contentDir: "pixels",
    language: "python",
  },
  {
    slug: "python-primer",
    name: "Python Primer",
    tagline: "Real Python, One Step Up",
    description:
      "Ready for real Python? Variables, strings, loops, and containers — the next step after Pixel Wizards, and the launchpad into every other class.",
    accentColor: "emerald",
    heroImage: "/hero-python.webp",
    studentName: "Student",
    contentDir: "python-primer",
    language: "python",
  },
  {
    slug: "leo",
    name: "Leo's Computer Class",
    tagline: "Build a Computer From Physics",
    description:
      "Start with a light switch. End with a working CPU. Write Python code that does what real circuits do — no kits, no magic, just logic.",
    accentColor: "indigo",
    heroImage: "/hero-eniac.webp",
    studentName: "Leo",
    contentDir: "leo",
    language: "python",
  },
  {
    slug: "leo-physics",
    name: "Leo's Motion Lab",
    tagline: "Engineer a Nerf Blaster",
    description:
      "Use calculus and Python to simulate motion from scratch — then design your own spring or air-powered blaster and prove with code why it shoots the farthest.",
    accentColor: "amber",
    heroImage: "/hero-physics.webp",
    studentName: "Leo",
    contentDir: "leo-physics",
    language: "python",
  },
  {
    slug: "leo-space",
    name: "Leo's Space School",
    tagline: "Fly a Mission to the Moon",
    description:
      "Gravity reaches across millions of miles. Use Python to find out why the Moon doesn't fall down — then orbit a planet, land a rocket, and plan a trip to Mars.",
    accentColor: "sky",
    heroImage: "/hero-space.webp",
    studentName: "Leo",
    contentDir: "leo-space",
    language: "python",
  },
  {
    slug: "leo-codes",
    name: "Leo's Secret Codes",
    tagline: "Send Secret Messages — Then Crack Them",
    description:
      "Hide a message your sister can't read, then learn to break the codes she sends back. Write Python that scrambles letters, flips bits, and even builds a public lock only your private key can open.",
    accentColor: "rose",
    heroImage: "/hero-codes.webp",
    studentName: "Leo",
    contentDir: "leo-codes",
    language: "python",
  },
  {
    slug: "leo-latex",
    name: "Leo's Proof Press",
    tagline: "Typeset Math Like a Mathematician",
    description:
      "You've derived the math — now publish it. Learn LaTeX, the language real mathematicians use to write beautiful formulas, and build your own math book page by page: from limits and integrals all the way to e^iπ = −1. Your equations aren't just checked for looks — the grader verifies the math is TRUE.",
    accentColor: "teal",
    heroImage: "/hero-latex.webp",
    studentName: "Leo",
    contentDir: "leo-latex",
    language: "latex",
  },
  {
    slug: "dna-decoders",
    name: "DNA Decoders",
    tagline: "Crack the Code of Life",
    description:
      "Brand new to Python? Start here. Paint strands of DNA as colored squares and discover strings, lists, loops, and dictionaries by solving real DNA puzzles — the gentle, visual on-ramp that gets you ready for Bio Lab.",
    accentColor: "lime",
    heroImage: "/hero-dna-decoders.webp",
    studentName: "Leila",
    contentDir: "dna-decoders",
    language: "python",
  },
  {
    slug: "leila",
    name: "Leila's Bio Lab",
    tagline: "Code Your Way Through Biology",
    description:
      "Explore DNA, genes, mutations, and gene editing by writing code that runs real biology experiments.",
    accentColor: "violet",
    heroImage: "/hero-bio.webp",
    studentName: "Leila",
    contentDir: "leila",
    language: "python",
  },
];

export function getClassBySlug(slug: string): ClassDef | undefined {
  return classes.find((c) => c.slug === slug);
}

export function getClassSlugs(): string[] {
  return classes.map((c) => c.slug);
}
