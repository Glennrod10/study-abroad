"use client";

import { useState } from "react";
import {
    LayoutDashboard,
    ClipboardCheck,
    Calendar,
    FileText,
    NotepadText,
    BarChart3,
} from "lucide-react";
import VisaBoard from "./VisaBoard";
import VisaChecklistTab from "./tabs/VisaChecklistTab";
import VisaAppointmentsTab from "./tabs/VisaAppointmentsTab";
import VisaDocumentsTab from "./tabs/VisaDocumentsTab";
import VisaLorTab from "./tabs/VisaLorTab";
import VisaSopTab from "./tabs/VisaSopTab";
import VisaAnalyticsTab from "./tabs/VisaAnalyticsTab";

const iconMap: Record<string, React.ElementType> = {
    board: LayoutDashboard,
    checklist: ClipboardCheck,
    appointments: Calendar,
    documents: FileText,
    lor: NotepadText,
    analytics: BarChart3,
};

const tabs = [
    { id: "board", label: "Board" },
    { id: "checklist", label: "Checklist" },
    { id: "appointments", label: "Appointments" },
    { id: "documents", label: "Documents" },
    { id: "lor", label: "LOR Tracker" },
    { id: "analytics", label: "Analytics" },
];

export default function VisaTabs() {
    const [activeTab, setActiveTab] = useState("board");
    const [selectedVisaId, setSelectedVisaId] = useState<string | null>(null);

    return (
        <div className="space-y-6">
            <div className="bg-gray-100 p-1 rounded-xl inline-flex">
                {tabs.map((tab) => {
                    const Icon = iconMap[tab.id];
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer
                                ${activeTab === tab.id
                                    ? "bg-white shadow-sm text-gray-900"
                                    : "text-gray-500 hover:text-gray-700"
                                }`}
                        >
                            <Icon size={16} />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            <div key={activeTab} className="animate-fadeIn">
                {activeTab === "board" && (
                    <VisaBoard
                        onOpenChecklist={(visaId: string) => {
                            setSelectedVisaId(visaId);
                            setActiveTab("checklist");
                        }}
                    />
                )}
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
                {activeTab === "analytics" && <VisaAnalyticsTab />}
            </div>
        </div>
    );
}
