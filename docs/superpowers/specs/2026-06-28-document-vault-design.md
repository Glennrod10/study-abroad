# Document Vault — Design Spec

## Overview

A centralized document management hub within the StudyAbroad CRM where agency staff can browse, search, filter, preview, and manage all student documents from one place. Documents remain accessible per-student as well (existing flow preserved).

## Data Model

### Existing: `student_documents` (augmented)

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | existing |
| student_id | uuid FK → students | existing |
| agency_id | uuid FK → agencies | existing |
| document_name | text | existing |
| file_url | text | existing |
| document_type | text | existing — kept for backward compat |
| tags | jsonb | **NEW** — array of tag IDs e.g. `["uuid1", "uuid2"]` |
| status | text | existing |
| created_at | timestamptz | existing |

### New: `document_tags`

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | gen_random_uuid() |
| name | text | unique per agency |
| color | text | hex color for UI badge |
| agency_id | uuid FK → agencies | scoped to agency |
| created_at | timestamptz | |

Index: unique on (name, agency_id)

### Storage

Reuse existing `student-documents` Supabase Storage bucket. No changes.

## API Endpoints

### `/api/documents`

| Method | Purpose | Notes |
|---|---|---|
| GET | List all documents for agency | Query params: search, tags[], student_id, status, date_from, date_to, page, limit. Joins students table for name. Returns signed URLs for preview. |
| PATCH /[id] | Update tags, document_name, status | Accepts partial updates |
| DELETE /[id] | Delete doc + storage file | Removes from DB + Supabase Storage |

### `/api/document-tags`

| Method | Purpose |
|---|---|
| GET | List all tags for agency |
| POST | Create tag (name, color) |
| DELETE /[id] | Delete tag (removes from all docs) |

## Pages

### `/dashboard/documents` — Document Vault (new)

Main page. Client component. Layout:

```
Page Header: "Document Vault" + "Upload Document" button (opens modal)
Filters Bar: search input | tag multi-select dropdown | status dropdown | date range
Table: student name | document name | tags (colored badges) | status | upload date | actions (view, edit tags, delete)
Pagination: same pattern as StudentsTable
```

### `/dashboard/students/[id]` — Per-student (existing)

Upgrade `StudentDocumentsModal` to show tags and use the same preview modal component.

## Components

### New

1. **`DocumentVaultPage`** — Main page shell with filter state management + data fetching
2. **`DocumentFilters`** — Search input (debounced), tag multi-select (dropdown with checkboxes), status dropdown, optional date picker
3. **`DocumentTable`** — Full table with sortable columns, pagination
4. **`DocumentPreviewModal`** — Modal with:
   - Left: file preview (PDF via iframe/pdf.js, images via `<img>`, DOCX via Google Docs viewer or download prompt)
   - Right: metadata panel (student name + link, tags, status, upload date, document name, edit/delete actions)
5. **`TagBadge`** — Small colored pill showing tag name
6. **`TagManager`** — Inline UI to create/edit/delete tags in a small dropdown/popover
7. **`UploadDocumentModal`** — Upload modal for the vault (select student, file, tags, optional document_type)
8. **`EmptyState`** — Reuse existing pattern

### Modified

1. **`StudentDocumentsModal`** — Use `TagBadge`, link to vault, use `DocumentPreviewModal` for preview
2. **`UploadDocument`** — Add tag selection alongside document_type dropdown (keep existing functionality)

## Preview Strategy

| Type | Method |
|---|---|
| PDF | `<iframe>` with Supabase signed URL + PDF.js viewer fallback |
| JPEG/PNG/WebP | Native `<img>` with signed URL |
| DOCX | Google Docs viewer `<iframe>` (`https://docs.google.com/viewer?url=...`) + download fallback |
| Other | Download link |

Signed URLs from Supabase Storage (7-day expiry) for secure viewing.

## UI / Layout

Follows the existing dashboard pattern:
- Table card: `bg-white rounded-xl border border-gray-200 shadow-sm`
- Filters: inline row with `gap-3`, inputs use `border-gray-200 rounded-lg`
- Table header: `bg-gray-50 text-text-secondary text-sm font-semibold`
- Table row: `hover:bg-gray-50 border-b border-gray-100`
- Tags: colored pills `px-2 py-0.5 rounded-full text-xs font-medium`
- Preview modal: `fixed inset-0 bg-black/40 z-50`, white card `max-w-5xl`
- Upload modal: same pattern, `max-w-lg`

## Nav Item

Add "Documents" to sidebar nav, between "Applications" and "Universities":

```ts
{
    name: "Documents",
    href: "/dashboard/documents",
    roles: ["admin", "counsellor"],
    icon: FolderOpen, // from lucide-react
}
```

## Permission Model

- `admin` + `counsellor` roles can access the vault
- `superadmin` sees all agency docs implicitly through agency_id
- Users only see documents belonging to their agency

## Future Considerations (out of scope)

- Bulk tag assignment
- Drag-and-drop upload
- OCR / document content search
- Version history for documents
- Document request workflow (ask student to upload specific docs)
