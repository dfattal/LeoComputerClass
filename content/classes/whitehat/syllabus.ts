// Single source of truth for White Hat curriculum.
// Each "week" is one lesson. The arc is a red-team → blue-team story: you're
// HIRED (with permission — always the white-hat rule) to break into Fort Knocks,
// find every weakness, then switch sides and make it unbreakable. Every attack is
// a safe, simulated, in-browser Python sandbox — never a real system.
// Add lessons with scripts/scaffold-lesson.mjs and flip status to "published".

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
  { phase: 1, name: "The Hacker Mindset", weeks: [1] },
  { phase: 2, name: "Red Team: Break In", weeks: [2, 3, 4, 5, 6, 7] },
  { phase: 3, name: "Blue Team: Lock It Down", weeks: [8] },
  { phase: 4, name: "The Big Picture", weeks: [9] },
];

export const weeks: Week[] = [
  {
    week: 1,
    slug: "lesson-01",
    title: "Think Like a Hacker",
    summary:
      "A hacker is just someone who understands a machine so well it does what THEY say. Learn the one rule that separates a white hat from a crook — permission — then crack a secret-rule puzzle by poking at it.",
    phase: 1,
    status: "published",
  },
  {
    week: 2,
    slug: "lesson-02",
    title: "Guess the Password",
    summary:
      "Fort Knocks has a 4-digit PIN. Write a brute-force attacker that tries every code until it gets in — then watch how adding just one more digit makes your attack take ten times longer.",
    phase: 2,
    status: "published",
  },
  {
    week: 3,
    slug: "lesson-03",
    title: "The Locked-Up Password",
    summary:
      "Smart sites never store your real password — they store a scrambled 'hash'. Learn why, then crack weak passwords with a dictionary attack, and defend the good ones by adding salt.",
    phase: 2,
    status: "published",
  },
  {
    week: 4,
    slug: "lesson-04",
    title: "Smash the Stack",
    summary:
      "The big one. You built the CPU and the stack — now overflow a too-small buffer and watch your input spill over and overwrite the return address. This is how real hackers hijack a program.",
    phase: 2,
    status: "published",
  },
  {
    week: 5,
    slug: "lesson-05",
    title: "Sneak Past the Login",
    summary:
      "Fort Knocks builds its login check by gluing your typed-in name straight into a command. Type something sneaky and you walk right in — this is injection, and you'll learn the one trick that stops it.",
    phase: 2,
    status: "published",
  },
  {
    week: 6,
    slug: "lesson-06",
    title: "Listening on the Wire",
    summary:
      "Messages on a network travel past lots of computers. Sniff the packets flying by, read a password sent in plain text — then see how encryption turns the whole conversation into gibberish a snoop can't use.",
    phase: 2,
    status: "published",
  },
  {
    week: 7,
    slug: "lesson-07",
    title: "The Trick Email",
    summary:
      "The easiest computer to hack is the human in front of it. Build a phishing detector that spots fake emails and look-alike web addresses, and learn why the best lock fails if someone hands over the key.",
    phase: 2,
    status: "published",
  },
  {
    week: 8,
    slug: "lesson-08",
    title: "Lock It All Down",
    summary:
      "Switch to the blue team. Take everything you broke into and harden Fort Knocks: rate-limit the PIN, salt the hashes, check the buffer size, clean the input, encrypt the wire. Score how safe you made it.",
    phase: 3,
    status: "published",
  },
  {
    week: 9,
    slug: "lesson-09",
    title: "The Big Picture: Cat and Mouse",
    summary:
      "Look back at every weakness you found and fixed. Re-explain in your own words why security is a forever game of cat and mouse — and what it really means to be a white hat.",
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
