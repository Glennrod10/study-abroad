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

    useEffect(() => {

        if (!visaId) return

        fetchChecklist()

    }, [visaId])


    const fetchChecklist = async () => {

        try {

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
            <div className="bg-white border rounded-xl shadow-sm p-6">
                <p className="text-gray-500">
                    Select a visa case from the board first.
                </p>
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


            {/* Progress */}
            <div>

                <div className="flex justify-between text-sm mb-1">
                    <span>Progress</span>
                    <span>{completed} / {checklist.length}</span>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                        className="bg-green-500 h-2 rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                    />
                </div>

            </div>


            {/* Checklist */}
            <div className="grid grid-cols-2 gap-3">

                {checklist.map(item => (

                    <label
                        key={item.id}
                        className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition"
                    >

                        <input
                            type="checkbox"
                            checked={item.completed}
                            onChange={() => toggleItem(item)}
                            className="w-4 h-4"
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

        </div>
    )
}