"use client";

import { useEffect, useState } from "react";

interface Organization {
    id: string;
    name: string;
    email: string;
    phone: string | null;
}

export default function OrganizationPage() {
    const [data, setData] = useState<Organization | null>(null);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    /* ================= FETCH ================= */

    useEffect(() => {
        const fetchOrg = async () => {
            const res = await fetch("/api/organization");
            const json = await res.json();

            setData(json);
            setName(json.name || "");
            setEmail(json.email || "");
            setPhone(json.phone || "");
            setLoading(false);
        };

        fetchOrg();
    }, []);

    /* ================= SAVE ================= */

    const handleSave = async () => {
        setError("");

        if (!name.trim() || !email.trim()) {
            setError("Name and Email are required.");
            return;
        }

        setSaving(true);

        const res = await fetch("/api/organization", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name,
                email,
                phone,
            }),
        });

        if (!res.ok) {
            setError("Failed to update organization.");
        }

        setSaving(false);
    };

    if (loading) {
        return <div className="p-8">Loading...</div>;
    }

    return (
        <div className="space-y-8">

            {/* Header */}
            <div>
                <h1 className="text-3xl font-black">
                    Organization Settings
                </h1>
                <p className="text-text-secondary mt-2">
                    Manage your agency information.
                </p>
            </div>

            {/* Form Card */}
            <div
                className="p-8 rounded-xl shadow-card max-w-xl space-y-6"
                style={{ backgroundColor: "var(--color-card-bg)" }}
            >
                {/* Name */}
                <div className="min-h-[80px]">
                    <label className="text-sm font-medium">
                        Organization Name <span className="text-error">*</span>
                    </label>
                    <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full border p-2 rounded-md mt-2"
                    />
                </div>

                {/* Email */}
                <div className="min-h-[80px]">
                    <label className="text-sm font-medium">
                        Email <span className="text-error">*</span>
                    </label>
                    <input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full border p-2 rounded-md mt-2"
                    />
                </div>

                {/* Phone */}
                <div className="min-h-[80px]">
                    <label className="text-sm font-medium">
                        Phone
                    </label>
                    <input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full border p-2 rounded-md mt-2"
                    />
                </div>

                {/* Error */}
                {error && (
                    <p className="text-error text-sm">{error}</p>
                )}

                {/* Actions */}
                <div className="flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-6 py-2 bg-[var(--color-primary)] text-white rounded-md hover:opacity-90 transition cursor-pointer disabled:opacity-50"
                    >
                        {saving ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </div>

        </div>
    );
}