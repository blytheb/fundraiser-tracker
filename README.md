# Fundraiser Tracker

A web app for a youth basketball club to track team fundraisers and each player's money. Admins record what a fundraiser raised, split it among the players who took part, and publish the result. Parents log in to see their own children's balances and transaction history.

This branch (`main`) is **v1 (the MVP)** and is what's deployed to production.

---

## Contents

- [Who uses it](#who-uses-it)
- [How the money flows](#how-the-money-flows)
- [The fundraiser lifecycle](#the-fundraiser-lifecycle)
- [Player balances](#player-balances)
- [Pages](#pages)
- [Tech stack](#tech-stack)
- [Project structure](#project-structure)
- [Data model](#data-model)
- [Security model](#security-model)
- [Getting started](#getting-started)
- [Testing](#testing)
- [Deployment](#deployment)
- [Conventions](#conventions)
- [Branches and versions](#branches-and-versions)

---

## Who uses it

Every account has one role:

| Role | Can do |
|---|---|
| `PARENT` | See players they're linked to; request access to other players |
| `ADMIN` | Manage teams, players, fundraisers, users and access requests; see every player |
| `ADMIN_PARENT` | Both of the above, plus a **Parent view** switch in the navbar |

- New sign-ups are always `PARENT`.
- An admin can change any other user's role on the **Users** page. You can't change your own role, and the last admin can't be demoted.
- The **first** admin has to be set directly in the database (see [Getting started](#getting-started)).

A parent only sees a player once they're **linked** to them. A link is created in one of two ways:
1. The parent requests access, and an admin approves the request.
2. An admin assigns the player to the parent on the **Users** page.

---

## How the money flows

```
Teams ──< TeamPlayer >── Players
  │                        │
  └──< FundraiserTeam      │
           │               │
      Fundraiser ──< FundraiserParticipant (one per player)
           │                     │
           │                FundraiserAllocation  (how much this player gets)
           │
      FundraiserContribution  (money raised: sales, tips, event profit…)

On completion, each allocation becomes a PlayerTransaction (DISTRIBUTION)
in that player's ledger, alongside manual deposits and expenses.
```

- **Contributions** record the money a fundraiser brought in, with a source and payment method.
- **Participants** are the players taking part. They're chosen through the fundraiser's teams, and a player can be on several teams.
- **Allocations** say how much of the total each participant gets. Every participant has exactly one active allocation, possibly $0, and the allocations must add up exactly to the total raised.
- **Player transactions** are each player's ledger: deposits, expenses, adjustments and fundraiser distributions. A player's balance is calculated from this ledger.

---

## The fundraiser lifecycle

```
            complete                 publish
  DRAFT ─────────────► COMPLETED ─────────────► PUBLISHED
    ▲                      │  ▲                     │
    │       reopen         │  │      unpublish      │
    └──────────────────────┘  └─────────────────────┘
    ▲                                               │
    └──────────────────── reopen ───────────────────┘
```

| Status | What it means | Parents see it? |
|---|---|---|
| **Draft** | Editable: contributions, teams, participants, allocations | No |
| **Completed** | Numbers are locked. A `DISTRIBUTION` transaction is created for every participant with status `INTERNAL` (visible to admins only) | No |
| **Published** | Those distributions become `PUBLISHED` and count toward each player's balance | Yes |

- **Complete:** requires at least one participant and allocations that add up exactly to the total raised. Anyone without an allocation is given $0.
- **Reopen:** returns the fundraiser to Draft and marks its distributions `VOID`. They're kept for history, never deleted. Completing again creates fresh distributions.
- **Unpublish:** hides the distributions from parents again (`PUBLISHED` → `INTERNAL`) without changing any amounts.
- Only **Draft** fundraisers can be edited. The server enforces this, not just the UI. See [`features/fundraisers/lib/fundraiser-status.ts`](features/fundraisers/lib/fundraiser-status.ts).

---

## Player balances

A balance is calculated from the player's **published** transactions by [`summarizeTransactions`](features/players/lib/summarize-transactions.ts):

| Type | Effect |
|---|---|
| `PAYMENT` (deposit) | adds |
| `DISTRIBUTION` (from a published fundraiser) | adds |
| `EXPENSE` | subtracts |
| `ADJUSTMENT` | adds or subtracts by its own sign |

Balance = money in − money out. All math uses `Prisma.Decimal`, so cents are exact. Admins add deposits and expenses from the admin player page.

---

## Pages

**Admin** (`/admin/...`, requires `ADMIN` or `ADMIN_PARENT`)

| Page | Purpose |
|---|---|
| `/admin/dashboard` | Club stats, fundraiser list with status, pending access requests |
| `/admin/teams`, `/admin/teams/[teamId]` | Teams, rosters, and the fundraisers a team is part of |
| `/admin/players`, `/admin/players/[playerId]` | Players; a player's balance and history, plus a form to add deposits and expenses |
| `/admin/fundraisers`, `/admin/fundraisers/[fundraiserId]` | Fundraisers; the workspace for contributions, roster, allocations and status changes |
| `/admin/users` | Accounts: change roles, link and unlink players |
| `/admin/access-requests` | Approve or reject parent access requests |

**Parent** (`/parent/...`, requires `PARENT` or `ADMIN_PARENT`)

| Page | Purpose |
|---|---|
| `/parent/my-players` | The players this account is linked to |
| `/parent/my-players/[playerId]` | A linked player's balance and history (same view as the admin page, minus the form) |
| `/parent/request-player-access` | Request access to a player, and see the status of past requests |

**Public:** `/` (log in) and `/register`.

---

## Tech stack

| | |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) (App Router, Server Components, Server Actions) and React 19 |
| Language | TypeScript |
| Database | PostgreSQL ([Supabase](https://supabase.com)) via [Prisma 6](https://www.prisma.io) |
| Auth | [Better Auth](https://better-auth.com) (email and password) |
| UI | Tailwind CSS 4, [shadcn/ui](https://ui.shadcn.com) on [Base UI](https://base-ui.com), [Sonner](https://sonner.emilkowal.ski) toasts, lucide icons |
| Tests | [Vitest](https://vitest.dev) and Testing Library |
| Hosting | [Vercel](https://vercel.com) |

> **Note:** this Next.js version has breaking changes from older versions. Read the guides in `node_modules/next/dist/docs/` before changing framework-level code (see [`AGENTS.md`](AGENTS.md)).

---

## Project structure

```
app/                     Routes (pages and layouts)
  admin/                 Admin pages; layout.tsx requires an admin
  parent/                Parent pages; layout.tsx requires parent access
  api/auth/[...all]/     Better Auth endpoint
components/
  ui/                    shadcn/ui primitives
  forms/, dialogs/       Feature forms and dialogs (client components)
  reusable/              Navbars, PageHeader, SearchBar, FundraiserStatusBadge…
features/<feature>/      One folder per feature (fundraisers, players, teams, users, player-access, dashboard)
  actions/               Server actions (writes); each returns an ActionResult
  data/                  Data functions (reads); called from server components
  lib/                   Feature logic (e.g. fundraiser-status, summarize-transactions)
  *.tsx                  Feature components
lib/
  permissions.ts         requireUser / requireAdmin / requireParentAccess
  action-result.ts       runAction() and the ActionResult type
  format.ts              formatCurrency, formatDate
  labels.ts              Display labels for enum values
  auth.ts, prisma.ts     Better Auth and Prisma clients
prisma/
  schema.prisma          Database schema
  migrations/            Migration history
test/                    Vitest tests (setup.ts, helpers/, and tests by feature)
```

---

## Data model

The main models in [`prisma/schema.prisma`](prisma/schema.prisma):

| Model | Purpose |
|---|---|
| `User`, `Session`, `Account`, `Verification` | Better Auth tables. `User.role` is `PARENT`, `ADMIN` or `ADMIN_PARENT` |
| `Player`, `Team`, `TeamPlayer` | Players and teams (many-to-many) |
| `Fundraiser` | Name, date, `status` (`DRAFT`, `COMPLETED`, `PUBLISHED`) |
| `FundraiserTeam` | Teams attached to a fundraiser |
| `FundraiserParticipant` | Players in a fundraiser (unique per fundraiser and player) |
| `FundraiserContribution` | Money raised: amount, source, payment method, date |
| `FundraiserAllocation` | Amount per participant; `ACTIVE` or `VOID` (old versions are kept) |
| `PlayerTransaction` | A player's ledger: `type` (`PAYMENT`, `EXPENSE`, `ADJUSTMENT`, `DISTRIBUTION`) and `status` (`INTERNAL`, `PUBLISHED`, `VOID`) |
| `ParentPlayerLink` | Which parent accounts can see which players |
| `PlayerAccessRequest` | Parent requests: `PENDING`, `APPROVED`, `REJECTED`, `CANCELLED` |

Money is stored as `Decimal(10, 2)`.

---

## Security model

Access is checked on the **server**, close to the data. Hiding buttons in the UI is never the only protection.

- **Every server action and data function** starts with a check from [`lib/permissions.ts`](lib/permissions.ts) (`requireAdmin()`, `requireParentAccess()` or `requireUser()`). Unauthorized users are redirected to `/`. The session lookup is cached once per request.
- **Player data** goes through [`requirePlayerAccess`](features/players/lib/require-player-access.ts). Admin pages allow any player; the parent view requires a parent link for everyone, including `ADMIN_PARENT` accounts.
- **Layouts** (`app/admin/layout.tsx`, `app/parent/layout.tsx`) also check the role, but Next.js layouts don't re-run on every navigation, so they aren't relied on alone.
- **Fundraiser edits** are refused unless the fundraiser is a Draft. Status changes use a conditional update that locks the row, so double clicks and simultaneous requests can't create duplicate distributions.

---

## Getting started

**Prerequisites:** Node.js 20+ and a PostgreSQL database (a free Supabase project works).

```bash
git clone https://github.com/blytheb/fundraiser-tracker.git
cd fundraiser-tracker
npm install
```

Create `.env` in the project root. It's gitignored, so never commit it.

```bash
# Supabase: pooled connection for the app, direct connection for migrations
DATABASE_URL="postgresql://USER:PASSWORD@HOST:6543/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://USER:PASSWORD@HOST:5432/postgres"

# Better Auth
BETTER_AUTH_URL="http://localhost:3000"
BETTER_AUTH_SECRET="a-long-random-string"   # e.g. `openssl rand -base64 32`
```

Set up the database and start the app:

```bash
npx prisma migrate deploy   # apply all migrations
npm run dev                 # http://localhost:3000
```

**Create the first admin:**
1. Register an account at `/register`. It starts as a `PARENT`.
2. Promote it in the database, either with Prisma Studio (`npx prisma studio`) or with SQL:
   ```sql
   UPDATE "User" SET role = 'ADMIN_PARENT' WHERE email = 'you@example.com';
   ```
3. Log out and back in.

From then on, admins can promote other users from the **Users** page.

**Scripts**

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | `prisma generate`, then a production build |
| `npm run start` | Run the production build |
| `npm run lint` | ESLint |
| `npm run type-check` | TypeScript check (`tsc --noEmit`) |
| `npm test` / `npm run test:run` | Vitest in watch mode / a single run |

---

## Testing

```bash
npm run test:run                 # all tests
npx vitest run --coverage        # with a coverage report
```

- The tests **mock Prisma**, so they never touch a database.
- [`test/setup.ts`](test/setup.ts) replaces auth with a fake that follows the real role rules. Tests choose who's logged in with helpers from [`test/helpers/auth.ts`](test/helpers/auth.ts):
  ```ts
  asAdmin(); asParent(); asAdminParent(); asLoggedOut();
  await expectRedirect(() => someAdminAction()); // access was blocked
  ```
- [`test/permissions/`](test/permissions) checks that every admin action and data function blocks the wrong roles. **When you add an action, add it to that table.**
- Money logic (`summarizeTransactions`, the allocation and completion actions) has focused unit tests, including exact-cents cases.

---

## Deployment

Production deploys from **`main`** on Vercel. Every pull request also gets a preview deployment.

**Vercel environment variables:** `DATABASE_URL`, `DIRECT_URL`, `BETTER_AUTH_URL` (the full `https://` production URL) and `BETTER_AUTH_SECRET`. If you use preview deployments, add their URLs to `trustedOrigins` in [`lib/auth.ts`](lib/auth.ts), with no trailing slash.

**Database migrations aren't applied by the build.** After merging a change to `prisma/schema.prisma`, apply it to production yourself:
```bash
DATABASE_URL="<production url>" DIRECT_URL="<production direct url>" npx prisma migrate deploy
```
If production errors mention a missing column or an invalid enum value, a migration probably wasn't applied.

**Images:** `next.config.ts` only allows remote images from `robohash.org`. Add other hosts to `images.remotePatterns` if player photos come from elsewhere.

---

## Conventions

- **Server actions return results, not errors.** Wrap the body in `runAction()` and `throw new Error("Friendly message")` for expected failures. The client checks the result and shows a toast:
  ```ts
  const result = await someAction(args);
  if (!result.ok) return toast.error(result.error);
  toast.success("Saved");
  ```
  Next.js hides thrown error messages in production, so returning them is the only way users see them. `redirect()` from the permission checks still works inside `runAction`.
- **Money:** keep `Prisma.Decimal` on the server and convert to `number` only when passing data to client components. Never return a `Decimal` from a server action.
- **Fundraiser edits:** call `assertDraft(tx, id)` inside `prisma.$transaction`. For status changes, use `claimStatus(...)`.
- **Display:** use `formatCurrency` and `formatDate` from `lib/format.ts`, and the label maps in `lib/labels.ts`, instead of formatting inline.
- **Dates** are formatted in UTC, so server and browser output match and date-only values don't shift a day.

---

## Branches and versions

- **`main`**: v1, the live MVP. Keep it deployable. Only bug fixes go here, through pull requests.
- **`v2`**: the next version (shared income and expenses split across teams), developed separately. Bug fixes from `main` are merged into `v2` regularly.
- Releases are tagged (`v1.0.0`, …) so any deployed version can be found and rebuilt.
