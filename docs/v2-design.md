# Fundraiser Tracker v2: Design

**Status:** In progress · **Branch:** `v2` · **Last updated:** Nov 13, 2026

v1 (live, tag `v1.0.0`) tracks fundraisers and individual player deposits and expenses. v2 turns it into a **complete finance tracker for the money held on behalf of players**: every dollar in and out, split across players and teams, reported by season, and provably balanced against the bank statement.

Sections 1–6 describe *what* v2 does and are written for review with the club. Sections 7–10 describe *how* it's built. [Progress](#progress) shows what's done.

---

## 1. Goals

1. **Record all player money in one place:** individual and team income and expenses.
2. **One transactions list** showing everything, with filters and totals.
3. **Season reports:** each season's activity, with balances carried over from earlier seasons.
4. **A balancing matrix** (players × transactions) that balances with itself **and** with the bank statement, viewable in the app and exportable to Excel.
5. **Keep everything v1 does:** parent access and the player balance pages. Fundraisers become team income.

## 2. Key facts about the club's money

- **All money belongs to players.** The club keeps no money of its own: no club cut, no club-paid expenses, no bank fees outside player accounts. Every dollar in the bank belongs to some player.
- Because of that, **the total of all player balances should equal the bank balance**, after accounting for any timing and draft differences (see §5).
- **Completed and Published transactions count** toward balances and reports. Drafts don't.

## 3. Terms

| Term | Meaning |
|---|---|
| **Individual transaction** | Money in or out for **one player**, e.g. a parent deposit or a uniform. |
| **Team transaction** | Money in or out for **several players**, worked out together, e.g. a car wash or a tournament fee. Players are chosen through their teams. |
| **Share** | One player's part of a team transaction. Shares must add up exactly to the team transaction's total. |
| **Money item** | The actual money received or paid for a team transaction, with its own date and payment method (a fundraiser can have several: sales, tips…). |
| **Player ledger** | Each player's list of transactions. **Every balance and report is calculated from it.** An individual transaction is one ledger row; a completed team transaction adds one ledger row per player. |
| **Season** | A named period, such as "Fall 2026", with start and end dates. |
| **Opening / closing balance** | A player's balance at the start / end of a season. |

### The four kinds of transaction

| Kind | Example | Players | Effect on each player |
|---|---|---|---|
| **Individual income** | Parent deposit | 1 | + |
| **Individual expense** | Uniform | 1 | − |
| **Team income** | Fundraiser, sponsor donation | Many (chosen through teams) | + their share |
| **Team expense** | Tournament fee, gym rental | Many (chosen through teams) | − their share |

Each kind is a combination of **direction** (income or expense) and **individual or team**.

## 4. How it works for the admin

### Individual transactions
Recorded in one quick form (player, amount, date, note) and **posted to the player's balance immediately**, like v1 deposits and expenses. (Q5 asks whether they should go through Draft instead.)

### Team transaction lifecycle (same as v1 fundraisers)
```
DRAFT ──complete──► COMPLETED ──publish──► PUBLISHED
  ▲                    │  ▲                   │
  └──────reopen────────┘  └────unpublish──────┘
```
- **Draft:** editable. Doesn't count toward balances or reports.
- **Completed:** locked. Each player's share is added to their ledger. **Counts toward balances and reports**, but parents can't see it yet.
- **Published:** parents can see each player's share.
- **Reopen:** returns it to Draft. The shares are voided in the ledger (kept for history, never deleted). A draft that was completed before can't be deleted, only edited.

### Rules enforced by the app
- **Shares must add up exactly to the total** before completing (in exact cents). The equal-split helper only fills in amounts; the saved per-player amounts are what count.
- **Every included player gets a share, even $0.**
- **Only drafts can be edited.** Status changes are protected against double clicks and simultaneous requests.

### Transactions list
One list of everything, newest first. Team transactions appear **once** (not once per player); click to see the split.
```
Date    Name             Kind                Who                         Amount    Status
Nov 8   Tournament fee   Team expense        U12 Boys, U12 Girls · 20   −$1,000   Draft
Nov 6   Car wash         Team income         U12 Boys · 12              +$840     Published
Nov 5   Uniform          Individual expense  Jane Doe                   −$45      Posted
Nov 2   Deposit          Individual income   John Smith                 +$100     Posted
─────────────────────────────────────────────────────────────────────────────────────────
        Totals (filtered, drafts excluded):   Income +$940 · Expenses −$45 · Net +$895
```
- **Filters:** kind and search (built); season, team, player and status (planned).
- **"New transaction"** offers the four kinds. Individual ones open a quick form; team ones open a full page (details → teams → per-player split).

