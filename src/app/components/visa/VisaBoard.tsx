"use client";

import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { DndContext, closestCorners, DragEndEvent } from "@dnd-kit/core";
import { VISA_COLUMNS } from "./constants";
import VisaColumn from "./VisaColumn";
import CreateVisaModal from "./CreateVisaModal";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function VisaBoard({ onOpenChecklist }: any) {
    const [visas, setVisas] = useState<any[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);

    const fetchVisas = async () => {
        setLoading(true);
        const res = await fetch("/api/visas");
        const data = await res.json();

        if (Array.isArray(data)) {
            setVisas(data);
        } else {
            setVisas([]);
        }
        setLoading(false);
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

    const scrollRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    const updateScroll = useCallback(() => {
        const el = scrollRef.current;
        if (!el) return;
        setCanScrollLeft(el.scrollLeft > 4);
        setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
    }, []);

    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;
        updateScroll();
        el.addEventListener("scroll", updateScroll, { passive: true });
        window.addEventListener("resize", updateScroll);
        const observer = new ResizeObserver(updateScroll);
        observer.observe(el);
        return () => {
            el.removeEventListener("scroll", updateScroll);
            window.removeEventListener("resize", updateScroll);
            observer.disconnect();
        };
    }, [updateScroll]);

    const scrollBy = (dir: "left" | "right") => {
        scrollRef.current?.scrollBy({
            left: dir === "left" ? -400 : 400,
            behavior: "smooth",
        });
    };

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
                {loading ? (
                    <>
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="p-6 rounded-xl border border-gray-200 bg-white shadow-sm animate-pulse">
                                <div className="h-4 w-24 bg-gray-200 rounded mb-3" />
                                <div className="h-8 w-16 bg-gray-200 rounded" />
                            </div>
                        ))}
                    </>
                ) : (
                    <>
                        <StatCard title="Visa Approved" value={approvedCount} color="green" />
                        <StatCard title="Visa Rejected" value={rejectedCount} color="red" />
                        <StatCard title="Under Processing" value={processingCount} color="yellow" />
                        <StatCard
                            title="Success Rate"
                            value={`${successRate}%`}
                            color={successColor}
                            tooltip={`Success Rate = (Approved ÷ Total) × 100\n${approvedCount} approved out of ${totalVisas} total visas`}
                        />
                    </>
                )}
            </div>

            {/* ===== BOARD ===== */}
            <div className="relative">
                <div
                    ref={scrollRef}
                    className="flex gap-6 overflow-x-auto pb-4 [&::-webkit-scrollbar]:hidden"
                    style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                    {loading ? (
                        VISA_COLUMNS.map((column) => (
                            <div key={column.id} className="w-80 flex-shrink-0 flex flex-col rounded-2xl border border-gray-200 bg-white shadow-sm h-[calc(100vh-16rem)] animate-pulse">
                                <div className="px-4 py-3 border-b border-gray-200">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-gray-200" />
                                        <div className="h-4 w-24 bg-gray-200 rounded" />
                                    </div>
                                </div>
                                <div className="p-4 space-y-3 flex-1">
                                    {[1, 2, 3].map((j) => (
                                        <div key={j} className="bg-white p-4 rounded-xl border border-gray-200">
                                            <div className="h-3 w-20 bg-gray-200 rounded mb-2" />
                                            <div className="h-3 w-32 bg-gray-200 rounded mb-3" />
                                            <div className="h-2 w-full bg-gray-200 rounded" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    ) : (
                        <DndContext collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
                            {VISA_COLUMNS.map((column) => (
                                <VisaColumn
                                    key={column.id}
                                    column={column}
                                    visas={visas.filter((v) => v.status === column.id)}
                                    onUpdated={fetchVisas}
                                    onDeleted={fetchVisas}
                                    onOpenChecklist={onOpenChecklist}
                                />
                            ))}
                        </DndContext>
                    )}
                </div>

                {canScrollLeft && (
                    <>
                        <div className="pointer-events-none absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-white via-white/80 to-transparent z-10" />
                        <button
                            onClick={() => scrollBy("left")}
                            className="absolute left-1 top-1/2 -translate-y-1/2 z-20 bg-white/90 border border-gray-200 rounded-full p-1.5 shadow-md hover:bg-white transition cursor-pointer"
                        >
                            <ChevronLeft size={18} />
                        </button>
                    </>
                )}
                {canScrollRight && (
                    <>
                        <div className="pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-white via-white/80 to-transparent z-10" />
                        <button
                            onClick={() => scrollBy("right")}
                            className="absolute right-1 top-1/2 -translate-y-1/2 z-20 bg-white/90 border border-gray-200 rounded-full p-1.5 shadow-md hover:bg-white transition cursor-pointer"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </>
                )}
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