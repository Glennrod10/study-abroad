"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"

export default function VisaAppointmentsTab({ visaId }: any) {

    const [appointments, setAppointments] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [type, setType] = useState("Biometrics")
    const [date, setDate] = useState("")
    const [location, setLocation] = useState("")

    useEffect(() => {

        if (!visaId) return

        fetchAppointments()

    }, [visaId])


    const fetchAppointments = async () => {

        setLoading(true)
        const res = await fetch(`/api/visa-appointments/${visaId}`)

        const data = await res.json()

        if (Array.isArray(data)) {
            setAppointments(data)
        }
        setLoading(false)

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
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8 flex flex-col items-center justify-center text-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300 mb-3"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                <p className="text-gray-500 font-medium">Select a visa case first</p>
                <p className="text-sm text-gray-400 mt-1">Pick a visa from the Board to manage its appointments.</p>
            </div>
        )
    }


    return (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 space-y-6">

            <h2 className="text-xl font-semibold">
                Visa Appointments
            </h2>


            {/* Create Appointment */}

            <div className="grid grid-cols-4 gap-3">

                <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
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
                    className="border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                />

                <input
                    placeholder="Location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                />

                <button
                    onClick={createAppointment}
                    className="bg-blue-600 text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-blue-700 transition cursor-pointer"
                >
                    Add
                </button>

            </div>


            {/* Appointment List */}

            <div className="space-y-3">

                {loading ? (
                    <div className="space-y-3 animate-pulse">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="p-4 border border-gray-200 rounded-lg flex justify-between items-center">
                                <div className="space-y-2">
                                    <div className="h-4 w-24 bg-gray-200 rounded" />
                                    <div className="h-3 w-32 bg-gray-200 rounded" />
                                </div>
                                <div className="h-3 w-36 bg-gray-200 rounded" />
                            </div>
                        ))}
                    </div>
                ) : appointments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-center py-8 text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300 mb-2"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                        <p className="text-sm">No appointments scheduled yet.</p>
                    </div>
                ) : (
                    appointments.map((appt) => (

                        <div
                            key={appt.id}
                            className="p-4 border border-gray-200 rounded-lg flex justify-between items-center"
                        >

                            <div>
                                <p className="font-semibold text-gray-800">
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

                    ))
                )}

            </div>

        </div>
    )
}