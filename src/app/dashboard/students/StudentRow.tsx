"use client"


import StudentActions from "@/app/components/students/StudentActions"
import { Eye, Edit, MoreVertical } from "lucide-react"

export default function StudentRow({
    student,
    selected,
    toggleSelect
}: {
    student: any
    selected: boolean
    toggleSelect: (id: string) => void
}) {
    const getStatusStyle = (status: string) => {
        switch (status) {
            case "Enrolled":
                return "bg-emerald-50 text-emerald-600 border border-emerald-200"
            case "Visa Pending":
                return "bg-amber-50 text-amber-600 border border-amber-200"
            case "Offer Letter":
                return "bg-indigo-50 text-indigo-600 border border-indigo-200"
            case "Applied":
                return "bg-blue-50 text-blue-600 border border-blue-200"
            default:
                return "bg-gray-100 text-gray-600 border border-gray-200"
        }
    }

    return (
        <tr className="hover:bg-gray-50 transition">
            <td className="px-6 py-4">
                <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => toggleSelect(student.id)}
                    className="cursor-pointer"
                />
            </td>
            <td className="px-6 py-4">
                <div className="flex items-center gap-3">

                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 border">
                        {student.avatar_url ? (
                            <img
                                src={student.avatar_url}
                                alt="Avatar"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-500">
                                {student.first_name?.[0]}
                            </div>
                        )}
                    </div>

                    {/* Name + Code */}
                    <div>
                        <p className="font-semibold">
                            {student.first_name} {student.last_name}
                        </p>
                        <p className="text-xs text-text-secondary">
                            {student.student_code || "No ID"}
                        </p>
                    </div>

                </div>
            </td>

            <td className="px-6 py-4 text-sm">
                {student.email}
            </td>
            <td className="px-6 py-4 text-sm">
                {student.counsellor?.name || "Unassigned"}
            </td>

            {/* <td>
                <div>
                    <p>{student.last_activity_note || "No activity"}</p>
                    <p className="text-xs text-text-secondary">
                        {student.last_activity_at
                            ? new Date(student.last_activity_at).toLocaleDateString()
                            : ""}
                    </p>
                </div>
            </td> */}

            <td className="px-6 py-4">
                <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusStyle(student.status)}`}>
                    {student.status}
                </span>
            </td>

            <td className="px-6 py-4 text-right">
                <StudentActions studentId={student.id} />
            </td>
        </tr>
    )
}