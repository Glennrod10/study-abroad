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
