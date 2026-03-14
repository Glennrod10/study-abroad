"use client";

import { useEffect, useState, useMemo } from "react";
import { DndContext, closestCorners, DragEndEvent } from "@dnd-kit/core";
import { VISA_COLUMNS } from "./constants";
import VisaColumn from "./VisaColumn";
import CreateVisaModal from "./CreateVisaModal";

export default function VisaBoard({ onOpenChecklist }: any) {
    const [visas, setVisas] = useState<any[]>([]);
    const [showModal, setShowModal] = useState(false);

    const fetchVisas = async () => {
        const res = await fetch("/api/visas");
        const data = await res.json();

        if (Array.isArray(data)) {
            setVisas(data);
        } else {
            setVisas([]);
        }
    };

    useEffect(() => {
        fetchVisas();
    }, []);

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over) return;

        const draggedVisa = visas.find((v) => v.id === active.id);
        if (!draggedVisa) return;

        let newStatus: string | null = null;

        const droppedOnColumn = VISA_COLUMNS.find(
            (col) => col.id === over.id
        );

        if (droppedOnColumn) {
            newStatus = droppedOnColumn.id;
        } else {
            const overCard = visas.find((v) => v.id === over.id);
            if (overCard) newStatus = overCard.status;
        }

        if (!newStatus || newStatus === draggedVisa.status) return;

        setVisas((prev) =>
            prev.map((v) =>
                v.id === draggedVisa.id ? { ...v, status: newStatus! } : v
            )
        );

        await fetch(`/api/visas/${draggedVisa.id}/status`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: newStatus }),
        });
    };

    /* =========================
       STATUS COUNTS
    ========================= */

    const totalVisas = visas.length;

    const approvedCount = useMemo(
        () => visas.filter((v) => v.status === "approved").length,
        [visas]
    );

    const rejectedCount = useMemo(
        () => visas.filter((v) => v.status === "rejected").length,
        [visas]
    );

    const processingCount = useMemo(
        () => visas.filter((v) => v.status === "under_processing").length,
        [visas]
    );

    /* =========================
       SUCCESS RATE
    ========================= */

    const successRate = useMemo(() => {
        if (totalVisas === 0) return 0;
        return Math.round((approvedCount / totalVisas) * 100);
    }, [approvedCount, totalVisas]);

    const successColor =
        successRate >= 80
            ? "green"
            : successRate >= 50
                ? "yellow"
                : "red";

    return (
        <div className="space-y-8">

            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-black">
                        Visa Tracking
                    </h1>
                    <p className="text-sm text-text-secondary mt-2">
                        Manage and track student visa progress across all stages.
                    </p>
                </div>

                <button
                    onClick={() => setShowModal(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition cursor-pointer"
                >
                    + Add Visa
                </button>
            </div>

            {/* ===== STAT CARDS ===== */}
            <div className="grid grid-cols-4 gap-6">
                <StatCard
                    title="Visa Approved"
                    value={approvedCount}
                    color="green"
                />
                <StatCard
                    title="Visa Rejected"
                    value={rejectedCount}
                    color="red"
                />
                <StatCard
                    title="Under Processing"
                    value={processingCount}
                    color="yellow"
                />
                <StatCard
                    title="Success Rate"
                    value={`${successRate}%`}
                    color={successColor}
                    tooltip={`Success Rate = (Approved ÷ Total) × 100\n${approvedCount} approved out of ${totalVisas} total visas`}
                />
            </div>

            {/* ===== BOARD ===== */}
            <div className="flex gap-6 overflow-x-auto visa-scroll pb-4">
                <DndContext
                    collisionDetection={closestCorners}
                    onDragEnd={handleDragEnd}
                >
                    {VISA_COLUMNS.map((column) => (
                        <VisaColumn
                            key={column.id}
                            column={column}
                            visas={visas.filter(
                                (v) => v.status === column.id
                            )}
                            onUpdated={fetchVisas}
                            onDeleted={fetchVisas}
                            onOpenChecklist={onOpenChecklist}
                        />
                    ))}
                </DndContext>
            </div>

            {showModal && (
                <CreateVisaModal
                    onClose={() => setShowModal(false)}
                    onCreated={fetchVisas}
                />
            )}
        </div>
    );
}

/* =========================
   STAT CARD COMPONENT
========================= */

function StatCard({
    title,
    value,
    color,
    tooltip,
}: {
    title: string;
    value: number | string;
    color: "green" | "red" | "yellow";
    tooltip?: string;
}) {
    const colorStyles = {
        green: "bg-green-50 text-green-700 border-green-200",
        red: "bg-red-50 text-red-700 border-red-200",
        yellow: "bg-yellow-50 text-yellow-700 border-yellow-200",
    };

    return (
        <div className="relative group">
            <div
                className={`p-6 rounded-xl border shadow-sm ${colorStyles[color]}`}
            >
                <p className="text-sm font-medium mb-2">
                    {title}
                </p>
                <h2 className="text-3xl font-bold">
                    {value}
                </h2>
            </div>

            {/* Tooltip */}
            {tooltip && (
                <div className="absolute left-1/2 -translate-x-1/2 -top-16 w-64 
                                bg-gray-900 text-white text-xs rounded-lg p-3 
                                opacity-0 group-hover:opacity-100 
                                transition-opacity duration-200 pointer-events-none 
                                whitespace-pre-line shadow-lg z-50">
                    {tooltip}
                </div>
            )}
        </div>
    );
}