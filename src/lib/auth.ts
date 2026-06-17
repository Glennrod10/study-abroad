import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export type AuthSession = {
    user: {
        id: string
        name?: string | null
        email?: string | null
        image?: string | null
        role: string
        agency_id: string
    }
    expires: string
}

export async function getAuthSession() {
    return await getServerSession(authOptions) as AuthSession | null
}

export async function requireAuth() {
    const session = await getAuthSession()
    if (!session?.user) return null
    return session
}
