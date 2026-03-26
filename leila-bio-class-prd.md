# PRD — Multi-Class Learning App  
## Leo Computer Class + Leila Bio Class  
**Repo:** same Next.js repo  
**Working title:** `family-classroom`

---

# 1. Overview

We want to extend the existing **Leo computer class** app into a small multi-class learning platform with a top-level entry point that lets a student choose between:

- **Leo’s Computer Class**
- **Leila’s Bio Coding Class**

The new Leila experience should teach biology through coding exercises, with a strong focus on:
- DNA basics
- mutations
- simple bioinformatics
- a playful **CRISPR gene editing simulator**

Students should be able to submit code and have it evaluated automatically. The app should feel visual, fun, and approachable for a kid, while still being structured enough to support real programming exercises.

---

# 2. Goals

## Product goals
- Support **multiple classes** in a single app and repo
- Reuse as much of the existing lesson/exercise infrastructure as possible
- Add a new **biology-themed coding curriculum**
- Add **auto-grading**
- Add a **visual simulator layer** for biology exercises, especially CRISPR
- Keep the UI simple enough that either kid can navigate it independently

## Learning goals for Leila
- Learn programming by manipulating biological data
- Understand core concepts:
  - DNA sequence
  - complementary bases
  - transcription
  - translation
  - mutation
  - gene editing
  - similarity between sequences
- Experience coding as a way to run “small biology experiments”

---

# 3. Non-goals

- No need for full LMS complexity
- No user accounts or multi-tenant school features
- No real biological accuracy beyond educational toy models
- No need for collaborative editing
- No need for backend-heavy code execution if in-browser evaluation is enough
- No need to support arbitrary student-written multi-file programs

---

# 4. Target users

## Primary users
- Leo
- Leila

## Secondary user
- Parent/admin creating lessons and reviewing progress

---

# 5. Core product concept

The app becomes a **small family learning portal**.

At the top level, the user lands on a home page with two large cards:

- *Leo — Computer Class*
- *Leila — Bio Lab*

Each class has:
- its own theme
- its own curriculum
- its own lesson list
- shared exercise/auto-grading infrastructure underneath

Leila’s class adds:
- visual DNA rendering
- mutation visualization
- trait decoding
- CRISPR simulation screens

---

# 6. User experience

## 6.1 Top-level flow

### Home
User opens app and sees:
- title
- two class cards
- optional short description per class
- optional progress summary

User chooses:
- Leo class
- Leila class

### Class home
Each class has:
- class title
- short intro
- lesson list
- progress markers
- continue button

### Lesson page
Each lesson has:
- story intro
- concept explanation
- coding prompt
- starter code
- run/test buttons
- visible test results
- optional visualization panel

### Completion
When student passes required tests:
- lesson marked complete
- next lesson unlocked
- celebratory but light feedback

---

# 7. Key features

## 7.1 Multi-class selector
At the app root, show a clear selector for available classes.

Requirements:
- obvious entry point
- visually distinct class identities
- easy to add more classes later

## 7.2 Shared lesson engine
A common lesson framework should support:
- title
- intro text
- concept section
- instructions
- starter code
- function name / expected API
- tests
- hints
- optional simulator/visualization config

## 7.3 Auto-grading
Students write a single function for each lesson.
The app runs:
- visible tests
- hidden tests

Result:
- pass/fail per test
- hint messaging
- lesson completion status

## 7.4 Biology visualizations
Leila’s class should include:
- DNA strand rendering
- highlighted mutations
- RNA/protein display where relevant
- trait cards for fake creatures
- CRISPR cut/replace animation

## 7.5 CRISPR simulator
A dedicated screen/component that visualizes:
- the source DNA
- the target sequence
- the cut site
- the replacement sequence
- the edited result
- optional decoded trait effect

---

# 8. Curriculum for Leila Bio Class

Initial version should include about 10 lessons.

## Unit 1 — DNA Basics
1. Count DNA bases  
2. Complementary DNA  
3. Reverse complement  
4. DNA to RNA  

## Unit 2 — Decode Biology
5. RNA to protein  
6. Find a gene pattern  

## Unit 3 — Edit DNA
7. Substitution / insertion / deletion  
8. Decode traits from a toy genome  
9. CRISPR replace sequence  

## Unit 4 — Compare living things
10. Compare two sequences / species distance  

---

# 9. Functional requirements

## 9.1 App shell
The app must:
- support multiple classes
- present class selection at top level
- route into each class cleanly
- preserve progress per class and per lesson

## 9.2 Lesson rendering
Each lesson page must support:
- markdown/rich text explanation
- code editor
- test panel
- hint panel
- optional simulator panel

