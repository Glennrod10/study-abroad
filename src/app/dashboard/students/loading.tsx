export default function Loading() {
    return (
        <div className="space-y-8 animate-pulse">

            <div className="flex items-end justify-between">
                <div className="space-y-2">
                    <div className="h-9 w-40 bg-gray-200 rounded-lg" />
                    <div className="h-4 w-64 bg-gray-200 rounded" />
                </div>
                <div className="h-11 w-36 bg-gray-200 rounded-lg" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-gray-100 rounded-xl p-5 flex items-center gap-4">
                        <div className="w-11 h-11 rounded-lg bg-gray-200" />
                        <div className="space-y-2 flex-1">
                            <div className="h-3 w-16 bg-gray-200 rounded" />
                            <div className="h-3 w-24 bg-gray-200 rounded" />
                            <div className="h-6 w-12 bg-gray-200 rounded" />
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex gap-4">
                <div className="h-11 flex-1 bg-gray-200 rounded-lg" />
                <div className="h-11 w-28 bg-gray-200 rounded-lg" />
            </div>

            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="divide-y">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="flex items-center gap-6 p-4">
                            <div className="h-4 w-4 bg-gray-200 rounded" />
                            <div className="flex items-center gap-3 flex-1">
                                <div className="w-10 h-10 rounded-full bg-gray-200 shrink-0" />
                                <div className="space-y-2 flex-1">
                                    <div className="h-4 w-32 bg-gray-200 rounded" />
                                    <div className="h-3 w-20 bg-gray-200 rounded" />
                                </div>
                            </div>
                            <div className="h-4 w-48 bg-gray-200 rounded hidden md:block" />
                            <div className="h-4 w-24 bg-gray-200 rounded hidden lg:block" />
                            <div className="h-5 w-20 bg-gray-200 rounded" />
                            <div className="h-4 w-8 bg-gray-200 rounded" />
                        </div>
                    ))}
                </div>
            </div>

        </div>
    )
}
