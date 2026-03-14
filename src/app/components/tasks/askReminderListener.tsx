"use client"

import { useEffect } from "react"
import { supabase } from "@/app/lib/supabase"
import { toast } from "sonner"
import { BellRing, Clock } from "lucide-react"

export default function TaskReminderListener() {

    useEffect(() => {

        const audio = new Audio("/notification.mp3")

        const checkReminders = async () => {

            const now = new Date().toISOString()

            const { data } = await supabase
                .from("tasks")
                .select("*")
                .lte("reminder_at", now)
                .eq("status", "pending")
                .eq("reminder_sent", false)

            if (!data) return

            data.forEach(async (task) => {

                audio.play()

                toast(

                    <div className="flex items-start gap-3">

                        <BellRing className="text-red-500 mt-1" size={20} />

                        <div className="flex flex-col">

                            <span className="font-semibold text-red-600">
                                Task Reminder
                            </span>

                            <span className="text-sm font-medium">
                                {task.title}
                            </span>

                            <span className="text-xs text-gray-500 flex items-center gap-1">
                                <Clock size={12} />
                                Due: {task.due_date
                                    ? new Date(task.due_date).toLocaleString()
                                    : "No due date"}
                            </span>

                        </div>

                    </div>,

                    {
                        duration: 20000
                    }

                )

                await supabase
                    .from("tasks")
                    .update({ reminder_sent: true })
                    .eq("id", task.id)

            })

        }

        const interval = setInterval(checkReminders, 15000)

        return () => clearInterval(interval)

    }, [])

    return null
}