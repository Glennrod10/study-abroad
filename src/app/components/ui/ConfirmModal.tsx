"use client"

import { X } from "lucide-react"

interface ConfirmModalProps {
    open: boolean
    onClose: () => void
    onConfirm: () => void
    title: string
    description: string
}

export default function ConfirmModal({ open, onClose, onConfirm, title, description }: ConfirmModalProps) {
    if (!open) return null

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white w-full max-w-md rounded-xl p-6 shadow-xl">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold">{title}</h3>
                    <button onClick={onClose} className="cursor-pointer">
                        <X size={18} />
                    </button>
                </div>

                <p className="text-sm text-text-secondary mb-6">{description}</p>

                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-200 rounded-lg text-sm cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:opacity-90 cursor-pointer"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    )
}
