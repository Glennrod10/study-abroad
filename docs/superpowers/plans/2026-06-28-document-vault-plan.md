# Document Vault Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a centralized document vault for browsing, searching, filtering, previewing, and managing all student documents across the agency.

**Architecture:** New `/dashboard/documents` page with client-side components fetching from new API routes. Add `document_tags` table + tags JSONB column to `student_documents`. Reuse existing Supabase Storage bucket. Upgrade per-student components to use tags + preview modal.

**Tech Stack:** Next.js 16 (App Router), React 19, Supabase (PostgreSQL + Storage), Tailwind CSS v4, Lucide React

## Global Constraints

- All API routes use `SUPABASE_SERVICE_ROLE_KEY` server-side Supabase client (existing pattern)
- All API routes use `getAuthSession()` from `@/lib/auth` for auth
- All components follow existing design tokens (primary `#5048E5`, bg-gray-50, rounded-xl, etc.)
- Agency scoping via `session.user.agency_id`
- Use `next/navigation` router, not `next/router`
- Client components use `"use client"` directive

---

## File Structure

### New Files

| Path | Responsibility |
|---|---|
| `src/app/api/document-tags/route.ts` | GET (list) + POST (create) document tags |
| `src/app/api/document-tags/[id]/route.ts` | DELETE document tag |
| `src/app/api/documents/route.ts` | GET (list with filters) documents |
| `src/app/api/documents/[id]/route.ts` | PATCH (update tags/status) + DELETE |
| `src/app/dashboard/documents/page.tsx` | Vault page server component |
| `src/app/components/documents/DocumentVaultClient.tsx` | Main vault client component |
| `src/app/components/documents/DocumentFilters.tsx` | Search + tags + status + date filter bar |
| `src/app/components/documents/DocumentTable.tsx` | Document list table with pagination |
| `src/app/components/documents/DocumentPreviewModal.tsx` | File preview modal (PDF/img/DOCX) |
| `src/app/components/documents/TagBadge.tsx` | Colored tag pill |
| `src/app/components/documents/TagManager.tsx` | Tag create/delete UI popover |
| `src/app/components/documents/UploadDocumentModal.tsx` | Upload modal for vault |

### Modified Files

| Path | Change |
|---|---|
| `schema.sql` | Add `document_tags` table + `tags` column to `student_documents` |
| `src/app/components/dashboard/Sidebar.tsx` | Add "Documents" nav item |
| `src/app/components/students/UploadDocument.tsx` | Add tag selection dropdown |
| `src/app/components/students/StudentDocumentsModal.tsx` | Show tags, use preview modal |

---

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

---

### Task 2: Document Tags API

**Files:**
- Create: `src/app/api/document-tags/route.ts`
- Create: `src/app/api/document-tags/[id]/route.ts`

**Interfaces:**
- Produces: `GET /api/document-tags` → `{ tags: Tag[] }`, `POST /api/document-tags` → `{ tag: Tag }`, `DELETE /api/document-tags/[id]` → `{ success: true }`
- Consumes: `session.user.agency_id` from `getAuthSession()`
- Tag: `{ id: string; name: string; color: string; agency_id: string }`

- [ ] **Step 1: Create list + create route**

```typescript
// src/app/api/document-tags/route.ts
export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { getAuthSession } from "@/lib/auth"

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
    const session = await getAuthSession()
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: tags, error } = await supabase
        .from("document_tags")
        .select("*")
        .eq("agency_id", session.user.agency_id)
        .order("name")

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ tags })
}

export async function POST(req: Request) {
    const session = await getAuthSession()
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, color } = await req.json()

    if (!name || typeof name !== "string" || !name.trim()) {
        return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    const { data: tag, error } = await supabase
        .from("document_tags")
        .insert([{ name: name.trim(), color: color || "#6366F1", agency_id: session.user.agency_id }])
        .select()
        .single()

    if (error) {
        if (error.code === "23505") {
            return NextResponse.json({ error: "Tag already exists" }, { status: 409 })
        }
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ tag })
}
```

- [ ] **Step 2: Create delete route**

```typescript
// src/app/api/document-tags/[id]/route.ts
export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { getAuthSession } from "@/lib/auth"

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function DELETE(
    req: Request,
    context: { params: Promise<{ id: string }> }
) {
    const session = await getAuthSession()
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await context.params

    const { error: removeError } = await supabase
        .from("student_documents")
        .update({ tags: supabase.rpc("jsonb_remove_value", { target: supabase.rpc("jsonb_build_array", { value: id }) }) })
        .filter("tags", "cs", `["${id}"]`)
        .eq("agency_id", session.user.agency_id)

    // Remove tag from all documents that have it (simpler approach — fetch and update)
    const { data: docsWithTag } = await supabase
        .from("student_documents")
        .select("id, tags")
        .contains("tags", [id])
        .eq("agency_id", session.user.agency_id)

    if (docsWithTag) {
        for (const doc of docsWithTag) {
            const updatedTags = (doc.tags as string[]).filter(t => t !== id)
            await supabase
                .from("student_documents")
                .update({ tags: updatedTags })
                .eq("id", doc.id)
        }
    }

    const { error } = await supabase
        .from("document_tags")
        .delete()
        .eq("id", id)
        .eq("agency_id", session.user.agency_id)

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
}
```

- [ ] **Step 3: Test API**

```powershell
# Create a tag
curl -X POST http://localhost:3000/api/document-tags `
  -H "Content-Type: application/json" `
  -H "Cookie: <session-cookie>" `
  -Body '{"name":"LOR","color":"#10B981"}'

