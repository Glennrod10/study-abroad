### Task 1: DB Migration

**Files:**
- Modify: `schema.sql`

**Interfaces:**
- Produces: `document_tags` table + `student_documents.tags` column

- [ ] **Step 1: Add document_tags table**

Add this to `schema.sql` after the `student_documents` table definition:

```sql
-- ── Document Tags ─────────────────────────────────────────────
create table if not exists document_tags (
    id         uuid primary key default gen_random_uuid(),
    name       text not null,
    color      text not null default '#6366F1',
    agency_id  uuid references agencies(id) on delete cascade,
    created_at timestamptz not null default now(),
    unique(name, agency_id)
);
```

- [ ] **Step 2: Add tags column to student_documents**

After the document_tags table, add:

```sql
alter table student_documents
add column if not exists tags jsonb default '[]'::jsonb;
```

- [ ] **Step 3: Add index for tags**

```sql
-- index for JSONB tag lookups
create index if not exists idx_student_docs_tags
    on student_documents using gin(tags);
```

Run this in Supabase SQL Editor.
