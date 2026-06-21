"use client"

import { useEffect, useState, useCallback } from "react"
import CreateTaskModal from "@/app/components/tasks/CreateTaskModal"
import ConfirmModal from "@/app/components/ui/ConfirmModal"
import { toast } from "sonner"
import { Eye, Pencil, Trash2, ClipboardList, Bell, X } from "lucide-react"
import type {
    Task,
    TaskStatus,
    TaskPriority,
    ModalProps,
    InputProps,
    TextareaProps,
    InfoProps,
} from "@/app/types/tasks"

const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
    { value: "pending", label: "Pending" },
    { value: "in_progress", label: "In Progress" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
]

export default function TasksPage() {
    const [tasks, setTasks] = useState<Task[]>([])
    const [loading, setLoading] = useState(true)
    const [open, setOpen] = useState(false)

    const [viewTask, setViewTask] = useState<Task | null>(null)
    const [editTask, setEditTask] = useState<Task | null>(null)
    const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
    const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)

    const [selectedTasks, setSelectedTasks] = useState<string[]>([])

    const [editForm, setEditForm] = useState<Partial<Task>>({})
    const [errors, setErrors] = useState<Partial<Record<string, string>>>({})

    const fetchTasks = useCallback(async () => {
        setLoading(true)
        const res = await fetch("/api/tasks")
        if (!res.ok) {
            toast.error("Failed to load tasks")
            setTasks([])
        } else {
            setTasks(await res.json())
        }
        setLoading(false)
    }, [])

    useEffect(() => {
        fetchTasks()
    }, [fetchTasks])

    const updateStatus = async (id: string, status: string) => {
        const res = await fetch("/api/tasks", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, status }),
        })

        if (!res.ok) {
            toast.error("Status update failed")
            return
        }

        fetchTasks()
    }

    const deleteTask = async (id: string) => {
        const res = await fetch("/api/tasks", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ids: [id] }),
        })

        if (!res.ok) {
            toast.error("Failed to delete task")
            return
        }

        toast.success("Task deleted")
        setDeleteTarget(null)
        fetchTasks()
    }

    const bulkDelete = async () => {
        if (!selectedTasks.length) return

        const res = await fetch("/api/tasks", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ids: selectedTasks }),
        })

        if (!res.ok) {
            toast.error("Failed to delete tasks")
            return
        }

        toast.success(`${selectedTasks.length} tasks deleted`)
        setSelectedTasks([])
        setBulkDeleteOpen(false)
        fetchTasks()
    }

    const toggleSelect = (id: string) => {
        setSelectedTasks((prev) =>
            prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
        )
    }

    const toggleSelectAll = () => {
        setSelectedTasks((prev) =>
            prev.length === tasks.length ? [] : tasks.map((t) => t.id)
        )
    }

    const cancelSelection = () => setSelectedTasks([])

    const startEdit = (task: Task) => {
        setEditTask(task)
        setEditForm(task)
        setErrors({})
    }

    const handleEditChange = (e: React.ChangeEvent) => {
        const target = e.target as HTMLInputElement | HTMLTextAreaElement
        setEditForm((prev) => ({
            ...prev,
            [target.name]: target.value,
        }))
        setErrors((prev) => ({
            ...prev,
            [target.name]: "",
        }))
    }

    const validateEdit = () => {
        const newErrors: Partial<Record<string, string>> = {}

        if (!editForm.title?.trim()) {
            newErrors.title = "Title cannot be empty"
        }
        if (!editForm.description?.trim()) {
            newErrors.description = "Description required"
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const updateTask = async () => {
        if (!validateEdit() || !editTask) return

        const res = await fetch("/api/tasks", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: editTask.id, ...editForm }),
        })

        if (!res.ok) {
            toast.error("Task update failed")
            return
        }

        toast.success("Task updated")
        setEditTask(null)
        fetchTasks()
    }

    const priorityColor = (p: TaskPriority) => {
        if (p === "high") return "bg-red-100 text-red-700"
        if (p === "medium") return "bg-yellow-100 text-yellow-700"
        return "bg-green-100 text-green-700"
    }

    return (
        <>
            <div className="space-y-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-black">Tasks</h1>
                        <p className="text-text-secondary">Manage reminders and follow-ups</p>
                    </div>
                    <button
                        onClick={() => setOpen(true)}
                        className="px-6 h-11 rounded-lg text-white cursor-pointer font-semibold"
                        style={{ backgroundColor: "var(--color-primary)" }}
                    >
                        + Create Task
                    </button>
                </div>

                {selectedTasks.length > 0 && (
                    <div className="flex justify-between items-center bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                        <p className="text-sm font-semibold">
                            {selectedTasks.length} selected
                        </p>
                        <div className="flex gap-4">
                            <button onClick={cancelSelection} className="cursor-pointer text-gray-600">
                                Cancel
                            </button>
                            <button
                                onClick={() => setBulkDeleteOpen(true)}
                                className="cursor-pointer text-red-600 font-semibold"
                            >
                                Delete Selected
                            </button>
                        </div>
                    </div>
                )}

                {loading ? (
                    <LoadingSkeleton />
                ) : tasks.length === 0 ? (
                    <EmptyState onCreateTask={() => setOpen(true)} />
                ) : (
                    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b">
                                <tr className="text-xs uppercase text-gray-500">
                                    <th className="w-[60px] text-center py-3">
                                        <input
                                            type="checkbox"
                                            checked={selectedTasks.length === tasks.length}
                                            onChange={toggleSelectAll}
                                            className="cursor-pointer"
                                        />
                                    </th>
                                    <th className="px-6 py-3 text-left">Task</th>
                                    <th className="px-6 py-3 text-left">Priority</th>
                                    <th className="px-6 py-3 text-left">Due Date</th>
                                    <th className="px-6 py-3 text-left">Status</th>
                                    <th className="px-6 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tasks.map((task) => {
                                    const isOverdue =
                                        task.status !== "completed" &&
                                        task.due_date &&
                                        new Date(task.due_date) < new Date()

                                    return (
                                        <tr
                                            key={task.id}
                                            className={`border-t transition hover:bg-gray-50 ${
                                                isOverdue ? "bg-red-50 border-red-200" : ""
                                            }`}
                                        >
                                            <td className="text-center py-4">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedTasks.includes(task.id)}
                                                    onChange={() => toggleSelect(task.id)}
                                                    className="cursor-pointer"
                                                />
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    {task.reminder_at && (
                                                        <Bell size={14} className="text-yellow-500 shrink-0" />
                                                    )}
                                                    <span className="font-semibold">{task.title}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`px-3 py-1 rounded-full text-xs font-semibold ${priorityColor(task.priority)}`}
                                                >
                                                    {task.priority}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {task.due_date
                                                    ? new Date(task.due_date).toLocaleDateString()
                                                    : "-"}
                                            </td>
                                            <td className="px-6 py-4">
                                                <select
                                                    value={task.status || "pending"}
                                                    onChange={(e) => updateStatus(task.id, e.target.value)}
                                                    className="border rounded-lg px-2 py-1 text-sm cursor-pointer"
                                                >
                                                    {STATUS_OPTIONS.map((opt) => (
                                                        <option key={opt.value} value={opt.value}>
                                                            {opt.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex justify-end gap-4">
                                                    <Eye
                                                        size={18}
                                                        className="text-blue-600 cursor-pointer"
                                                        onClick={() => setViewTask(task)}
                                                    />
                                                    <Pencil
                                                        size={18}
                                                        className="text-yellow-600 cursor-pointer"
                                                        onClick={() => startEdit(task)}
                                                    />
                                                    <Trash2
                                                        size={18}
                                                        className="text-red-600 cursor-pointer"
                                                        onClick={() => setDeleteTarget(task.id)}
                                                    />
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <CreateTaskModal open={open} onClose={() => setOpen(false)} onCreated={fetchTasks} />

            {viewTask && (
                <Modal title="Task Details" close={() => setViewTask(null)}>
                    <Info label="Title" value={viewTask.title} />
                    <Info label="Description" value={viewTask.description || "-"} />
                    <Info label="Priority" value={viewTask.priority} />
                    <Info
                        label="Status"
                        value={
                            viewTask.status
                                ? STATUS_OPTIONS.find((o) => o.value === viewTask.status)?.label || viewTask.status
                                : "Pending"
                        }
                    />
                    <Info
                        label="Due Date"
                        value={viewTask.due_date ? new Date(viewTask.due_date).toLocaleString() : "-"}
                    />
                    <Info
                        label="Reminder"
                        value={viewTask.reminder_at ? new Date(viewTask.reminder_at).toLocaleString() : "-"}
                    />
                </Modal>
            )}

            {editTask && (
                <Modal title="Edit Task" close={() => setEditTask(null)}>
                    <Field
                        label="Title *"
                        name="title"
                        value={editForm.title || ""}
                        onChange={handleEditChange}
                        error={errors.title}
                    />
                    <Textarea
                        label="Description *"
                        name="description"
                        value={editForm.description || ""}
                        onChange={handleEditChange}
                        error={errors.description}
                    />
                    <button
                        onClick={updateTask}
                        className="w-full h-11 rounded-lg text-white cursor-pointer font-semibold"
                        style={{ backgroundColor: "var(--color-primary)" }}
                    >
                        Update Task
                    </button>
                </Modal>
            )}

            <ConfirmModal
                open={deleteTarget !== null}
                onClose={() => setDeleteTarget(null)}
                onConfirm={() => deleteTarget && deleteTask(deleteTarget)}
                title="Delete Task"
                description="Are you sure you want to delete this task? This action cannot be undone."
            />

            <ConfirmModal
                open={bulkDeleteOpen}
                onClose={() => setBulkDeleteOpen(false)}
                onConfirm={bulkDelete}
                title="Delete Selected Tasks"
                description={`Are you sure you want to delete ${selectedTasks.length} tasks? This action cannot be undone.`}
            />
        </>
    )
}

/* ---------- STATUS BADGE ---------- */

function StatusBadge({ status }: { status: TaskStatus }) {
    const map: Record<TaskStatus, { color: string; label: string }> = {
        pending: { color: "bg-gray-100 text-gray-600", label: "Pending" },
        in_progress: { color: "bg-blue-100 text-blue-600", label: "In Progress" },
        completed: { color: "bg-green-100 text-green-600", label: "Completed" },
        cancelled: { color: "bg-red-100 text-red-600", label: "Cancelled" },
    }
    const m = map[status] || map.pending
    return (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${m.color}`}>
            {m.label}
        </span>
    )
}

/* ---------- LOADING SKELETON ---------- */

function LoadingSkeleton() {
    return (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <table className="w-full">
                <thead className="bg-gray-50 border-b">
                    <tr className="text-xs uppercase text-gray-500">
                        <th className="w-[60px] text-center py-3" />
                        <th className="px-6 py-3 text-left">Task</th>
                        <th className="px-6 py-3 text-left">Priority</th>
                        <th className="px-6 py-3 text-left">Due Date</th>
                        <th className="px-6 py-3 text-left">Status</th>
                        <th className="px-6 py-3 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {[1, 2, 3, 4, 5].map((i) => (
                        <tr key={i} className="border-t animate-pulse">
                            <td className="text-center py-4">
                                <div className="w-4 h-4 bg-gray-200 rounded mx-auto" />
                            </td>
                            <td className="px-6 py-4">
                                <div className="h-4 bg-gray-200 rounded w-3/4" />
                            </td>
                            <td className="px-6 py-4">
                                <div className="h-5 bg-gray-200 rounded w-16" />
                            </td>
                            <td className="px-6 py-4">
                                <div className="h-4 bg-gray-200 rounded w-24" />
                            </td>
                            <td className="px-6 py-4">
                                <div className="h-5 bg-gray-200 rounded w-20" />
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex justify-end gap-4">
                                    <div className="w-5 h-5 bg-gray-200 rounded" />
                                    <div className="w-5 h-5 bg-gray-200 rounded" />
                                    <div className="w-5 h-5 bg-gray-200 rounded" />
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

/* ---------- EMPTY STATE ---------- */

function EmptyState({ onCreateTask }: { onCreateTask: () => void }) {
    return (
        <div className="bg-white border border-gray-200 rounded-xl p-16 text-center shadow-sm">
            <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                    <ClipboardList size={32} className="text-gray-400" />
                </div>
            </div>
            <h3 className="text-lg font-bold text-gray-700 mb-2">No tasks yet</h3>
            <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
                You haven&apos;t created any tasks. Tasks help you track follow-ups, reminders, and work with your team.
            </p>
            <button
                onClick={onCreateTask}
                className="px-6 h-11 rounded-lg text-white cursor-pointer font-semibold inline-flex items-center gap-2"
                style={{ backgroundColor: "var(--color-primary)" }}
            >
                + Create Your First Task
            </button>
        </div>
    )
}

/* ---------- UI COMPONENTS ---------- */

function Modal({ title, children, close }: ModalProps) {
    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white w-full max-w-lg rounded-xl shadow-xl">
                <div className="flex justify-between items-center px-6 py-4 border-b">
                    <h3 className="font-bold text-lg">{title}</h3>
                    <X size={18} className="cursor-pointer" onClick={close} />
                </div>
                <div className="p-6 space-y-4">{children}</div>
            </div>
        </div>
    )
}

function Info({ label, value }: InfoProps) {
    return (
        <div>
            <p className="text-xs text-gray-500 font-semibold">{label}</p>
            <p className="font-medium">{value}</p>
        </div>
    )
}

function Field({ label, error, ...props }: InputProps) {
    return (
        <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold">{label}</label>
            <input
                {...props}
                className={`h-11 px-4 border rounded-lg ${error ? "border-red-400" : "border-gray-200"}`}
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
                className={`p-3 border rounded-lg min-h-[120px] ${error ? "border-red-400" : "border-gray-200"}`}
            />
            {error && <span className="text-xs text-red-500">{error}</span>}
        </div>
    )
}
