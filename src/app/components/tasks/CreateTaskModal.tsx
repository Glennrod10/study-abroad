"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/app/lib/supabase"
import { X, ClipboardPlus } from "lucide-react"
import { toast } from "sonner"
import DatePicker from "react-datepicker"

export default function CreateTaskModal({
    open,
    onClose,
    onCreated
}: any) {

    const emptyForm = {
        title: "",
        description: "",
        student_id: "",
        assigned_to: "",
        priority: "medium",
        due_date: null,
        reminder_at: null
    }

    const [form, setForm] = useState<any>(emptyForm)
    const [errors, setErrors] = useState<any>({})
    const [loading, setLoading] = useState(false)

    const [students, setStudents] = useState<any[]>([])
    const [counsellors, setCounsellors] = useState<any[]>([])

    useEffect(() => {
        fetchOptions()
    }, [])

    const fetchOptions = async () => {

        const { data: studentsData } = await supabase
            .from("students")
            .select("id,first_name,last_name")

        const { data: counsellorData } = await supabase
            .from("users")
            .select("id,name")
            .eq("role", "counsellor")

        setStudents(studentsData || [])
        setCounsellors(counsellorData || [])
    }

    const handleChange = (e: any) => {

        setForm({
            ...form,
            [e.target.name]: e.target.value
        })

        setErrors({
            ...errors,
            [e.target.name]: ""
        })

    }

    /* ---------- VALIDATION ---------- */

    const validate = () => {

        let newErrors: any = {}

        if (!form.title.trim()) {
            newErrors.title = "Task title is required"
        }

        if (!form.description.trim()) {
            newErrors.description = "Description is required"
        }

        if (!form.student_id) {
            newErrors.student_id = "Student is required"
        }

        if (!form.assigned_to) {
            newErrors.assigned_to = "Assignee required"
        }

        if (!form.priority) {
            newErrors.priority = "Priority required"
        }

        if (!form.due_date) {
            newErrors.due_date = "Due date required"
        }

        if (form.reminder_at && form.due_date) {

            if (new Date(form.reminder_at) > new Date(form.due_date)) {

                newErrors.reminder_at =
                    "Reminder must be before due date"

            }

        }

        setErrors(newErrors)

        return Object.keys(newErrors).length === 0

    }

    const handleSubmit = async (e: any) => {

        e.preventDefault()

        if (!validate()) return

        setLoading(true)

        const res = await fetch("/api/tasks", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form)
        })

        if (res.ok) {

            toast.success("Task created successfully")

            setForm(emptyForm)
            setErrors({})

            onClose()
            onCreated()

        } else {

            toast.error("Task creation failed")

        }

        setLoading(false)
    }

    if (!open) return null

    return (

        <div className="fixed inset-0 bg-black/40 z-50 overflow-y-auto">

            <div className="flex min-h-full items-center justify-center p-6">

                <div className="bg-white w-full max-w-xl rounded-xl shadow-xl max-h-[90vh] flex flex-col">

                    <div className="flex justify-between items-center px-6 py-4 border-b">

                        <h3 className="font-bold text-lg flex items-center gap-2">
                            <ClipboardPlus size={18} />
                            Create Task
                        </h3>

                        <button
                            onClick={() => {
                                setForm(emptyForm)
                                setErrors({})
                                onClose()
                            }}
                            className="cursor-pointer"
                        >
                            <X size={18} />
                        </button>

                    </div>

                    <div className="overflow-y-auto p-6">

                        <form
                            onSubmit={handleSubmit}
                            className="space-y-5"
                        >

                            <Field
                                label="Task Title *"
                                name="title"
                                value={form.title}
                                onChange={handleChange}
                                error={errors.title}
                            />

                            <Textarea
                                label="Description *"
                                name="description"
                                value={form.description}
                                onChange={handleChange}
                                error={errors.description}
                            />

                            <Select
                                label="Student *"
                                name="student_id"
                                value={form.student_id}
                                onChange={handleChange}
                                options={students.map((s) => ({
                                    value: s.id,
                                    label: `${s.first_name} ${s.last_name}`
                                }))}
                                error={errors.student_id}
                            />

                            <Select
                                label="Assign To *"
                                name="assigned_to"
                                value={form.assigned_to}
                                onChange={handleChange}
                                options={counsellors.map((c) => ({
                                    value: c.id,
                                    label: c.name
                                }))}
                                error={errors.assigned_to}
                            />

                            <Select
                                label="Priority *"
                                name="priority"
                                value={form.priority}
                                onChange={handleChange}
                                options={[
                                    { value: "low", label: "Low" },
                                    { value: "medium", label: "Medium" },
                                    { value: "high", label: "High" }
                                ]}
                                error={errors.priority}
                            />

                            <div className="grid grid-cols-2 gap-4">

                                <DateField
                                    label="Due Date *"
                                    selected={form.due_date}
                                    onChange={(date: any) =>
                                        setForm({
                                            ...form,
                                            due_date: date
                                        })
                                    }
                                    error={errors.due_date}
                                />

                                <DateField
                                    label="Reminder"
                                    selected={form.reminder_at}
                                    onChange={(date: any) =>
                                        setForm({
                                            ...form,
                                            reminder_at: date
                                        })
                                    }
                                    error={errors.reminder_at}
                                    showTime
                                />

                            </div>

                            <button
                                disabled={loading}
                                className="w-full h-11 rounded-lg text-white cursor-pointer font-semibold"
                                style={{
                                    backgroundColor: "var(--color-primary)"
                                }}
                            >
                                {loading
                                    ? "Creating..."
                                    : "Create Task"}
                            </button>

                        </form>

                    </div>

                </div>

            </div>

        </div>

    )
}

