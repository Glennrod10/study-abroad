export default function ProfileSkeleton() {
    return (
        <div className="space-y-8 animate-pulse">

            {/* Header */}

            <div className="space-y-2">
                <div className="h-8 w-56 bg-gray-200 rounded"></div>
                <div className="h-4 w-96 bg-gray-200 rounded"></div>
            </div>

            {/* Avatar Card */}

            <div className="bg-white border border-gray-200 rounded-xl p-6 flex items-center gap-6">

                <div className="w-20 h-20 rounded-full bg-gray-200"></div>

                <div className="space-y-3 flex-1">

                    <div className="h-4 w-40 bg-gray-200 rounded"></div>
                    <div className="h-3 w-72 bg-gray-200 rounded"></div>

                    <div className="flex gap-4 mt-2">
                        <div className="h-9 w-32 bg-gray-200 rounded-lg"></div>
                        <div className="h-9 w-20 bg-gray-200 rounded-lg"></div>
                    </div>

                </div>

            </div>

            {/* Form Card */}

            <div className="bg-white border border-gray-200 rounded-xl p-8 space-y-6">

                <div className="h-6 w-48 bg-gray-200 rounded"></div>

                <div className="grid md:grid-cols-2 gap-6">

                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="space-y-2">
                            <div className="h-3 w-24 bg-gray-200 rounded"></div>
                            <div className="h-11 w-full bg-gray-200 rounded-lg"></div>
                        </div>
                    ))}

                </div>

                <div className="space-y-2">
                    <div className="h-3 w-20 bg-gray-200 rounded"></div>
                    <div className="h-24 w-full bg-gray-200 rounded-lg"></div>
                </div>

                <div className="flex justify-end">
                    <div className="h-10 w-40 bg-gray-200 rounded-lg"></div>
                </div>

            </div>

        </div>
    )
}