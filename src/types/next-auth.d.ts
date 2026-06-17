import "next-auth"
import "next-auth/jwt"

declare module "next-auth" {
    interface DefaultSession {
        user?: {
            id: string
            name?: string | null
            email?: string | null
            image?: string | null
            role: string
            agency_id: string
        }
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        role: string
        agency_id: string
    }
}
