# Mind Break: Design System

**Direction:** A · Stopwatch (light, Swiss-precise, built around the 60-tick timer ring)
**Version:** 1.0 (draft) · 17 October 2026
**Companion doc:** `PRD.md`
**Reference mockups:** home page, game, result, leaderboard, reward claim, mobile home (on the design canvas)

---

## 1. Design Principles

1. **One minute, one idea.** Every screen has one primary action. Nothing competes with "play".
2. **Time is the hero.** The 60-tick ring is the logo, the timer, the streak motif and the loading state. Reuse it before inventing a new visual.
3. **Instrument, not toy.** Precise grids, mono numerals, tight headlines. Playful through colour and reward moments, never through cartoons.
4. **Real rewards look real.** Physical rewards are **squares**, digital rewards are **circles**. This shape rule holds everywhere.
5. **Calm at a desk.** Sound off by default, no flashing, no pressure copy. It must feel safe to open in a meeting gap or a lecture break.
6. **Honest by default.** No fake urgency, no dark patterns around streaks. Streak freezes exist to forgive, not to upsell.

---

## 2. Colour

### 2.1 Core palette

| Token | Hex | Role |
|---|---|---|
| `--bg` | `#ECEEE8` | Page background (cool pale grey-green) |
| `--card` | `#F8F9F5` | Cards, panels, inputs' surround |
| `--surface` | `#FFFFFF` | Inputs, game tiles, raised chips |
| `--ink` | `#0E1411` | Primary text, dark cards, primary outlines |
| `--mute` | `#59615B` | Secondary text, labels, captions |
| `--line` | `rgba(14,20,17,.14)` | Hairlines, card borders, inactive ticks |
| `--acc` | `#FF5A2B` | Signal orange: time, streaks, primary buttons, "you" |
| `--lime` | `#CFEA6B` | Rewards, highlights, positive states, avatar fill |
| `--lime-ink` | `#2D3A14` | Text on lime backgrounds (secondary lines) |

### 2.2 Semantic mapping

| Meaning | Colour |
|---|---|
| Primary action | `--acc` fill, `--ink` text |
| Secondary action | transparent, 1.5px `--ink` border |
| Streak / time progress | `--acc` |
| Reward, personal best, success | `--lime` |
| "You" row / current position | `--acc` fill |
| Dark feature card (streak, college-vs-college) | `--ink` fill, white text, `--lime` labels |
| Disabled | `--line` fill, `--mute` text |
| Error (proposed) | `#B3261E` on `#FBE9E7` |

### 2.3 Contrast rules (important)

Checked against `--bg`:

- `--ink` on `--bg`: very high contrast. All body text.
- `--mute` on `--bg`: about 5.3:1. Passes for body and captions.
- `--ink` on `--acc`: about 5.9:1. Passes. **Always use ink text on orange.**
- **White text on `--acc` fails (about 3:1). Never use it.**
- **`--acc` as text on `--bg` is only about 2.7:1, which fails.** The mockups use it for large display type ("Don’t break it.", the logo slash, "You are here"). For production:
  - Small or medium text in orange uses `--acc-text: #C23A0C` (about 4.6:1).
  - Large display type (48px and up) may use `#D9400F` (about 3.9:1) or stay on the bright orange only when it's decorative.
  - Orange on `--ink` (dark cards) is fine for any size.
- Colour never carries meaning alone. Pair it with shape (square vs circle), a label, or a number.

### 2.4 Tokens as CSS variables

```css
:root {
  --bg: #ECEEE8;
  --card: #F8F9F5;
  --surface: #FFFFFF;
  --ink: #0E1411;
  --mute: #59615B;
  --line: rgba(14, 20, 17, 0.14);
  --acc: #FF5A2B;
  --acc-text: #C23A0C;
  --lime: #CFEA6B;
  --lime-ink: #2D3A14;
  --error: #B3261E;
  --error-bg: #FBE9E7;
}
```

### 2.5 Dark mode (proposed, not yet designed)

Planned for v1.1. Starting tokens: `--bg #0E1411`, `--card #172019`, `--ink #ECEEE8`, `--mute #9AA59D`, `--line rgba(236,238,232,.16)`; `--acc` and `--lime` stay the same. Ink text on orange and lime stays dark in both modes.

---

## 3. Typography

### 3.1 Typefaces