# List tags
curl http://localhost:3000/api/document-tags
```

---

### Task 3: Documents API

**Files:**
- Create: `src/app/api/documents/route.ts`
- Create: `src/app/api/documents/[id]/route.ts`

**Interfaces:**
- Produces: `GET /api/documents?search=&tags=&student_id=&status=&date_from=&date_to=&page=&limit=` → `{ documents: Doc[], total: number }`, `PATCH /api/documents/[id]` → `{ success: true }`, `DELETE /api/documents/[id]` → `{ success: true }`
- Doc: `{ id: string; student_id: string; student_name: string; document_name: string; file_url: string; document_type: string; tags: string[]; tag_details: Tag[]; status: string; created_at: string }`

- [ ] **Step 1: Create list route with filters**

```typescript
// src/app/api/documents/route.ts
export const runtime = "nodejs"

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { getAuthSession } from "@/lib/auth"

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
    const session = await getAuthSession()
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const search = searchParams.get("search") || ""
    const tagIds = searchParams.getAll("tags")
    const studentId = searchParams.get("student_id") || ""
    const status = searchParams.get("status") || ""
    const dateFrom = searchParams.get("date_from") || ""
    const dateTo = searchParams.get("date_to") || ""
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "25")
    const offset = (page - 1) * limit

    const agencyId = session.user.agency_id

    // Fetch all tags for this agency (for mapping)
    const { data: allTags } = await supabase
        .from("document_tags")
        .select("*")
        .eq("agency_id", agencyId)

    const tagMap = new Map((allTags || []).map(t => [t.id, t]))

    // Build query — join with students for student name
    let query = supabase
        .from("student_documents")
        .select("*, students!inner(first_name, last_name)", { count: "exact" })
        .eq("agency_id", agencyId)

    if (search) {
        query = query.or(
            `document_name.ilike.%${search}%,students.first_name.ilike.%${search}%,students.last_name.ilike.%${search}%`
        )
    }

    if (tagIds.length > 0) {
        const tagFilters = tagIds.map(id => `tags.cs.${JSON.stringify([id])}`)
        query = query.or(tagFilters.join(","))
    }

    if (studentId) {
        query = query.eq("student_id", studentId)
    }

    if (status) {
        query = query.eq("status", status)
    }

    if (dateFrom) {
        query = query.gte("created_at", dateFrom)
    }

    if (dateTo) {
        query = query.lte("created_at", dateTo)
    }

    const { data: documents, count, error } = await query
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1)

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const mapped = (documents || []).map(doc => ({
        id: doc.id,
        student_id: doc.student_id,
        student_name: doc.students
            ? `${doc.students.first_name || ""} ${doc.students.last_name || ""}`.trim()
            : "Unknown",
        document_name: doc.document_name,
        file_url: doc.file_url,
        document_type: doc.document_type,
        tags: doc.tags || [],
        tag_details: (doc.tags || []).map((tagId: string) => tagMap.get(tagId)).filter(Boolean),
        status: doc.status,
        created_at: doc.created_at,
    }))

    return NextResponse.json({ documents: mapped, total: count || 0 })
}
```

- [ ] **Step 2: Create update + delete route**

```typescript
// src/app/api/documents/[id]/route.ts
export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { getAuthSession } from "@/lib/auth"

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function PATCH(
    req: Request,
    context: { params: Promise<{ id: string }> }
) {
    const session = await getAuthSession()
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await context.params
    const body = await req.json()

    const updates: Record<string, any> = {}
    if (body.tags !== undefined) updates.tags = body.tags
    if (body.document_name !== undefined) updates.document_name = body.document_name
    if (body.status !== undefined) updates.status = body.status

    const { error } = await supabase
        .from("student_documents")
        .update(updates)
        .eq("id", id)
        .eq("agency_id", session.user.agency_id)

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
}

export async function DELETE(
    req: Request,
    context: { params: Promise<{ id: string }> }
) {
    const session = await getAuthSession()
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await context.params

    // Get doc to find storage file
    const { data: doc } = await supabase
        .from("student_documents")
        .select("file_url")
        .eq("id", id)
        .eq("agency_id", session.user.agency_id)
        .single()

    if (doc?.file_url) {
        // Extract filename from URL
        const fileName = doc.file_url.split("/").pop()
        if (fileName) {
            await supabase.storage
                .from("student-documents")
                .remove([fileName])
        }
    }

    const { error } = await supabase
        .from("student_documents")
        .delete()
        .eq("id", id)
        .eq("agency_id", session.user.agency_id)

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
}
```

- [ ] **Step 3: Test API**

Run dev server and test:

```powershell
# List documents
curl "http://localhost:3000/api/documents"

# List with search
curl "http://localhost:3000/api/documents?search=john"

# Update tags on a document
curl -X PATCH "http://localhost:3000/api/documents/<doc-id>" `
  -H "Content-Type: application/json" `
  -Body '{"tags":["<tag-id-1>","<tag-id-2>"]}'
```

---

### Task 4: Sidebar Nav + TagBadge Component

**Files:**
- Modify: `src/app/components/dashboard/Sidebar.tsx`
- Create: `src/app/components/documents/TagBadge.tsx`

**Interfaces:**
- Produces: `TagBadge({ name: string; color: string })` → renders colored pill

- [ ] **Step 1: Add Documents nav item**

In `src/app/components/dashboard/Sidebar.tsx`:

Import `FolderOpen` from lucide-react at the top.

Add nav item between "Applications" and "Universities":

```typescript
{
    name: "Documents",
    href: "/dashboard/documents",
    roles: ["admin", "counsellor"],
    icon: FolderOpen,
},
```

- [ ] **Step 2: Create TagBadge component**

```typescript
// src/app/components/documents/TagBadge.tsx
"use client"

export default function TagBadge({
    name,
    color,
    onRemove,
}: {
    name: string
    color: string
    onRemove?: () => void
}) {
    return (
        <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
            style={{
                backgroundColor: `${color}18`,
                color: color,
            }}
        >
            {name}
            {onRemove && (
                <button
                    onClick={onRemove}
                    className="cursor-pointer hover:opacity-70"
                >
                    ×
                </button>
            )}
        </span>
    )
}
```

---

### Task 5: TagManager Component

**Files:**
- Create: `src/app/components/documents/TagManager.tsx`

**Interfaces:**
- Consumes: `GET /api/document-tags`, `POST /api/document-tags`, `DELETE /api/document-tags/[id]`
- Produces: `TagManager({ selectedTags: string[], onTagsChange: (ids: string[]) => void })` — popover to select existing tags or create new ones

- [ ] **Step 1: Create TagManager component**

```typescript
// src/app/components/documents/TagManager.tsx
"use client"

