"use client";

import { useState } from "react";
import { toast } from "sonner";

export default function CreateLeadModal({
    onClose,
    onCreated,
}: {
    onClose: () => void;
    onCreated: () => void;
}) {

    const [name, setName] = useState("");
    const [country, setCountry] = useState("");
    const [phone, setPhone] = useState("");

    const handleSubmit = async () => {

        if (!name || !country) {
            toast.error("Required fields missing");
            return;
        }

        const res = await fetch("/api/leads", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                student_name: name,
                destination_country: country,
                phone,
            }),
        });

        if (res.ok) {
            toast.success("Lead created");
            onCreated();
            onClose();
        } else {
            toast.error("Failed to create lead");
        }

    };

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

            <div className="bg-white rounded-2xl w-[500px] shadow-xl">

                {/* Header */}

                <div className="p-6 border-b">

                    <h2 className="text-xl font-semibold">
                        Create Lead
                    </h2>

                </div>

                {/* Form */}

                <div className="p-6 space-y-4">

                    <div>

                        <label className="text-sm font-medium">
                            Student Name *
                        </label>

                        <input
                            className="w-full border p-2 rounded-md mt-1"
                            value={name}
                            onChange={(e) =>
                                setName(e.target.value)
                            }
                        />

                    </div>

                    <div>

                        <label className="text-sm font-medium">
                            Destination Country *
                        </label>

                        <input
                            className="w-full border p-2 rounded-md mt-1"
                            value={country}
                            onChange={(e) =>
                                setCountry(e.target.value)
                            }
                        />

                    </div>

                    <div>

                        <label className="text-sm font-medium">
                            Phone
                        </label>

                        <input
                            className="w-full border p-2 rounded-md mt-1"
                            value={phone}
                            onChange={(e) =>
                                setPhone(e.target.value)
                            }
                        />

                    </div>

                </div>

                {/* Footer */}

                <div className="p-6 border-t flex justify-end gap-3">

                    <button
                        onClick={onClose}
                        className="px-4 py-2 border rounded-md hover:bg-gray-100 cursor-pointer"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={handleSubmit}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer"
                    >
                        Create
                    </button>

                </div>

            </div>

        </div>
    );
}