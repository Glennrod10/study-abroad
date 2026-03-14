"use client";

import { useEffect, useState, useMemo } from "react";
import { DndContext, closestCorners, DragEndEvent } from "@dnd-kit/core";
import { LEAD_COLUMNS } from "./constants";
import LeadColumn from "./LeadColumn";
import CreateLeadModal from "./CreateLeadModal";

export default function LeadBoard() {
    const [leads, setLeads] = useState<any[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [sourceFilter, setSourceFilter] = useState("");
    const [countryFilter, setCountryFilter] = useState("");
    const [scoreFilter, setScoreFilter] = useState("");
    const [searchQuery, setSearchQuery] = useState("");

    const fetchLeads = async () => {
        const res = await fetch("/api/leads");
        const data = await res.json();

        if (Array.isArray(data)) {
            setLeads(data);
        } else {
            setLeads([]);
        }
    };

    useEffect(() => {
        fetchLeads();
    }, []);

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over) return;

        const draggedLead = leads.find((l) => l.id === active.id);
        if (!draggedLead) return;

        let newStage: string | null = null;

        const droppedOnColumn = LEAD_COLUMNS.find(
            (col) => col.id === over.id
        );

        if (droppedOnColumn) {
            newStage = droppedOnColumn.id;
        } else {
            const overCard = leads.find((l) => l.id === over.id);
            if (overCard) newStage = overCard.stage;
        }

        if (!newStage || newStage === draggedLead.stage) return;

        setLeads((prev) =>
            prev.map((l) =>
                l.id === draggedLead.id ? { ...l, stage: newStage } : l
            )
        );

        await fetch(`/api/leads/${draggedLead.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ stage: newStage }),
        });
    };

    /* =========================
       STATS
    ========================= */

    const totalLeads = leads.length;

    const hotLeads = useMemo(
        () => leads.filter((l) => l.score >= 80).length,
        [leads]
    );

    const convertedLeads = useMemo(
        () => leads.filter((l) => l.stage === "application_submitted").length,
        [leads]
    );

    const lostLeads = useMemo(
        () => leads.filter((l) => l.stage === "lost").length,
        [leads]
    );

    const filteredLeads = leads.filter((lead) => {

        /* SEARCH */

        if (searchQuery) {

            const query = searchQuery.toLowerCase();

            const matchesName = lead.student_name
                ?.toLowerCase()
                .includes(query);

            const matchesPhone = lead.phone
                ?.toLowerCase()
                .includes(query);

            const matchesEmail = lead.email
                ?.toLowerCase()
                .includes(query);

            if (!matchesName && !matchesPhone && !matchesEmail) {
                return false;
            }
        }

        /* SOURCE FILTER */

        if (sourceFilter && lead.source !== sourceFilter) {
            return false;
        }

        /* COUNTRY FILTER */

        if (
            countryFilter &&
            !lead.destination_country
                ?.toLowerCase()
                .includes(countryFilter.toLowerCase())
        ) {
            return false;
        }

        /* SCORE FILTER */

        if (scoreFilter === "hot" && lead.score < 80) {
            return false;
        }

        if (scoreFilter === "warm" && (lead.score < 40 || lead.score >= 80)) {
            return false;
        }

        if (scoreFilter === "cold" && lead.score >= 40) {
            return false;
        }

        return true;
    });

    return (
        <div className="space-y-8">

            {/* Header */}

            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-black">
                        Lead Management
                    </h1>

                    <p className="text-sm text-text-secondary mt-2">
                        Capture, qualify and convert student leads efficiently.
                    </p>
                </div>

                <button
                    onClick={() => setShowModal(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition cursor-pointer"
                >
                    + Add Lead
                </button>
            </div>

            {/* Stat Cards */}

            <div className="grid grid-cols-4 gap-6">

                <StatCard
                    title="Total Leads"
                    value={totalLeads}
                    color="blue"
                />

                <StatCard
                    title="Hot Leads"
                    value={hotLeads}
                    color="red"
                />

                <StatCard
                    title="Converted"
                    value={convertedLeads}
                    color="green"
                />

                <StatCard
                    title="Lost"
                    value={lostLeads}
                    color="yellow"
                />

            </div>
            {/* Filters */}

            <div className="flex gap-4 flex-wrap">
                {/* Search */}
                <input
                    type="text"
                    placeholder="Search name, phone, email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="border rounded-md px-3 py-2 text-sm w-64"
                />
                {/* Source Filter */}

                <select
                    value={sourceFilter}
                    onChange={(e) => setSourceFilter(e.target.value)}
                    className="border rounded-md px-3 py-2 text-sm"
                >
                    <option value="">All Sources</option>
                    <option value="facebook_ads">Facebook Ads</option>
                    <option value="google_ads">Google Ads</option>
                    <option value="website">Website</option>
                    <option value="referral">Referral</option>
                </select>

                {/* Country Filter */}

                <input
                    placeholder="Filter by country"
                    value={countryFilter}
                    onChange={(e) => setCountryFilter(e.target.value)}
                    className="border rounded-md px-3 py-2 text-sm"
                />

                {/* Score Filter */}

                <select
                    value={scoreFilter}
                    onChange={(e) => setScoreFilter(e.target.value)}
                    className="border rounded-md px-3 py-2 text-sm"
                >
                    <option value="">All Scores</option>
                    <option value="hot">Hot Leads</option>
                    <option value="warm">Warm Leads</option>
                    <option value="cold">Cold Leads</option>
                </select>

            </div>


            {/* Pipeline */}

            <div className="flex gap-6 overflow-x-auto pb-4">

                <DndContext
                    collisionDetection={closestCorners}
                    onDragEnd={handleDragEnd}
                >

                    {LEAD_COLUMNS.map((column) => (

                        <LeadColumn
                            key={column.id}
                            column={column}
                            leads={filteredLeads.filter((l) => l.stage === column.id)}
                            onUpdated={fetchLeads}
                            onDeleted={fetchLeads}
                        />

                    ))}

                </DndContext>

            </div>

            {showModal && (
                <CreateLeadModal
                    onClose={() => setShowModal(false)}
                    onCreated={fetchLeads}
                />
            )}
        </div>
    );
}

/* =========================
   STAT CARD
========================= */

function StatCard({
    title,
    value,
    color,
}: {
    title: string;
    value: number | string;
    color: "blue" | "red" | "green" | "yellow";
}) {

    const styles = {
        blue: "bg-blue-50 text-blue-700 border-blue-200",
        red: "bg-red-50 text-red-700 border-red-200",
        green: "bg-green-50 text-green-700 border-green-200",
        yellow: "bg-yellow-50 text-yellow-700 border-yellow-200",
    };

    return (
        <div
            className={`p-6 rounded-xl border shadow-sm ${styles[color]}`}
        >
            <p className="text-sm font-medium mb-2">
                {title}
            </p>

            <h2 className="text-3xl font-bold">
                {value}
            </h2>
        </div>
    );
}