## 9.3 Code execution
The system must:
- run student code safely in a constrained environment
- inject test harness
- compare actual vs expected output
- show errors cleanly

Preferred:
- one function per lesson
- deterministic exercises only
- no network access
- no file system access

## 9.4 Progress tracking
The app should store:
- current class
- completed lessons
- latest code draft per lesson
- last pass/fail result

Local-first is fine for V1.

## 9.5 Simulator synchronization
For biology lessons with visualization, the simulator should update based on:
- sample input values
- current student output
- lesson scenario config

Example:
- student writes `crisprEdit(dna, target, replacement)`
- app executes it on a demo DNA string
- simulator animates original and edited DNA

---

# 10. UX requirements

## 10.1 Home page
Must clearly communicate:
- this is one app with two classes
- each class is visually different
- student can jump back and forth

Suggested layout:
- centered title
- two large cards side by side on desktop
- stacked cards on mobile

Card content:
- class icon/illustration
- class title
- short description
- continue button
- progress summary

Example:
- *Leo’s Computer Class* — games, coding, logic
- *Leila’s Bio Lab* — DNA, genetics, biology experiments with code

## 10.2 Leila class visual style
Should feel:
- scientific
- playful
- colorful but not babyish

Suggested motifs:
- DNA strands
- microscope/lab cues
- colored nucleotide chips
- creature trait cards

## 10.3 Lesson layout
Recommended three-column desktop layout:
- left: lesson/story/instructions
- center: code editor
- right: visualization / tests

On smaller screens:
- stacked tabs or accordion sections

## 10.4 Feedback style
Feedback should be:
- friendly
- direct
- specific

Good:
- “Nice, your function found the correct target.”
- “Close — check what should happen to G when building the complement.”

Bad:
- generic “wrong answer”
- overly noisy success animations

---

# 11. CRISPR simulator product requirements

## 11.1 Purpose
The CRISPR simulator is the main “wow” feature of the bio class.  
It turns string manipulation into a visual gene-editing lab.

## 11.2 Learning model
We are not trying to simulate real CRISPR in full detail.  
We are teaching the simple idea:

- DNA contains sequences
- a guide finds a matching target
- the system cuts there
- a new sequence can replace the old one
- changing the sequence can change traits

## 11.3 Core simulator states
The simulator must represent:

### Original DNA
A full DNA strand rendered as colored base blocks

### Target found
The matching target region is highlighted

### Cut
The target region is marked with a cut animation or split

### Replacement
Replacement sequence is shown being inserted

### Edited DNA
Final strand shown clearly

### Trait impact
Optional panel shows how the edited DNA changes a toy creature trait

## 11.4 Simulator screen layout
Recommended panel layout:

### Left panel
- mini biology explanation
- mission text
- current challenge
- input values

### Center panel
- DNA strand visualization
- target highlight
- cut/replace animation

### Right panel
- edited result
- test results
- trait card
- hint box

## 11.5 Simulator interactions
V1 can be mostly passive after code runs.

User actions:
- Run code
- Test code
- Reset sample
- Replay animation

Optional later:
- step through edit
- choose different guide
- compare off-target candidates

## 11.6 Example challenge
Mission:
“Turn the mountain cat’s fur gene from brown to white.”

Inputs:
- DNA: `AATCGGTTACGA`
- target: `CGG`
- replacement: `AAA`

Student function:
`crisprEdit(dna, target, replacement)`

Expected result:
`AATAAATTACGA`

Trait card:
- before: brown fur
- after: white fur

---

# 12. Data model

Below is a clean data model that supports both classes and future expansion.

## 12.1 Class
```ts
type ClassDef = {
  id: string
  slug: string
  title: string
  subtitle?: string
  description: string
  theme: ClassTheme
  lessonOrder: string[]
}
```

Example:
```ts
type ClassTheme = {
  accent: string
  icon?: string
  illustration?: string
}
```

---

## 12.2 Lesson
```ts
type LessonDef = {
  id: string
  classId: string
  slug: string
  title: string
  shortTitle?: string
  unitTitle?: string
  order: number

  storyIntro: string
  conceptMarkdown: string
  instructionsMarkdown: string

  language: "javascript" | "python"
  starterCode: string
  functionName: string

  visibleTests: TestCase[]
  hiddenTests: TestCase[]
  hints: string[]

  visualization?: VisualizationConfig
  simulator?: SimulatorConfig

  completionCriteria?: CompletionCriteria
}
```

---

## 12.3 Test case
```ts
type TestCase = {
  id: string
  input: any[]
  expected: any
  explanation?: string
}
```

