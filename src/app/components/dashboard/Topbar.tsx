"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Bell, ChevronDown, User, Building2, Settings, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import Link from "next/link";

interface Profile {
    name: string;
    role: string;
    avatar_url: string | null;
}

interface SearchResult {
    id: string;
    type: "student" | "application" | "visa";
    label: string;
}

export default function Topbar() {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [profileOpen, setProfileOpen] = useState(false);

    const [search, setSearch] = useState("");
    const [results, setResults] = useState<SearchResult[]>([]);
    const [showResults, setShowResults] = useState(false);

    const searchRef = useRef<HTMLDivElement>(null);
    const profileRef = useRef<HTMLDivElement>(null);

    /* ================= FETCH PROFILE ================= */

    const fetchProfile = async () => {
        const res = await fetch("/api/profile");
        const json = await res.json();
        setProfile(json);
    };

    useEffect(() => {
        fetchProfile();

        // Listen for profile update event
        const handleProfileUpdate = () => {
            fetchProfile();
        };

        window.addEventListener("profileUpdated", handleProfileUpdate);

        return () => {
            window.removeEventListener("profileUpdated", handleProfileUpdate);
        };
    }, []);

    /* ================= GLOBAL SEARCH ================= */

    useEffect(() => {
        const delay = setTimeout(async () => {
            if (!search.trim()) {
                setResults([]);
                return;
            }

            const res = await fetch(`/api/search?q=${search}`);
            const json = await res.json();

            setResults(json);
            setShowResults(true);
        }, 400);

        return () => clearTimeout(delay);
    }, [search]);

    /* ================= CLOSE DROPDOWNS ================= */

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                searchRef.current &&
                !searchRef.current.contains(event.target as Node)
            ) {
                setShowResults(false);
            }

            if (
                profileRef.current &&
                !profileRef.current.contains(event.target as Node)
            ) {
                setProfileOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const getInitials = () => {
        if (!profile?.name) return "?";

        return profile.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase();
    };

    return (
        <header className="h-16 border-b border-gray-200 bg-white/80 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-40">

            {/* 🔍 SEARCH */}
            <div className="relative w-80" ref={searchRef}>
                <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 h-10">
                    <Search size={16} className="text-text-secondary" />
                    <input
                        type="text"
                        placeholder="Global search..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="bg-transparent outline-none text-sm w-full"
                    />
                </div>

                {showResults && results.length > 0 && (
                    <div className="absolute top-12 w-full bg-white border rounded-lg shadow-lg p-2 space-y-1">
                        {results.map((item) => (
                            <Link
                                key={item.id}
                                href={`/dashboard/${item.type}s/${item.id}`}
                                className="block px-3 py-2 text-sm hover:bg-gray-100 rounded-md cursor-pointer"
                            >
                                {item.label}
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            {/* RIGHT SECTION */}
            <div className="flex items-center gap-6">

                {/* 🔔 Notifications */}
                <button className="relative p-2 rounded-lg hover:bg-gray-100 transition cursor-pointer">
                    <Bell size={18} className="text-text-secondary" />
                </button>

                <div className="w-px h-6 bg-border"></div>

                {/* 👤 PROFILE DROPDOWN */}
                <div
                    className="flex items-center gap-3 cursor-pointer group relative"
                    ref={profileRef}
                >
                    <div
                        onClick={() => setProfileOpen(!profileOpen)}
                        className="flex items-center gap-3"
                    >
                        <div className="text-right">
                            <p className="text-sm font-semibold leading-none">
                                {profile?.name}
                            </p>
                            <p className="text-xs text-text-secondary mt-1">
                                {profile?.role}
                            </p>
                        </div>

                        <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-white shadow-sm group-hover:border-[var(--color-primary)] transition-all flex items-center justify-center bg-gray-200 text-sm font-bold">

                            {profile?.avatar_url ? (
                                <img
                                    src={`${profile.avatar_url}?v=${Date.now()}`}
                                    alt="Avatar"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                getInitials()
                            )}

                        </div>

                        <ChevronDown size={16} className="text-text-secondary" />
                    </div>

                    {profileOpen && (
                        <div className="absolute right-0 top-14 w-56 bg-white shadow-xl rounded-xl border border-gray-200 p-2 space-y-1 z-50">

                            <Link
                                href="/dashboard/profile"
                                className="flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-100 rounded-md cursor-pointer transition"
                            >
                                <User size={16} className="text-text-secondary" />
                                Profile
                            </Link>

                            <Link
                                href="/dashboard/organization"
                                className="flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-100 rounded-md cursor-pointer transition"
                            >
                                <Building2 size={16} className="text-text-secondary" />
                                Organization Settings
                            </Link>

                            <Link
                                href="/dashboard/settings"
                                className="flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-100 rounded-md cursor-pointer transition"
                            >
                                <Settings size={16} className="text-text-secondary" />
                                Settings
                            </Link>

                            <div className="border-t my-1"></div>

                            <button
                                onClick={() => signOut({ callbackUrl: "/login" })}
                                className="flex items-center gap-3 w-full text-left px-3 py-2 text-sm text-error hover:bg-gray-100 rounded-md cursor-pointer transition"
                            >
                                <LogOut size={16} />
                                Logout
                            </button>

                        </div>
                    )}
                </div>

            </div>
        </header>
    );
}