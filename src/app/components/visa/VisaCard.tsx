"use client";

import { useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import { VISA_COLUMNS } from "./constants";
import { toast } from "sonner";
import {
    Pencil,
    Trash2,
    Eye,
    GripVertical,
    FileText,
    CircleCheck,
} from "lucide-react";
import Link from "next/link";

export default function VisaCard({
    visa,
    onUpdated,
    onDeleted,
    onOpenChecklist
}: any) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        isDragging,
    } = useDraggable({
        id: visa.id,
    });

    const [isEditing, setIsEditing] = useState(false);
    const [showNotes, setShowNotes] = useState(false); // ✅ NEW

    const [visaType, setVisaType] = useState(visa.visa_type);
    const [status, setStatus] = useState(visa.status);
    const [notes, setNotes] = useState(visa.notes ?? "");
    const [tagsInput, setTagsInput] = useState(
        visa.tags?.join(", ") ?? ""
    );

    const style = {
        transform: transform
            ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
            : undefined,
        opacity: isDragging ? 0.6 : 1,
    };
    const openChecklist = () => {
        onOpenChecklist(visa.id)
        toast.success("Opening visa checklist")
    }
    const handleSave = async () => {
        const res = await fetch(`/api/visas/${visa.id}/status`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                visa_type: visaType,
                status,
                notes,
                tags: tagsInput
                    .split(",")
                    .map((t) => t.trim())
                    .filter(Boolean),
            }),
        });

        if (res.ok) {
            toast.success("Visa updated successfully");
            onUpdated();
            setIsEditing(false);
        } else {
            toast.error("Failed to update visa");
        }
    };

    const handleDelete = async () => {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete this visa case?"
        );

        if (!confirmDelete) return;

        const res = await fetch(`/api/visas/${visa.id}`, {
            method: "DELETE",
        });

        if (res.ok) {
            toast.success("Visa deleted successfully");
            onDeleted();
        } else {
            toast.error("Failed to delete visa");
        }
    };

    return (
        <>
            <div
                ref={setNodeRef}
                style={style}
                className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200"
            >
                {/* Drag Handle */}
                <div
                    {...listeners}
                    {...attributes}
                    className="cursor-grab active:cursor-grabbing text-gray-400 mb-2 flex items-center gap-1 text-xs"
                >
                    <GripVertical size={14} />
                    Drag
                </div>

                {!isEditing ? (
                    <>
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-semibold text-sm">
                                    {visa.student_name}

                                </h3>
                                <p className="text-xs text-gray-500 mt-1">
                                    {visa.country}
                                </p>
                            </div>

                            <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full">
                                {visa.visa_type}
                            </span>
                        </div>
                        {/* data which enters from other tabs */}
                        <div className="mt-3 border border-gray-200 shadow-sm rounded-lg py-3 px-4">
                            {visa.checklist_total > 0 && (

                                <div className="">

                                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                                        <span>Checklist</span>
                                        <span>
                                            {visa.checklist_completed} / {visa.checklist_total}
                                        </span>
                                    </div>

                                    <div className="w-full bg-gray-200 rounded-full h-1.5">

                                        <div
                                            className="bg-green-500 h-1.5 rounded-full"
                                            style={{
                                                width: `${(visa.checklist_completed / visa.checklist_total) * 100
                                                    }%`
                                            }}
                                        />

                                    </div>

                                </div>

                            )}
                            {visa.next_appointment && (() => {

                                const now = new Date();
                                const appt = new Date(visa.next_appointment);

                                const diff = Math.ceil(
                                    (appt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
                                );

                                let label = "";

                                if (diff > 1) {
                                    label = `${visa.next_appointment_type} in ${diff} days`;
                                } else if (diff === 1) {
                                    label = `${visa.next_appointment_type} tomorrow`;
                                } else if (diff === 0) {
                                    label = `${visa.next_appointment_type} today`;
                                }

                                return (
                                    <div className="mt-2 text-xs text-orange-600 font-medium">
                                        {label}
                                    </div>
                                );

                            })()}
                        </div>

                        <div className="border-t my-3"></div>

                        <div className="flex justify-between items-center">
                            <Link
                                href={`/dashboard/applications/${visa.application_id}`}
                                className="text-blue-600 hover:text-blue-800 cursor-pointer"
                            >
                                <Eye size={16} />
                            </Link>

                            <div className="flex gap-3 text-gray-500">

                                {/* ✅ NEW: View Notes Icon */}
                                <button
                                    onClick={() => setShowNotes(true)}
                                    className="hover:text-indigo-600 cursor-pointer"
                                >
                                    <FileText size={16} />
                                </button>
                                <button
                                    onClick={openChecklist}
                                    className="hover:text-green-600 cursor-pointer"
                                    title="Open Checklist"
                                >
                                    <CircleCheck size={16} />
                                </button>

                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="hover:text-black cursor-pointer"
                                >
                                    <Pencil size={16} />
                                </button>

                                <button
                                    onClick={handleDelete}
                                    className="hover:text-red-600 cursor-pointer"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <input
                            value={visaType}
                            onChange={(e) =>
                                setVisaType(e.target.value)
                            }
                            className="w-full border p-2 rounded-md mb-2"
                        />

                        <select
                            value={status}
                            onChange={(e) =>
                                setStatus(e.target.value)
                            }
                            className="w-full border p-2 rounded-md mb-2"
                        >
                            {VISA_COLUMNS.map((col) => (
                                <option key={col.id} value={col.id}>
                                    {col.title}
                                </option>
                            ))}
                        </select>

                        <textarea
                            placeholder="Internal notes..."
                            value={notes}
                            onChange={(e) =>
                                setNotes(e.target.value)
                            }
                            className="w-full border p-2 rounded-md mb-2 text-sm"
                        />

                        <input
                            placeholder="Tags (comma separated)"
                            value={tagsInput}
                            onChange={(e) =>
                                setTagsInput(e.target.value)
                            }
                            className="w-full border p-2 rounded-md mb-3 text-sm"
                        />

                        <div className="flex justify-end gap-3 text-sm">
                            <button
                                onClick={() => setIsEditing(false)}
                                className="text-gray-500 cursor-pointer"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleSave}
                                className="text-blue-600 font-semibold cursor-pointer"
                            >
                                Save
                            </button>
                        </div>
                    </>
                )}
            </div>

            {/* ✅ NOTES MODAL */}
            {showNotes && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white w-[450px] rounded-xl p-6 shadow-xl space-y-4">
                        <h2 className="text-lg font-semibold">
                            Notes – {visa.student_name}
                        </h2>

                        {visa.tags?.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {visa.tags.map((tag: string) => (
                                    <span
                                        key={tag}
                                        className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}

                        <div className="text-sm text-gray-600 whitespace-pre-line">
                            {visa.notes || "No notes added yet."}
                        </div>

                        <div className="flex justify-end pt-4">
                            <button
                                onClick={() => setShowNotes(false)}
                                className="px-4 py-2 border rounded-md hover:bg-gray-100 transition cursor-pointer"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}