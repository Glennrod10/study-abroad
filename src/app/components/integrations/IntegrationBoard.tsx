"use client";

import IntegrationCard from "./IntegrationCard";



export default function IntegrationBoard() {
    return (
        <div className="space-y-8">

            <div>
                <h1 className="text-3xl font-black">
                    Integrations
                </h1>

                <p className="text-sm text-gray-500 mt-2">
                    Connect external platforms to automatically capture leads.
                </p>
            </div>

            <div className="grid grid-cols-3 gap-6">

                <IntegrationCard
                    title="Facebook Lead Ads"
                    description="Automatically capture leads from Facebook forms."
                    provider="facebook"
                />

                <IntegrationCard
                    title="Google Ads"
                    description="Import leads from Google Ads campaigns."
                    provider="google"
                />

                <IntegrationCard
                    title="Website Forms"
                    description="Capture leads from website forms."
                    provider="website"
                />

                <IntegrationCard
                    title="WhatsApp"
                    description="Capture leads via WhatsApp chatbot."
                    provider="whatsapp"
                />

            </div>

        </div>
    );
}