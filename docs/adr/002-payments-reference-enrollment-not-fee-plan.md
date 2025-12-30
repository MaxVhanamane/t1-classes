# 002 – Payments reference enrollment, not fee plan

## Status

Accepted

## Background / Context

In this system, financial modeling is intentionally separated into:

- **Enrollment** → who gets access
- **Fee plan** → what the student is expected to pay
- **Payment** → money that was actually received or refunded

A single enrollment can have:

- multiple fee plans over time
- edits before payment
- superseded plans after partial payments
- cancellations
- refunds

However, **payments are permanent financial records** and must remain valid
even when fee plans change.

---

## Problem

If payments reference a specific fee plan directly:

- Superseding a fee plan breaks historical references
- Editing a fee plan creates ambiguity:
  - “Which version did this payment belong to?”
- Cancelling a fee plan creates orphaned payments
- Partial payments across fee plan changes become hard to reason about
- Accounting queries become complex and error-prone

In short:

> **Fee plans are mutable. Payments must not depend on mutable entities.**

---

## Decision

**Payments reference `enrollment_id`, not `fee_plan_id`.**

Specifically:

- Payments are always attached to the enrollment lifecycle
- Fee plans define expected amounts but are not payment owners
- Payment records remain stable regardless of fee plan changes

The relationship is:
Enrollment
├── Fee plans (mutable, historical)
└── Payments (immutable ledger)

---

## What this means in practice

- A payment remains valid even if:
  - the fee plan is edited
  - the fee plan is superseded
  - the fee plan is cancelled
- The system can always answer:
  - “How much was paid for this enrollment?”
- Fee plans can evolve without touching payment history
- Refunds and adjustments stay clean and auditable

The active fee plan determines:

- how much _should_ be paid

Payments determine:

- how much _was_ paid

The comparison happens via a **derived view**, not direct references.

---

## Consequences (Trade-offs)

### Positive consequences

- Payments form a clean, immutable ledger
- Fee plan lifecycle is flexible and safe
- No migrations needed when fee plans change
- Supports:
  - partial payments
  - refunds
  - offline-first workflows
- Accounting logic becomes simpler and more reliable

### Negative consequences

- Payments cannot automatically “belong” to a specific fee plan version
- Developers must use derived views to compute outstanding balances

These trade-offs are intentional and acceptable for financial correctness.

---

## Alternatives considered

### Alternative 1: Payments reference fee_plan_id

**Rejected because:**

- fee plans are editable and supersedable
- creates broken references
- complicates refunds and adjustments
- requires data migrations on structural changes

### Alternative 2: Payments reference both enrollment and fee plan

**Rejected because:**

- introduces dual sources of truth
- creates ambiguity when fee plans change
- adds complexity without real benefit

---

## Related Decisions

- ADR 001 – Enrollment controls access
- ADR 003 – Fee plans are immutable after payments exist (planned)

---

## Final Principle

> **Payments belong to the enrollment lifecycle, not to a specific fee plan version.**

This principle ensures financial records remain stable, auditable,
and future-proof.
