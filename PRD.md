# Product Requirements Document: Mind Break

**Working title:** Mind Break (daily 60-second brain games)
**Version:** 1.0 (draft)
**Date:** 17 October 2026
**Platform:** Web / PWA first
**Audience:** Students (colleges first) and corporate teams

---

## 1. Overview

### 1.1 Summary
Mind Break is a web/PWA app where people play short, 60-second mind games (puzzle, math, memory, word, reflex) once a day or as often as they like. A streak system rewards daily consistency with digital gifts and, at big milestones (50, 100, 200, 365+ days), physical rewards. Players compete on solo leaderboards at global, organisation (company or college) and department levels.

### 1.2 Problem
- Office workers and students spend long hours at a screen and need a quick mental reset, but most games are too long, too addictive, or too noisy for a work or study setting.
- Existing daily puzzle games (Wordle-style) offer one puzzle only, with little variety and no organisation-level competition.
- Organisations (companies, colleges) want light engagement and wellbeing tools but lack a simple one.

### 1.3 Solution
A hub of many 60-second games, one featured game per day, free replays, streaks with real rewards, and organisation leaderboards. Opens instantly, no signup for the first round, built to fit inside a work or study break.

### 1.4 Vision
Become the default one-minute daily mental break for desk workers and students.

---

## 2. Goals and Non-Goals

### 2.1 Goals (v1)
1. Create a daily habit: a player can finish a "day" in 60 seconds.
2. Offer variety: at least 4 games at launch across different categories, scaling to 15+ by v1.2.
3. Drive retention through streaks, freezes and milestone rewards.
4. Support both students and corporate users through organisation-based leaderboards.
5. Generate revenue through premium subscriptions, team/college plans and sponsors, enough to cover running costs and reward fulfilment.
6. Keep the architecture cheap and quick to extend with new games.

### 2.2 Non-Goals (v1)
- No 1v1 or real-time multiplayer. Competition is solo, score-based.
- No native iOS/Android apps (PWA only).
- No user-generated games or content.
- No in-app chat or social feed.
- No under-18 / school accounts in v1 (see section 14).
- No cash prizes (avoids gambling and legal complexity).

---

## 3. Target Users and Personas

### 3.1 Persona A: Student (primary growth audience)
- Age 17-25, college or university student.
- Plays between lectures, in hostels, between study sessions.
- Motivated by college-vs-college rankings, streaks, bragging rights, free rewards.
- Low willingness to pay, high willingness to share.

### 3.2 Persona B: Corporate employee (primary revenue audience)
- Age 22-45, desk worker.
- Wants a quick, discreet mental reset between tasks.
- Motivated by team leaderboards, small daily ritual, wellbeing.
- Low individual spend; the company can pay for team plans.

### 3.3 Persona C: Organisation admin (HR / wellbeing lead / college coordinator)
- Creates the organisation, shares invite codes, views engagement, buys a plan.
- Wants simple setup, safe usernames, participation stats, no data headaches.

### 3.4 Persona D: Platform admin (you / the team)
- Manages games, rewards, claims, abuse reports, organisations and subscriptions.

---

## 4. Success Metrics

| Metric | Target (first 90 days after launch) |
|---|---|
| Day-1 retention | 40% |
| Day-7 retention | 25-30% |
| Day-30 retention | 12-15% |
| Average daily play time per active user | 3+ minutes |
| Users reaching a 7-day streak | 20% of new users |
| Users reaching a 50-day streak | 3-5% of users active at day 60 |
| Paid conversion (individual) | 2-3% |
| Organisations onboarded | 10 colleges or companies |
| Cost per physical reward claimed | Within the reward budget (section 10.4) |

North-star metric: **daily active players who complete at least one 60-second play day.**

---

## 5. Scope Summary

### 5.1 MVP (v1.0)
- Guest play, then account creation (email, Google, magic link)
- 4 launch games
- Daily featured game, free play library, unlimited replays
- Streaks, streak freezes, digital rewards
- Global leaderboard, organisation leaderboard
- Organisation creation with invite codes
- Web push + email reminders
- Premium subscription (individual)
- Physical reward claim flow (manual fulfilment)
- Basic admin dashboard
- PWA install

### 5.2 v1.1
- Team/college paid plans and org admin dashboard
- Department / year sub-leaderboards
- Weekly challenges, achievements and badges
- 4-6 additional games

