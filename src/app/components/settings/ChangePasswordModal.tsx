"use client";

import { useState } from "react";
import { X, Eye, EyeOff, Lock } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

export default function ChangePasswordModal({ isOpen, onClose }: Props) {
    const { data: session } = useSession();

    const [loading, setLoading] = useState(false);

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [form, setForm] = useState({
        password: "",
        confirmPassword: "",
    });

    if (!isOpen) return null;

    const handleChange = (key: string, value: string) => {
        setForm((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const getPasswordStrength = () => {
        const password = form.password;

        if (password.length < 6) return { text: "Weak", color: "bg-red-500", width: "30%" };
        if (password.length < 10) return { text: "Medium", color: "bg-yellow-500", width: "60%" };

        return { text: "Strong", color: "bg-green-500", width: "100%" };
    };

    const strength = getPasswordStrength();

    const updatePassword = async () => {
        if (!form.password || !form.confirmPassword) {
            toast.error("All fields are required");
            return;
        }

        if (form.password.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }

        if (form.password !== form.confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        setLoading(true);

        const res = await fetch("/api/update-password", {
            method: "POST",
            body: JSON.stringify({
                userId: session?.user?.id,
                password: form.password,
            }),
        });

        const data = await res.json();

        setLoading(false);

        if (data.error) {
            toast.error(data.error);
            return;
        }

        toast.success("Password updated successfully");

        setForm({
            password: "",
            confirmPassword: "",
        });

        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">

            <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl p-7 space-y-6">

                {/* HEADER */}
                <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <Lock size={18} />
                        Change Password
                    </h2>

                    <button
                        onClick={onClose}
                        className="cursor-pointer hover:bg-gray-100 p-1 rounded-md transition"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* NEW PASSWORD */}
                <div className="space-y-2">
                    <label className="text-sm font-medium">
                        New Password *
                    </label>

                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            value={form.password}
                            onChange={(e) => handleChange("password", e.target.value)}
                            className="w-full border rounded-lg px-3 py-2 pr-10 focus:ring-2 focus:ring-black outline-none"
                            placeholder="Enter new password"
                        />

                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-2.5 cursor-pointer text-gray-500"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>

                    {/* PASSWORD STRENGTH */}
                    {form.password && (
                        <div className="space-y-1">

                            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                    className={`h-full ${strength.color}`}
                                    style={{ width: strength.width }}
                                />
                            </div>

                            <p className="text-xs text-gray-500">
                                Strength: {strength.text}
                            </p>

                        </div>
                    )}
                </div>

                {/* CONFIRM PASSWORD */}
                <div className="space-y-2">
                    <label className="text-sm font-medium">
                        Confirm Password *
                    </label>

                    <div className="relative">
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            value={form.confirmPassword}
                            onChange={(e) =>
                                handleChange("confirmPassword", e.target.value)
                            }
                            className="w-full border rounded-lg px-3 py-2 pr-10 focus:ring-2 focus:ring-black outline-none"
                            placeholder="Confirm password"
                        />

                        <button
                            type="button"
                            onClick={() =>
                                setShowConfirmPassword(!showConfirmPassword)
                            }
                            className="absolute right-3 top-2.5 cursor-pointer text-gray-500"
                        >
                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>

                {/* ACTIONS */}
                <div className="flex justify-end gap-3 pt-2">

                    <button
                        onClick={onClose}
                        className="px-4 py-2 border rounded-lg hover:bg-gray-100 cursor-pointer transition"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={updatePassword}
                        disabled={loading}
                        className="px-5 py-2 bg-black text-white rounded-lg hover:opacity-90 cursor-pointer transition"
                    >
                        {loading ? "Updating..." : "Update Password"}
                    </button>

                </div>

            </div>
        </div>
    );
}