"use client";

import { useState } from "react";
import VisaBoard from "./VisaBoard";
import VisaChecklistTab from "./tabs/VisaChecklistTab";
import VisaAppointmentsTab from "./tabs/VisaAppointmentsTab";
import VisaDocumentsTab from "./tabs/VisaDocumentsTab";
import VisaLorTab from "./tabs/VisaLorTab";
import VisaSopTab from "./tabs/VisaSopTab";
import VisaAnalyticsTab from "./tabs/VisaAnalyticsTab";

export default function VisaTabs() {

    const [activeTab, setActiveTab] = useState("board");
    const [selectedVisaId, setSelectedVisaId] = useState<string | null>(null)

    const tabs = [
        { id: "board", label: "Board" },
        { id: "checklist", label: "Checklist" },
        { id: "appointments", label: "Appointments" },
        { id: "documents", label: "Documents" },
        { id: "lor", label: "LOR Tracker" },
        // { id: "sop", label: "SOP Builder" },
        { id: "analytics", label: "Analytics" }
    ];

    return (
        <div className="space-y-6">

            {/* Header */}
            {/* <div>
                <h1 className="text-3xl font-black">Visa Tracking</h1>
                <p className="text-sm text-gray-500 mt-2">
                    Manage visa processing, documents, and appointments.
                </p>
            </div> */}

            {/* Tabs */}
            <div className="flex gap-2 mb-8 pb-2">

                {tabs.map(tab => (

                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition cursor-pointer
                        
                        ${activeTab === tab.id
                                ? "bg-blue-600 text-white"
                                : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                            }`}
                    >
                        {tab.label}
                    </button>

                ))}

            </div>

            {/* Content */}

            {activeTab === "board" && (
                <VisaBoard
                    onOpenChecklist={(visaId: string) => {
                        setSelectedVisaId(visaId)
                        setActiveTab("checklist")
                    }}
                />
            )}

            {/* Checklist */}
            {activeTab === "checklist" && (
                <VisaChecklistTab visaId={selectedVisaId} />
            )}

            {activeTab === "appointments" && (
                <VisaAppointmentsTab visaId={selectedVisaId} />
            )}

            {activeTab === "documents" && (
                <VisaDocumentsTab visaId={selectedVisaId} />
            )}

            {activeTab === "lor" && <VisaLorTab visaId={selectedVisaId} />}

            {/* {activeTab === "sop" && <VisaSopTab visaId={selectedVisaId} />} */}

            {activeTab === "analytics" && <VisaAnalyticsTab />}

        </div>
    );
}