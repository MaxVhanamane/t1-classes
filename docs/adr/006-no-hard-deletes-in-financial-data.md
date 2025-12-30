# 006 – No hard deletes in financial data

## Status

Accepted

## Context

This system handles financial records such as:

- payments
- refunds
- fee plans
- financial adjustments (future)

Financial data must remain:

- auditable
- traceable
- historically correct

In real-world education and accounting systems:

- mistakes happen
- refunds happen
- corrections happen
- people leave the organization

Deleting financial records creates irreversible loss of information and breaks trust in the system.

---

## Problem

If financial records are hard-deleted:

- Audit trails are broken
- Totals and reports become unreliable
- Historical discrepancies cannot be explained
- Legal and compliance requirements may be violated
- Bugs or admin mistakes become unrecoverable

Even “safe” deletes like:

- deleting a wrong payment
- deleting a cancelled fee plan
  are dangerous in financial systems.

Once money is involved, **history must be preserved**.

---

## Decision

**Financial data is never hard-deleted.**

Instead:

- Records are retained permanently
- State is changed via explicit status fields
- Corrections are represented as new records, not mutations

Specifically:

- Payments are immutable ledger entries
- Refunds are recorded as separate negative payments
- Fee plans are cancelled or superseded, never deleted

---

## What this means in practice

### Payments

- No DELETE operations
- Mistakes are corrected by:
  - refunds
  - reversal entries
  - adjustment records (future)
- Original records always remain

### Fee plans

- Old plans are:
  - `cancelled` or `superseded`
- Historical plans remain visible in history
- Exactly one active fee plan exists at a time

### UI behavior

- “Delete” buttons do not exist
- Admin actions are explicit and intentional:
  - cancel
  - supersede
  - refund
- History is always visible

---

## Consequences

### Positive consequences

- Full audit trail preserved
- Financial reports remain consistent
- Admin mistakes are reversible without data loss
- Aligns with real accounting systems
- Safe for long-term institutional use

### Negative consequences

- Tables grow larger over time
- Requires careful UI design to avoid clutter

These are acceptable and expected trade-offs for financial correctness.

---

## Alternatives considered

### Alternative 1: Allow hard deletes for admins

**Rejected because:**

- too easy to misuse
- impossible to audit after the fact
- encourages silent data loss

### Alternative 2: Soft deletes with `deleted_at`

**Rejected for financial data because:**

- hides records instead of preserving meaning
- still removes entries from most queries
- unclear financial impact

Explicit status changes are clearer and safer.

---

## Related Decisions

- ADR 004 – Payments are immutable ledger entries
- ADR 005 – Snapshot user data in financial records

---

## Final Principle

> **Financial history is sacred.**

Corrections are additive.  
State changes are explicit.  
Nothing is erased.
