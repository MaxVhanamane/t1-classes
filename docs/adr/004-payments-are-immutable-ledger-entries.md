# 004 – Payments are immutable ledger entries

## Status

Accepted

## Context

Payments represent **actual money movement** in the system.
They include:

- cash received
- online payments
- refunds
- reversals

Once recorded, a payment becomes part of the institution’s
**financial ledger** and must remain historically accurate.

In real accounting systems, ledger entries are never edited or deleted.
Corrections are always represented as **new entries**.

---

## Problem

If payments could be edited or deleted:

- Financial history would become unreliable
- Audit trails would be broken
- Refund calculations could be incorrect
- Reports could silently change over time
- Admins could unintentionally alter past financial reality

Examples of dangerous edits:

- Changing amount after receipt
- Changing payment method after the fact
- Changing payment date to manipulate reports

---

## Decision

**Payments are immutable once created.**

This means:

- Payments cannot be edited
- Payments cannot be deleted
- Corrections are represented as **new payments**

Specifically:

- Refunds are recorded as **negative payment entries**
- Failed or reversed payments are recorded with explicit status
- Adjustments are additive, never mutative

---

## What this means in practice

### Creating a payment

- A new row is inserted into the `payments` table
- The row represents a permanent fact

### Fixing a mistake

Instead of editing:

- Create a compensating entry

Examples:

- Wrong amount → add adjustment payment
- Refund → insert negative payment
- Reversal → insert reversal entry

The ledger always tells the full story.

---

## Consequences

### Positive consequences

- Strong auditability
- Clear financial history
- Easy reconciliation
- Safe refunds and partial payments
- Aligns with real-world accounting practices

### Negative consequences

- Requires more rows instead of simple edits
- UI must guide admins to correct flows instead of editing

These trade-offs are intentional and acceptable.

---

## Alternatives considered

### Alternative 1: Allow editing payments

**Rejected because:**

- breaks audit trails
- enables silent history mutation
- unsafe for financial systems

### Alternative 2: Allow deleting payments

**Rejected because:**

- removes historical facts
- creates reconciliation gaps
- unacceptable for accounting data

---

## Related Decisions

- ADR 001 – Enrollment controls access
- ADR 002 – Payments reference enrollment, not fee plan
- ADR 003 – Fee plans are immutable after payments exist

---

## Final Principle

> **Financial truth is additive, never mutable.**

Once a payment exists, it becomes part of the permanent ledger.
All corrections must be expressed as new entries.
