# 005 – Snapshot user data in financial records

## Status

Accepted

## Context

Financial records (payments, refunds) must remain accurate and understandable
**even years later**, regardless of changes to user accounts.

In this system:

- Admins may leave the organization
- Users may be deactivated
- Names and roles may change
- User records may be anonymized in the future

Despite this, financial records must continue to clearly show:

- who processed a payment or refund
- without relying on mutable user data

---

## Problem

If financial records only reference a `user_id`:

- User names may change over time
- User accounts may be deactivated
- User records may be removed or anonymized
- Historical records would lose human-readable context

This creates problems such as:

- “Who processed this payment?” → unclear
- Audit reports showing missing or broken user references
- UI depending on joins that may fail in the future

Financial history must not depend on the current state of user records.

---

## Decision

**Financial records snapshot user identity at the time of action.**

Specifically:

- Payments store:
  - `processed_by_user_id`
  - `processed_by_user_name`
- The name is captured at creation time
- The ID is retained for optional lookup, but not required for display

This ensures financial records remain readable and complete even if the user
record changes later.

---

## What this means in practice

### When creating a payment or refund

- The admin’s current display name is copied into
  `processed_by_user_name`
- The admin’s user ID is stored in `processed_by_user_id`

### When displaying payments

- UI uses `processed_by_user_name` directly
- No joins are required for normal rendering
- Historical clarity is preserved

### Optional deep audit

- `processed_by_user_id` can be used to fetch current user state
- Used only when explicitly needed (audit dialog, admin tooling)

---

## Consequences

### Positive consequences

- Financial history remains human-readable forever
- UI is fast and simple (no joins required)
- Safe against user deletion or deactivation
- Aligns with accounting and compliance practices
- Reduces coupling between financial data and user data

### Negative consequences

- Slight data duplication (name stored twice)
- Name may differ from current user profile name

These trade-offs are intentional and acceptable for financial records.

---

## Alternatives considered

### Alternative 1: Store only user_id and join users table

**Rejected because:**

- breaks when users change or are removed
- introduces fragile runtime dependencies
- harms auditability

### Alternative 2: Store no user reference at all

**Rejected because:**

- loses accountability
- unacceptable for financial actions

---

## Related Decisions

- ADR 002 – Payments reference enrollment, not fee plan
- ADR 004 – Payments are immutable ledger entries

---

## Final Principle

> **Financial records must remain understandable without external dependencies.**

Snapshotting user identity ensures clarity, stability, and audit safety.