| Role | Family | Source | Weights used |
|---|---|---|---|
| Display / headings | **Bricolage Grotesque** | Google Fonts (variable, optical size) | 600, 700, 800 |
| Body / UI | **Instrument Sans** | Google Fonts (variable) | 400, 500, 600, 700 |
| Numerals / labels / timers | **JetBrains Mono** | Google Fonts | 400, 500, 600 |

Fallbacks:

```css
--font-display: "Bricolage Grotesque", "Helvetica Neue", system-ui, sans-serif;
--font-body: "Instrument Sans", system-ui, -apple-system, sans-serif;
--font-mono: "JetBrains Mono", ui-monospace, "SF Mono", Menlo, monospace;
```

Load with `next/font/google` (self-hosted, no layout shift, `display: swap`). Subset to Latin; add Devanagari fallback (Noto Sans Devanagari) when Hindi/Marathi is added.

### 3.2 Type scale (desktop)

| Style | Font | Size / line | Weight | Tracking | Use |
|---|---|---|---|---|---|
| Display XL | Display | 190 / 0.95 | 700 | −0.06em | Result score |
| Hero H1 | Display | 88 / 0.94 | 700 | −0.04em | Home hero |
| Timer | Mono | 92 / 1 | 500 | −0.05em | Game ring centre |
| Section H2 | Display | 56 / 1.0 | 700 | −0.035em | Home sections |
| Page title | Display | 60 / 1.0 | 700 | −0.04em | App screens |
| Card title | Display | 34 / 1.05 | 700 | −0.02em | Game and reward cards |
| Lead | Body | 20 / 1.5 | 400 | 0 | Hero paragraph |
| Body | Body | 17 / 1.55 | 400 | 0 | Default copy |
| UI | Body | 15–16 / 1.4 | 500–600 | 0 | Buttons, nav, rows |
| Caption | Body | 13–14 / 1.5 | 400 | 0 | Helper text |
| Label | Mono | 12 / 1.2 | 400–500 | +0.1em, uppercase | Eyebrows, table heads |
| Score / numeric | Mono | 14–28 | 400–500 | 0 | Scores, ranks, streaks |

### 3.3 Type scale (mobile, 390px)

Hero/H1 44–48px, H2 32–36px, card title 24–28px, timer 52–56px, body 16px, label 11–12px. Never below 16px for form inputs (prevents iOS zoom).

### 3.4 Rules

- Headlines are tight (negative tracking) and short. Max about 3 lines.
- All numbers that change (timer, score, rank, streak) use **mono** so digits don't jump.
- Labels above content are mono uppercase. No other uppercase.
- Use typographic punctuation in all UI copy: ’ for apostrophes, “ ” for quotes, − (minus sign) and × ÷ in the math game, · as a separator.
- No italics in the interface.

---

## 4. Spacing, Radii, Elevation

### 4.1 Spacing (4px base)

`4 · 8 · 12 · 16 · 20 · 24 · 28 · 32 · 40 · 48 · 56 · 72 · 96`

| Context | Value |
|---|---|
| Page side padding (home) | 56px desktop · 20px mobile |
| App screen side padding | 48px desktop · 20px mobile |
| Section vertical padding | 72–96px desktop · 48px mobile |
| Card inner padding | 24–32px (28 default) · 20px mobile |
| Gap between cards | 16px |
| Gap between buttons | 14px |
| Row padding (lists) | 15px vertical |

### 4.2 Radii

| Token | Value | Used for |
|---|---|---|
| `r-sm` | 12px | Physical-reward squares, small icons |
| `r-input` | 14px | Inputs |
| `r-row` | 16px | Highlighted list rows ("You") |
| `r-tile` | 18px | Game number tiles, sticker chips |
| `r-card` | 28px | Cards, panels |
| `r-xl` | 36–40px | Large CTA band, hero card |
| `r-pill` | 999px | Buttons, chips, progress bars |
| circle | 50% | Digital-reward nodes, avatars, operator buttons, ring |

### 4.3 Elevation

Mostly flat with hairline borders. One soft shadow for the hero card only:

```css
--shadow-hero: 0 1px 0 var(--line), 0 40px 70px -40px rgba(14, 20, 17, 0.35);
```

Floating "sticker" chips (streak, rank) use a ±3° rotation and no shadow. Everything else is border + colour contrast.

---

## 5. Signature Elements

### 5.1 The 60-tick ring