/* ---------- INPUT COMPONENTS ---------- */

function Field({ label, error, ...props }: any) {

    return (

        <div className="flex flex-col gap-1">

            <label className="text-sm font-semibold">
                {label}
            </label>

            <input
                {...props}
                className={`h-11 px-4 border rounded-lg bg-gray-50
                ${error ? "border-red-400" : "border-gray-200"}`}
            />

            {error && (
                <span className="text-xs text-red-500">
                    {error}
                </span>
            )}

        </div>

    )
}

function Textarea({ label, error, ...props }: any) {

    return (

        <div className="flex flex-col gap-1">

            <label className="text-sm font-semibold">
                {label}
            </label>

            <textarea
                {...props}
                className={`p-3 border rounded-lg min-h-[120px]
                ${error ? "border-red-400" : "border-gray-200"}`}
            />

            {error && (
                <span className="text-xs text-red-500">
                    {error}
                </span>
            )}

        </div>

    )
}

function Select({ label, options, error, ...props }: any) {

    return (

        <div className="flex flex-col gap-1">

            <label className="text-sm font-semibold">
                {label}
            </label>

            <select
                {...props}
                className={`h-11 px-4 border rounded-lg bg-gray-50
                ${error ? "border-red-400" : "border-gray-200"}`}
            >

                <option value="">Select</option>

                {options.map((opt: any) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}

            </select>

            {error && (
                <span className="text-xs text-red-500">
                    {error}
                </span>
            )}

        </div>

    )
}

function DateField({
    label,
    selected,
    onChange,
    error,
    showTime
}: any) {

    return (

        <div className="flex flex-col gap-1">

            <label className="text-sm font-semibold">
                {label}
            </label>

            <DatePicker
                selected={selected}
                onChange={onChange}
                showTimeSelect={showTime}
                dateFormat={showTime ? "Pp" : "P"}
                className={`h-11 px-4 border rounded-lg w-full
                ${error ? "border-red-400" : "border-gray-200"}`}
            />

            {error && (
                <span className="text-xs text-red-500">
                    {error}
                </span>
            )}

        </div>

    )
}