# ADR: Course Content Architecture, Publishing Model, Ordering & Indexing

**Status:** Accepted  
**Audience:** Backend, Frontend, DB  
**Scope:** Chapters, Topics, Videos, PDFs, Practice Sets, Questions, Options  
**Primary Goal:** Correctness, predictability, safety, and scalability  
**Non-Goal:** Premature optimization or magic implicit behavior

---

## 1. Problem We Are Solving

We are building a **course authoring + consumption system** where:

- Teachers create structured content
- Students consume **only explicitly published content**
- Content must be ordered
- Deletes must not break ordering
- Publishing must not create inconsistent states
- Permissions must be enforceable and auditable
- Queries must remain fast at scale

This ADR documents **why the schema looks the way it does**, **how publishing works**, and **why specific indexes exist**.

---

## 2. Content Hierarchy (Mental Model)

Course
├─ Chapter
│ ├─ Topic
│ │ ├─ Video (course_units)
│ │ ├─ PDF (course_units)
│ │ └─ Practice Set (practice_sets)
│ │ └─ Questions
│ │ └─ Options

yaml
Copy code

### Key Observations

- Chapters and Topics are **structure**
- Videos, PDFs, Practice Sets are **leaf content**
- Practice Sets are **not simple units** → they have children

---

## 3. Tables Overview

| Table                | Purpose           |
| -------------------- | ----------------- |
| `course_structure`   | Chapters & Topics |
| `course_units`       | Videos & PDFs     |
| `practice_sets`      | MCQ collections   |
| `practice_questions` | Questions         |
| `practice_options`   | Options           |

---

## 4. `course_structure` (Chapters & Topics)

### Why a Single Table?

Chapters and Topics:

- Share lifecycle (create, rename, delete, reorder, publish)
- Share permissions
- Share ordering rules
- Are hierarchical

Instead of two tables → **one table with a discriminator**:

```sql
structure_type = 'chapter' | 'topic'
Schema
sql
Copy code
create table public.course_structure (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references courses(id) on delete cascade,
  parent_id uuid null references course_structure(id) on delete cascade,
  title text not null,
  structure_type text not null check (structure_type in ('chapter','topic')),
  sort_order integer not null check (sort_order >= 1),
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
Rules
Chapters → parent_id IS NULL

Topics → parent_id = chapter.id

Publishing is explicit

Topic cannot be published unless chapter is published

Unpublishing a chapter must cascade

5. course_units (Videos & PDFs)
Why One Table?
Videos and PDFs:

Same publish rules

Same ordering

Same permissions

Minor field differences handled via constraints

Schema
sql
Copy code
create table public.course_units (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references courses(id) on delete cascade,
  structure_id uuid not null references course_structure(id) on delete cascade,
  title text not null,
  unit_type text not null check (unit_type in ('video','pdf')),
  content_url text null,
  file_path text null,
  video_provider text null,
  duration_minutes integer null,
  is_free_preview boolean not null default false,
  sort_order integer not null check (sort_order >= 1),
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
Publishing Rules
Can publish only if topic AND chapter are published

Unpublish does not cascade (leaf node)

6. practice_sets
Why Separate from course_units?
Practice Sets:

Have children (questions)

Have different UI & logic

Not just a content blob

Schema
sql
Copy code
create table public.practice_sets (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references course_structure(id) on delete cascade,
  title text not null,
  description text null,
  is_published boolean not null default false,
  sort_order integer not null check (sort_order >= 1),
  created_at timestamptz not null default now()
);
Publishing Rules
Can publish only if topic + chapter are published

No cascade needed (leaf in publish tree)

7. practice_questions
Schema
sql
Copy code
create table public.practice_questions (
  id uuid primary key default gen_random_uuid(),
  practice_set_id uuid not null references practice_sets(id) on delete cascade,
  question text not null,
  correct_answer_explanation text null,
  sort_order integer not null check (sort_order >= 1),
  created_at timestamptz not null default now()
);
Why sort_order?
Stable question order

Predictable student experience

Supports future drag & drop

8. practice_options
Schema
sql
Copy code
create table public.practice_options (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references practice_questions(id) on delete cascade,
  option_text text not null,
  is_correct boolean not null default false,
  created_at timestamptz not null default now()
);
Why No sort_order?
Very small N (2–6)

Order not business-critical

UI can manage ordering if needed later

9. Ordering Strategy (Critical)
Rule
Deletes must never leave gaps

We enforce this via database triggers, not app code.

Why DB Triggers?
Atomic

Race-condition safe

Centralized

Impossible to forget

Triggers
reorder_chapters_after_delete

reorder_topics_after_delete

reorder_course_units_after_delete

reorder_practice_sets_after_delete

reorder_practice_questions_after_delete

10. Publishing Model (Very Important)
Philosophy
Explicit > Implicit

Nothing publishes automatically upward or downward.

Allowed Actions
Action	Result
Publish Chapter	Chapter only
Publish Topic	Only if Chapter published
Publish Video/PDF	Only if Topic + Chapter published
Publish Practice Set	Only if Topic + Chapter published
Unpublish Chapter	Cascade unpublish EVERYTHING
Unpublish Topic	Cascade unpublish units + practice
Unpublish Leaf	Leaf only

Why This Model?
Prevents accidental student visibility

Matches teacher mental model

Avoids “surprise publishing”

Enables staged releases

11. Cascade Unpublish (Atomic)
Unpublishing must be all-or-nothing.

Why?
We must avoid states like:

Chapter unpublished

Topic still published

Videos still visible

Solution
Database functions:

unpublish_chapter_and_descendants

unpublish_topic_and_descendants

These:

Run inside a single transaction

Update:

course_structure

course_units

practice_sets

Fail completely if anything fails

12. Permissions Model
Split Responsibility
Layer	Responsibility
RLS	Role-level access (teacher/admin)
Server Actions	Ownership & business rules

Why?
Easier debugging

Better error messages

Avoids over-complex RLS

Keeps business logic explicit

13. Indexing Strategy (No Premature Indexes)
Core Principle
Index what we query, not what we might query.

course_structure
sql
Copy code
create index if not exists idx_course_structure_course
on course_structure(course_id);

create index if not exists idx_course_structure_parent
on course_structure(parent_id);

create index if not exists idx_course_structure_student
on course_structure(course_id, structure_type, is_published, sort_order);
Supports:

Admin listing

Student consumption

Ordered traversal

course_units
sql
Copy code
create index if not exists idx_course_units_structure_published
on course_units(structure_id, is_published, sort_order);

create index if not exists idx_course_units_course
on course_units(course_id);
practice_sets
sql
Copy code
create index if not exists idx_practice_sets_topic_published
on practice_sets(topic_id, is_published, sort_order);
practice_questions
sql
Copy code
create index if not exists idx_practice_questions_set_order
on practice_questions(practice_set_id, sort_order);
practice_options
sql
Copy code
create index if not exists idx_practice_options_question
on practice_options(question_id);
14. Why Composite Indexes Are Enough
Postgres can use:

(practice_set_id, sort_order) for:

WHERE practice_set_id = ?

ORDER BY sort_order

So single-column indexes are not needed when covered by leading columns.

15. Final Outcome
This architecture provides:

✅ Safe publishing
✅ No inconsistent states
✅ Clean admin UX
✅ Efficient student queries
✅ Scales without refactor
✅ Clear mental model
```
