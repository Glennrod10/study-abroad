export default function Loading() {
    return (
        <div className="space-y-6 animate-pulse">

            {/* Header skeleton */}

            <div className="flex justify-between items-center">
                <div className="h-8 w-56 bg-gray-200 rounded"></div>
                <div className="h-10 w-36 bg-gray-200 rounded-lg"></div>
            </div>

            {/* Filters */}

            <div className="grid grid-cols-4 gap-4">
                <div className="h-10 bg-gray-200 rounded-lg"></div>
                <div className="h-10 bg-gray-200 rounded-lg"></div>
                <div className="h-10 bg-gray-200 rounded-lg"></div>
                <div className="h-10 bg-gray-200 rounded-lg"></div>
            </div>

            {/* Table */}

            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">

                <div className="divide-y">

                    {[...Array(8)].map((_, i) => (

                        <div
                            key={i}
                            className="grid grid-cols-6 gap-4 p-4"
                        >

                            <div className="h-4 bg-gray-200 rounded"></div>
                            <div className="h-4 bg-gray-200 rounded"></div>
                            <div className="h-4 bg-gray-200 rounded"></div>
                            <div className="h-4 bg-gray-200 rounded"></div>
                            <div className="h-4 bg-gray-200 rounded"></div>
                            <div className="h-4 bg-gray-200 rounded"></div>

                        </div>

                    ))}

                </div>

            </div>

        </div>
    )
}