The core visual. A circle of 60 radial ticks (one per second).

- Ticks are drawn as a dashed circle stroke: stroke width = tick length, dash length = tick width.
- For radius `r`, circumference `C = 2πr`, period `P = C / 60`.
- `stroke-dasharray = "<tickWidth> <P − tickWidth>"`, rotated −90° so it starts at 12 o'clock.
- Progress: draw the same dashed circle in `--acc` and clip it with an SVG `<mask>` containing a plain circle stroke with `stroke-dasharray = "<C × elapsed/60> <C>"`.
- A solid orange dot (r about 3–4% of ring size, 3px ink stroke) marks the current second.

| Use | Ring size | r | Tick width / length | Dasharray |
|---|---|---|---|---|
| Hero card | 340 viewBox | 150 | 2.4 / 16 | `2.4 13.308` |
| Game screen | 440 viewBox | 200 | 3 / 22 | `3 17.944` |
| Mobile card | 340 viewBox, 240px | 150 | 2.4 / 16 | `2.4 13.308` |
| Logo mark | 30px | 12 | 1.4 / 5 | `1.4 1.9` |

Build it once as a React component:

```tsx
<TickRing size={440} elapsed={37} total={60} tickWidth={3} tickLength={22} />
```

Rules: update `elapsed` from `requestAnimationFrame`, never from CSS animation, so it stays in sync with the server-validated timer. Under `prefers-reduced-motion`, update once per second instead of every frame.

### 5.2 Shape language for rewards

| Shape | Meaning |
|---|---|
| Circle | Digital reward or streak day |
| Rounded square (12px radius, 1.5px ink border, lime fill) | Physical reward milestone (50, 100, 200) |
| Ink square with lime numeral | The top physical milestone (365) |
| Orange circle with a double ring | "You are here" |

### 5.3 Streak ladder

Horizontal track: solid ink line for the part completed, dashed line for the part ahead. Nodes sit on the line with label and sub-label below. On mobile it collapses to a single progress bar to the next physical reward.

### 5.4 Sticker chips

Small rotated cards floating on the hero card ("Streak 47 days" in ink, "Rank 12" in lime). Max two per view. Used only on marketing surfaces, never inside gameplay.

---

## 6. Components

### 6.1 Buttons

| Variant | Style |
|---|---|
| Primary | `--acc` fill, `--ink` text, pill, 16–17px, weight 700, padding 16–19px × 28–30px |
| Secondary | Transparent, 1.5px `--ink` border, ink text, weight 600 |
| Dark | `--ink` fill, white text (nav "Play now") |
| Compact | Padding 11–13px × 21–22px, 15px text (tabs, filters) |
| Operator | 56px circle, 1.5px ink border, `--card` fill, 24px glyph (math game) |

States: hover = 6% darker fill (links: 0.7 opacity); active = scale 0.98; focus-visible = 3px `--ink` outline, 2px offset; disabled = `--line` fill, `--mute` text, no pointer events. Minimum touch target 44px (mobile primary buttons 52px).

### 6.2 Chips and pills

- **Pill:** 1px `--line` border, 13px mono, 8px × 12px padding (e.g., "Streak 47").
- **Selected pill:** `--ink` fill, white text.
- **Highlight chip:** `--lime` fill, 12px mono (e.g., "New personal best", category tag).

### 6.3 Cards

| Variant | Style |
|---|---|
| Default | `--card` fill, 1px `--line` border, 28px radius |
| Dark | `--ink` fill, white text, lime labels |
| Lime | `--lime` fill, lime-ink secondary text |
| Orange | `--acc` fill, ink text |
| Bento tile | Mixed sizes, 28px padding, label top, title bottom, a miniature of the game in the corner |

### 6.4 Form fields

Always a visible `<label>` above the field (13px, weight 600). Input: white fill, 1.5px `--line` border, 14px radius, 15px × 16px padding, 16px text. Focus: 2px `--ink` border. Error: `--error` border plus message below (13px, `--error`). Helper text 13px `--mute`.

### 6.5 Leaderboard row

`rank (mono, mute, 42px wide) · handle · group (mute, 14px) · score (mono)`. Rows separated by 1px `--line`. The user's row: `--acc` fill, 16px radius, weight 600, pinned below the top five with a "· · ·" divider.

### 6.6 Progress bars