### 5.3 v1.2+
- Sponsored rewards and "presented by" slots
- Shareable result cards
- Exam-season mode and vacation freeze
- Light ads (optional)
- Native wrapper apps if PWA limits retention (especially iOS push)
- School accounts with parental consent

---

## 6. Core Product Mechanics

### 6.1 The "play day" rule
- A day counts as **played** when the user has accumulated **at least 60 seconds of valid game time** in that day (user's local day).
- Time can be split across multiple rounds. One full 60-second round satisfies it.
- Unlimited replays after that; no daily cap.
- Play time is measured and recorded server-side (client time is never trusted).

### 6.2 Daily featured game
- One game is featured each day, selected by a rotation schedule (category rotation, no repeats within 3 days).
- All users get the same puzzle seed for the featured game each day.
- Free-play library games use random seeds, except the daily seed games which also offer a "daily puzzle" mode.

### 6.3 Streak rules
- Streak increments by 1 for each consecutive played day.
- Day boundary uses the user's stored timezone (set at signup, editable once every 30 days).
- Missing a day resets the streak to 0 unless a **streak freeze** is used.
- **Streak freeze:** consumes automatically when a day is missed; protects one missed day. Maximum 2 held at a time.
  - Earned: 1 at day 7, and 1 more at every 30-day milestone.
  - Premium users get 1 extra freeze per month.
- **Best streak** is stored separately and is never lost.
- **Welcome back flow:** if a streak of 14+ days breaks, offer a one-time "restore" (premium feature or watch-a-sponsor-message), to soften churn.

### 6.4 Time zones and fairness
- The server computes "today" per user from stored timezone.
- Daily leaderboards reset at 00:00 UTC for global boards and at org-local midnight for org boards (configurable per org, default UTC).

---

## 7. Games

### 7.1 Game plugin interface
Every game is a module implementing a shared contract so new games are cheap to add:

```ts
interface Game {
  id: string;                    // "make24", "sudoku4"
  name: string;
  category: "puzzle" | "math" | "memory" | "word" | "reflex";
  durationSeconds: number;       // 60 by default
  generate(seed: string, difficulty: number): Puzzle;
  validate(puzzle: Puzzle, submission: Submission): Result; // runs on server
  score(result: Result): number;
  Component: React.ComponentType<GameProps>;
}
```

- Timer, scoring pipeline, leaderboard writes, streak updates and analytics are handled by the platform, not by individual games.
- Difficulty scales by player level (adaptive in v1.1).

### 7.2 Launch games (MVP)

| Game | Category | How it works in 60s | Score rule |
|---|---|---|---|
| Mini Sudoku (4x4) | Puzzle | Solve as many 4x4 grids as possible | Grids solved x 100, minus 5 per error, plus time bonus |
| Make-24 | Math | Combine four numbers to reach 24 | Puzzles solved x 100, streak bonus for consecutive solves |
| Pattern Recall | Memory | Watch a sequence, repeat it; it grows each round | Highest level reached x 100 plus accuracy bonus |
| Stroop Test | Reflex | Tap the colour of the text, not the word | Correct x 10, minus 15 per miss, speed multiplier |

### 7.3 Game backlog (to add after MVP)

**Puzzle / logic:** Mini KenKen, Number Slide, Nonogram (5x5), Lights Out, Futoshiki, Tower of Hanoi, Pipe Connect, Odd One Out
**Math:** Quick Math Sprint, Number Chain, Greater or Less, Target Sum, Cross-Math
**Memory:** Card Flip Match, Sequence Memory, Grid Memory, N-Back, Number Memory, Spot the Change
**Word:** Anagram Rush, Word Sprint, Missing Letter, Word Ladder
**Reflex / focus:** Inbox Zero Rush, Reaction Tap, Sort the Shapes

### 7.4 Game design rules
- Every game must be fully playable in 60 seconds, with a clear score.
- Large puzzles (Sudoku, KenKen, Nonogram) use small grids or "puzzles solved in time" scoring.
- Each game has a 5-second tutorial overlay on first play.
- Sound is off by default with a visible toggle.
- Fully keyboard-playable on desktop, touch-friendly on mobile.
- Colour-blind-safe palettes.

---

## 8. Leaderboards

### 8.1 Types
| Board | Scope | Reset |
|---|---|---|
| Daily game board | Per game, global | Daily |
| Daily game board (org) | Per game, per organisation | Daily |
| Weekly total | All games combined, global and per org | Weekly (Monday) |
| All-time streak board | Longest current streak, global and per org | Never |
| Department / year board | Sub-groups inside an organisation | Daily / weekly |
| College vs college | Aggregate of org members' scores | Weekly |
| Company vs company | Opt-in, aggregate | Weekly |

### 8.2 Rules
- Best score of the day counts; replays can only improve it.
- Ties broken by earlier submission time.
- Users choose a display name; offensive names are filtered and reportable.
- Option to appear anonymously on public boards while visible to their own org.
- Leaderboards show the user's rank and the players around them, not only the top 10.

### 8.3 Aggregate board formula
College vs college uses the **average of top N members' scores** (N configurable, default 20) to avoid advantaging large colleges.

---

## 9. Organisations (Companies and Colleges)

### 9.1 Features
- Create an organisation: name, type (company, college), logo, domain (optional), timezone.
- **Invite codes and links**; optional email-domain restriction (e.g., only `@college.edu`).
- Sub-groups: departments, years, teams.
- Org admin dashboard: members, participation rate, average play time, top streaks.
- Org admins can remove members and moderate display names.
- Plans: free (up to 25 members, basic board), paid (unlimited, analytics, branding, challenges).

### 9.2 Rules
- A user can belong to multiple organisations (e.g., college and a side community) but has one primary org for aggregate boards.
- Org data is visible only to org members and admins.

---

## 10. Rewards

### 10.1 Digital streak gifts
| Streak | Reward |
|---|---|
| Day 3 | New avatar or theme |
| Day 7 | Badge + 1 streak freeze |
| Day 14 | Unlock a locked game or higher difficulty |
| Day 30 | Profile frame + title ("Focus Master") + 1 streak freeze |
| Day 100 | Rare cosmetic |

### 10.2 Physical rewards
| Streak | Reward (proposed) |
|---|---|
| 50 days | Sticker pack + branded pen or keychain |
| 100 days | Mug or desk mat |
| 200 days | T-shirt or hoodie |
| 365 days | Premium gift (desk organiser, Bluetooth speaker or trophy plaque) |
| 500 / 1000 days | Engraved trophy + Hall of Fame entry |

### 10.3 Claim flow
1. User reaches a milestone; status becomes **Eligible**.
2. In-app notification and email prompt the user to claim.
3. User submits shipping details (name, address, phone, size if apparel). Address is collected **only at claim time**.
4. System runs automatic checks (valid play time, account verified, no abuse flags).
5. Admin reviews the claim; status becomes **Approved** or **Rejected** (with reason).
6. Admin marks **Shipped** with tracking info; user is notified.
7. **Delivered** or **Returned** is recorded; address data is purged after a retention window (e.g., 90 days).

### 10.4 Reward rules and cost controls
- Eligibility requires a verified email and valid play-time logs for every streak day.
- **Freeze limit for physical rewards (proposed):** at most 3 freezes used inside the qualifying streak; the 365-day tier allows at most 5.
- One physical reward per tier per user (lifetime); the 365-day tier is repeatable yearly (365, 730).
- A **monthly reward budget cap** is set by admin. If exceeded, claims are queued, or the user is offered a digital alternative or delayed shipping.
- Initial shipping region: India only; other regions added by demand. Users outside supported regions receive a digital alternative or a coupon.
- Premium-only for 200+ tiers (proposed) to make high-value gifts self-funding. To be confirmed (section 17).
- Sponsors can fund specific tiers.

---

## 11. Monetisation

### 11.1 Tiers

| | Free | Premium (individual) | Team / College plan |
|---|---|---|---|
| Daily game and streak | Yes | Yes | Yes |
| Free-play library | Core games | All games | All games |
| Global and org leaderboard | Yes | Yes | Yes |
| Streak freezes | Earned only | +1 per month | +1 per month |
| Stats and history | Basic | Full | Full |
| Themes and cosmetics | Limited | Full | Full |
| Ads | Light (optional, v1.2) | None | None |
| Physical rewards | 50 and 100-day | All tiers | All tiers |
| Org dashboard, branding, challenges | No | No | Yes |

### 11.2 Pricing (initial proposal, to test)
- Premium: around ₹99-149/month or ₹799-999/year (about $2-3 per month internationally).
- Student discount: reduced rate with a verified student email.
- Team plan (corporate): per-seat pricing, about $1-2 per seat per month, with a minimum seat count.
- College plan: flat yearly fee per college, with a pilot discount.

### 11.3 Other revenue
- Sponsors fund physical rewards and "daily game presented by" slots.
- Cosmetic packs and single-purchase streak freezes.
- Optional light ads: never during a game round, only between rounds and only on the free tier.

### 11.4 Cost model (indicative)
- Hosting, database, email, analytics: near zero on free tiers, then roughly $25-100/month as usage grows.
- Rewards: the largest variable cost; capped by the monthly budget.

---

## 12. Functional Requirements

### 12.1 Accounts and onboarding
| ID | Requirement | Priority |
|---|---|---|
| FR-01 | Guest can play the first round with no signup | P0 |
| FR-02 | Guest progress converts to an account on signup without losing the streak | P0 |
| FR-03 | Sign in via email magic link and Google | P0 |
| FR-04 | User sets display name, timezone, avatar | P0 |
| FR-05 | User can join an organisation by invite code or link | P0 |
| FR-06 | Account deletion and data export | P1 |

### 12.2 Gameplay
| ID | Requirement | Priority |
|---|---|---|
| FR-10 | Each game runs a 60-second timer with start, pause-on-blur (counts as forfeited time) and end states | P0 |
| FR-11 | Daily featured game with a shared seed | P0 |
| FR-12 | Free-play library with unlimited replays | P0 |
| FR-13 | Server-side validation of every submission | P0 |
| FR-14 | Result screen with score, personal best, rank and streak status | P0 |
| FR-15 | Difficulty adapts to player level | P2 |

### 12.3 Streaks and rewards
| ID | Requirement | Priority |
|---|---|---|
| FR-20 | Streak computed on the server using the user's timezone | P0 |
| FR-21 | Automatic freeze consumption on a missed day | P0 |
| FR-22 | Digital reward unlocks at milestones | P0 |
| FR-23 | Physical reward claim flow (section 10.3) | P0 |
| FR-24 | Admin approve/reject/ship workflow | P0 |
| FR-25 | Streak restore flow after a long break | P2 |

### 12.4 Leaderboards
| ID | Requirement | Priority |
|---|---|---|
| FR-30 | Daily global board per game | P0 |
| FR-31 | Org board per game | P0 |
| FR-32 | Weekly total board | P1 |
| FR-33 | Department / year sub-boards | P1 |
| FR-34 | College-vs-college aggregate board | P1 |
| FR-35 | Username profanity filter and report button | P0 |

### 12.5 Notifications
| ID | Requirement | Priority |
|---|---|---|
| FR-40 | Daily reminder at a user-chosen time (web push and email fallback) | P0 |
| FR-41 | "Streak ends soon" nudge two hours before the day ends | P1 |
| FR-42 | Reward milestone and claim-status emails | P0 |
| FR-43 | Per-channel opt-out and quiet hours | P0 |

### 12.6 Payments
| ID | Requirement | Priority |
|---|---|---|
| FR-50 | Subscription checkout (Razorpay for India, Stripe for international) | P0 |
| FR-51 | Plan management: upgrade, cancel, invoices | P0 |
| FR-52 | Org plan purchase and seat management | P1 |
| FR-53 | Student verification for discounted pricing | P2 |

### 12.7 Admin
| ID | Requirement | Priority |
|---|---|---|
| FR-60 | Manage games, daily schedule and difficulty | P1 |
| FR-61 | View and process reward claims | P0 |
| FR-62 | Manage organisations, members and plans | P1 |
| FR-63 | Review abuse reports and flagged accounts | P1 |
| FR-64 | Monthly reward budget and spend view | P1 |

---

## 13. Non-Functional Requirements

- **Performance:** first game playable in under 3 seconds on a mid-range phone on 4G; game input latency under 100 ms.
- **Availability:** 99.5% target at launch; the leaderboard may degrade gracefully, but streak and score writes must not be lost.
- **Scalability:** designed for 10,000 daily active users on the initial architecture; leaderboard caching introduced beyond that.
- **Security:** row-level security on all user data, rate limiting on score submission, secrets stored server-side only, HTTPS everywhere.
- **Privacy:** minimal data collection; addresses collected only at reward claim and purged afterwards.
- **Accessibility:** WCAG 2.1 AA target, keyboard play, colour-blind-safe, reduced-motion option.
- **Browser support:** latest two versions of Chrome, Safari, Edge, Firefox; iOS Safari 16.4+ for PWA push.
- **Offline:** app shell works offline; plays are queued only for free-play, never for streak-counting daily plays.
- **Localisation:** English at launch; the string layer is built for later translation (Hindi, Marathi, etc.).

---

## 14. Legal, Privacy and Safety

- Privacy policy and terms of service before launch.
- Compliance with India's DPDP Act; GDPR readiness if marketed in the EU.
- **Age:** v1 requires users to be 18+, or 13+ with a college account for students; under-18 school accounts require verifiable parental consent and are deferred to a later release.
- Reward terms: eligibility rules, anti-cheat clause, right to refuse or revoke claims, and region limits.
- Prize-law check: rewards are earned through consistency, not chance or payment, but confirm that a premium-only reward tier doesn't create a contest or lottery issue.
- Moderation: profanity filter on usernames and org names; report and takedown flow.
- Data retention policy for play logs, shipping addresses and deleted accounts.
- Sponsor content must follow an ad and content policy.

---

## 15. Technical Architecture

### 15.1 Stack
| Layer | Choice |
|---|---|
| Frontend | Next.js (App Router) + TypeScript + Tailwind CSS |
| Game UI | React/DOM for most games; Canvas for reflex/animation games |
| State | Zustand |
| Backend | Next.js API routes / server actions; Supabase Edge Functions for score validation |
| Database | Supabase Postgres with row-level security |
| Auth | Supabase Auth (magic link, Google); guest sessions |
| Leaderboards | Postgres indexed tables initially; Upstash Redis sorted sets when load requires |
| PWA | Serwist / next-pwa |
| Push | Web Push (VAPID) with email fallback |
| Jobs | Supabase pg_cron or Vercel Cron |
| Payments | Razorpay (India), Stripe (international) |
| Email | Resend |
| Analytics | PostHog |
| Errors | Sentry |
| Hosting | Vercel + Supabase |

### 15.2 Key design decisions
- **Daily seed:** `seed = HMAC(secret, date + gameId)`. All users get the same puzzle; nothing needs storing; the secret prevents players from pre-computing future puzzles.
- **Server-authoritative scoring:** the client sends moves and answers with timestamps; the server regenerates the puzzle from the seed and recomputes the score. A raw score number from the client is never trusted.
- **Server-side play time:** session start/end is logged on the server; a round is valid only if submission time is within the allowed window plus tolerance.
- **Streak engine:** a nightly job (and a lazy check on login) evaluates each user's local day, applying freezes or resets.
- **Multi-tenancy:** organisation and membership tables with row-level security, so users only see boards for orgs they belong to.
- **Game plugins:** games are lazy-loaded modules behind the common interface (section 7.1).

### 15.3 Data model (core tables)

| Table | Key fields |
|---|---|
| users | id, display_name, email, timezone, avatar, created_at, is_premium, flags |
| organizations | id, name, type, logo, domain, plan, timezone, created_by |
| memberships | user_id, org_id, role, group_id, joined_at |
| org_groups | id, org_id, name, kind (department, year, team) |
| games | id, name, category, active, min_level |
| daily_schedule | date, game_id |
| game_sessions | id, user_id, game_id, mode, seed, started_at, ended_at, valid |
| scores | id, session_id, user_id, game_id, score, date, org_ids |
| play_days | user_id, date, seconds_played, counted |
| streaks | user_id, current, best, last_played_date, freezes_held, freezes_used_in_streak |
| streak_freeze_log | user_id, date, source (earned/used/purchased) |
| rewards | id, tier_days, type (digital/physical), name, active, budget_sku |
| reward_claims | id, user_id, reward_id, status, address (encrypted), tracking, notes, timestamps |
| subscriptions | id, user_id/org_id, plan, provider, status, renews_at |
| reports | id, reporter_id, target_type, target_id, reason, status |
| notifications_prefs | user_id, channel flags, reminder_time, quiet_hours |

---

## 16. Anti-Cheat and Abuse Prevention

- Server recomputes every score from the seed and submitted moves.
- Rate limits on session starts and submissions per user and per IP.
- Impossible-speed detection (inputs faster than human limits, perfect scores repeatedly).
- One account per person: verified email required for rewards; device and IP signals as flags, not auto-bans.
- Physical reward claims always get a manual review in v1.
- Flagged accounts are hidden from public leaderboards pending review.
- Admin tools to revoke scores, streaks or rewards, with an audit log.

---

## 17. Open Questions and Decisions Needed

1. Final MVP games: confirm the four launch games (Mini Sudoku, Make-24, Pattern Recall, Stroop Test).
2. Freezes and physical rewards: confirm the freeze-limit rule for qualifying streaks.
3. Premium-only physical rewards at 200+ days: keep, or open to all?
4. Initial reward budget cap per month and the supplier/fulfilment method.
5. Student verification method (college email domain vs ID upload).
6. Pricing validation: run a small test with students and a pilot company.
7. Whether college-vs-college boards are public or only visible to the participating colleges.
8. Product name and domain.
9. Minimum age policy and whether school accounts are ever supported.
10. Sponsor strategy: outreach timing and what to offer before there are users.

---

## 18. Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Users cheat or farm streaks for physical rewards | Cost and trust loss | Server-side validation, verified email, manual review, budget cap |
| Reward costs scale faster than revenue | Unsustainable | Tier caps, premium gating at high tiers, sponsors, delay or digital fallback |
| Daily habit fades (novelty wears off) | Low retention | Game rotation, weekly challenges, streak freezes, org competition |
| Students won't pay | Low revenue | Free student tier, college plans, sponsors |
| iOS PWA push limits | Weak reminders | Email fallback, home-screen install prompt, native wrapper later |
| Too many games, thin quality | Poor experience | Launch with 4 polished games; add one at a time |
| Data and privacy issues with addresses | Legal risk | Collect late, encrypt, purge, publish a clear policy |
| Offensive usernames or org names | Brand damage | Filter, report flow, admin moderation |
| Solo-developer bandwidth | Delays | Strict MVP scope, reuse the game engine, defer v1.1+ features |

---

## 19. Analytics and Events

**Core events:** `first_play`, `signup`, `round_started`, `round_completed`, `play_day_counted`, `streak_incremented`, `streak_broken`, `freeze_used`, `reward_unlocked`, `reward_claimed`, `org_joined`, `org_created`, `leaderboard_viewed`, `notification_sent`, `notification_opened`, `paywall_viewed`, `subscription_started`, `subscription_cancelled`, `report_submitted`.

**Dashboards:** retention (D1/D7/D30), streak distribution, plays per user per day, game popularity, org participation, funnel from guest to signup to paid, reward cost per claim.

---

## 20. Roadmap

| Phase | Timeline (indicative, solo build) | Deliverables |
|---|---|---|
| 0. Foundations | Weeks 1-2 | Repo, auth, DB schema, game plugin engine, seed generator |
| 1. MVP games | Weeks 3-5 | 4 games, scoring, server validation, result screen |
| 2. Streaks and boards | Weeks 6-7 | Streak engine, freezes, digital rewards, global and org boards |
| 3. Orgs and PWA | Weeks 8-9 | Organisations, invite codes, PWA install, push and email reminders |
| 4. Monetisation | Weeks 10-11 | Premium plans, payments, physical claim flow, admin dashboard |
| 5. Beta | Weeks 12-13 | Pilot with 1-2 colleges and 1 company, fix issues, tune retention |
| 6. Launch | Week 14 | Public launch, outreach to colleges and companies |
| 7. v1.1 | After launch | Team plans, sub-boards, more games, weekly challenges, achievements |

---

## 21. Appendix

### 21.1 Glossary
- **Play day:** a calendar day (user timezone) with at least 60 valid seconds of play.
- **Streak freeze:** a consumable that protects one missed day.
- **Seed:** a deterministic value that generates the same puzzle for everyone on a given day.
- **Org:** a company or college group that shares leaderboards.

### 21.2 Reference summary of decisions so far
- Audience: students and corporate, both.
- Platform: web/PWA first.
- Competition: solo scores and leaderboards, not 1v1.
- Games: variety across puzzle, math, memory, word and reflex.
- Retention: streaks, freezes, digital gifts, and physical rewards at 50/100/200/365+ days.
- Revenue: premium subscription, team and college plans, sponsors, optional light ads.
