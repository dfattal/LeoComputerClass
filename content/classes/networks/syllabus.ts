// Single source of truth for Networks & the Internet curriculum.
// Each "week" is one lesson. Fill in the arc, then add lessons with
// scripts/scaffold-lesson.mjs and flip status to "published" when each is done.

export interface Phase {
  phase: number;
  name: string;
  weeks: number[];
}

export interface Week {
  week: number;
  slug: string;
  title: string;
  summary: string;
  phase: number;
  status: "published" | "planned";
}

export const phases: Phase[] = [
  { phase: 1, name: "Send a Message", weeks: [1, 2] },
  { phase: 2, name: "Find the Way", weeks: [3, 4, 5] },
  { phase: 3, name: "Speak the Language", weeks: [6, 7] },
  { phase: 4, name: "The Whole Journey", weeks: [8, 9] },
];

export const weeks: Week[] = [
  {
    week: 1,
    slug: "lesson-01",
    title: "Packets",
    summary:
      "A message too big to send all at once gets chopped into little numbered envelopes called packets. Chop one up, send the pieces, then snap them back together in the right order on the other side.",
    phase: 1,
    status: "published",
  },
  {
    week: 2,
    slug: "lesson-02",
    title: "Addresses",
    summary:
      "Every machine on the internet has an address — four numbers like 192.168.1.5. Split an address into its parts and figure out whether two machines live on the same little network or need to talk through the wider world.",
    phase: 1,
    status: "published",
  },
  {
    week: 3,
    slug: "lesson-03",
    title: "Routing",
    summary:
      "Your packet can't reach the other side of the planet in one jump. Routers hand it along, hop by hop, each one picking the best next step from its routing table. Build the rule that chooses the next hop.",
    phase: 2,
    status: "published",
  },
  {
    week: 4,
    slug: "lesson-04",
    title: "Ports & Sockets",
    summary:
      "One computer runs many programs at once — a browser, an email app, a login service. Ports are the numbered doors that send each packet to the right program. Sort the traffic by its port number.",
    phase: 2,
    status: "published",
  },
  {
    week: 5,
    slug: "lesson-05",
    title: "DNS",
    summary:
      "You type fortknocks.com, but machines only understand numbers. DNS is the internet's phonebook — it turns a name into an address. Build the lookup, then add a cache so you don't have to ask twice.",
    phase: 2,
    status: "published",
  },
  {
    week: 6,
    slug: "lesson-06",
    title: "HTTP",
    summary:
      "Once you've reached the server, you have to ASK for the page — politely, in a language called HTTP. Build the request line a browser sends, and read the status code the server sends back (200 OK, 404 Not Found).",
    phase: 3,
    status: "published",
  },
  {
    week: 7,
    slug: "lesson-07",
    title: "Reliability",
    summary:
      "The internet loses packets all the time. TCP fixes that: every packet gets a number, the other side says 'got it' (an ACK), and anything that never arrives gets sent again. Build the part that spots what's missing.",
    phase: 3,
    status: "published",
  },
  {
    week: 8,
    slug: "lesson-08",
    title: "The Whole Stack",
    summary:
      "Time to put it ALL together. A name becomes an address becomes a route becomes a request — and a page comes back, packet by packet. Watch one web address travel the entire journey in a single run.",
    phase: 4,
    status: "published",
  },
  {
    week: 9,
    slug: "lesson-09",
    title: "The Big Picture: What Really Happens",
    summary:
      "No code this time — just you, explaining the whole trip in your own words. What REALLY happens, step by step, when you type a URL and press enter? And how did a 1960s science experiment become the internet?",
    phase: 4,
    status: "published",
  },
];

export function getPhaseForWeek(weekNum: number): Phase | undefined {
  return phases.find((p) => p.weeks.includes(weekNum));
}

export function getWeeksForPhase(phaseNum: number): Week[] {
  return weeks.filter((w) => w.phase === phaseNum);
}

export function getWeekBySlug(slug: string): Week | undefined {
  return weeks.find((w) => w.slug === slug);
}
