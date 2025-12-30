# 001 – Enrollment controls access

## Status

Accepted

## Background / Context

This platform is designed for an India-focused coaching institute where:

- Admissions can happen **offline or online**
- Payments may be:
  - delayed
  - partial
  - waived (scholarships)
  - trial-based
  - refunded later
- Admins may grant access **before** money is collected
- Some students may attend classes while fees are still pending

In such environments, **payment status is not a reliable signal for access**.

If access were tied directly to payments, the system would fail in common real-world cases like:

- a student admitted on promise-to-pay
- a scholarship student with zero fees
- a trial student attending for a week
- an internal / complimentary enrollment
- offline payments that are recorded later

This creates both operational friction and data inconsistencies.

---

## Problem

If course or batch access is controlled by payment state:

- Access logic becomes complex and fragile
- Admins are forced to “hack” the system
- Legitimate students can be blocked unintentionally
- Refunds and reversals can accidentally revoke access
- Financial workflows and academic workflows become tightly coupled

This is especially problematic in offline-first institutions where
**operations do not happen in a strict order**.

---

## Decision

**Enrollment is the single source of truth for access.**

Specifically:

- A student gets access when an **enrollment exists**
- Access is governed by:
  - enrollment status
  - access start and end dates
- Payments:
  - do NOT grant access
  - do NOT revoke access
  - do NOT modify enrollment state

Payments exist purely to record money movement, not permissions.

---

## What this means in practice

- A student can be enrolled without any payment
- A student can continue access even if fees are pending
- Cancelling or refunding a payment does NOT affect access
- Access revocation is an explicit enrollment action, not a side-effect

This keeps:

- academic rules clear
- financial rules independent
- admin actions intentional and auditable

---

## Consequences (Trade-offs)

### Positive consequences

- Clean separation of concerns:
  - Enrollment = access
  - Fee plan = financial contract
  - Payment = money received
- Supports real-world workflows naturally
- Prevents accidental access loss
- Makes refunds and adjustments safe
- Easier to reason about permissions

### Negative consequences

- Requires admins to explicitly manage enrollment lifecycle
- Requires UI to clearly show access vs payment status separately

These trade-offs are intentional and acceptable for this domain.

---

## Alternatives considered

### Alternative 1: Payment-gated access

Access is granted only after full payment.

**Rejected because:**

- breaks scholarships and trials
- incompatible with offline payments
- causes frequent admin overrides
- tightly couples money with permissions

### Alternative 2: Partial payment-based access

Access depends on percentage paid.

**Rejected because:**

- complex to explain
- hard to enforce consistently
- creates edge cases during refunds and adjustments

---

## Final Principle

> **Access is an academic decision, not a financial side-effect.**

This principle applies across the entire system and should not be violated
without a deliberate architectural change.
