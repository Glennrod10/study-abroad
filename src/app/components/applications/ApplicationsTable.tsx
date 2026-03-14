"use client"

import { useRouter } from "next/navigation"

export default function ApplicationsTable({ applications }: any) {
    const router = useRouter()

    return (
        <div className="bg-white border border-border rounded-xl shadow-sm overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 border-b border-border">
                    <tr>
                        <th className="px-6 py-4 text-xs font-bold uppercase">Student</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase">University</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase">Intake</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase">Status</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase">Commission</th>
                    </tr>
                </thead>

                <tbody>
                    {applications?.map((app: any) => (
                        <tr
                            key={app.id}
                            className="hover:bg-gray-50 transition cursor-pointer"
                            onClick={() =>
                                router.push(`/dashboard/applications/${app.id}`)
                            }
                        >
                            <td className="px-6 py-4">
                                {app.students?.first_name} {app.students?.last_name}
                            </td>
                            <td className="px-6 py-4">{app.university_name}</td>
                            <td className="px-6 py-4">{app.intake}</td>
                            <td className="px-6 py-4">
                                <span className="px-2 py-1 text-xs rounded-full bg-blue-50 text-blue-600">
                                    {app.application_status}
                                </span>
                            </td>
                            <td className="px-6 py-4">
                                ₹ {app.commission_amount || 0}
                            </td>
                        </tr>
                    ))}

                    {!applications?.length && (
                        <tr>
                            <td colSpan={5} className="text-center py-10 text-text-secondary">
                                No applications yet.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    )
}