8–10px high, pill-shaped, `--line` track, fill in `--acc` (time and streak) or `--lime` (comparison bars). On dark cards the track is `rgba(255,255,255,.14)`.

### 6.7 Stepper (reward claim)

Four numbered circles on a track: done = ink, current = orange with a double ring, upcoming = outlined. Labels in mono below.

### 6.8 Game tiles

- Number tile: 58–64px square, 16–18px radius, white fill, 1px line border, 30–34px display numerals.
- Target tile: ink fill, white numerals, slightly wider.
- Memory dots: 38px circles, inactive `rgba(14,20,17,.18)`, lit = ink.
- Sudoku cell: 34px, `--card` fill, 6px radius, the active cell in orange.

### 6.9 Navigation

- **Desktop top bar:** 72px high, 1px bottom border, logo left, three links centred, streak pill and avatar right.
- **Mobile bottom bar:** 84px high, 4 tabs (Today, Games, Boards, Rewards), active tab has a 3px orange underline, mono 11px labels. Respect `env(safe-area-inset-bottom)`.

### 6.10 Avatar

40px circle, lime fill, ink initial, weight 700.

---

## 7. Layout

### 7.1 Grid and widths

- Max content width **1360px** (including side padding), centred.
- No fixed 12-column grid. Layouts use **flex-wrap with basis values** so sections reflow naturally (for example, `flex: 1 1 560px`).
- Bento games grid: row 1 = 5 / 4 / 3 flex ratios, row 2 = 6 / 6.

### 7.2 Breakpoints

| Name | Width | Behaviour |
|---|---|---|
| `sm` | 640px | Single column, bottom nav |
| `md` | 768px | Two-column cards |
| `lg` | 1024px | Side-by-side hero and app layouts |
| `xl` | 1360px | Max container |

### 7.3 Screens

| Screen | Structure |
|---|---|
| **Home** | Nav → hero (headline left, live-round card right) → streak ladder → games bento → leaderboard + team cards → ink CTA band → footer |
| **Game** | Left column (game name, rules, "play time today" card) · centre (ring, number tiles, operators, undo/skip) · right column (score card, key hints) |
| **Result** | Left (score display, rank/solved/accuracy cards, three buttons) · right (dark streak card with progress to next gift, freeze count) |
| **Leaderboard** | Page title → period tabs and scope chips → table card (2/3) beside college-vs-college dark card (1/3) |
| **Reward claim** | Page title → four-step tracker → form card (60%) beside reward card and privacy note (40%) |
| **Mobile home** | Header → today card (ring and "Play 60 seconds") → week dots → reward progress card → bottom tab bar |

### 7.4 Responsive behaviour

- Hero: text over visual on mobile; floating chips pulled inside the card.
- Game screen on mobile: ring scales to 280px, number tiles 56px, side columns collapse above and below; the score sits in a top strip.
- Tables become stacked rows (rank, name, score) under 640px.
- Streak ladder becomes a progress bar to the next milestone.
- Wide tables or the ladder scroll inside their own container; the page never scrolls sideways.

---

## 8. Iconography

- Style: 1.75px stroke, round caps and joins, 20–24px grid, no fills (except small status dots).
- Library: **lucide-react**, with custom SVG for the ring, logo, and streak-day check mark.
- Icon-only buttons always have an `aria-label`. Decorative icons are `aria-hidden`.
- No emoji anywhere in the UI.

---

## 9. Motion

| Moment | Behaviour | Duration |
|---|---|---|
| Ring progress | Updates from rAF; linear; no easing | continuous |
| Score count-up (result) | Ease-out count from 0 to final | 700ms |
| Streak increment | The number slides up one step, ring pulses once | 450ms |
| Reward unlock | Square node scales from 0.8 to 1, a lime flash behind | 500ms |
| Card hover (desktop) | Translate −2px | 150ms |
| Page transition | Fade, 8px rise | 200ms |
| Chip float (hero only) | ±3° rotation, static | none |

Rules: nothing loops. Respect `prefers-reduced-motion` (replace motion with instant state changes). No screen shake, flashing, or confetti walls; reward moments stay quiet and precise.

**Sound:** off by default with a visible toggle. Short, soft sounds for correct, wrong, and round end. Never autoplay.

---

## 10. Accessibility

