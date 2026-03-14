import type { Config } from "tailwindcss"

const config: Config = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {

            /* 🎨 COLOR SYSTEM */
            colors: {
                primary: {
                    DEFAULT: "#5048E5",
                    light: "#F5F4FF",
                },
                success: "#10B981",
                error: "#EF4444",
                warning: "#F59E0B",
                info: "#3B82F6",

                surface: "#FFFFFF",
                background: "#F9FAFB",
                border: "#E5E7EB",

                text: {
                    primary: "#111827",
                    secondary: "#6B7280",
                    disabled: "#9CA3AF",
                },
            },

            /* 🅰 TYPOGRAPHY */
            fontFamily: {
                sans: ["Inter", "sans-serif"],
            },

            fontSize: {
                display: ["48px", { lineHeight: "1.2", fontWeight: "700" }],
                h1: ["32px", { lineHeight: "1.25", fontWeight: "600" }],
                h2: ["24px", { lineHeight: "1.3", fontWeight: "600" }],
                h3: ["20px", { lineHeight: "1.4", fontWeight: "600" }],
                bodylg: ["18px", { lineHeight: "1.5", fontWeight: "400" }],
                body: ["16px", { lineHeight: "1.5", fontWeight: "400" }],
                bodysm: ["14px", { lineHeight: "1.5", fontWeight: "400" }],
                caption: ["12px", { lineHeight: "1.4", fontWeight: "500" }],
            },

            /* 📏 SPACING (8px system) */
            spacing: {
                1: "4px",
                2: "8px",
                3: "12px",
                4: "16px",
                6: "24px",
                8: "32px",
                10: "40px",
                12: "48px",
            },

            borderRadius: {
                sm: "8px",
                md: "12px",
            },

            boxShadow: {
                card: "0px 4px 6px -1px rgba(0,0,0,0.1), 0px 2px 4px -1px rgba(0,0,0,0.06)",
            },

            maxWidth: {
                content: "1200px",
            },
        },
    },
    plugins: [],
}

export default config