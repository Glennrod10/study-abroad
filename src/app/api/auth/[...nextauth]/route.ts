import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { createClient } from "@supabase/supabase-js"
import bcrypt from "bcryptjs"
import { NextAuthOptions } from "next-auth"

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null
                }

                const { data: user } = await supabase
                    .from("users")
                    .select("*")
                    .eq("email", credentials.email)
                    .single()

                if (!user) return null

                const isValid = await bcrypt.compare(
                    credentials.password,
                    user.password
                )

                if (!isValid) return null

                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    agency_id: user.agency_id
                }
            }
        })
    ],

    session: { strategy: "jwt" },

    secret: process.env.NEXTAUTH_SECRET,

    callbacks: {

        /* ===== JWT ===== */
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id
                token.role = (user as any).role
                token.agency_id = (user as any).agency_id
            }
            return token
        },

        /* ===== SESSION ===== */
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).id = token.id
                ;(session.user as any).role = token.role
                ;(session.user as any).agency_id = token.agency_id
            }
            return session
        }
    }
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }