"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"

interface ChecklistItem {
    id: string
    item_name: string
    completed: boolean
}

export default function VisaChecklistTab({ visaId }: any) {

    const [checklist, setChecklist] = useState<ChecklistItem[]>([])
    const [visaInfo, setVisaInfo] = useState<any>(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {

        if (!visaId) return

        fetchChecklist()

    }, [visaId])


    const fetchChecklist = async () => {

        try {

            setLoading(true)
            const res = await fetch(`/api/visa-checklist/${visaId}`)

            const data = await res.json()
            setVisaInfo(data.visa)

            if (Array.isArray(data.checklist)) {
                setChecklist(data.checklist)
            } else {
                setChecklist([])
            }

        } catch (err) {

            console.error(err)
            toast.error("Failed to load checklist")

        } finally {
            setLoading(false)
        }

    }


    const toggleItem = async (item: ChecklistItem) => {

        try {

            await fetch(`/api/visa-checklist/${visaId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    id: item.id,
                    completed: !item.completed
                })
            })

            toast.success("Checklist updated")

            fetchChecklist()

        } catch {

            toast.error("Update failed")

        }

    }


    if (!visaId) {
        return (
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8 flex flex-col items-center justify-center text-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300 mb-3"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                <p className="text-gray-500 font-medium">Select a visa case first</p>
                <p className="text-sm text-gray-400 mt-1">Click on a visa card from the Board tab to view its checklist.</p>
            </div>
        )
    }


    const completed = checklist.filter(i => i.completed).length
    const progress = checklist.length
        ? Math.round((completed / checklist.length) * 100)
        : 0


    return (
        <div className="bg-white border rounded-xl shadow-sm p-6 space-y-6">

            <div>
                <h2 className="text-xl font-semibold">
                    Visa Checklist
                </h2>

                <p className="text-sm text-gray-500">
                    Track all required documents for this visa case.
                </p>
            </div>

            {loading ? (
                <div className="space-y-6 animate-pulse">
                    <div className="p-4 border rounded-lg bg-gray-50">
                        <div className="h-4 w-40 bg-gray-200 rounded mb-2" />
                        <div className="h-3 w-56 bg-gray-200 rounded" />
                    </div>

                    <div>
                        <div className="flex justify-between mb-1">
                            <div className="h-4 w-16 bg-gray-200 rounded" />
                            <div className="h-4 w-12 bg-gray-200 rounded" />
                        </div>
                        <div className="w-full h-2 bg-gray-200 rounded-full" />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                                <div className="w-4 h-4 rounded border border-gray-200 bg-gray-100" />
                                <div className="h-4 w-32 bg-gray-200 rounded" />
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <>
                    {visaInfo && (
                        <div className="p-4 border rounded-lg bg-gray-50 flex justify-between items-center">
                            <div>
                                <p className="font-semibold text-gray-800">
                                    {visaInfo.student_name}
                                </p>
                                <p className="text-sm text-gray-500">
                                    {visaInfo.country} • {visaInfo.visa_type}
                                </p>
                            </div>
                        </div>
                    )}

                    <div>
                        <div className="flex justify-between text-sm mb-1">
                            <span>Progress</span>
                            <span>{completed} / {checklist.length}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-green-500 h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">

                {checklist.map(item => (

                    <label
                        key={item.id}
                        className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition
                            ${item.completed
                                ? "bg-gray-50 border-gray-200"
                                : "hover:bg-gray-50 border-gray-200"
                            }`}
                    >

                        <input
                            type="checkbox"
                            checked={item.completed}
                            onChange={() => toggleItem(item)}
                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                        />

                        <span
                            className={
                                item.completed
                                    ? "line-through text-gray-400"
                                    : "text-gray-700"
                            }
                        >
                            {item.item_name}
                        </span>

                    </label>

                ))}

                    </div>
                </>
            )}

        </div>
    )
}