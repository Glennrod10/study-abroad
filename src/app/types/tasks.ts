export type TaskStatus = "pending" | "in_progress" | "completed" | "cancelled"

export type TaskPriority = "low" | "medium" | "high"

export interface Task {
    id: string
    title: string
    description: string | null
    status: TaskStatus
    priority: TaskPriority
    due_date: string | null
    reminder_at: string | null
    reminder_sent: boolean
    student_id: string | null
    assigned_to: string | null
    created_by: string
    agency_id: string
    created_at: string
}

export interface TaskFormData {
    title: string
    description: string
    student_id: string
    assigned_to: string
    priority: string
    due_date: Date | null
    reminder_at: Date | null
}



export interface ModalProps {
    title: string
    children: React.ReactNode
    close: () => void
}

export interface InputProps {
    label: string
    name: string
    value: string
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    error?: string
}

export interface TextareaProps {
    label: string
    name: string
    value: string
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
    error?: string
}

export interface SelectOption {
    value: string
    label: string
}

export interface SelectProps {
    label: string
    name: string
    value: string
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
    options: SelectOption[]
    error?: string
    emptyText?: string
}

export interface DateFieldProps {
    label: string
    selected: Date | null
    onChange: (date: Date | null) => void
    error?: string
    showTime?: boolean
}

export interface InfoProps {
    label: string
    value: string
}
