"use client"

import { X } from "lucide-react"

export default function ConfirmModal({
    open,
    onClose,
    onConfirm,
    title,
    description,
}: any) {
    if (!open) return null

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

            <div className="bg-white w-full max-w-md rounded-xl p-6 shadow-xl">

                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold">{title}</h3>
                    <button onClick={onClose}>
                        <X size={18} />
                    </button>
                </div>

                <p className="text-sm text-text-secondary mb-6">
                    {description}
                </p>

                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border border-border rounded-lg text-sm"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:opacity-90"
                    >
                        Delete
                    </button>
                </div>

            </div>

        </div>
    )
}