# 009 – Admin actions are explicit and intentional

## Status

Accepted

## Context

This platform is designed for real-world academic operations where:

- offline workflows exist
- exceptions are common
- admins handle sensitive financial and access decisions
- mistakes can have serious consequences

In such systems, automation must be used carefully.
Silent or implicit system behavior can cause irreversible damage.

---

## Problem

If admin actions are implicit or automated:

- fee plans may change without clear intent
- access may be revoked unintentionally
- payments may be misapplied
- refunds may happen without proper review
- audit trails become unclear

Systems that “do things automatically” often:

- hide important decisions
- make debugging difficult
- reduce admin accountability
- surprise users

This is especially dangerous when money and access are involved.

---

## Decision

**All admin actions must be explicit, deliberate, and intentional.**

Specifically:

- No automatic side effects for critical actions
- No silent state changes
- Every impactful action requires:
  - a clear user action
  - a visible UI control
  - a clear backend operation
- The system never assumes intent

---

## What this means in practice

### Financial actions

- Payments are recorded explicitly
- Refunds require:
  - an explicit action
  - confirmation
  - a reason
- Fee plans are:
  - created intentionally
  - edited intentionally
  - superseded intentionally
  - cancelled intentionally

### Access actions

- Enrollment controls access
- Access changes require explicit admin decisions
- Payments never auto-grant or auto-revoke access

### UI behavior

- No hidden mutations
- No auto-updates based on inferred logic
- Confirmation dialogs for destructive actions
- Clear warnings when actions are irreversible

---

## Examples

### Example 1 – Fee plan after payment

- Payments exist
- Editing is blocked
- Admin must explicitly choose “Supersede”
- Intent is recorded and visible

### Example 2 – Refund

- Admin clicks “Issue Refund”
- Enters amount and reason
- Confirms explicitly
- Refund is recorded as a new entry

### Example 3 – Access control

- Payment fails
- Access remains unchanged
- Admin explicitly decides next steps

---

## Consequences

### Positive consequences

- High operational clarity
- Reduced accidental errors
- Strong auditability
- Predictable system behavior
- Admins remain in control

### Negative consequences

- Slightly more UI interactions
- Fewer “one-click” shortcuts

These trade-offs are intentional and acceptable for safety.

---

## Alternatives considered

### Alternative 1: Automatic system-driven actions

**Rejected because:**

- intent is unclear
- errors are hard to trace
- admins lose control

### Alternative 2: Silent background adjustments

**Rejected because:**

- dangerous in financial systems
- breaks trust
- violates audit principles

---

## Related Decisions

- ADR 004 – Payments are immutable ledger entries
- ADR 006 – No hard deletes in financial data
- ADR 008 – Payments do not control access

---

## Final Principle

> **If an action matters, a human must choose it.**

The system assists decisions —  
it never makes them silently.
