"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/app/lib/supabase"
import { X, ClipboardPlus } from "lucide-react"
import { toast } from "sonner"
import DatePicker from "react-datepicker"
import type { TaskFormData, SelectOption, InputProps, TextareaProps, SelectProps, DateFieldProps } from "@/app/types/tasks"

interface CreateTaskModalProps {
    open: boolean
    onClose: () => void
    onCreated: () => void
}

interface StudentOption {
    id: string
    first_name: string
    last_name: string
}

interface CounsellorOption {
    id: string
    name: string
}

export default function CreateTaskModal({ open, onClose, onCreated }: CreateTaskModalProps) {
    const emptyForm: TaskFormData = {
        title: "",
        description: "",
        student_id: "",
        assigned_to: "",
        priority: "medium",
        due_date: null,
        reminder_at: null,
    }

    const [form, setForm] = useState<TaskFormData>(emptyForm)
    const [errors, setErrors] = useState<Partial<Record<string, string>>>({})
    const [loading, setLoading] = useState(false)

    const [students, setStudents] = useState<StudentOption[]>([])
    const [counsellors, setCounsellors] = useState<CounsellorOption[]>([])

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

    const handleChange = (e: React.ChangeEvent) => {
        const target = e.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        setForm((prev) => ({
            ...prev,
            [target.name]: target.value,
        }))
        setErrors((prev) => ({
            ...prev,
            [target.name]: "",
        }))
    }

    const validate = () => {
        const newErrors: Partial<Record<string, string>> = {}

        if (!form.title.trim()) newErrors.title = "Task title is required"
        if (!form.description.trim()) newErrors.description = "Description is required"
        if (!form.priority) newErrors.priority = "Priority required"
        if (!form.due_date) newErrors.due_date = "Due date required"

        if (form.reminder_at && form.due_date) {
            if (new Date(form.reminder_at) > new Date(form.due_date)) {
                newErrors.reminder_at = "Reminder must be before due date"
            }
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!validate()) return

        setLoading(true)

        const res = await fetch("/api/tasks", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
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

    const studentOptions: SelectOption[] = students.map((s) => ({
        value: s.id,
        label: `${s.first_name} ${s.last_name}`,
    }))

    const counsellorOptions: SelectOption[] = counsellors.map((c) => ({
        value: c.id,
        label: c.name,
    }))

    const priorityOptions: SelectOption[] = [
        { value: "low", label: "Low" },
        { value: "medium", label: "Medium" },
        { value: "high", label: "High" },
    ]

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
                        <form onSubmit={handleSubmit} className="space-y-5">
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
                                label="Student"
                                name="student_id"
                                value={form.student_id}
                                onChange={handleChange}
                                options={studentOptions}
                                error={errors.student_id}
                                emptyText={students.length === 0 ? "No students yet. Add one from the Students page." : undefined}
                            />

                            <Select
                                label="Assign To"
                                name="assigned_to"
                                value={form.assigned_to}
                                onChange={handleChange}
                                options={counsellorOptions}
                                error={errors.assigned_to}
                                emptyText={counsellors.length === 0 ? "No counsellors yet. Add one from Settings." : undefined}
                            />

                            <Select
                                label="Priority *"
                                name="priority"
                                value={form.priority}
                                onChange={handleChange}
                                options={priorityOptions}
                                error={errors.priority}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <DateField
                                    label="Due Date *"
                                    selected={form.due_date}
                                    onChange={(date) =>
                                        setForm((prev) => ({ ...prev, due_date: date }))
                                    }
                                    error={errors.due_date}
                                />

                                <DateField
                                    label="Reminder"
                                    selected={form.reminder_at}
                                    onChange={(date) =>
                                        setForm((prev) => ({ ...prev, reminder_at: date }))
                                    }
                                    error={errors.reminder_at}
                                    showTime
                                />
                            </div>

                            <button
                                disabled={loading}
                                className="w-full h-11 rounded-lg text-white cursor-pointer font-semibold disabled:opacity-50"
                                style={{ backgroundColor: "var(--color-primary)" }}
                            >
                                {loading ? "Creating..." : "Create Task"}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}

/* ---------- INPUT COMPONENTS ---------- */

function Field({ label, error, ...props }: InputProps) {
    return (
        <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold">{label}</label>
            <input
                {...props}
                className={`h-11 px-4 border rounded-lg bg-gray-50 ${error ? "border-red-400" : "border-gray-200"}`}
            />
            {error && <span className="text-xs text-red-500">{error}</span>}
        </div>
    )
}

function Textarea({ label, error, ...props }: TextareaProps) {
    return (
        <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold">{label}</label>
            <textarea
                {...props}
                className={`p-3 border rounded-lg min-h-[120px] bg-gray-50 ${error ? "border-red-400" : "border-gray-200"}`}
            />
            {error && <span className="text-xs text-red-500">{error}</span>}
        </div>
    )
}

function Select({ label, options, error, emptyText, ...props }: SelectProps) {
    return (
        <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold">{label}</label>
            <select
                {...props}
                className={`h-11 px-4 border rounded-lg bg-gray-50 ${error ? "border-red-400" : "border-gray-200"}`}
            >
                <option value="">Select</option>
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
            {emptyText && <span className="text-xs text-amber-600">{emptyText}</span>}
            {error && <span className="text-xs text-red-500">{error}</span>}
        </div>
    )
}

function DateField({ label, selected, onChange, error, showTime }: DateFieldProps) {
    return (
        <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold">{label}</label>
            <DatePicker
                selected={selected}
                onChange={onChange}
                showTimeSelect={showTime}
                dateFormat={showTime ? "Pp" : "P"}
                className={`h-11 px-4 border rounded-lg w-full bg-gray-50 ${
                    error ? "border-red-400" : "border-gray-200"
                }`}
            />
            {error && <span className="text-xs text-red-500">{error}</span>}
        </div>
    )
}