Optional richer format:
```ts
type TestCase = {
  id: string
  call: {
    fn: string
    args: any[]
  }
  expected: any
  comparison?: "deepEqual" | "stringEqual" | "numberEqual"
}
```

---

## 12.4 Completion criteria
```ts
type CompletionCriteria = {
  minVisibleTestsToPass?: number
  requireAllHiddenTests?: boolean
}
```

Default:
- all visible tests
- all hidden tests

---

## 12.5 Visualization config
Used for non-CRISPR displays like DNA color rendering or mutation previews.

```ts
type VisualizationConfig = {
  type:
    | "dna-strand"
    | "rna-strand"
    | "protein-chain"
    | "mutation-preview"
    | "trait-card"
    | "sequence-compare"
  demoInput?: Record<string, any>
}
```

---

## 12.6 Simulator config
Used when a lesson has a structured interactive simulator.

```ts
type SimulatorConfig = {
  type: "crispr"
  scenarioId: string
  demoArgs: Record<string, any>
  outputBinding?: {
    editedSequenceField: string
  }
}
```

Example:
```ts
{
  type: "crispr",
  scenarioId: "snow-cat-fur-edit",
  demoArgs: {
    dna: "AATCGGTTACGA",
    target: "CGG",
    replacement: "AAA"
  },
  outputBinding: {
    editedSequenceField: "result"
  }
}
```

---

## 12.7 CRISPR scenario
```ts
type CrisprScenario = {
  id: string
  title: string
  mission: string

  dna: string
  target: string
  replacement: string

  traitMapBefore?: TraitSnapshot
  traitMapAfter?: TraitSnapshot

  genomeRegions?: GenomeRegion[]
}
```

```ts
type TraitSnapshot = {
  [key: string]: string
}
```

```ts
type GenomeRegion = {
  label: string
  start: number
  end: number
  role?: string
}
```

Example:
```ts
{
  id: "snow-cat-fur-edit",
  title: "Edit the fur gene",
  mission: "Replace the fur target to turn the mountain cat into a snow cat.",
  dna: "AATCGGTTACGA",
  target: "CGG",
  replacement: "AAA",
  traitMapBefore: { fur: "brown", eyes: "green" },
  traitMapAfter: { fur: "white", eyes: "green" },
  genomeRegions: [
    { label: "fur gene", start: 3, end: 6, role: "trait" }
  ]
}
```

---

## 12.8 Student progress
For V1, local persistence is enough.

```ts
type LessonProgress = {
  lessonId: string
  status: "not-started" | "in-progress" | "passed"
  latestCode?: string
  lastRunAt?: string
  visibleTestsPassed?: number
  hiddenTestsPassed?: number
}
```

```ts
type ClassProgress = {
  classId: string
  completedLessonIds: string[]
  currentLessonId?: string
}
```

```ts
type AppProgress = {
  classes: Record<string, ClassProgress>
  lessons: Record<string, LessonProgress>
}
```

---

# 13. Information architecture / routing

Suggested routes:

```txt
/                       -> class selector home
/classes/leo            -> Leo class home
/classes/leila          -> Leila class home
/classes/leo/[lesson]   -> Leo lesson page
/classes/leila/[lesson] -> Leila lesson page
```

Optional:
```txt
/admin/lessons
```
for internal authoring later.

---

# 14. Component architecture

## Shared components
- `ClassCard`
- `LessonSidebar`
- `LessonHeader`
- `CodeEditor`
- `RunButton`
- `TestResultsPanel`
- `HintPanel`
- `ProgressBadge`

## Leila-specific components
- `DNAStrand`
- `BaseChip`
- `MutationHighlight`
- `TraitCard`
- `SequenceCompareView`
- `CrisprSimulator`
- `CrisprCutAnimation`
- `GenomeMap`

## Shared engine components
- `LessonRenderer`
- `ExerciseRunner`
- `TestHarness`
- `ProgressStore`

---

# 15. Suggested repo structure

```txt
/app
  /page.tsx
  /classes
    /leo
      /page.tsx
      /[lesson]
        /page.tsx
    /leila
      /page.tsx
      /[lesson]
        /page.tsx

/components
  /shared
  /leo
  /leila
  /simulators

/lib
  /classes
    /leo
      lessons.ts
    /leila
      lessons.ts
  /simulators
    crispr.ts
  /grading
    runner.ts
    compare.ts
  /progress
    store.ts
  /types
    curriculum.ts

/content
  /assets
```

---

# 16. Auto-grading architecture

## Preferred V1
Use constrained in-browser execution and deterministic tests.

If staying with JavaScript:
- easiest path
- maximal reuse from Leo app

If adding Python:
- use Pyodide in browser
- better fit for biology
- slightly more complexity

