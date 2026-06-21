"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"

export default function ApplicationForm({
    application,
    mode = "create",
}: {
    application?: any
    mode?: "create" | "edit"
}) {
    const router = useRouter()
    const searchParams = useSearchParams()

    const universityParam = searchParams.get("university")
    const programParam = searchParams.get("program")

    const [students, setStudents] = useState<any[]>([])
    const [programs, setPrograms] = useState<any[]>([])
    const [errors, setErrors] = useState<any>({})
    const [studentMode, setStudentMode] = useState<"existing" | "new">(
        application?.student_id ? "existing" : "new"
    )
    const [loading, setLoading] = useState(false)

    const [form, setForm] = useState({
        student_id: application?.student_id || "",
        university_id: application?.university_id || "",
        program_id: application?.program_id || "",
        university_name: application?.university_name || "",
        course_name: application?.course_name || "",
        intake: application?.intake || "",
        tuition_fee: application?.tuition_fee || "",
        application_status: application?.application_status || "Draft",
        commission_type: application?.commission_type || "percentage",
        commission_value: application?.commission_value || "",
        manual_override: application?.manual_override || false,
        commission_amount: application?.commission_amount || "",
        new_student: {
            first_name: "",
            last_name: "",
            email: "",
            phone: "",
            destination_country: "",
            intake: "",
            qualification: "",
            english_proficiency: "",
        },
    })

    const updateNewStudent = (field: string, value: string) => {
        setForm(prev => ({ ...prev, new_student: { ...prev.new_student, [field]: value } }))
    }

    // Load students
    useEffect(() => {
        fetch("/api/students-list")
            .then(res => res.json())
            .then(data => setStudents(data))
    }, [])

    // Prefill from university page (CREATE ONLY)
    useEffect(() => {
        if (mode === "edit") return
        if (!universityParam) return

        async function prefill() {
            const res = await fetch(
                `/api/programs-by-university?university=${universityParam}`
            )

            if (!res.ok) return

            const data = await res.json()
            setPrograms(data)

            let selectedProgram = null

            if (programParam) {
                selectedProgram = data.find((p: any) => p.id === programParam)
            }

            if (!selectedProgram && data.length > 0) {
                selectedProgram = data[0]
            }

            if (selectedProgram) {
                setForm(prev => ({
                    ...prev,
                    university_id: universityParam,
                    program_id: selectedProgram.id,
                    university_name: selectedProgram.university_name,
                    course_name: selectedProgram.name,
                    tuition_fee: selectedProgram.tuition_fee,
                    intake: selectedProgram.intake,
                }))
            }
        }

        prefill()
    }, [universityParam, programParam, mode])

    const handleProgramChange = (programId: string) => {
        const selected = programs.find((p) => p.id === programId)
        if (!selected) return

        setForm(prev => ({
            ...prev,
            program_id: programId,
            course_name: selected.name,
            tuition_fee: selected.tuition_fee,
            intake: selected.intake,
        }))
    }

    const handleChange = (e: any) => {
        const { name, value } = e.target
        setForm(prev => ({ ...prev, [name]: value }))
    }

    const calculatePreview = () => {
        if (form.manual_override) return form.commission_amount || 0

        if (form.commission_type === "percentage") {
            return (
                Number(form.tuition_fee || 0) *
                (Number(form.commission_value || 0) / 100)
            )
        }

        return Number(form.commission_value || 0)
    }

    const handleSubmit = async (e: any) => {
        e.preventDefault()
        setLoading(true)

        let payload

        if (mode === "edit") {
            // FLAT structure for PUT
            payload = {
                university_name: form.university_name,
                course_name: form.course_name,
                intake: form.intake,
                tuition_fee: Number(form.tuition_fee),
                application_status: form.application_status,
                commission_type: form.commission_type,
                commission_value: Number(form.commission_value),
                manual_override: form.manual_override,
                commission_amount: Number(form.commission_amount),
            }
        } else {
            // Nested structure for CREATE
            payload = {
                student_mode: studentMode,
                student_id: form.student_id,
                university_id: form.university_id,
                program_id: form.program_id,
                application_data: {
                    university_name: form.university_name,
                    course_name: form.course_name,
                    intake: form.intake,
                    tuition_fee: Number(form.tuition_fee),
                    application_status: form.application_status,
                    commission_type: form.commission_type,
                    commission_value: Number(form.commission_value),
                    manual_override: form.manual_override,
                    commission_amount: Number(form.commission_amount),
                },
            }
        }

        const res = await fetch(
            mode === "edit"
                ? `/api/applications/${application.id}`
                : "/api/applications",
            {
                method: mode === "edit" ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            }
        )

        setLoading(false)

        if (res.ok) {
            toast.success(
                mode === "edit"
                    ? "Application updated"
                    : "Application created"
            )

            router.push(
                mode === "edit"
                    ? `/dashboard/applications/${application.id}`
                    : "/dashboard/applications"
            )
        } else {
            toast.error("Something went wrong")
        }
    }

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-black">
                {mode === "edit" ? "Edit Application" : "Add Application"}
            </h1>

            <form onSubmit={handleSubmit} className="space-y-8">

                {/* PROGRAM SECTION */}
                {/* <div className="bg-white p-6 rounded-xl border border-gray-200 space-y-4">
                    <h2 className="font-bold">Program Selection</h2>

                    <select
                        value={form.program_id}
                        onChange={(e) => handleProgramChange(e.target.value)}
                        className="h-11 px-4 border border-gray-200 rounded-lg w-full"
                    >
                        <option value="">Select Program</option>
                        {programs.map((p) => (
                            <option key={p.id} value={p.id}>
                                {p.name}
                            </option>
                        ))}
                    </select>
                </div> */}

                {/* STUDENT SECTION */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 space-y-4">
                    <h2 className="font-bold">Student</h2>

                    <div className="flex gap-6">
                        <label>
                            <input
                                type="radio"
                                checked={studentMode === "existing"}
                                onChange={() => setStudentMode("existing")}
                            /> Existing
                        </label>

                        <label>
                            <input
                                type="radio"
                                checked={studentMode === "new"}
                                onChange={() => setStudentMode("new")}
                            /> New
                        </label>
                    </div>

                    {studentMode === "existing" ? (
                        <select
                            name="student_id"
                            value={form.student_id}
                            onChange={handleChange}
                            className="h-11 px-4 border border-gray-200 rounded-lg w-full"
                        >
                            <option value="">Select Student</option>
                            {students.map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.first_name} {s.last_name}
                                </option>
                            ))}
                        </select>
                    ) : (
                        <div className="grid grid-cols-2 gap-4">
                            <input placeholder="First Name"
                                value={form.new_student.first_name}
                                onChange={(e) => updateNewStudent("first_name", e.target.value)}
                                className="h-11 px-4 border border-gray-200 rounded-lg" />
                            <input placeholder="Last Name"
                                value={form.new_student.last_name}
                                onChange={(e) => updateNewStudent("last_name", e.target.value)}
                                className="h-11 px-4 border border-gray-200 rounded-lg" />
                            <input placeholder="Email"
                                value={form.new_student.email}
                                onChange={(e) => updateNewStudent("email", e.target.value)}
                                className="h-11 px-4 border border-gray-200 rounded-lg" />
                            <input placeholder="Phone"
                                value={form.new_student.phone}
                                onChange={(e) => updateNewStudent("phone", e.target.value)}
                                className="h-11 px-4 border border-gray-200 rounded-lg" />
                        </div>
                    )}
                </div>

                {/* APPLICATION DETAILS */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 grid grid-cols-2 gap-4">
                    <input
                        name="university_name"
                        value={form.university_name}
                        onChange={handleChange}
                        placeholder="University"
                        disabled={!!universityParam}
                        className={`h-11 px-4 rounded-lg border 
                            ${universityParam
                                ? "bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed"
                                : "border-gray-200"
                            }`}
                    />

                    <input name="course_name" value={form.course_name}
                        onChange={handleChange}
                        placeholder="Course"
                        className="h-11 px-4 border border-gray-200 rounded-lg" />

                    <input name="intake" value={form.intake}
                        onChange={handleChange}
                        placeholder="Intake"
                        className="h-11 px-4 border border-gray-200 rounded-lg" />

                    <input name="tuition_fee" value={form.tuition_fee}
                        onChange={handleChange}
                        placeholder="Tuition Fee"
                        className="h-11 px-4 border border-gray-200 rounded-lg" />
                </div>

                {/* COMMISSION */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 grid grid-cols-2 gap-4">
                    <select name="commission_type"
                        value={form.commission_type}
                        onChange={handleChange}
                        className="h-11 px-4 border border-gray-200 rounded-lg">
                        <option value="percentage">Percentage</option>
                        <option value="fixed">Fixed</option>
                    </select>

                    <input name="commission_value"
                        value={form.commission_value}
                        onChange={handleChange}
                        placeholder="Commission"
                        className="h-11 px-4 border border-gray-200 rounded-lg" />

                    <div className="col-span-2 text-sm text-text-secondary">
                        Estimated Commission: ₹ {calculatePreview()}
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="h-11 px-6 bg-[var(--color-primary)] text-white rounded-lg font-semibold"
                >
                    {loading ? "Saving..." : "Create Application"}
                </button>

            </form>
        </div>
    )
}