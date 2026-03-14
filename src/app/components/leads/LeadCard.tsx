"use client";

import { useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import {
    Pencil,
    Trash2,
    GripVertical,
    ArrowRightCircle
} from "lucide-react";
import { toast } from "sonner";

export default function LeadCard({
    lead,
    onUpdated,
    onDeleted,
}: any) {

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        isDragging,
    } = useDraggable({
        id: lead.id,
    });

    const [isEditing, setIsEditing] = useState(false);

    const [name, setName] = useState(lead.student_name);
    const [country, setCountry] = useState(lead.destination_country);
    const [phone, setPhone] = useState(lead.phone);
    const [score, setScore] = useState(lead.score ?? 0);

    const sourceStyles: Record<string, string> = {
        facebook_ads: "bg-blue-50 text-blue-600",
        google_ads: "bg-yellow-50 text-yellow-700",
        website: "bg-purple-50 text-purple-700",
        referral: "bg-green-50 text-green-700",
        walkin: "bg-gray-100 text-gray-600",
    };

    const style = {
        transform: transform
            ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
            : undefined,
        opacity: isDragging ? 0.6 : 1,
    };

    const isConverted = lead.stage === "application_started";

    /* ========================
       UPDATE LEAD
    ======================== */

    const handleSave = async () => {

        const res = await fetch(`/api/leads/${lead.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                student_name: name,
                destination_country: country,
                phone,
                score,
            }),
        });

        if (res.ok) {
            toast.success("Lead updated");
            onUpdated();
            setIsEditing(false);
        } else {
            toast.error("Failed to update lead");
        }

    };

    /* ========================
       DELETE LEAD
    ======================== */

    const handleDelete = async () => {

        const confirmDelete = window.confirm(
            "Delete this lead?"
        );

        if (!confirmDelete) return;

        const res = await fetch(`/api/leads/${lead.id}`, {
            method: "DELETE",
        });

        if (res.ok) {
            toast.success("Lead deleted");
            onDeleted();
        } else {
            toast.error("Failed to delete lead");
        }

    };

    /* ========================
       CONVERT LEAD
    ======================== */

    const convertLead = async () => {

        if (isConverted) return;

        const confirmConvert = window.confirm(
            "Convert this lead into an application?"
        );

        if (!confirmConvert) return;

        const res = await fetch(`/api/leads/${lead.id}/convert`, {
            method: "POST",
        });

        if (res.ok) {
            toast.success("Lead converted to application");
            onUpdated();
        } else {
            toast.error("Conversion failed");
        }

    };

    /* ========================
       SCORE BADGE
    ======================== */

    const scoreBadge =
        score >= 80
            ? "bg-red-50 text-red-600"
            : score >= 40
                ? "bg-yellow-50 text-yellow-600"
                : "bg-gray-100 text-gray-600";

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition"
        >

            {/* Drag */}

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
                                {lead.student_name}
                            </h3>

                            <p className="text-xs text-gray-500 mt-1">
                                {lead.destination_country}
                            </p>
                            {lead.source && (
                                <span
                                    className={`text-[10px] px-2 py-1 rounded-full ${sourceStyles[lead.source] || "bg-gray-100 text-gray-600"
                                        }`}
                                >
                                    {lead.source.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}
                                </span>
                            )}

                        </div>

                        <span
                            className={`text-xs px-2 py-1 rounded-full ${scoreBadge}`}
                        >
                            {score}
                        </span>

                    </div>

                    <div className="border-t my-3"></div>

                    <div className="flex justify-between items-center">

                        <span className="text-xs text-gray-500">
                            {lead.phone}
                        </span>

                        <div className="flex gap-3 text-gray-500">

                            {/* Convert */}

                            <button
                                onClick={convertLead}
                                disabled={isConverted}
                                title={
                                    isConverted
                                        ? "Application already created"
                                        : "Convert to Application"
                                }
                                className={`cursor-pointer ${isConverted
                                    ? "text-gray-300 cursor-not-allowed"
                                    : "hover:text-green-600"
                                    }`}
                            >
                                <ArrowRightCircle size={18} />
                            </button>

                            {/* Edit */}

                            <button
                                onClick={() => setIsEditing(true)}
                                className="hover:text-black cursor-pointer"
                                title="Edit lead"
                            >
                                <Pencil size={16} />
                            </button>

                            {/* Delete */}

                            <button
                                onClick={handleDelete}
                                className="hover:text-red-600 cursor-pointer"
                                title="Delete lead"
                            >
                                <Trash2 size={16} />
                            </button>

                        </div>

                    </div>

                </>
            ) : (
                <>

                    <input
                        value={name}
                        onChange={(e) =>
                            setName(e.target.value)
                        }
                        className="w-full border p-2 rounded-md mb-2"
                    />

                    <input
                        value={country}
                        onChange={(e) =>
                            setCountry(e.target.value)
                        }
                        className="w-full border p-2 rounded-md mb-2"
                    />

                    <input
                        value={phone}
                        onChange={(e) =>
                            setPhone(e.target.value)
                        }
                        className="w-full border p-2 rounded-md mb-2"
                    />

                    <input
                        type="number"
                        value={score}
                        onChange={(e) =>
                            setScore(Number(e.target.value))
                        }
                        className="w-full border p-2 rounded-md mb-3"
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
    );
}