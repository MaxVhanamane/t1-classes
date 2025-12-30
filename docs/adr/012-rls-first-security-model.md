# 012 – RLS-first security model

## Status

Accepted

## Context

This system handles sensitive data such as:

- student enrollments
- academic access
- fee plans and contracts
- payments and refunds

Multiple user roles exist:

- admin
- teacher
- student
- parent (future)

Access rules are non-trivial and must remain correct across:

- server actions
- client components
- background jobs
- future APIs
- future integrations

Relying only on application-layer authorization is fragile and error-prone.

---

## Problem

If security is enforced only in application code:

- bugs can bypass checks
- new queries may forget authorization
- refactors can introduce leaks
- future services may bypass logic
- database access becomes unsafe

In such systems, the database blindly trusts the application —
which is dangerous for financial and academic data.

---

## Decision

**Row Level Security (RLS) is the primary security boundary.**

Specifically:

- RLS policies are enabled on all sensitive tables
- The database enforces who can:
  - read
  - insert
  - update
- Application code operates _within_ RLS constraints
- No query assumes implicit trust

The application is treated as an untrusted client.

---

## What this means in practice

### Database-first enforcement

- Policies exist for:
  - admins
  - students
  - teachers
- Even if a query is written incorrectly,
  the database blocks unauthorized access

### Server actions

- Server actions do not bypass RLS
- Actions rely on:
  - authenticated user context
  - role-based policies
- Explicit security definer functions are used sparingly and intentionally

### Admin privileges

- Admins have broader access
- Still constrained by explicit policies
- No blanket superuser behavior

---

## Benefits of RLS-first design

- Strong defense-in-depth
- Safe future expansion
- Reduced risk of data leaks
- Easier audits
- Clear security boundaries

Security becomes **systemic**, not incidental.

---

## Consequences

### Positive consequences

- High confidence in data safety
- Reduced reliance on developer discipline
- Safe internal tooling
- Compatible with future APIs

### Negative consequences

- Requires careful policy design
- More initial setup effort
- Debugging requires RLS awareness

These are acceptable trade-offs for sensitive systems.

---

## Alternatives considered

### Alternative 1: App-only authorization

**Rejected because:**

- easy to bypass
- fragile under refactors
- unsafe for financial data

### Alternative 2: Mixed enforcement

**Rejected because:**

- unclear source of truth
- inconsistent behavior
- difficult to reason about

A single, authoritative security layer is required.

---

## Related Decisions

- ADR 009 – Admin actions are explicit and intentional
- ADR 010 – Offline-first system design
- ADR 011 – Derived views over mutable state

---

## Final Principle

> **The database must protect itself.**

Application code may fail.  
RLS does not.
