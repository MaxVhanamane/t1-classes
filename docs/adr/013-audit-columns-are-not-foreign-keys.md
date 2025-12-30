# 013 – Audit columns are not foreign keys

## Status

Accepted

## Context

Many tables in the system include audit fields such as:

- `created_by`
- `updated_by`
- `processed_by_user_id`

These fields record **who performed an action**, not **who owns the data**.

The system also supports:

- long-lived academic and financial records
- staff turnover
- user deactivation
- future anonymization requirements

Audit information must remain intact regardless of the lifecycle of user accounts.

---

## Problem

If audit columns are implemented as foreign keys to `users`:

- deleting or anonymizing a user may fail
- historical records may become invalid
- migrations become risky
- the database enforces ownership semantics where none exist

This creates a false dependency between:

- **audit metadata** (who did something)
- **domain ownership** (who the data belongs to)

In real systems, audit trails must survive user lifecycle events.

---

## Decision

**Audit columns are plain UUID columns without foreign key constraints.**

Specifically:

- `created_by`
- `updated_by`
- `processed_by_user_id`

are stored as identifiers only, without FK enforcement.

These columns are:

- optional
- non-authoritative
- informational only

They do **not** participate in referential integrity.

---

## What this means in practice

### Audit data

- Always preserved
- Never blocks deletes or anonymization
- Remains readable even if user records change

### User lifecycle

- Users may be:
  - deactivated
  - removed
  - anonymized
- Historical records remain valid

### UI behavior

- Audit details are fetched lazily when needed
- Failure to resolve a user does not break rendering
- Snapshot data (names) may be used where necessary

---

## What audit columns are NOT

Audit columns are **not**:

- ownership indicators
- access control mechanisms
- required for business logic

They exist purely for traceability and accountability.

---

## Consequences

### Positive consequences

- Robust historical records
- Safe user lifecycle management
- Fewer migration risks
- Clear separation of concerns
- Matches industry best practices

### Negative consequences

- No automatic referential integrity
- Requires discipline to avoid misuse

These trade-offs are intentional and acceptable.

---

## Alternatives considered

### Alternative 1: Foreign keys to users

**Rejected because:**

- audit trails should not enforce ownership
- breaks under user deletion
- unsafe for long-term records

### Alternative 2: Store only names, no IDs

**Rejected because:**

- loses ability to investigate deeper
- prevents optional audit lookup

Storing IDs without FKs provides the right balance.

---

## Related Decisions

- ADR 005 – Snapshot user data in financial records
- ADR 006 – No hard deletes in financial data
- ADR 012 – RLS-first security model

---

## Final Principle

> **Audit data records history, not relationships.**

History must never be blocked by referential constraints.
