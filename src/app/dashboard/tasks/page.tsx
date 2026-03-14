"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/app/lib/supabase"
import CreateTaskModal from "@/app/components/tasks/CreateTaskModal"
import { toast } from "sonner"
import { Eye, Pencil, Trash2, X, Bell } from "lucide-react"

export default function TasksPage() {

    const [tasks, setTasks] = useState<any[]>([])
    const [open, setOpen] = useState(false)

    const [viewTask, setViewTask] = useState<any>(null)
    const [editTask, setEditTask] = useState<any>(null)

    const [selectedTasks, setSelectedTasks] = useState<string[]>([])

    const [editForm, setEditForm] = useState<any>({})
    const [errors, setErrors] = useState<any>({})

    useEffect(() => {
        fetchTasks()
    }, [])

    const fetchTasks = async () => {

        const { data } = await supabase
            .from("tasks")
            .select("*")
            .order("created_at", { ascending: false })

        setTasks(data || [])
    }

    /* ---------- STATUS UPDATE ---------- */

    const updateStatus = async (id: string, status: string) => {

        const { error } = await supabase
            .from("tasks")
            .update({ status })
            .eq("id", id)

        if (error) {
            toast.error("Status update failed")
            return
        }

        fetchTasks()
    }

    /* ---------- DELETE ---------- */

    const deleteTask = async (id: string) => {

        if (!confirm("Delete this task?")) return

        await supabase
            .from("tasks")
            .delete()
            .eq("id", id)

        toast.success("Task deleted")

        fetchTasks()
    }

    const bulkDelete = async () => {

        if (!selectedTasks.length) return

        if (!confirm(`Delete ${selectedTasks.length} tasks?`)) return

        await supabase
            .from("tasks")
            .delete()
            .in("id", selectedTasks)

        toast.success("Tasks deleted")

        setSelectedTasks([])

        fetchTasks()
    }

    /* ---------- SELECTION ---------- */

    const toggleSelect = (id: string) => {

        if (selectedTasks.includes(id)) {

            setSelectedTasks(
                selectedTasks.filter((t) => t !== id)
            )

        } else {

            setSelectedTasks([...selectedTasks, id])

        }

    }

    const toggleSelectAll = () => {

        if (selectedTasks.length === tasks.length) {

            setSelectedTasks([])

        } else {

            setSelectedTasks(tasks.map((t) => t.id))

        }

    }

    const cancelSelection = () => {

        setSelectedTasks([])

    }

    /* ---------- EDIT ---------- */

    const startEdit = (task: any) => {

        setEditTask(task)
        setEditForm(task)
        setErrors({})

    }

    const handleEditChange = (e: any) => {

        setEditForm({
            ...editForm,
            [e.target.name]: e.target.value
        })

        setErrors({
            ...errors,
            [e.target.name]: ""
        })

    }

    const validateEdit = () => {

        let newErrors: any = {}

        if (!editForm.title || !editForm.title.trim()) {
            newErrors.title = "Title cannot be empty"
        }

        if (!editForm.description || !editForm.description.trim()) {
            newErrors.description = "Description required"
        }

        setErrors(newErrors)

        return Object.keys(newErrors).length === 0

    }

    const updateTask = async () => {

        if (!validateEdit()) return

        const { error } = await supabase
            .from("tasks")
            .update(editForm)
            .eq("id", editTask.id)

        if (error) {

            toast.error("Task update failed")
            return

        }

        toast.success("Task updated")

        setEditTask(null)

        fetchTasks()

    }

    /* ---------- UI HELPERS ---------- */

    const priorityColor = (p: string) => {

        if (p === "high") return "bg-red-100 text-red-700"

        if (p === "medium") return "bg-yellow-100 text-yellow-700"

        return "bg-green-100 text-green-700"

    }

    return (

        <>
            <div className="space-y-8">

                <div className="flex justify-between items-center">

                    <div>

                        <h1 className="text-3xl font-black">
                            Tasks
                        </h1>

                        <p className="text-text-secondary">
                            Manage reminders and follow-ups
                        </p>

                    </div>

                    <button
                        onClick={() => setOpen(true)}
                        className="px-6 h-11 rounded-lg text-white cursor-pointer"
                        style={{ backgroundColor: "var(--color-primary)" }}
                    >
                        + Create Task
                    </button>

                </div>

                {/* BULK BAR */}

                {selectedTasks.length > 0 && (

                    <div className="flex justify-between items-center bg-red-50 border border-red-200 rounded-lg px-4 py-3">

                        <p className="text-sm font-semibold">
                            {selectedTasks.length} selected
                        </p>

                        <div className="flex gap-4">

                            <button
                                onClick={cancelSelection}
                                className="cursor-pointer text-gray-600"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={bulkDelete}
                                className="cursor-pointer text-red-600 font-semibold"
                            >
                                Delete Selected
                            </button>

                        </div>

                    </div>

                )}

                {/* TABLE */}

                <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">

                    <table className="w-full">

                        <thead className="bg-gray-50 border-b">

                            <tr className="text-xs uppercase text-gray-500">

                                <th className="w-[60px] text-center py-3">

                                    <input
                                        type="checkbox"
                                        checked={
                                            tasks.length > 0 &&
                                            selectedTasks.length === tasks.length
                                        }
                                        onChange={toggleSelectAll}
                                        className="cursor-pointer"
                                    />

                                </th>

                                <th className="px-6 py-3 text-left">
                                    Task
                                </th>

                                <th className="px-6 py-3 text-left">
                                    Priority
                                </th>

                                <th className="px-6 py-3 text-left">
                                    Due Date
                                </th>

                                <th className="px-6 py-3 text-left">
                                    Status
                                </th>

                                <th className="px-6 py-3 text-right">
                                    Actions
                                </th>

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
                                        className={`border-t hover:bg-gray-50
                                        ${isOverdue ? "bg-red-50 border-red-200" : ""}`}
                                    >

                                        <td className="text-center py-4">

                                            <input
                                                type="checkbox"
                                                checked={selectedTasks.includes(task.id)}
                                                onChange={() => toggleSelect(task.id)}
                                                className="cursor-pointer"
                                            />

                                        </td>

                                        <td className="px-6 py-4 font-semibold flex items-center gap-2">

                                            {task.reminder_at && (
                                                <Bell
                                                    size={14}
                                                    className="text-yellow-500"
                                                />
                                            )}

                                            {task.title}

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
                                                value={task.status}
                                                onChange={(e) =>
                                                    updateStatus(task.id, e.target.value)
                                                }
                                                className="border rounded-lg px-2 py-1 text-sm cursor-pointer"
                                            >

                                                <option value="pending">
                                                    Pending
                                                </option>

                                                <option value="in_progress">
                                                    In Progress
                                                </option>

                                                <option value="completed">
                                                    Completed
                                                </option>

                                                <option value="cancelled">
                                                    Cancelled
                                                </option>

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
                                                    onClick={() => deleteTask(task.id)}
                                                />

                                            </div>

                                        </td>

                                    </tr>

                                )

                            })}

                        </tbody>

                    </table>

                </div>

            </div>

            <CreateTaskModal
                open={open}
                onClose={() => setOpen(false)}
                onCreated={fetchTasks}
            />

            {/* VIEW MODAL */}

            {viewTask && (

                <Modal title="Task Details" close={() => setViewTask(null)}>

                    <Info label="Title" value={viewTask.title} />
                    <Info label="Description" value={viewTask.description || "-"} />
                    <Info label="Priority" value={viewTask.priority} />
                    <Info label="Status" value={viewTask.status} />
                    <Info label="Due Date" value={viewTask.due_date ? new Date(viewTask.due_date).toLocaleString() : "-"} />
                    <Info label="Reminder" value={viewTask.reminder_at ? new Date(viewTask.reminder_at).toLocaleString() : "-"} />

                </Modal>

            )}

            {/* EDIT MODAL */}

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
                        className="w-full h-11 rounded-lg text-white cursor-pointer"
                        style={{ backgroundColor: "var(--color-primary)" }}
                    >
                        Update Task
                    </button>

                </Modal>

            )}

        </>
    )
}

/* ---------- UI COMPONENTS ---------- */

function Modal({ title, children, close }: any) {

    return (

        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

            <div className="bg-white w-full max-w-lg rounded-xl shadow-xl">

                <div className="flex justify-between items-center px-6 py-4 border-b">

                    <h3 className="font-bold text-lg">
                        {title}
                    </h3>

                    <X
                        size={18}
                        className="cursor-pointer"
                        onClick={close}
                    />

                </div>

                <div className="p-6 space-y-4">

                    {children}

                </div>

            </div>

        </div>

    )

}

function Info({ label, value }: any) {

    return (

        <div>

            <p className="text-xs text-gray-500 font-semibold">
                {label}
            </p>

            <p className="font-medium">
                {value}
            </p>

        </div>

    )

}

function Field({ label, error, ...props }: any) {

    return (

        <div className="flex flex-col gap-1">

            <label className="text-sm font-semibold">
                {label}
            </label>

            <input
                {...props}
                className={`h-11 px-4 border rounded-lg
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