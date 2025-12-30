# 010 – Offline-first system design

## Status

Accepted

## Context

This platform is designed primarily for Indian coaching institutes where:

- admissions often happen offline
- payments are collected in cash, UPI, or delayed transfers
- internet connectivity may be unreliable
- admins perform many operations manually
- real-world workflows do not follow clean “online checkout” flows

While online self-serve payments are planned for the future, the system must
work reliably **even when fully operated by admins**.

---

## Problem

If a system is designed as online-first:

- offline admissions become awkward or impossible
- partial or delayed payments break assumptions
- admin workflows require hacks or workarounds
- real operations diverge from system behavior

Such systems often:

- assume payment before access
- require constant connectivity
- enforce rigid flows unsuitable for ground reality

This leads to operational friction and data inconsistency.

---

## Decision

**The system is designed as offline-first, admin-driven by default.**

Specifically:

- All core operations are admin-manageable
- Online workflows are additive, not foundational
- Financial and access logic does not assume real-time payments
- The system remains correct even if:
  - payments are recorded later
  - enrollments are created manually
  - data is entered retrospectively

---

## What this means in practice

### Enrollment

- Admins can create enrollments directly
- Access can begin immediately
- No dependency on payment gateways

### Payments

- Can be recorded manually
- Support cash, UPI, bank transfer
- Do not require gateway metadata
- Can be partial, delayed, or refunded

### Fee plans

- Created manually by admins
- Represent agreed contracts, not automated prices
- Independent of online checkout flows

### Online payments (future)

- Will create payment records automatically
- Will follow the same data model
- Will not change core system assumptions

---

## Design principles enabled by offline-first

- Explicit admin actions
- Immutable financial records
- Decoupled access and payments
- Strong auditability
- Resilience to connectivity issues

Offline-first is not a limitation — it is a foundation.

---

## Consequences

### Positive consequences

- Matches real-world institute operations
- High data integrity
- Flexible workflows
- Easy to support edge cases
- Smooth transition to online payments later

### Negative consequences

- More admin responsibility
- Less automation in early phases
- Requires disciplined UI design

These are acceptable trade-offs for correctness and flexibility.

---

## Alternatives considered

### Alternative 1: Online-first checkout-driven system

**Rejected because:**

- incompatible with offline admissions
- too rigid for real operations
- fragile in low-connectivity environments

### Alternative 2: Hybrid with implicit assumptions

**Rejected because:**

- unclear source of truth
- complex edge cases
- hard to reason about failures

---

## Related Decisions

- ADR 001 – Enrollment controls access
- ADR 007 – Fee plans are contracts, not prices
- ADR 008 – Payments do not control access
- ADR 009 – Admin actions are explicit and intentional

---

## Final Principle

> **The system must work even if the internet, payment gateway, or automation fails.**

Admins are the source of truth.  
Online flows are conveniences — not dependencies.
