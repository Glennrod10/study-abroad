"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/app/lib/supabase"

export default function StudentTimeline({ studentId }: any) {

    const [activities, setActivities] = useState<any[]>([])

    useEffect(() => {
        fetchActivities()
    }, [])

    const fetchActivities = async () => {

        const { data } = await supabase
            .from("activities")
            .select("*")
            .eq("student_id", studentId)
            .order("created_at", { ascending: false })

        setActivities(data || [])

    }

    return (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm">

            <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="font-bold text-lg">
                    Activity Timeline
                </h3>
            </div>

            <div className="p-6 space-y-4">

                {activities.length === 0 && (
                    <p className="text-sm text-text-secondary">
                        No activity yet
                    </p>
                )}

                {activities.map((a) => (
                    <div key={a.id} className="border-l-2 pl-4">

                        <p className="font-semibold text-sm">
                            {a.action}
                        </p>

                        <p className="text-xs text-text-secondary">
                            {a.description}
                        </p>

                        <p className="text-xs text-text-secondary mt-1">
                            {new Date(a.created_at).toLocaleString()}
                        </p>

                    </div>
                ))}

            </div>

        </div>
    )
}