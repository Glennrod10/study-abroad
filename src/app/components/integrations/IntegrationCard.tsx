"use client";

export default function IntegrationCard({
    title,
    description,
    provider,
}: {
    title: string;
    description: string;
    provider: string;
}) {

    const connect = async () => {
        window.location.href = `/api/integrations/${provider}/connect`;
    };

    return (
        <div className="border rounded-xl p-6 bg-white shadow-sm flex flex-col justify-between">

            <div>
                <h2 className="font-semibold text-lg">
                    {title}
                </h2>

                <p className="text-sm text-gray-500 mt-2">
                    {description}
                </p>
            </div>

            <button
                onClick={connect}
                className="mt-6 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition cursor-pointer"
            >
                Connect
            </button>

        </div>
    );
}