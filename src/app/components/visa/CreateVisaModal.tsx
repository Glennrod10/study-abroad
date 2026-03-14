"use client";

import { useEffect, useState } from "react";
import { VISA_COLUMNS } from "./constants";
import { toast } from "sonner";

interface Application {
    id: string;
    intake: string;
    country: string;
    student_name: string;
}

export default function CreateVisaModal({
    onClose,
    onCreated,
}: {
    onClose: () => void;
    onCreated: () => void;
}) {
    const [applications, setApplications] = useState<Application[]>([]);
    const [selectedApp, setSelectedApp] = useState<Application | null>(null);
    const [visaType, setVisaType] = useState("");
    const [status, setStatus] = useState("documents_pending");
    const [search, setSearch] = useState("");

    const [errors, setErrors] = useState({
        application: "",
        visaType: "",
    });

    useEffect(() => {
        const fetchData = async () => {
            const [appsRes, visasRes] = await Promise.all([
                fetch("/api/applications"),
                fetch("/api/visas"),
            ]);

            const apps = await appsRes.json();
            const visas = await visasRes.json();

            if (!Array.isArray(apps) || !Array.isArray(visas)) return;

            const usedApplicationIds = visas.map(
                (v: any) => v.application_id
            );

            const filteredApps = apps.filter(
                (app: any) => !usedApplicationIds.includes(app.id)
            );

            setApplications(filteredApps);
        };

        fetchData();
    }, []);

    const validate = () => {
        let valid = true;
        const newErrors = { application: "", visaType: "" };

        if (!selectedApp) {
            newErrors.application = "Application is required";
            valid = false;
        }

        if (!visaType.trim()) {
            newErrors.visaType = "Visa type is required";
            valid = false;
        }

        setErrors(newErrors);
        return valid;
    };

    const handleSubmit = async () => {
        if (!validate()) return;

        const res = await fetch("/api/visas", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                application_id: selectedApp!.id,
                visa_type: visaType,
                status,
            }),
        });

        if (res.ok) {
            toast.success("Visa created successfully");
            onCreated();
            onClose();
        } else {
            toast.error("Failed to create visa");
        }
    };

    const filteredApplications = applications.filter((app) =>
        app.student_name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl w-[550px] h-[600px] shadow-xl flex flex-col">

                {/* Header */}
                <div className="p-6 border-b">
                    <h2 className="text-xl font-semibold">
                        Create Visa Case
                    </h2>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">

                    {/* Search */}
                    <div>
                        <label className="text-sm font-medium">
                            Search Student <span className="text-red-500">*</span>
                        </label>
                        <input
                            placeholder="Search student..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full border p-2 rounded-md mt-1"
                        />
                        {errors.application && (
                            <p className="text-red-500 text-xs mt-1">
                                {errors.application}
                            </p>
                        )}
                    </div>

                    {/* Student List */}
                    <div className="border rounded-md h-40 overflow-y-auto">
                        {filteredApplications.length === 0 && (
                            <div className="p-3 text-sm text-gray-400">
                                No students found
                            </div>
                        )}

                        {filteredApplications.map((app) => (
                            <div
                                key={app.id}
                                onClick={() => setSelectedApp(app)}
                                className={`p-3 cursor-pointer hover:bg-gray-100 ${selectedApp?.id === app.id
                                    ? "bg-gray-200"
                                    : ""
                                    }`}
                            >
                                {app.student_name} — {app.country}
                            </div>
                        ))}
                    </div>

                    {/* Selected Info */}
                    {selectedApp && (
                        <>
                            <div>
                                <label className="text-sm font-medium">
                                    Destination Country
                                </label>
                                <input
                                    value={selectedApp?.country ?? ""}
                                    disabled
                                    className="w-full border p-2 rounded-md bg-gray-100 mt-1"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium">
                                    Visa Type <span className="text-red-500">*</span>
                                </label>
                                <input
                                    placeholder="Student / Dependent"
                                    className="w-full border p-2 rounded-md mt-1"
                                    value={visaType}
                                    onChange={(e) => setVisaType(e.target.value)}
                                />
                                {errors.visaType && (
                                    <p className="text-red-500 text-xs mt-1">
                                        {errors.visaType}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="text-sm font-medium">
                                    Visa Status
                                </label>
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="w-full border p-2 rounded-md mt-1"
                                >
                                    {VISA_COLUMNS.map((col) => (
                                        <option key={col.id} value={col.id}>
                                            {col.title}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border rounded-md hover:bg-gray-100 transition cursor-pointer"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={handleSubmit}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition cursor-pointer"
                    >
                        Create
                    </button>
                </div>
            </div>
        </div>
    );
}