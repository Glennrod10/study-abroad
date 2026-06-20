import crypto from "crypto"

const SECRET = process.env.NEXTAUTH_SECRET!

export function createResetToken(userId: string): string {
    const payload = JSON.stringify({ userId, exp: Math.floor(Date.now() / 1000) + 3600 })
    const encoded = Buffer.from(payload).toString("base64url")
    const hmac = crypto.createHmac("sha256", SECRET).update(encoded).digest("base64url")
    return `${encoded}.${hmac}`
}

export function verifyResetToken(token: string): { userId: string } | null {
    const parts = token.split(".")
    if (parts.length !== 2) return null

    const [encoded, sig] = parts
    const expected = crypto.createHmac("sha256", SECRET).update(encoded).digest("base64url")

    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null

    try {
        const { userId, exp } = JSON.parse(Buffer.from(encoded, "base64url").toString())
        if (Date.now() > exp * 1000) return null
        return { userId }
    } catch {
        return null
    }
}