- Target WCAG 2.1 AA.
- Full keyboard play for every game (keys listed on the game screen). Visible focus ring everywhere.
- Real elements: `<button>`, `<a>`, `<input>` with `<label>`. No clickable divs.
- Timer announced politely at 30s, 10s and end via `aria-live="polite"`, not every second.
- Colour-blind-safe: orange vs lime differ in lightness and shape; correct and wrong states also use icon and text.
- Reduced motion and sound-off honoured.
- Minimum 44px touch targets, 16px minimum for inputs on mobile.
- Alt text or `aria-label` on score rings and charts, describing the value ("37 seconds elapsed, 23 left").

---

## 11. Content and Voice

- Short, calm, direct. No exclamation marks, no "Oops!", no streak guilt.
- Verbs first on buttons: "Play today’s round", "Review my claim", "Try another game".
- Streak loss copy: "Your streak ended at 47 days. Your best is still 47." Offer a restart, never shame.
- Rewards copy is concrete: "Pen and sticker pack", not "Awesome goodies".
- Privacy copy is plain: "Your address is used only to ship this gift and deleted after delivery."
- Placeholder values in mockups are marked `[like this]`; replace with real data from the product.

---

## 12. UI Packages and Libraries

Aligned with the stack in `PRD.md` (Next.js, TypeScript, Supabase, Vercel). Verify current versions when installing.

### 12.1 Core

| Purpose | Package |
|---|---|
| Framework | `next` (App Router), `react`, `react-dom`, `typescript` |
| Styling | `tailwindcss` (tokens mapped in config), `postcss`, `autoprefixer` |
| Class utilities | `clsx`, `tailwind-merge`, `class-variance-authority` |
| Fonts | `next/font/google` (built in) |

### 12.2 UI building blocks

| Purpose | Package | Notes |
|---|---|---|
| Accessible primitives | `@radix-ui/react-*` (Dialog, Tabs, Switch, Tooltip, Popover, Progress, Toggle Group) | Headless; fully restyled to this system |
| Component starter | `shadcn/ui` (optional) | Copy components in, then replace the default look with these tokens |
| Icons | `lucide-react` | Stroke 1.75 |
| Toasts | `sonner` | Restyle with card tokens |
| Forms | `react-hook-form`, `zod`, `@hookform/resolvers` | Reward claim and org setup |
| Motion | `motion` (Framer Motion) | Count-ups, node unlocks, page transitions |

### 12.3 Game and data

| Purpose | Package |
|---|---|
| Game state, timers | `zustand` |
| Seeded randomness | `seedrandom` (or a small custom PRNG) |
| Dates and timezones | `date-fns` and `date-fns-tz` |
| Sound (optional) | `use-sound` / `howler` |
| Charts (stats, v1.1) | `recharts` |
| Share cards | `@vercel/og` (server-rendered share images) |

### 12.4 Platform

| Purpose | Package |
|---|---|
| PWA and offline shell | `@serwist/next` |
| Push notifications | `web-push` (server), the browser Push API |
| Backend and auth | `@supabase/supabase-js`, `@supabase/ssr` |
| Analytics | `posthog-js` |
| Errors | `@sentry/nextjs` |
| Payments | `razorpay` (India), `stripe` (international) |
| Email | `resend`, `react-email` |

### 12.5 Quality

`eslint`, `prettier` (with `prettier-plugin-tailwindcss`), `vitest` and `@testing-library/react` for logic and components, `playwright` for end-to-end flows, `storybook` for the component library, `axe-core` / `@axe-core/react` for accessibility checks.

### 12.6 What to avoid

Heavy UI kits with their own look (MUI, Ant Design, Chakra), game engines like Phaser for these games, and animation libraries beyond one (`motion`). Keep the bundle small so the first game is playable in under 3 seconds on a mid-range phone.

---

## 13. Tailwind Configuration