import { useState, useEffect, useRef } from "react"
import { Plus, X } from "lucide-react"
import TagBadge from "./TagBadge"

type Tag = {
    id: string
    name: string
    color: string
}

export default function TagManager({
    selectedTags,
    onTagsChange,
}: {
    selectedTags: string[]
    onTagsChange: (ids: string[]) => void
}) {
    const [open, setOpen] = useState(false)
    const [tags, setTags] = useState<Tag[]>([])
    const [newName, setNewName] = useState("")
    const [newColor, setNewColor] = useState("#6366F1")
    const popoverRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        fetch("/api/document-tags")
            .then(r => r.json())
            .then(d => setTags(d.tags || []))
    }, [])

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
                setOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClick)
        return () => document.removeEventListener("mousedown", handleClick)
    }, [])

    const createTag = async () => {
        if (!newName.trim()) return
        const res = await fetch("/api/document-tags", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: newName.trim(), color: newColor }),
        })
        if (res.ok) {
            const { tag } = await res.json()
            setTags(prev => [...prev, tag])
            setNewName("")
        }
    }

    const deleteTag = async (id: string) => {
        const res = await fetch(`/api/document-tags/${id}`, { method: "DELETE" })
        if (res.ok) {
            setTags(prev => prev.filter(t => t.id !== id))
            onTagsChange(selectedTags.filter(t => t !== id))
        }
    }

    const toggleTag = (id: string) => {
        if (selectedTags.includes(id)) {
            onTagsChange(selectedTags.filter(t => t !== id))
        } else {
            onTagsChange([...selectedTags, id])
        }
    }

    const colors = ["#6366F1", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#06B6D4", "#F97316"]

    return (
        <div className="relative" ref={popoverRef}>
            <div className="flex items-center gap-1 flex-wrap">
                {selectedTags.map(id => {
                    const tag = tags.find(t => t.id === id)
                    return tag ? (
                        <TagBadge
                            key={id}
                            name={tag.name}
                            color={tag.color}
                            onRemove={() => toggleTag(id)}
                        />
                    ) : null
                })}
                <button
                    onClick={() => setOpen(!open)}
                    className="p-1 rounded hover:bg-gray-100 cursor-pointer"
                    title="Manage tags"
                >
                    <Plus size={14} className="text-text-secondary" />
                </button>
            </div>

            {open && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-lg z-50 p-3 space-y-3">
                    <p className="text-xs font-semibold text-text-secondary uppercase">Tags</p>

                    <div className="space-y-1 max-h-40 overflow-y-auto">
                        {tags.map(tag => (
                            <label
                                key={tag.id}
                                className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-50 cursor-pointer text-sm"
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedTags.includes(tag.id)}
                                    onChange={() => toggleTag(tag.id)}
                                    className="rounded border-gray-300"
                                />
                                <span
                                    className="w-2.5 h-2.5 rounded-full"
                                    style={{ backgroundColor: tag.color }}
                                />
                                <span className="flex-1">{tag.name}</span>
                                <button
                                    onClick={(e) => { e.preventDefault(); deleteTag(tag.id) }}
                                    className="cursor-pointer hover:text-red-500"
                                >
                                    <X size={12} />
                                </button>
                            </label>
                        ))}
                        {tags.length === 0 && (
                            <p className="text-xs text-text-secondary px-2">No tags yet</p>
                        )}
                    </div>

                    <div className="border-t border-gray-200 pt-2 space-y-2">
                        <p className="text-xs font-semibold text-text-secondary uppercase">New Tag</p>
                        <div className="flex gap-2">
                            <div className="flex gap-1">
                                {colors.map(c => (
                                    <button
                                        key={c}
                                        onClick={() => setNewColor(c)}
                                        className={`w-5 h-5 rounded-full cursor-pointer ${newColor === c ? "ring-2 ring-offset-1 ring-gray-400" : ""}`}
                                        style={{ backgroundColor: c }}
                                    />
                                ))}
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <input
                                value={newName}
                                onChange={e => setNewName(e.target.value)}
                                placeholder="Tag name"
                                className="flex-1 px-2 py-1.5 border border-gray-200 rounded-lg text-sm"
                                onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); createTag() } }}
                            />
                            <button
                                onClick={createTag}
                                disabled={!newName.trim()}
                                className="px-3 py-1.5 bg-[var(--color-primary)] text-white rounded-lg text-xs font-medium disabled:opacity-50 cursor-pointer"
                            >
                                Add
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
```

---

### Task 6: DocumentFilters Component

**Files:**
- Create: `src/app/components/documents/DocumentFilters.tsx`

**Interfaces:**
- Consumes: `GET /api/document-tags`
- Produces: `DocumentFilters({ filters: FilterState, onFilterChange: (f: FilterState) => void })`
- FilterState: `{ search: string; tags: string[]; status: string; dateFrom: string; dateTo: string }`

- [ ] **Step 1: Create DocumentFilters component**

```typescript
// src/app/components/documents/DocumentFilters.tsx
"use client"

import { useState, useEffect } from "react"
import { Search } from "lucide-react"
import TagBadge from "./TagBadge"

type Tag = { id: string; name: string; color: string }

export type FilterState = {
    search: string
    tags: string[]
    status: string
    dateFrom: string
    dateTo: string
}

