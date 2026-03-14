import LoginForm from "../components/auth/LoginForm";

export default function LoginPage() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 min-h-screen">

            {/* LEFT PANEL */}
            <div className="hidden md:flex bg-gradient-to-br from-indigo-600 to-purple-600 text-white p-12 flex-col justify-between">
                <div>
                    <h1 className="text-2xl font-bold">StudyAbroad CRM</h1>
                </div>

                <div>
                    <h2 className="text-4xl font-bold mb-6">
                        Empowering Global Ambitions
                    </h2>
                    <p className="text-lg opacity-90">
                        The all-in-one CRM designed specifically for international
                        education agencies to manage applications, track students,
                        and scale globally.
                    </p>
                </div>

                <div className="text-sm opacity-80">
                    © 2026 StudyAbroad CRM
                </div>
            </div>

            {/* RIGHT PANEL */}
            <div className="flex items-center justify-center p-10 bg-gray-50">
                <LoginForm />
            </div>

        </div>
    )
}