## Recommendation
For speed, keep V1 in **JavaScript** if Leo’s class already works that way.  
Design the lesson schema so Python can be added later.

## Grading flow
1. student edits starter function
2. clicks Run or Test
3. code is executed in sandbox
4. harness calls expected function with test args
5. results compared against expected values
6. UI shows per-test results
7. if passing, lesson marked complete

---

# 17. State management

V1:
- localStorage-backed progress
- lesson draft code saved per lesson
- currently selected class persisted

Potential store:
- Zustand or simple React context

Need to persist:
- latest code draft
- pass/fail status
- lesson completion
- last opened lesson

---

# 18. Content authoring workflow

Lessons should be defined in structured TS objects rather than hand-coded pages.

That gives:
- easy curriculum expansion
- shared renderer
- reusable test harness
- clean separation between content and UI

Example:
- `lib/classes/leila/lessons.ts`
- `lib/classes/leo/lessons.ts`

Each exports arrays of `LessonDef`.

---

# 19. V1 success criteria

V1 is successful if:
- app root clearly allows choosing Leo or Leila
- Leila class has at least 5 working lessons
- each lesson supports code input + auto-grading
- one CRISPR lesson includes a functioning visual simulator
- progress persists locally
- app feels cohesive rather than like two disconnected mini-apps

---

# 20. Phased delivery plan

## Phase 1 — Multi-class shell
- top-level home page
- class cards
- shared route structure
- shared lesson renderer
- progress store refactor

## Phase 2 — Leila curriculum core
- lessons 1–4
- DNA visualization
- shared auto-grading working well

## Phase 3 — Trait + mutation layer
- mutation preview
- toy genome trait decoding
- trait card UI

## Phase 4 — CRISPR simulator
- CRISPR lesson
- target highlight
- cut/replace animation
- trait before/after

## Phase 5 — polish
- better hints
- improved responsiveness
- more lessons
- optional Python support

---

# 21. Open questions

These are the main product/technical decisions still worth settling:

## Language choice
- Reuse JS for speed?
- Add Python now for better science vibe?

## Code execution model
- entirely in-browser?
- any server-side evaluation later?

## Progress/auth
- purely local for now?
- or shared progress across devices later?

## Visual depth
- simple animation only?
- or more game-like interactive simulator?

## Tone
- more “lab adventure”
- or more “serious young scientist”

My take: start with **playful but clean**, not cartoonish.

---

# 22. Strong recommendation

The right framing is:

**one platform, two classes, one shared engine.**

Do not build Leila’s class as a separate app hidden inside the repo.  
Keep:
- one homepage
- one lesson framework
- class-specific themes and simulators on top

That gives you clean extensibility later for other subjects too.

---

# 23. Example top-level copy

## Home title
**Family Classroom**

## Leo card
**Leo’s Computer Class**  
Build coding skills through puzzles, logic, and small programming challenges.

## Leila card
**Leila’s Bio Lab**  
Learn biology by writing code to explore DNA, genes, mutations, and gene editing.

---

# 24. Example first CRISPR lesson spec

```ts
export const crisprLesson: LessonDef = {
  id: "leila-crispr-edit-1",
  classId: "leila",
  slug: "crispr-edit-1",
  title: "CRISPR: Edit a Fur Gene",
  unitTitle: "Edit DNA",
  order: 9,
  storyIntro:
    "A mountain cat has the wrong fur code for snowy weather. Your job is to edit the DNA.",
  conceptMarkdown:
    "CRISPR can be thought of as a system that finds a target DNA sequence and replaces it with a new one.",
  instructionsMarkdown:
    "Write a function called crisprEdit(dna, target, replacement) that replaces the first occurrence of target with replacement.",
  language: "javascript",
  starterCode: `function crisprEdit(dna, target, replacement) {
  // Replace the first matching target sequence
}`,
  functionName: "crisprEdit",
  visibleTests: [
    {
      id: "t1",
      input: ["AATCGGTTACGA", "CGG", "AAA"],
      expected: "AATAAATTACGA"
    }
  ],
  hiddenTests: [
    {
      id: "t2",
      input: ["TTTACGCCC", "ACG", "GGG"],
      expected: "TTTGGGCCC"
    }
  ],
  hints: [
    "Find where the target starts.",
    "Take the part before the target, then add replacement, then add the rest.",
    "Only replace the first occurrence."
  ],
  simulator: {
    type: "crispr",
    scenarioId: "snow-cat-fur-edit",
    demoArgs: {
      dna: "AATCGGTTACGA",
      target: "CGG",
      replacement: "AAA"
    }
  }
}
```
