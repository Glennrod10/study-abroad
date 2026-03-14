"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"

export default function VisaAppointmentsTab({ visaId }: any) {

    const [appointments, setAppointments] = useState<any[]>([])
    const [type, setType] = useState("Biometrics")
    const [date, setDate] = useState("")
    const [location, setLocation] = useState("")

    useEffect(() => {

        if (!visaId) return

        fetchAppointments()

    }, [visaId])


    const fetchAppointments = async () => {

        const res = await fetch(`/api/visa-appointments/${visaId}`)

        const data = await res.json()

        if (Array.isArray(data)) {
            setAppointments(data)
        }

    }


    const createAppointment = async () => {

        if (!date) {
            toast.error("Appointment date required")
            return
        }

        await fetch(`/api/visa-appointments/${visaId}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                type,
                appointment_date: date,
                location
            })
        })

        toast.success("Appointment created")

        setDate("")
        setLocation("")

        fetchAppointments()

    }


    if (!visaId) {
        return (
            <div className="bg-white border rounded-xl p-6">
                Select a visa case first
            </div>
        )
    }


    return (
        <div className="bg-white border rounded-xl shadow-sm p-6 space-y-6">

            <h2 className="text-xl font-semibold">
                Visa Appointments
            </h2>


            {/* Create Appointment */}

            <div className="grid grid-cols-4 gap-3">

                <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="border p-2 rounded-md"
                >
                    <option>Biometrics</option>
                    <option>Medical</option>
                    <option>Interview</option>
                    <option>VFS Appointment</option>
                    <option>Passport Collection</option>
                </select>

                <input
                    type="datetime-local"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="border p-2 rounded-md"
                />

                <input
                    placeholder="Location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="border p-2 rounded-md"
                />

                <button
                    onClick={createAppointment}
                    className="bg-blue-600 text-white rounded-md cursor-pointer"
                >
                    Add
                </button>

            </div>


            {/* Appointment List */}

            <div className="space-y-3">

                {appointments.map((appt) => (

                    <div
                        key={appt.id}
                        className="p-4 border rounded-lg flex justify-between"
                    >

                        <div>
                            <p className="font-semibold">
                                {appt.type}
                            </p>

                            <p className="text-sm text-gray-500">
                                {appt.location}
                            </p>
                        </div>

                        <p className="text-sm text-gray-600">
                            {new Date(appt.appointment_date).toLocaleString()}
                        </p>

                    </div>

                ))}

            </div>

        </div>
    )
}