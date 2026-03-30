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
  language: "python";
  comingSoon?: boolean;
}

export const classes: ClassDef[] = [
  {
    slug: "python-primer",
    name: "Python Primer",
    tagline: "Learn Python in 5 Fun Lessons",
    description:
      "Variables, functions, strings, loops, and more — everything you need to start coding in Python. No experience required!",
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