### Seasons (planned)
- **Assigning a season:** when you create a transaction, the app pre-selects the season whose dates include its date. The admin can change it.
- **Dates outside the season:** the app **warns** (but doesn't block); these appear as timing differences in the reconciliation.
- **Closing a season:** after reconciling, the admin **closes** the season. Closed seasons are read-only. Late corrections go into the current season as a new transaction.
- **Reopening a closed season** is admin-only, behind a confirmation.

## 5. Season reconciliation (planned)

### The matrix
Rows are players. Columns are the season's counted transactions (Completed, Published and posted): one column per team transaction, one per individual transaction.
```
              Opening │ Car wash  Tourn. fee  Jane uniform  John deposit │ Closing
              balance │  Nov 6     Nov 8       Nov 5         Nov 2       │ balance
Jane Doe        +40   │   +70       −50         −45                      │   +15
John Smith      +10   │   +70       −50                       +100       │  +130
...
──────────────────────┼──────────────────────────────────────────────────┼─────────
Total          +500   │  +840     −1,000        −45           +100       │  +395
```
- **Opening balance:** the player's total from all counted transactions in earlier seasons. It's calculated, never typed in.
- **Closing balance:** opening plus this season's transactions. It matches the player's balance page and becomes next season's opening balance.

Because every transaction ends up in the player ledger, the matrix is one query over the ledger, grouped by player and by transaction.

### Internal checks (must all pass)
1. **Each team transaction column** adds up to its total (guaranteed when it's completed).
2. **Each player row's closing balance** equals the player's balance as of season end.
3. **Grand totals match:** the sum of the closing balances equals the opening total plus the sum of all columns.

### Bank check
Because the club holds no money of its own, the matrix's closing total should equal the bank balance at season end, after two kinds of adjustment:
```
Matrix closing total                                  $395
+ Money received for Draft team transactions          $230   e.g. "Spring raffle" (draft): 3 money items
± Timing differences                                   $0    money-item dates outside the season
= Expected bank balance                               $625
  Bank statement balance (entered by admin)           $625   ✅ Balanced
```
If it doesn't balance, the page shows the difference and lists what to investigate.

### Excel export
- **Matrix sheet:** the matrix above, with live `=SUM()` formulas in the total row and column, so the club can verify the totals in Excel independently.
- **Reconciliation sheet:** the bank check, with draft money and timing differences itemized.
- **Transactions sheet:** a flat list of every counted ledger row (date, season, kind, transaction, player, amount), for filtering.

## 6. Out of scope for v2

- **Amount owed / balance due and dues collection tracking** (per-charge paid / partial / unpaid). Planned for later.
- **Earmarked funds** (money usable only for a specific purpose, such as travel).
- **Club or team-owned money.** Not needed, because the club keeps no money.
- **Bank feed or statement import.** The statement balance is entered by hand.

---

## 7. Data model

Two levels: **team transactions** handle the group workflow; the **player ledger** (`PlayerTransaction`) is where every balance comes from.

```prisma
enum TransactionDirection { INCOME EXPENSE }

model TeamTransaction {
  id          String                @id @default(cuid())
  name        String
  description String?
  date        DateTime
  direction   TransactionDirection
  status      TeamTransactionStatus @default(DRAFT) // DRAFT | COMPLETED | PUBLISHED
  teams              TeamTransactionTeam[]          // teams used to choose players
  participants       TeamTransactionParticipant[]   // players (unique per team transaction)
  items              TeamTransactionItem[]          // money received / paid
  playerTransactions PlayerTransaction[]            // ledger rows written on completion
}

model TeamTransactionParticipant { id, teamTransactionId, playerId, shares TeamTransactionShare[] }
model TeamTransactionShare       { id, participantId, amount (positive), status ACTIVE | VOID }
model TeamTransactionItem        { id, teamTransactionId, name, amount (positive), date, paymentMethod, description? }

model PlayerTransaction {                  // the player ledger
  id                String
  playerId          String
  direction         TransactionDirection   // income adds, expense subtracts
  amount            Decimal                // positive
  date              DateTime
  description       String?
  status            TransactionStatus      // INTERNAL (admins only) | PUBLISHED | VOID
  teamTransactionId String?                // null = individual transaction
  shareId           String?
}
```

- **Individual transaction** = a `PlayerTransaction` with no team transaction, saved as `PUBLISHED`.
- **Completing a team transaction** writes one `INTERNAL` ledger row per active share, with the team transaction's direction. Publishing marks them `PUBLISHED`; reopening marks them `VOID`.
- **Deletes are restricted** for players and team transactions that have ledger rows, so money history can't disappear. Deactivate players instead.
- **Still to come:** a `Season` model with `seasonId` on team and player transactions (§9 step 5).

**Transition (until the fundraiser migration):** the v1 `Fundraiser*` models and `PlayerTransaction.type`, `fundraiserId` and `allocationId` still exist and work. Fundraiser ledger rows count as team income. They're removed after step 4.

## 8. Migrating v1 data

**Done:** `PlayerTransaction.direction` was filled in from `type` (`PAYMENT`/`DISTRIBUTION` → income, `EXPENSE` → expense, adjustments by sign) in the `team_transactions` migration. Player balances were verified unchanged on the dev database.

**Next, a one-time script** (dev database first, then production at launch):

| v1 | becomes |
|---|---|
| `Fundraiser` | `TeamTransaction` (direction `INCOME`, same status, date = `startDate`) |
| `FundraiserTeam` | `TeamTransactionTeam` |
| `FundraiserParticipant` + `FundraiserAllocation` | `TeamTransactionParticipant` + `TeamTransactionShare` (void history kept) |
| `FundraiserContribution` | `TeamTransactionItem` |
| `PlayerTransaction.fundraiserId` / `allocationId` | `teamTransactionId` / `shareId` |
| Individual `PlayerTransaction`s | unchanged (they already are individual transactions) |

**Success check:** every player's balance is unchanged, and every team transaction's shares still add up to its items.

## 9. Build order

Each step is one or more commits on `v2`, with tests.

1. ✅ **Ledger direction:** `PlayerTransaction.direction`; balances calculated from it.
2. ✅ **Team transaction schema:** team transactions, shares and money items.
3. ✅ **Transactions page:** one list (kind filter, search, totals); new individual income and expense; team income and expense form with per-player split; team transaction page with complete / publish / unpublish / reopen / edit / delete.
4. **Fundraisers → team transactions:** team transactions with several money items; the migration script above; retire the fundraiser pages and remove the old models and columns.
5. **Seasons:** model, admin page, season on transactions, season filter.
6. **Reconciliation page:** matrix, internal checks and the bank check.
7. **Excel export.**
8. **Closing seasons.**

Also needed before real use: **editing or voiding individual transactions** (today they're final once saved).

## 10. Testing

- **Unit tests:** shares equal the total (exact cents); ledger rows signed by direction; status changes; opening and closing balance carry-over; matrix checks; draft money and timing differences.
- **Permission tests:** every new action and data function added to `test/permissions/`.
- **Migration test:** balances before equal balances after, on a copy of real data.
- **End-to-end** (once a test database exists): create a season → team income and expense → complete → reconcile → close.

---

## Progress

| Step | Status |
|---|---|
| Ledger direction | ✅ Done; dev balances verified unchanged |
| Team transaction schema | ✅ Done |
| Transactions page (list, new individual, new team, team detail) | ✅ Done; workflow verified against the dev database |
| Fundraisers → team transactions | Next |
| Seasons | Waiting on Q1, Q2 |
| Reconciliation, export, closing seasons | After seasons |

---

## Open questions

| # | Question | Why it matters |
|---|---|---|
| Q1 | **Do teams belong to a season?** Do rosters change each season (U12 Boys Fall vs Spring), or are teams permanent? | Decides whether `Team` gets a `seasonId`, and which roster a season report shows. |
| Q2 | **Can seasons overlap** (e.g. a summer league during spring)? | Overlaps make "pre-select season by date" ambiguous and complicate the bank check. |
| Q3 | **Save each season's bank statement balance** when it's closed? (Recommended: yes.) | Keeps past reconciliations on record. |
| Q4 | **Is one column per transaction fine in Excel**, or is a summary grouped by month or category also needed? | A busy season may have 40+ transactions. |
| Q5 | **Should individual transactions go through Draft → Completed**, or stay posted immediately when saved (current behavior)? | Changes the individual form and when they count. |
| Q6 | **A player on two teams in the same team transaction:** one share or two? (Current behavior: one share.) | Affects the split and per-team totals. |
| Q7 | **Should parents see the name of team transactions** (e.g. "Tournament fee") on their player's history? (Current behavior: yes.) | Parent page wording and privacy. |
