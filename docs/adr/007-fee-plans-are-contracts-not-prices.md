# 007 – Fee plans are contracts, not prices

## Status

Accepted

## Context

This platform supports:

- academic courses
- multiple delivery batches
- discounts, scholarships, and overrides
- partial payments and refunds
- future online payments

Courses have a **list price**, but real-world enrollments often differ due to:

- discounts
- scholarships
- negotiated fees
- late admissions
- internal or manual adjustments

Once a student is enrolled, the agreed financial terms must be clearly defined
and remain traceable over time.

---

## Problem

If the system treats prices as mutable values tied to:

- courses
- batches
- payments

then:

- historical agreements are lost
- discounts become unclear
- changes overwrite past intent
- payments lose context (“what was this payment for?”)

A student’s financial obligation is not simply “the course price” —
it is a **specific agreement made at a point in time**.

---

## Decision

**Fee plans represent financial contracts, not prices.**

Specifically:

- A fee plan defines:
  - total amount
  - discount amount
  - final payable amount
  - effective date
- A fee plan is created per enrollment
- Exactly one fee plan is active at a time
- Fee plans are never deleted

Payments do **not** define contracts — they settle against them.

---

## What this means in practice

### Course price

- Acts as a reference or default
- Helps prefill fee plans
- Has no financial authority

### Fee plan

- Represents the agreed contract
- Defines what _should_ be paid
- Can be:
  - edited (before payments)
  - superseded (after payments)
  - cancelled (if no payments)
- Preserved forever as history

### Payments

- Reference the enrollment
- Record what _was_ paid
- Do not mutate fee plans
- Do not grant or revoke access

---

## Lifecycle example

1. Course list price = ₹50,000
2. Admin creates fee plan:
   - total = ₹50,000
   - discount = ₹10,000
   - final = ₹40,000
3. Student pays ₹20,000
4. Fee plan cannot be edited
5. Admin supersedes fee plan:
   - final = ₹45,000 (change agreed later)
6. Payments continue against enrollment

All history remains intact.

---

## Consequences

### Positive consequences

- Clear separation of intent vs settlement
- Accurate historical contracts
- Safe handling of discounts and overrides
- Supports partial payments naturally
- Scales to online payments and refunds
- Matches real-world accounting behavior

### Negative consequences

- More tables and concepts
- Requires admin discipline
- Slightly more UI complexity

These trade-offs are intentional and necessary.

---

## Alternatives considered

### Alternative 1: Use course price directly

**Rejected because:**

- prices change over time
- discounts overwrite intent
- breaks historical accuracy

### Alternative 2: Payments define the contract

**Rejected because:**

- payments can be partial
- payments can fail
- refunds distort totals
- no single source of truth

---

## Related Decisions

- ADR 001 – Enrollment controls access
- ADR 002 – Payments reference enrollment, not fee plan
- ADR 004 – Payments are immutable ledger entries
- ADR 006 – No hard deletes in financial data

---

## Final Principle

> **A fee plan is a promise.  
> A payment is a settlement.**

Never confuse the two.