```ts
// tailwind.config.ts
import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    container: { center: true, padding: { DEFAULT: "20px", lg: "56px" }, screens: { xl: "1360px" } },
    extend: {
      colors: {
        bg: "var(--bg)",
        card: "var(--card)",
        surface: "var(--surface)",
        ink: "var(--ink)",
        mute: "var(--mute)",
        line: "var(--line)",
        acc: { DEFAULT: "var(--acc)", text: "var(--acc-text)" },
        lime: { DEFAULT: "var(--lime)", ink: "var(--lime-ink)" },
        error: { DEFAULT: "var(--error)", bg: "var(--error-bg)" },
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
        mono: ["var(--font-mono)"],
      },
      borderRadius: {
        sm: "12px", input: "14px", row: "16px", tile: "18px",
        card: "28px", xl: "36px",
      },
      fontSize: {
        "display-xl": ["190px", { lineHeight: "0.95", letterSpacing: "-0.06em" }],
        "h1": ["88px", { lineHeight: "0.94", letterSpacing: "-0.04em" }],
        "h2": ["56px", { lineHeight: "1", letterSpacing: "-0.035em" }],
        "title": ["60px", { lineHeight: "1", letterSpacing: "-0.04em" }],
        "card-title": ["34px", { lineHeight: "1.05", letterSpacing: "-0.02em" }],
        "label": ["12px", { lineHeight: "1.2", letterSpacing: "0.1em" }],
      },
      boxShadow: { hero: "0 1px 0 var(--line), 0 40px 70px -40px rgba(14,20,17,.35)" },
    },
  },
  plugins: [],
} satisfies Config;
```

Use `clamp()` or responsive classes to scale `display-xl`, `h1`, `h2` and `title` down on mobile (see section 3.3).

---

## 14. Component Architecture

```
src/
  components/
    ui/              # primitives: Button, Pill, Card, Input, Tabs, Progress, Switch
    brand/           # TickRing, LogoMark, StreakChip, RewardNode, StickerChip
    game/            # GameShell, GameTimer, ScoreCard, TileRow, OperatorPad
    board/           # LeaderboardTable, RankRow, CollegeVsCollege
    rewards/         # StreakLadder, ClaimStepper, ClaimForm, RewardCard
    layout/          # TopNav, BottomNav, PageShell
  games/
    make24/          # logic + Component, implements the Game interface from PRD §7.1
    sudoku4/
    pattern-recall/
    stroop/
  styles/
    tokens.css       # CSS variables from section 2.4
```

Every game renders inside `GameShell`, which owns the ring, timer, score card and keyboard hints. A game only supplies its play area, so a new game looks native without new design work.

---

## 15. Game Screen Rules

- The ring is always the largest element. The play area never covers it.
- Layout order: rules (left), play (centre), score (right). On mobile: score strip, ring, play area.
- Colour use: orange for time, ink for numbers and tiles, lime for success flashes (200ms), a gentle shake-free shake alternative for errors (the tile outlines in `--error` for 300ms plus a "×" icon).
- Every game shows its keys or gestures in a mono hint line.
- A 5-second tutorial overlay appears on first play only: the ring paused, one sentence, one "Start" button.
- Paused-on-blur: the timer keeps running but the screen dims and shows "Return to the round". Time away is forfeited, per the PRD.

---

## 16. States Still to Design

The current mockups cover the happy path. Still to design before build:

- Empty states: no scores yet, no organisation joined, no rewards earned
- Error states: network failure on submit, invalid invite code, form validation
- Loading and skeleton states (use the ring as a spinner)
- Guest-to-account prompt after the first round
- Streak-broken and streak-freeze-used screens
- Reward unlock moment (full screen)
- Settings (reminder time, timezone, sound, notifications)
- Organisation admin dashboard
- Premium paywall and pricing page
- Dark mode
- Sub-18 / school variant (deferred in the PRD)

---

## 17. Directions Considered and Not Chosen

- **B · Arcade:** bold cobalt background, huge yellow "60", tilted sticker reward cards, Unbounded display type. Loud and shareable, but less credible for corporate buyers.
- **C · Quiet:** forest green with a light serif and amber accent. Calm and premium, but least game-like.

Kept for reference on the design canvas. Elements worth borrowing later: B's reward-card energy for student-facing campaigns, C's calm tone for a corporate wellbeing landing page.

---

## 18. Quick Reference

| Thing | Value |
|---|---|
| Max width | 1360px |
| Background | `#ECEEE8` |
| Ink | `#0E1411` |
| Orange | `#FF5A2B` (text version `#C23A0C`) |
| Lime | `#CFEA6B` |
| Display font | Bricolage Grotesque |
| Body font | Instrument Sans |
| Numerals font | JetBrains Mono |
| Card radius | 28px |
| Button | pill, orange, ink text |
| Reward shapes | circle = digital, square = physical |
| Signature | 60-tick ring |
| Icons | lucide-react, 1.75px stroke |
