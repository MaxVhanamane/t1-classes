# Architecture & Decision Documentation

This directory contains **Architecture Decision Records (ADRs)** for the coaching
institute platform.

These documents capture _why_ certain architectural and modeling decisions were
made — not just _what_ was implemented.

If you are:

- returning to this codebase after a long break
- onboarding a new developer
- reviewing or refactoring core logic
- adding major new features (payments, access, automation)

👉 **Read the relevant ADRs first.**

---

## What is an ADR?

An **Architecture Decision Record (ADR)** documents:

- the context of a problem
- the decision that was made
- the alternatives considered
- the consequences of the decision

ADRs help prevent:

- re-litigating old decisions
- accidental architectural regressions
- “quick fixes” that break core principles

---

## How to use these ADRs

- **Before changing behavior**: check if an ADR already covers it
- **When adding new core behavior**: add a new ADR
- **When reviewing PRs**: ensure changes align with existing ADRs
- **When unsure why something feels “strict”**: there is probably an ADR explaining it

These ADRs are **authoritative** for system design.

---

## ADR Index

### Core Domain & Access

- **ADR 001** – Enrollment controls access
- **ADR 008** – Payments do not control access
- **ADR 009** – Admin actions are explicit and intentional

### Financial Modeling

- **ADR 002** – Payments reference enrollment, not fee plan
- **ADR 004** – Payments are immutable ledger entries
- **ADR 005** – Snapshot user data in financial records
- **ADR 006** – No hard deletes in financial data
- **ADR 007** – Fee plans are contracts, not prices

### System Design Principles

- **ADR 010** – Offline-first system design
- **ADR 011** – Derived views over mutable state
- **ADR 012** – RLS-first security model
- **ADR 014** – Server Actions only (no client mutations)
- **ADR 015** – Text + CHECK constraints instead of enums

### Audit & Data Integrity

- **ADR 013** – Audit columns are not foreign keys

---

## When to add a new ADR

Add a new ADR when you are making a decision that:

- affects core data models
- impacts security or access
- introduces irreversible behavior
- changes how money or access works
- would be hard to undo later

If you find yourself saying:

> “We should remember why we did this”

That is a signal to write an ADR.

---

## ADR Naming Convention

NNN-short-decision-title.md

Examples:

- `016-online-payments-integration.md`
- `017-refund-adjustments-vs-edits.md`

---

## Final Note

This project is intentionally designed to:

- favor correctness over convenience
- preserve history
- avoid silent mutations
- support real-world offline workflows

The ADRs explain _why_.

**Do not bypass them lightly.**
