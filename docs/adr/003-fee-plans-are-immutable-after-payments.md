# 003 – Fee plans are immutable after payments exist

## Status

Accepted

## Background / Context

In this system, a **fee plan represents a financial agreement** for an enrollment.
It defines:

- total amount
- discounts
- final payable amount
- effective date

Payments, on the other hand, represent **actual money movement** and form an
immutable financial ledger.

Once a payment is recorded, it becomes part of the institute’s official
financial history and must remain traceable and auditable.

---

## Problem

If a fee plan could be edited after payments exist:

- Historical meaning of payments becomes unclear
- The same payment could appear to “apply” to different agreements
- Auditors and admins cannot reconstruct what was agreed at the time of payment
- Refund calculations become unreliable
- Silent financial mutations can occur without trace

In short:

> **Editing a contract after money has been exchanged corrupts history.**

---

## Decision

**Fee plans become immutable once any payment exists for the enrollment.**

Specifically:

- If no payments exist:
  - fee plans may be edited or cancelled
- If payments exist:
  - fee plans cannot be edited
  - fee plans cannot be cancelled
  - changes must be done via **superseding**

Superseding creates a new fee plan and preserves the old one as historical
record.

---

## What this means in practice

- Every payment can be traced back to a specific agreement state
- Historical fee plans remain readable and untouched
- Changes to pricing are explicit and intentional
- Admins must acknowledge that a financial change is being made

The lifecycle becomes:

No payment yet
→ Edit / Cancel allowed

Payment exists
→ Supersede only

---

## Consequences (Trade-offs)

### Positive consequences

- Strong financial auditability
- Clear historical trail of agreements
- Safe handling of partial payments and refunds
- Prevents accidental or silent financial changes
- Aligns with real-world accounting principles

### Negative consequences

- Requires additional UI and logic (supersede flow)
- Admins must understand the difference between edit and supersede

These trade-offs are intentional and acceptable.

---

## Alternatives considered

### Alternative 1: Allow editing fee plans after payments

**Rejected because:**

- breaks financial traceability
- creates ambiguity in historical records
- unsafe for refunds and reporting

### Alternative 2: Automatically adjust old payments to new fee plan

**Rejected because:**

- silently mutates financial history
- extremely dangerous in accounting systems
- difficult to audit or explain

---

## Related Decisions

- ADR 001 – Enrollment controls access
- ADR 002 – Payments reference enrollment, not fee plan

---

## Final Principle

> **Once money is recorded, the agreement that justified it must never change.**

All future changes must be explicit and additive, not mutative.
