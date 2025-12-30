# 008 – Payments do not control access

## Status

Accepted

## Context

This platform supports multiple real-world enrollment scenarios:

- offline admissions
- partial payments
- delayed payments
- scholarships
- internal enrollments
- trials and temporary access
- refunds and reversals

In such environments, payment status and access status often diverge.

If access is tied directly to payments, the system becomes fragile and
incapable of handling real operational workflows.

---

## Problem

If payments control access:

- a delayed payment can incorrectly block a student
- partial payments create unclear access rules
- refunds may unintentionally revoke access
- offline workflows become impossible
- admins are forced into unsafe manual overrides

This creates:

- complex conditional logic
- inconsistent student experiences
- frequent production bugs
- poor auditability

Access becomes an emergent side-effect instead of a deliberate decision.

---

## Decision

**Payments do not grant, revoke, or modify access.**

Access is controlled exclusively by:

- enrollment
- enrollment status
- explicit access window (`access_starts_at`, `access_ends_at`)

Payments are strictly financial records and have **no authority over access**.

---

## What this means in practice

### Enrollment

- Is the single source of truth for access
- Determines:
  - whether a student can attend
  - when access starts
  - when access ends
- Can exist with or without payments

### Payments

- Record money received or refunded
- May be:
  - partial
  - delayed
  - failed
  - reversed
- Do not affect enrollment status

### Fee plans

- Define financial obligation
- Do not grant access
- Do not revoke access

---

## Example scenarios

### Scenario 1 – Offline admission

- Student is enrolled
- Access starts immediately
- Payment is collected later
- Access remains uninterrupted

### Scenario 2 – Partial payment

- Student pays part of the fee
- Access continues
- Remaining balance is tracked financially
- No access toggling occurs

### Scenario 3 – Refund

- Payment is refunded
- Enrollment remains valid
- Admin explicitly decides if access should change

---

## Consequences

### Positive consequences

- Simple and predictable access logic
- Flexible financial workflows
- Clear admin responsibility
- No accidental access revocation
- Easy support for future features
- Strong auditability

### Negative consequences

- Requires explicit admin decisions
- No “automatic” enforcement via payments

This is intentional.  
Access decisions must be explicit, not implicit.

---

## Alternatives considered

### Alternative 1: Payment-gated access

**Rejected because:**

- too rigid
- fails offline-first use cases
- causes cascading bugs

### Alternative 2: Hybrid logic (payments + enrollment)

**Rejected because:**

- unclear source of truth
- complex edge cases
- difficult to reason about

---

## Related Decisions

- ADR 001 – Enrollment controls access
- ADR 002 – Payments reference enrollment, not fee plan
- ADR 007 – Fee plans are contracts, not prices

---

## Final Principle

> **Access is a policy decision, not a financial side-effect.**

Money informs decisions —  
it never makes them automatically.
