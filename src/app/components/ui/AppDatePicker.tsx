"use client"

import { forwardRef } from "react"
import DatePicker from "react-datepicker"
import { Calendar } from "lucide-react"

interface AppDatePickerProps {
    value: string
    onChange: (v: string) => void
    placeholder?: string
}

const CustomInput = forwardRef<
    HTMLButtonElement,
    { value?: string; onClick?: () => void; placeholder?: string }
>(({ value, onClick, placeholder }, ref) => (
    <button
        type="button"
        ref={ref}
        onClick={onClick}
        className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white hover:border-gray-300 transition cursor-pointer min-w-[130px]"
    >
        <Calendar size={14} className="text-text-secondary shrink-0" />
        <span className={value ? "text-text-primary" : "text-text-secondary"}>
            {value || placeholder}
        </span>
    </button>
))
CustomInput.displayName = "CustomInput"

export default function AppDatePicker({ value, onChange, placeholder = "Select date" }: AppDatePickerProps) {
    const selected = value ? new Date(value + "T00:00:00") : null

    return (
        <DatePicker
            selected={selected}
            onChange={(date: Date | null) => {
                onChange(date ? date.toISOString().split("T")[0] : "")
            }}
            placeholderText={placeholder}
            dateFormat="MMM d, yyyy"
            isClearable
            customInput={<CustomInput placeholder={placeholder} />}
        />
    )
}