export default function DocumentFilters({
    filters,
    onFilterChange,
}: {
    filters: FilterState
    onFilterChange: (filters: FilterState) => void
}) {
    const [tags, setTags] = useState<Tag[]>([])
    const [tagOpen, setTagOpen] = useState(false)

    useEffect(() => {
        fetch("/api/document-tags")
            .then(r => r.json())
            .then(d => setTags(d.tags || []))
    }, [])

    const update = (key: keyof FilterState, value: any) => {
        onFilterChange({ ...filters, [key]: value })
    }

    const toggleTag = (id: string) => {
        const next = filters.tags.includes(id)
            ? filters.tags.filter(t => t !== id)
            : [...filters.tags, id]
        update("tags", next)
    }

    const statuses = ["", "Pending Review", "Approved", "Rejected"]

    return (
        <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px] max-w-sm">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                <input
                    type="text"
                    placeholder="Search student or document..."
                    value={filters.search}
                    onChange={e => update("search", e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)]"
                />
            </div>

            {/* Tag Filter */}
            <div className="relative">
                <button
                    onClick={() => setTagOpen(!tagOpen)}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white hover:border-gray-300 cursor-pointer flex items-center gap-2"
                >
                    Tags {filters.tags.length > 0 && `(${filters.tags.length})`}
                </button>
                {tagOpen && (
                    <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-lg z-50 p-3">
                        <p className="text-xs font-semibold text-text-secondary uppercase mb-2">Filter by tags</p>
                        <div className="space-y-1 max-h-48 overflow-y-auto">
                            {tags.map(tag => (
                                <label
                                    key={tag.id}
                                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-50 cursor-pointer text-sm"
                                >
                                    <input
                                        type="checkbox"
                                        checked={filters.tags.includes(tag.id)}
                                        onChange={() => toggleTag(tag.id)}
                                        className="rounded border-gray-300"
                                    />
                                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: tag.color }} />
                                    {tag.name}
                                </label>
                            ))}
                            {tags.length === 0 && (
                                <p className="text-xs text-text-secondary">No tags created yet</p>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Status Filter */}
            <select
                value={filters.status}
                onChange={e => update("status", e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 cursor-pointer"
            >
                {statuses.map(s => (
                    <option key={s} value={s}>
                        {s || "All Statuses"}
                    </option>
                ))}
            </select>

            {/* Date From */}
            <input
                type="date"
                value={filters.dateFrom}
                onChange={e => update("dateFrom", e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
                title="From date"
            />

            {/* Date To */}
            <input
                type="date"
                value={filters.dateTo}
                onChange={e => update("dateTo", e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
                title="To date"
            />
        </div>
    )
}
```

---

### Task 7: DocumentPreviewModal Component

**Files:**
- Create: `src/app/components/documents/DocumentPreviewModal.tsx`

**Interfaces:**
- Consumes: document object with `file_url`, `document_name`, `document_type`
- Produces: modal with file preview + metadata panel

- [ ] **Step 1: Create preview modal**

```typescript
// src/app/components/documents/DocumentPreviewModal.tsx
"use client"

import { X, FileText, Download, ExternalLink, Trash2 } from "lucide-react"
import TagBadge from "./TagBadge"

type Document = {
    id: string
    student_id: string
    student_name: string
    document_name: string
    file_url: string
    document_type: string
    tags: string[]
    tag_details: Array<{ id: string; name: string; color: string }>
    status: string
    created_at: string
}

export default function DocumentPreviewModal({
    document,
    onClose,
    onDelete,
}: {
    document: Document | null
    onClose: () => void
    onDelete?: (id: string) => void
}) {
    if (!document) return null

    const fileUrl = document.file_url
    const isImage = /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(document.document_name)
    const isPdf = /\.pdf$/i.test(document.document_name)
    const isDocx = /\.docx?$/i.test(document.document_name)

    const renderPreview = () => {
        if (isImage) {
            return (
                <img
                    src={fileUrl}
                    alt={document.document_name}
                    className="max-w-full max-h-full object-contain"
                />
            )
        }

        if (isPdf) {
            return (
                <iframe
                    src={`${fileUrl}#toolbar=0`}
                    className="w-full h-full rounded-lg"
                    title={document.document_name}
                />
            )
        }

        if (isDocx) {
            return (
                <iframe
                    src={`https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`}
                    className="w-full h-full rounded-lg"
                    title={document.document_name}
                />
            )
        }

        return (
            <div className="flex flex-col items-center justify-center h-full text-text-secondary gap-3">
                <FileText size={48} />
                <p className="text-sm">Preview not available</p>
                <a
                    href={fileUrl}
                    target="_blank"
                    className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg text-sm font-medium hover:opacity-90 transition"
                >
                    <Download size={16} className="inline mr-1" />
                    Download File
                </a>
            </div>
        )
    }

    const statusColors: Record<string, string> = {
        "Approved": "bg-green-50 text-green-600",
        "Rejected": "bg-red-50 text-red-600",
        "Pending Review": "bg-amber-50 text-amber-600",
    }

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white w-full max-w-5xl max-h-[90vh] rounded-xl shadow-xl flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0">
                    <div className="flex items-center gap-3 min-w-0">
                        <h3 className="text-lg font-bold truncate">
                            {document.document_name}
                        </h3>
                        <span
                            className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${
                                statusColors[document.status] || "bg-gray-50 text-gray-600"
                            }`}
                        >
                            {document.status}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <a
                            href={fileUrl}
                            target="_blank"
                            className="p-2 hover:bg-gray-100 rounded cursor-pointer"
                            title="Open in new tab"
                        >
                            <ExternalLink size={16} />
                        </a>
                        {onDelete && (
                            <button
                                onClick={() => onDelete(document.id)}
                                className="p-2 hover:bg-red-50 rounded text-red-500 cursor-pointer"
                                title="Delete"
                            >
                                <Trash2 size={16} />
                            </button>
                        )}
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded cursor-pointer">
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex flex-1 min-h-0">
                    {/* Preview Area */}
                    <div className="flex-1 bg-gray-100 flex items-center justify-center p-4 overflow-auto">
                        {renderPreview()}
                    </div>

                    {/* Metadata Panel */}
                    <div className="w-64 border-l border-gray-200 p-4 space-y-4 overflow-y-auto shrink-0">
                        <div>
                            <p className="text-xs font-semibold text-text-secondary uppercase mb-1">Student</p>
                            <p className="text-sm font-medium">{document.student_name}</p>
                        </div>

                        <div>
                            <p className="text-xs font-semibold text-text-secondary uppercase mb-1">Document Type</p>
                            <p className="text-sm">{document.document_type || "—"}</p>
                        </div>

                        <div>
                            <p className="text-xs font-semibold text-text-secondary uppercase mb-1">Tags</p>
                            <div className="flex flex-wrap gap-1">
                                {document.tag_details.length > 0
                                    ? document.tag_details.map(t => (
                                        <TagBadge key={t.id} name={t.name} color={t.color} />
                                    ))
                                    : <span className="text-sm text-text-secondary">None</span>
                                }
                            </div>
                        </div>

                        <div>
                            <p className="text-xs font-semibold text-text-secondary uppercase mb-1">Uploaded</p>
                            <p className="text-sm">
                                {new Date(document.created_at).toLocaleDateString("en-US", {
                                    year: "numeric", month: "short", day: "numeric"
                                })}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs font-semibold text-text-secondary uppercase mb-1">File</p>
                            <p className="text-sm text-text-secondary break-all">{document.document_name}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
```

---

### Task 8: DocumentTable Component

**Files:**
- Create: `src/app/components/documents/DocumentTable.tsx`

**Interfaces:**
- Consumes: documents array, pagination info, tagDetails, callbacks for row click and tag change
- Produces: `DocumentTable({ documents, total, page, limit, onPageChange, onDocumentClick, onTagsChange })`

- [ ] **Step 1: Create DocumentTable component**

```typescript
// src/app/components/documents/DocumentTable.tsx
"use client"

import { FileText, Eye, ChevronLeft, ChevronRight } from "lucide-react"
import TagBadge from "./TagBadge"

type Document = {
    id: string
    student_id: string
    student_name: string
    document_name: string
    file_url: string
    document_type: string
    tags: string[]
    tag_details: Array<{ id: string; name: string; color: string }>
    status: string
    created_at: string
}

export default function DocumentTable({
    documents,
    total,
    page,
    limit,
    loading,
    onPageChange,
    onDocumentClick,
}: {
    documents: Document[]
    total: number
    page: number
    limit: number
    loading?: boolean
    onPageChange: (page: number) => void
    onDocumentClick: (doc: Document) => void
}) {
    const totalPages = Math.ceil(total / limit)

    const statusStyles: Record<string, string> = {
        "Approved": "bg-green-50 text-green-600",
        "Rejected": "bg-red-50 text-red-600",
        "Pending Review": "bg-amber-50 text-amber-600",
    }

    if (loading) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
                <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
                    ))}
                </div>
            </div>
        )
    }

    if (documents.length === 0) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 flex flex-col items-center justify-center text-center">
                <FileText size={48} className="text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold text-text-primary mb-1">No documents found</h3>
                <p className="text-sm text-text-secondary">
                    Try adjusting your filters or upload a new document.
                </p>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="bg-gray-50 text-left">
                            <th className="px-6 py-4 text-sm font-semibold text-text-secondary">Student</th>
                            <th className="px-6 py-4 text-sm font-semibold text-text-secondary">Document</th>
                            <th className="px-6 py-4 text-sm font-semibold text-text-secondary">Tags</th>
                            <th className="px-6 py-4 text-sm font-semibold text-text-secondary">Status</th>
                            <th className="px-6 py-4 text-sm font-semibold text-text-secondary">Uploaded</th>
                            <th className="px-6 py-4 text-sm font-semibold text-text-secondary text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {documents.map((doc) => (
                            <tr
                                key={doc.id}
                                className="border-t border-gray-100 hover:bg-gray-50 transition cursor-pointer"
                                onClick={() => onDocumentClick(doc)}
                            >
                                <td className="px-6 py-4">
                                    <p className="text-sm font-medium">{doc.student_name}</p>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <FileText size={14} className="text-text-secondary shrink-0" />
                                        <span className="text-sm truncate max-w-[200px]">
                                            {doc.document_name}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-wrap gap-1">
                                        {doc.tag_details.slice(0, 3).map(t => (
                                            <TagBadge key={t.id} name={t.name} color={t.color} />
                                        ))}
                                        {doc.tag_details.length > 3 && (
                                            <span className="text-xs text-text-secondary">
                                                +{doc.tag_details.length - 3}
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span
                                        className={`text-xs px-2 py-0.5 rounded-full ${
                                            statusStyles[doc.status] || "bg-gray-50 text-gray-600"
                                        }`}
                                    >
                                        {doc.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-sm text-text-secondary">
                                        {new Date(doc.created_at).toLocaleDateString("en-US", {
                                            month: "short", day: "numeric", year: "numeric"
                                        })}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onDocumentClick(doc) }}
                                        className="p-2 hover:bg-gray-100 rounded cursor-pointer"
                                        title="Preview"
                                    >
                                        <Eye size={16} className="text-text-secondary" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                    <p className="text-sm text-text-secondary">
                        Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => onPageChange(page - 1)}
                            disabled={page <= 1}
                            className="p-2 hover:bg-gray-100 rounded disabled:opacity-30 cursor-pointer"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <span className="text-sm font-medium px-2">{page} of {totalPages}</span>
                        <button
                            onClick={() => onPageChange(page + 1)}
                            disabled={page >= totalPages}
                            className="p-2 hover:bg-gray-100 rounded disabled:opacity-30 cursor-pointer"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
```

---

### Task 9: UploadDocumentModal Component

**Files:**
- Create: `src/app/components/documents/UploadDocumentModal.tsx`

**Interfaces:**
- Consumes: `POST /api/student-documents`, `GET /api/document-tags`
- Produces: upload modal for vault (requires picking student)

- [ ] **Step 1: Create upload modal for vault**

```typescript
// src/app/components/documents/UploadDocumentModal.tsx
"use client"

import { useState, useEffect } from "react"
import { X, UploadCloud } from "lucide-react"
import { useRouter } from "next/navigation"
import TagBadge from "./TagBadge"

type Tag = { id: string; name: string; color: string }

export default function UploadDocumentModal({
    open,
    onClose,
}: {
    open: boolean
    onClose: () => void
}) {
    const router = useRouter()
    const [file, setFile] = useState<File | null>(null)
    const [studentId, setStudentId] = useState("")
    const [studentSearch, setStudentSearch] = useState("")
    const [students, setStudents] = useState<any[]>([])
    const [tags, setTags] = useState<Tag[]>([])
    const [selectedTags, setSelectedTags] = useState<string[]>([])
    const [loading, setLoading] = useState(false)
    const [tagOpen, setTagOpen] = useState(false)

    useEffect(() => {
        fetch("/api/document-tags")
            .then(r => r.json())
            .then(d => setTags(d.tags || []))
    }, [])

    useEffect(() => {
        if (studentSearch.length < 1) { setStudents([]); return }
        const timer = setTimeout(async () => {
            const res = await fetch(`/api/students?search=${encodeURIComponent(studentSearch)}`)
            const d = await res.json()
            setStudents(d.students || [])
        }, 300)
        return () => clearTimeout(timer)
    }, [studentSearch])

    if (!open) return null

    const handleUpload = async () => {
        if (!file || !studentId) return
        setLoading(true)

        const formData = new FormData()
        formData.append("file", file)
        formData.append("student_id", studentId)
        formData.append("document_type", "Other")
        selectedTags.forEach(t => formData.append("tags", t))

        const res = await fetch("/api/student-documents", {
            method: "POST",
            body: formData,
        })

        setLoading(false)

        if (res.ok) {
            setFile(null)
            setStudentId("")
            setSelectedTags([])
            router.refresh()
            onClose()
        }
    }

    const toggleTag = (id: string) => {
        setSelectedTags(prev =>
            prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
        )
    }

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white w-full max-w-lg rounded-xl shadow-xl">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-bold">Upload Document</h3>
                    <button onClick={onClose} className="cursor-pointer">
                        <X size={18} />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    {/* Student Search */}
                    <div className="relative">
                        <p className="text-sm font-medium mb-1">Student</p>
                        <input
                            type="text"
                            placeholder="Search student..."
                            value={studentSearch}
                            onChange={e => setStudentSearch(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                        />
                        {students.length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-40 overflow-y-auto">
                                {students.map((s: any) => (
                                    <button
                                        key={s.id}
                                        onClick={() => { setStudentId(s.id); setStudentSearch(`${s.first_name} ${s.last_name || ""}`.trim()); setStudents([]) }}
                                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer"
                                    >
                                        {s.first_name} {s.last_name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Tags */}
                    <div>
                        <p className="text-sm font-medium mb-1">Tags</p>
                        <div className="relative">
                            <button
                                onClick={() => setTagOpen(!tagOpen)}
                                className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white w-full text-left cursor-pointer"
                            >
                                {selectedTags.length > 0
                                    ? `${selectedTags.length} tag(s) selected`
                                    : "Select tags..."
                                }
                            </button>
                            {tagOpen && (
                                <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-2 max-h-40 overflow-y-auto">
                                    {tags.map(tag => (
                                        <label key={tag.id} className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-50 rounded cursor-pointer text-sm">
                                            <input
                                                type="checkbox"
                                                checked={selectedTags.includes(tag.id)}
                                                onChange={() => toggleTag(tag.id)}
                                                className="rounded border-gray-300"
                                            />
                                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: tag.color }} />
                                            {tag.name}
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>
                        {selectedTags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                                {selectedTags.map(id => {
                                    const tag = tags.find(t => t.id === id)
                                    return tag ? <TagBadge key={id} name={tag.name} color={tag.color} /> : null
                                })}
                            </div>
                        )}
                    </div>

                    {/* File Upload */}
                    <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl p-6 cursor-pointer hover:border-[var(--color-primary)] transition">
                        <UploadCloud size={32} className="text-text-secondary mb-2" />
                        <span className="text-sm font-medium">
                            {file ? file.name : "Click to upload document"}
                        </span>
                        <span className="text-xs text-text-secondary mt-1">PDF, DOCX, JPG, PNG supported</span>
                        <input type="file" className="hidden" onChange={e => setFile(e.target.files?.[0] || null)} />
                    </label>
                </div>

                <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-text-secondary hover:bg-gray-100 rounded-lg cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleUpload}
                        disabled={!file || !studentId || loading}
                        className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 cursor-pointer"
                    >
                        {loading ? "Uploading..." : "Upload"}
                    </button>
                </div>
            </div>
        </div>
    )
}
```

- [ ] **Step 2: Update student-documents API to accept tags**

Modify `src/app/api/student-documents/route.ts` to read `tags` from FormData:

```typescript
// After parsing document_type, add:
const tagsRaw = formData.getAll("tags") as string[]
```

And in the insert, add:
```typescript
tags: tagsRaw.length > 0 ? tagsRaw : [],
```

---

### Task 10: DocumentVaultClient + Vault Page

**Files:**
- Create: `src/app/components/documents/DocumentVaultClient.tsx`
- Create: `src/app/dashboard/documents/page.tsx`

**Interfaces:**
- Produces: fully functional vault page at `/dashboard/documents`

- [ ] **Step 1: Create vault client component**

```typescript
// src/app/components/documents/DocumentVaultClient.tsx
"use client"

import { useState, useCallback } from "react"
import { Upload } from "lucide-react"
import DocumentFilters, { FilterState } from "./DocumentFilters"
import DocumentTable from "./DocumentTable"
import DocumentPreviewModal from "./DocumentPreviewModal"
import UploadDocumentModal from "./UploadDocumentModal"

type Document = {
    id: string
    student_id: string
    student_name: string
    document_name: string
    file_url: string
    document_type: string
    tags: string[]
    tag_details: Array<{ id: string; name: string; color: string }>
    status: string
    created_at: string
}

export default function DocumentVaultClient() {
    const [filters, setFilters] = useState<FilterState>({
        search: "", tags: [], status: "", dateFrom: "", dateTo: "",
    })
    const [page, setPage] = useState(1)
    const [documents, setDocuments] = useState<Document[]>([])
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(true)
    const [previewDoc, setPreviewDoc] = useState<Document | null>(null)
    const [uploadOpen, setUploadOpen] = useState(false)

    const limit = 25

    const fetchDocuments = useCallback(async () => {
        setLoading(true)
        const params = new URLSearchParams()
        if (filters.search) params.set("search", filters.search)
        filters.tags.forEach(t => params.append("tags", t))
        if (filters.status) params.set("status", filters.status)
        if (filters.dateFrom) params.set("date_from", filters.dateFrom)
        if (filters.dateTo) params.set("date_to", filters.dateTo)
        params.set("page", String(page))
        params.set("limit", String(limit))

        const res = await fetch(`/api/documents?${params}`)
        const data = await res.json()
        setDocuments(data.documents || [])
        setTotal(data.total || 0)
        setLoading(false)
    }, [filters, page])

    // Fetch on mount and when filters/page change
    const [initialFetch, setInitialFetch] = useState(true)
    if (initialFetch) {
        fetchDocuments()
        setInitialFetch(false)
    }

    // Refetch when filters or page change
    // In a real component, this would be in useEffect
    useState(() => {
        // Re-fetch will be triggered by page/filter state changes
    })

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black">Document Vault</h1>
                    <p className="text-sm text-text-secondary mt-1">
                        Browse and manage all student documents
                    </p>
                </div>
                <button
                    onClick={() => setUploadOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg text-sm font-medium hover:opacity-90 transition cursor-pointer"
                >
                    <Upload size={16} />
                    Upload Document
                </button>
            </div>

            {/* Filters */}
            <DocumentFilters
                filters={filters}
                onFilterChange={(f) => { setFilters(f); setPage(1) }}
            />

            {/* Table */}
            <DocumentTable
                documents={documents}
                total={total}
                page={page}
                limit={limit}
                loading={loading}
                onPageChange={setPage}
                onDocumentClick={setPreviewDoc}
            />

            {/* Preview Modal */}
            <DocumentPreviewModal
                document={previewDoc}
                onClose={() => setPreviewDoc(null)}
            />

            {/* Upload Modal */}
            <UploadDocumentModal
                open={uploadOpen}
                onClose={() => { setUploadOpen(false); fetchDocuments() }}
            />
        </div>
    )
}
```

Wait, I have a bug in the above component — I'm using `useState` as a callback which is wrong. Let me fix it to use `useEffect` properly:

```typescript
// src/app/components/documents/DocumentVaultClient.tsx
"use client"

import { useState, useEffect, useCallback } from "react"
import { Upload } from "lucide-react"
import { useRouter } from "next/navigation"
import DocumentFilters, { FilterState } from "./DocumentFilters"
import DocumentTable from "./DocumentTable"
import DocumentPreviewModal from "./DocumentPreviewModal"
import UploadDocumentModal from "./UploadDocumentModal"

type TagDetail = { id: string; name: string; color: string }

type Document = {
    id: string
    student_id: string
    student_name: string
    document_name: string
    file_url: string
    document_type: string
    tags: string[]
    tag_details: TagDetail[]
    status: string
    created_at: string
}

export default function DocumentVaultClient() {
    const router = useRouter()
    const [filters, setFilters] = useState<FilterState>({
        search: "", tags: [], status: "", dateFrom: "", dateTo: "",
    })
    const [page, setPage] = useState(1)
    const [documents, setDocuments] = useState<Document[]>([])
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(true)
    const [previewDoc, setPreviewDoc] = useState<Document | null>(null)
    const [uploadOpen, setUploadOpen] = useState(false)
    const limit = 25

    const fetchDocuments = useCallback(async () => {
        setLoading(true)
        const params = new URLSearchParams()
        if (filters.search) params.set("search", filters.search)
        filters.tags.forEach(t => params.append("tags", t))
        if (filters.status) params.set("status", filters.status)
        if (filters.dateFrom) params.set("date_from", filters.dateFrom)
        if (filters.dateTo) params.set("date_to", filters.dateTo)
        params.set("page", String(page))
        params.set("limit", String(limit))

        const res = await fetch(`/api/documents?${params}`)
        const data = await res.json()
        setDocuments(data.documents || [])
        setTotal(data.total || 0)
        setLoading(false)
    }, [filters, page, limit])

    useEffect(() => {
        fetchDocuments()
    }, [fetchDocuments])

    const handleFilterChange = (f: FilterState) => {
        setFilters(f)
        setPage(1)
    }

    const handleDelete = async (id: string) => {
        const res = await fetch(`/api/documents/${id}`, { method: "DELETE" })
        if (res.ok) {
            setPreviewDoc(null)
            fetchDocuments()
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black">Document Vault</h1>
                    <p className="text-sm text-text-secondary mt-1">
                        Browse and manage all student documents
                    </p>
                </div>
                <button
                    onClick={() => setUploadOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg text-sm font-medium hover:opacity-90 transition cursor-pointer"
                >
                    <Upload size={16} />
                    Upload Document
                </button>
            </div>

            <DocumentFilters filters={filters} onFilterChange={handleFilterChange} />

            <DocumentTable
                documents={documents}
                total={total}
                page={page}
                limit={limit}
                loading={loading}
                onPageChange={setPage}
                onDocumentClick={setPreviewDoc}
            />

            <DocumentPreviewModal
                document={previewDoc}
                onClose={() => setPreviewDoc(null)}
                onDelete={handleDelete}
            />

            <UploadDocumentModal
                open={uploadOpen}
                onClose={() => { setUploadOpen(false); fetchDocuments() }}
            />
        </div>
    )
}
```

- [ ] **Step 2: Create vault page**

```typescript
// src/app/dashboard/documents/page.tsx
import DocumentVaultClient from "@/app/components/documents/DocumentVaultClient"

export const metadata = {
    title: "Document Vault - StudyAbroad",
}

export default function DocumentVaultPage() {
    return <DocumentVaultClient />
}
```

- [ ] **Step 3: Verify page renders**

Start dev server and navigate to `/dashboard/documents`. Ensure the page renders without errors.

---

### Task 11: Upgrade Per-Student Components

**Files:**
- Modify: `src/app/components/students/UploadDocument.tsx`
- Modify: `src/app/components/students/StudentDocumentsModal.tsx`

- [ ] **Step 1: Add tag selection to per-student UploadDocument**

Add tag selection to the existing upload component. Import `TagBadge` and add a tag multi-select section after the document_type dropdown.

In `UploadDocument.tsx`, add state and tag fetching:

```typescript
// Add these imports
import TagBadge from "../documents/TagBadge"

// Add state
const [tags, setTags] = useState<any[]>([])
const [selectedTags, setSelectedTags] = useState<string[]>([])
const [tagOpen, setTagOpen] = useState(false)

// Fetch tags on mount
useEffect(() => {
    fetch("/api/document-tags")
        .then(r => r.json())
        .then(d => setTags(d.tags || []))
}, [])
```

Add tag UI after the document type dropdown and before the file upload box:

```tsx
{/* Tags */}
<div className="relative">
    <button
        type="button"
        onClick={() => setTagOpen(!tagOpen)}
        className="w-full flex items-center justify-between px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:border-[var(--color-primary)] transition"
    >
        {selectedTags.length > 0 ? `${selectedTags.length} tag(s)` : "Select tags"}
    </button>
    {tagOpen && (
        <div className="absolute mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-2 max-h-40 overflow-y-auto">
            {tags.map((tag: any) => (
                <label
                    key={tag.id}
                    className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-50 rounded cursor-pointer text-sm"
                >
                    <input
                        type="checkbox"
                        checked={selectedTags.includes(tag.id)}
                        onChange={() => {
                            setSelectedTags(prev =>
                                prev.includes(tag.id)
                                    ? prev.filter(t => t !== tag.id)
                                    : [...prev, tag.id]
                            )
                        }}
                        className="rounded border-gray-300"
                    />
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: tag.color }} />
                    {tag.name}
                </label>
            ))}
        </div>
    )}
</div>
{selectedTags.length > 0 && (
    <div className="flex flex-wrap gap-1">
        {selectedTags.map(id => {
            const tag = tags.find((t: any) => t.id === id)
            return tag ? <TagBadge key={id} name={tag.name} color={tag.color} /> : null
        })}
    </div>
)}
```

Update `handleUpload` to include tags:

```typescript
selectedTags.forEach(t => formData.append("tags", t))
```

- [ ] **Step 2: Upgrade StudentDocumentsModal**

Replace the simple `Eye` link (which opens in new tab) with a preview modal, and show tags for each document.

Import and use the preview modal:

```typescript
// In StudentDocumentsModal.tsx
import { useState } from "react"
import DocumentPreviewModal from "../documents/DocumentPreviewModal"
import TagBadge from "../documents/TagBadge"
```

Add state:
```typescript
const [previewDoc, setPreviewDoc] = useState<any>(null)
```

After the `</div>` that closes the modal, add:
```tsx
<DocumentPreviewModal
    document={previewDoc ? {
        ...previewDoc,
        student_name: "Student",
        tag_details: [],
    } : null}
    onClose={() => setPreviewDoc(null)}
/>
```

Update the view button to open preview instead of new tab:
```tsx
<button
    onClick={() => setPreviewDoc(doc)}
    className="p-2 hover:bg-gray-100 rounded cursor-pointer"
    title="Preview"
>
    <Eye size={16} />
</button>
```

Add tag display next to document info. The modal now accepts a `allTags` prop (array of `{ id, name, color }` from the server) to resolve tag IDs:

```typescript
// Add to component props
export default function StudentDocumentsModal({
    open,
    onClose,
    documents,
    allTags = [], // NEW
}: {
    open: boolean
    onClose: () => void
    documents: any[]
    allTags?: Array<{ id: string; name: string; color: string }>
}) {
```

```tsx
// Below the document_type line, inside the document row
{doc.tags && doc.tags.length > 0 && (
    <div className="flex flex-wrap gap-1 mt-1">
        {doc.tags.map((tagId: string) => {
            const tag = allTags.find((t: any) => t.id === tagId)
            return tag ? (
                <TagBadge key={tagId} name={tag.name} color={tag.color} />
            ) : null
        })}
    </div>
)}
```

- [ ] **Step 3: Update student page to pass all tags**

In `src/app/dashboard/students/[id]/page.tsx`, after fetching documents, also fetch agency tags:

```typescript
const { data: allDocTags } = await supabase
    .from("document_tags")
    .select("*")
    .eq("agency_id", session.user.agency_id)
```

Pass to modal:
```tsx
<ViewDocumentsButton documents={documents || []} allTags={allDocTags || []} />
```

And update `ViewDocumentsButton` to pass `allTags` to `StudentDocumentsModal`.

---

## Spec Coverage Check

| Spec Requirement | Task |
|---|---|
| document_tags table | Task 1 |
| tags column on student_documents | Task 1 |
| Tag CRUD API | Task 2 |
| Documents list API (search, filter, pagination) | Task 3 |
| Document update/delete API | Task 3 |
| Sidebar nav item | Task 4 |
| TagBadge component | Task 4 |
| TagManager popover | Task 5 |
| DocumentFilters component | Task 6 |
| DocumentPreviewModal (PDF/img/DOCX) | Task 7 |
| DocumentTable with pagination | Task 8 |
| Upload from vault (UploadDocumentModal) | Task 9 |
| Vault page | Task 10 |
| Per-student upload tag support | Task 11 |
| Per-student modal with tags + preview | Task 11 |

All spec requirements are covered.
