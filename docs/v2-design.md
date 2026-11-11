# Fundraiser Tracker v2: Design

**Status:** Draft for review · **Branch:** `v2` · **Last updated:** Nov 10, 2026

v1 (live, tag `v1.0.0`) tracks fundraisers and individual player deposits and expenses. v2 turns it into a **complete finance tracker for the money held on behalf of players**: every dollar in and out, split across players and teams, reported by season, and provably balanced against the bank statement.

Sections 1–6 describe *what* v2 does and are written for review with the club. Sections 7–10 describe *how* it's built.

---

## 1. Goals

1. **Record all player money in one place:** individual and team income and expenses.
2. **One finances list** showing every entry, with filters and totals.
3. **Season reports:** each season's activity, with balances carried over from earlier seasons.
4. **A balancing matrix** (players × entries) that balances with itself **and** with the bank statement, viewable in the app and exportable to Excel.
5. **Keep everything v1 does:** the fundraiser workflow, parent access, and the player balance pages.

## 2. Key facts about the club's money

- **All money belongs to players.** The club keeps no money of its own: no club cut, no club-paid expenses, no bank fees outside player accounts. Every dollar in the bank belongs to some player.
- Because of that, **the total of all player balances should equal the bank balance**, after accounting for any timing and draft differences (see §5).
- **Completed and Published entries count** toward balances and reports. Drafts don't.

## 3. Terms

| Term | Meaning |
|---|---|
| **Entry** | One financial event, such as "Car wash", "Tournament fee" or "Jane's uniform". Shown as one row in the finances list. |
| **Line** | One player's share of an entry. An individual entry has one line; a team entry has many. |
| **Money movement** | Actual money in or out of the bank for an entry: a fundraiser's contributions, an expense's payments. Each has its own date and payment method. |
| **Season** | A named period, such as "Fall 2026", with start and end dates. Every entry belongs to exactly one season. |
| **Opening / closing balance** | A player's balance at the start / end of a season. |

### The four kinds of entry

| Kind | Example | Lines | Effect on players |
|---|---|---|---|
| **Individual income** | Parent deposit | 1 player | + |
| **Individual expense** | Uniform for one player | 1 player | − |
| **Team income** (shared) | Fundraiser, sponsor donation | Many players (chosen through teams) | + per share |
| **Team expense** (shared) | Tournament fee, gym rental | Many players (chosen through teams) | − per share |

Technically, each kind is a combination of **direction** (income or expense) and **scope** (individual or shared).

## 4. How it works for the admin

### Entry lifecycle (same as v1 fundraisers)
```
DRAFT ──complete──► COMPLETED ──publish──► PUBLISHED
  ▲                    │  ▲                   │
  └──────reopen────────┘  └────unpublish──────┘
```
- **Draft:** editable. Doesn't count toward balances or reports.
- **Completed:** locked. **Counts toward balances and reports**, but parents can't see it yet.
- **Published:** parents can see it.
- **Reopen:** returns the entry to Draft. Its effect on player ledgers is voided (kept for history, never deleted).
- **Individual entries** may skip straight to Published when saved, as v1 deposits and expenses do today (open question Q5).

### Rules enforced by the app
- **An entry's lines must add up exactly to its money movements** before it can be completed. For example, a $1,000 tournament fee must be split into shares totaling $1,000. Splitting helpers (equal split, by team, custom amounts) only fill in amounts; the saved per-player amounts are what count.
- **Every participant in a shared entry gets a line, even $0** (same as v1).
- **Only Draft entries can be edited.** Status changes are protected against double clicks and simultaneous requests (same as v1).

### Finances list
One list of every entry, newest first.
```
Date    Name             Kind                Who                         Amount    Status
Nov 8   Tournament fee   Team expense        U12 Boys, U12 Girls · 20   −$1,000   Draft
Nov 6   Car wash         Team income         U12 Boys · 12              +$840     Published
Nov 5   Uniform          Individual expense  Jane Doe                   −$45      Published
Nov 2   Deposit          Individual income   John Smith                 +$100     Published
─────────────────────────────────────────────────────────────────────────────────────────
        Totals (filtered):   Income +$940 · Expenses −$1,045 · Net −$105
```
- **Filters:** season, kind, team, player, status, search.
- **"New entry"** asks for the kind, then opens the matching form.
- **Clicking a row:** a team entry opens its workspace (contributions or costs, roster, split, status); an individual entry opens its detail.

