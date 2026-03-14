"use client";

import { useState } from "react";
import { Save } from "lucide-react";
import { toast } from "sonner";
import ChangePasswordModal from "@/app/components/settings/ChangePasswordModal";

export default function SettingsPage() {
    const [loading, setLoading] = useState(false);
    const [openPasswordModal, setOpenPasswordModal] = useState(false);

    const [settings, setSettings] = useState({
        theme: "system",
        language: "english",
        timezone: "Asia/Kolkata",
        email_notifications: true,
        visa_updates: true,
        application_updates: true,
        weekly_reports: false,
    });

    const handleChange = (key: string, value: any) => {
        setSettings((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const saveSettings = async () => {
        setLoading(true);

        try {
            // Later we will store in Supabase
            console.log(settings);

            toast.success("Settings saved successfully");
        } catch (error) {
            toast.error("Failed to save settings");
        }

        setLoading(false);
    };

    return (
        <div className="p-6 space-y-8 max-w-5xl">
            <h1 className="text-2xl font-semibold">Settings</h1>

            {/* ACCOUNT PREFERENCES */}
            <div className="bg-white rounded-xl border p-6 space-y-6">
                <h2 className="text-lg font-semibold">Account Preferences</h2>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Theme */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Theme *
                        </label>

                        <select
                            value={settings.theme}
                            onChange={(e) => handleChange("theme", e.target.value)}
                            className="w-full border rounded-lg px-3 py-2"
                        >
                            <option value="light">Light</option>
                            <option value="dark">Dark</option>
                            <option value="system">System</option>
                        </select>
                    </div>

                    {/* Language */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Language *
                        </label>

                        <select
                            value={settings.language}
                            onChange={(e) => handleChange("language", e.target.value)}
                            className="w-full border rounded-lg px-3 py-2"
                        >
                            <option value="english">English</option>
                            <option value="spanish">Spanish</option>
                            <option value="german">German</option>
                        </select>
                    </div>

                    {/* Timezone */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Timezone *
                        </label>

                        <select
                            value={settings.timezone}
                            onChange={(e) => handleChange("timezone", e.target.value)}
                            className="w-full border rounded-lg px-3 py-2"
                        >
                            <option value="Asia/Kolkata">Asia/Kolkata</option>
                            <option value="Europe/London">Europe/London</option>
                            <option value="America/New_York">America/New York</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* NOTIFICATIONS */}
            <div className="bg-white rounded-xl border p-6 space-y-6">
                <h2 className="text-lg font-semibold">Notifications</h2>

                <div className="space-y-4">

                    <label className="flex items-center justify-between">
                        <span>Email Notifications</span>
                        <input
                            type="checkbox"
                            checked={settings.email_notifications}
                            onChange={(e) =>
                                handleChange("email_notifications", e.target.checked)
                            }
                            className="cursor-pointer"
                        />
                    </label>

                    <label className="flex items-center justify-between">
                        <span>Visa Status Updates</span>
                        <input
                            type="checkbox"
                            checked={settings.visa_updates}
                            onChange={(e) =>
                                handleChange("visa_updates", e.target.checked)
                            }
                            className="cursor-pointer"
                        />
                    </label>

                    <label className="flex items-center justify-between">
                        <span>Application Updates</span>
                        <input
                            type="checkbox"
                            checked={settings.application_updates}
                            onChange={(e) =>
                                handleChange("application_updates", e.target.checked)
                            }
                            className="cursor-pointer"
                        />
                    </label>

                    <label className="flex items-center justify-between">
                        <span>Weekly Report Emails</span>
                        <input
                            type="checkbox"
                            checked={settings.weekly_reports}
                            onChange={(e) =>
                                handleChange("weekly_reports", e.target.checked)
                            }
                            className="cursor-pointer"
                        />
                    </label>

                </div>
            </div>

            {/* SECURITY */}
            <div className="bg-white rounded-xl border p-6 space-y-6">
                <h2 className="text-lg font-semibold">Security</h2>

                <div className="flex items-center justify-between">
                    <span>Change Password</span>

                    <button
                        onClick={() => setOpenPasswordModal(true)}
                        className="border px-4 py-2 rounded-lg hover:bg-gray-100 cursor-pointer"
                    >
                        Update Password
                    </button>
                </div>
            </div>

            {/* SAVE BUTTON */}
            <div className="flex justify-end">
                <button
                    onClick={saveSettings}
                    disabled={loading}
                    className="flex items-center gap-2 bg-black text-white px-6 py-2 rounded-lg hover:opacity-90 cursor-pointer"
                >
                    <Save size={18} />
                    {loading ? "Saving..." : "Save Settings"}
                </button>
            </div>
            <ChangePasswordModal
                isOpen={openPasswordModal}
                onClose={() => setOpenPasswordModal(false)}
            />
        </div>

    );
}