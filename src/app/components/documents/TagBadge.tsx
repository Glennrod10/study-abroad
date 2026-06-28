"use client"

export default function TagBadge({
    name,
    color,
    onRemove,
}: {
    name: string
    color: string
    onRemove?: () => void
}) {
    return (
        <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
            style={{
                backgroundColor: `${color}18`,
                color: color,
            }}
        >
            {name}
            {onRemove && (
                <button
                    onClick={onRemove}
                    className="cursor-pointer hover:opacity-70"
                >
                    ×
                </button>
            )}
        </span>
    )
}
