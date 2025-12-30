# 011 – Derived views over mutable state

## Status

Accepted

## Context

This system manages multiple mutable entities:

- enrollments (status, access window)
- fee plans (active, superseded, cancelled)
- payments (multiple entries, refunds, failures)

Many useful values in the system are **derived**, such as:

- total paid amount
- pending balance
- fully paid vs partially paid
- current active fee obligation

Storing these derived values directly risks inconsistency when underlying data changes.

---

## Problem

If derived values are stored as mutable columns:

- data can go out of sync
- bugs cause silent corruption
- historical corrections break totals
- refunds require complex mutation logic
- multiple sources of truth emerge

Examples of problematic stored fields:

- `paid_amount`
- `pending_amount`
- `is_fully_paid`
- `outstanding_balance`

Once stored, these fields must be kept in sync forever — which is fragile and error-prone.

---

## Decision

**Derived values must not be stored as mutable state.**

Instead:

- base facts are stored immutably
- derived values are computed using database views
- views act as the single source of truth for aggregates

The system prefers **derivation over mutation**.

---

## What this means in practice

### Base tables store facts

- `payments` store individual ledger entries
- `fee_plans` store contractual terms
- `enrollments` store access rules

These tables change only via explicit actions.

### Derived views compute meaning

- Aggregates are calculated using SQL
- Views join only what is necessary
- Business logic lives close to the data

Example:

- `enrollment_fee_status` view computes:
  - final amount (from active fee plan)
  - total paid (sum of payments)
  - pending balance

No column stores these values permanently.

---

## Benefits of derived views

- Always correct, even after refunds
- Automatically reflect superseded fee plans
- No risk of stale data
- Simple correction model
- Clear separation of facts vs interpretation

Derived views make the system resilient to change.

---

## Consequences

### Positive consequences

- Strong data integrity
- Fewer bugs
- Easier reasoning
- Safer refactors
- Natural support for refunds and adjustments

### Negative consequences

- Slightly more complex SQL
- Requires careful view design
- Some queries are less obvious

These are acceptable trade-offs for correctness.

---

## Alternatives considered

### Alternative 1: Store aggregates in tables

**Rejected because:**

- requires constant synchronization
- breaks under refunds and edits
- introduces race conditions

### Alternative 2: Compute everything in application code

**Rejected because:**

- logic duplicated across services
- harder to secure with RLS
- harder to audit

Database-level views provide a single, authoritative interpretation.

---

## Related Decisions

- ADR 004 – Payments are immutable ledger entries
- ADR 007 – Fee plans are contracts, not prices
- ADR 008 – Payments do not control access

---

## Final Principle

> **Store facts.  
> Derive meaning.**

Never persist what can be safely and deterministically computed.