### Seasons
- **Assigning a season:** when you create an entry, the app pre-selects the season whose dates include the entry's date. The admin can change it.
- **Dates outside the season:** the app **warns** (but doesn't block) when an entry or money-movement date falls outside its season; these appear as timing differences in the reconciliation.
- **Closing a season:** after reconciling, the admin **closes** the season. Closed seasons are read-only: no new, edited, reopened or voided entries. Late corrections go into the current season as an adjustment entry.
- **Reopening a closed season** is admin-only, behind a confirmation.

## 5. Season reconciliation

### The matrix
Rows are players and columns are the season's counted entries (Completed and Published).
```
              Opening │ Car wash  Tourn. fee  Jane uniform  John deposit │ Closing
              balance │  Nov 6     Nov 8       Nov 5         Nov 2       │ balance
Jane Doe        +40   │   +70       −50         −45                      │   +15
John Smith      +10   │   +70       −50                       +100       │  +130
...
──────────────────────┼──────────────────────────────────────────────────┼─────────
Total          +500   │  +840     −1,000        −45           +100       │  +395
```
- **Opening balance:** the player's total from all counted entries in earlier seasons. It's calculated, never typed in.
- **Closing balance:** opening plus this season's entries. It matches the player's balance page and becomes next season's opening balance.

### Internal checks (must all pass)
1. **Each entry column** adds up to that entry's total.
2. **Each player row's closing balance** equals the player's balance as of season end.
3. **Grand totals match:** the sum of the closing balances equals the opening total plus the sum of all entry totals.

### Bank check
Because the club holds no money of its own, the matrix's closing total should equal the bank balance at season end, after two kinds of adjustment:
```
Matrix closing total                                  $395
+ Money received for Draft entries                    $230   e.g. "Spring raffle" (draft): 3 contributions
± Timing differences                                   $0    money-movement dates outside the season
= Expected bank balance                               $625
  Bank statement balance (entered by admin)           $625   ✅ Balanced
```
If it doesn't balance, the page shows the difference and lists what to investigate.

### Excel export
- **Matrix sheet:** the matrix above, with live `=SUM()` formulas in the total row and column, so the club can verify the totals in Excel independently.
- **Reconciliation sheet:** the bank check, with draft money and timing differences itemized.
- **Entries sheet:** a flat list of every counted entry and line (date, season, kind, player, amount), for filtering.

## 6. Out of scope for v2

- **Amount owed / balance due and dues collection tracking** (per-charge paid / partial / unpaid). Planned for later. v2's model leaves room for it: a payment can later be linked to a charge line.
- **Earmarked funds** (money usable only for a specific purpose, such as travel).
- **Club or team-owned money.** Not needed, because the club keeps no money.
- **Bank feed or statement import.** The statement balance is entered by hand.

---

## 7. Data model

New and changed models (Prisma, summarized):

```prisma
model Season {
  id        String       @id @default(cuid())
  name      String       // "Fall 2026"
  startDate DateTime
  endDate   DateTime
  status    SeasonStatus @default(OPEN)    // OPEN | CLOSED
  bankStatementBalance Decimal? @db.Decimal(10, 2) // saved when closed (Q3)
  closedAt  DateTime?
  entries   Entry[]
}

model Entry {                              // replaces Fundraiser
  id          String         @id @default(cuid())
  name        String
  description String?
  date        DateTime
  seasonId    String
  direction   EntryDirection               // INCOME | EXPENSE
  scope       EntryScope                   // INDIVIDUAL | SHARED
  status      EntryStatus    @default(DRAFT) // DRAFT | COMPLETED | PUBLISHED
  teams       EntryTeam[]                  // shared entries: teams used to choose participants
  lines       EntryLine[]
  movements   MoneyMovement[]
}

model EntryLine {                          // replaces FundraiserParticipant + FundraiserAllocation
  id       String  @id @default(cuid())
  entryId  String
  playerId String
  amount   Decimal @db.Decimal(10, 2)      // always positive; direction comes from the entry
  status   LineStatus @default(ACTIVE)     // ACTIVE | VOID (history kept)
  @@index([entryId, playerId])
}

model MoneyMovement {                      // replaces FundraiserContribution; also expense payments
  id            String   @id @default(cuid())
  entryId       String
  amount        Decimal  @db.Decimal(10, 2)
  date          DateTime                   // the date money hit or left the bank
  paymentMethod PaymentMethod
  source        String?                    // income: SALES / TIPS…; expense: vendor or category
  description   String?
}
```

- **The player ledger (`PlayerTransaction`)** stays as the record of what affects each balance. Completing an entry writes one transaction per active line, signed by direction, with an `entryId` pointing back. Reopening voids them. `summarizeTransactions` and the player pages keep working.
- **Season rules** are enforced in shared helpers (like v1's `assertDraft` and `claimStatus`): `assertSeasonOpen(tx, seasonId)` runs before any entry change.
- **Teams:** depends on Q1 (whether teams belong to a season).

## 8. Migrating v1 data

A one-time script (run on the dev database first, then production at launch):

| v1 | becomes |
|---|---|
| `Fundraiser` | `Entry` (scope `SHARED`, direction `INCOME`, same status, date = `startDate`) |
| `FundraiserParticipant` + active `FundraiserAllocation` | `EntryLine` |
| `FundraiserContribution` | `MoneyMovement` |
| Manual `PlayerTransaction` (`PAYMENT` / `EXPENSE` / `ADJUSTMENT`) | an individual `Entry` with one line, linked to the existing transaction |
| (none) | One or more `Season`s covering existing dates; every migrated entry is assigned by date |

**Success check:** after migration, every player's balance is unchanged, and each season's matrix passes the internal checks.

## 9. Suggested build order

Each step is one or more small pull requests into `v2`, with tests.

1. **Seasons:** model, admin page to create and edit seasons, and `assertSeasonOpen`.
2. **Entry model and migration:** add the new tables, the migration script, and switch fundraiser pages to read from `Entry`. No new features yet; everything should look the same.
3. **Team expenses:** direction `EXPENSE`, costs as money movements, completion writes expense ledger rows.
4. **Individual entries as entries:** deposits and expenses created through the entry model.
5. **Finances list:** one list with filters and totals.
6. **Reconciliation page:** matrix, internal checks and the bank check.
7. **Excel export.**
8. **Closing seasons.**

## 10. Testing

- **Unit tests:** line totals equal movement totals; opening and closing balance carry-over; matrix checks; draft money and timing differences.
- **Permission tests:** every new action added to `test/permissions/admin-actions.test.ts`.
- **Migration test:** balances before equal balances after, on a copy of real data.
- **End-to-end** (once a test database exists): create a season → team income and expense → complete → reconcile → close.

---

## Open questions

| # | Question | Why it matters |
|---|---|---|
| Q1 | **Do teams belong to a season?** Do rosters change each season (U12 Boys Fall vs Spring), or are teams permanent? | Decides whether `Team` gets a `seasonId`, and which roster a season report shows. |
| Q2 | **Can seasons overlap** (e.g. a summer league during spring)? | Overlaps make "pre-select season by date" ambiguous and complicate the bank check. |
| Q3 | **Save each season's bank statement balance** when it's closed? (Recommended: yes.) | Keeps past reconciliations on record. |
| Q4 | **Is one column per entry fine in Excel**, or is a summary grouped by month or category also needed? | A busy season may have 40+ entries. |
| Q5 | **Should individual entries go through Draft → Completed**, or be completed immediately when saved, like v1 deposits? | Changes the individual entry form and when entries count. |
| Q6 | **A player on two teams in the same team entry:** one share or two? (Current assumption: one share.) | Affects the split helpers and the per-team totals. |
| Q7 | **Should parents see the name of team entries** (e.g. "Tournament fee") on their player's history? (Current assumption: yes.) | Parent page wording and privacy. |
