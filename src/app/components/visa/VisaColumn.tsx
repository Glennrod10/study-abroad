"use client";

import { useDroppable } from "@dnd-kit/core";
import VisaCard from "./VisaCard";

export default function VisaColumn({
    column,
    visas,
    onUpdated,
    onDeleted,
    onOpenChecklist,
}: any) {
    const { setNodeRef } = useDroppable({
        id: column.id,
    });

    return (
        <div className="w-80 flex-shrink-0 flex flex-col rounded-2xl border border-gray-200 bg-white shadow-sm h-[calc(100vh-16rem)]">

            {/* Top accent bar */}
            <div className={`h-1 rounded-t-2xl ${column.accent}`} />

            {/* Header */}
            <div className={`px-4 py-3 ${column.color} border-b border-gray-200`}>
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-full ${column.accent}`} />

                        <h2 className="font-semibold text-sm text-gray-800">
                            {column.title}
                        </h2>
                    </div>

                    <span className={`text-xs text-white px-2 py-0.5 rounded-full ${column.accent}`}>
                        {visas.length}
                    </span>
                </div>
            </div>

            {/* Scrollable Area */}
            <div
                ref={setNodeRef}
                className="p-4 space-y-3 overflow-y-auto flex-1 visa-scroll"
            >
                {visas.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-center text-sm text-gray-400 mt-10 px-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300 mb-3"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/><path d="M15 3v18"/></svg>
                        <p className="font-medium text-gray-400">No cases yet</p>
                        <p className="text-xs mt-1 text-gray-400">
                            Drop a visa card here or create one to get started.
                        </p>
                    </div>
                ) : (
                    visas.map((visa: any) => (
                        <VisaCard
                            key={visa.id}
                            visa={visa}
                            onUpdated={onUpdated}
                            onDeleted={onDeleted}
                            onOpenChecklist={onOpenChecklist}
                        />
                    ))
                )}
            </div>
        </div>
    );
}