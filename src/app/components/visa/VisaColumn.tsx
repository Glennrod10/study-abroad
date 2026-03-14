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

            {/* Header */}
            <div
                className={`p-4 rounded-t-2xl ${column.color} border-b border-gray-200`}
            >
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <span
                            className={`w-3 h-3 rounded-full ${column.accent}`}
                        ></span>

                        <h2 className="font-semibold text-sm text-gray-800">
                            {column.title}
                        </h2>
                    </div>

                    <span
                        className={`text-xs text-white px-2 py-1 rounded-full ${column.accent}`}
                    >
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
                    <div className="text-center text-sm text-gray-400 mt-10">
                        <p>No visa cases in this stage yet.</p>
                        <p className="text-xs mt-1">
                            Once a visa moves here, it will appear in this column.
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