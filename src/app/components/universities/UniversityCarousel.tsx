"use client"

import { useState } from "react"

export default function UniversityCarousel({ images }: any) {

    const [index, setIndex] = useState(0)

    if (!images.length) return null

    return (
        <div className="relative w-full h-72 rounded-xl overflow-hidden shadow-sm border border-border">

            <img
                src={images[index]}
                className="w-full h-full object-cover"
            />

            {/* Navigation */}
            {images.length > 1 && (
                <>
                    <button
                        onClick={() => setIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                        className="absolute left-3 top-1/2 -translate-y-1/2 bg-white p-2 rounded-full shadow"
                    >
                        ‹
                    </button>

                    <button
                        onClick={() => setIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 bg-white p-2 rounded-full shadow"
                    >
                        ›
                    </button>
                </>
            )}

        </div>
    )
}