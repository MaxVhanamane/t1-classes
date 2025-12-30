# 014 – Server Actions only (no client mutations)

## Status

Accepted

## Context

This platform handles sensitive operations such as:

- enrollments
- fee plans
- payments and refunds
- access control

It uses:

- Next.js App Router
- Supabase with RLS
- Role-based access control

Client-side mutations (direct inserts/updates from the browser) are easy to
implement but hard to secure and audit correctly at scale.

---

## Problem

If clients are allowed to mutate data directly:

- business rules can be bypassed
- authorization logic is duplicated
- RLS policies become harder to reason about
- audit fields may be missing or incorrect
- critical checks may be skipped accidentally

This leads to:

- inconsistent behavior
- fragile security
- hard-to-debug production issues

Especially for financial and academic data, this risk is unacceptable.

---

## Decision

**All data mutations must go through Server Actions.**

Specifically:

- Clients never insert, update, or delete records directly
- All writes happen in server-side functions
- Server Actions act as the single mutation boundary

The client is treated as an untrusted actor.

---

## What this means in practice

### Client components

- Collect user input
- Validate input (UX-level validation)
- Call Server Actions
- Handle loading and error states

### Server Actions

- Re-validate input (final authority)
- Enforce business rules
- Enforce authorization
- Set system-controlled fields
- Trigger revalidation

No mutation happens outside Server Actions.

---

## Benefits of this approach

- Single place for business logic
- Consistent authorization
- Correct audit data
- Predictable side effects
- Easier refactoring
- Safer future features

Server Actions become the **gatekeepers** of system integrity.

---

## Consequences

### Positive consequences

- Strong security guarantees
- Clear separation of concerns
- Reduced accidental misuse
- Easier code reviews
- Better auditability

### Negative consequences

- Slightly more boilerplate
- Less “quick hacks”
- Requires discipline

These trade-offs are intentional.

---

## Alternatives considered

### Alternative 1: Client-side mutations with RLS

**Rejected because:**

- business logic leaks into clients
- difficult to enforce complex rules
- audit data is fragile

### Alternative 2: Mixed approach

**Rejected because:**

- unclear mutation boundaries
- inconsistent behavior
- hard to reason about correctness

A single mutation path is safer.

---

## Related Decisions

- ADR 012 – RLS-first security model
- ADR 009 – Admin actions are explicit and intentional
- ADR 006 – No hard deletes in financial data

---

## Final Principle

> **The client may request changes.  
> Only the server may perform them.**

This guarantees correctness, security, and auditability.
