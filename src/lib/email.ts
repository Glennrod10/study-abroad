const APP_NAME = "StudyAbroad CRM"

export async function sendPasswordResetEmail({
    email,
    name,
    resetLink,
}: {
    email: string
    name: string
    resetLink: string
}) {
    if (!process.env.SENDGRID_API_KEY || !process.env.SENDGRID_FROM_EMAIL) {
        console.warn("SENDGRID_API_KEY or SENDGRID_FROM_EMAIL not set — skipping email send")
        return
    }

    const sgMail = await import("@sendgrid/mail")
    sgMail.default.setApiKey(process.env.SENDGRID_API_KEY!)

    await sgMail.default.send({
        to: email,
        from: process.env.SENDGRID_FROM_EMAIL,
        subject: `Reset your ${APP_NAME} password`,
        html: `
            <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
                <h2>Hi ${name},</h2>
                <p>We received a request to reset your password.</p>
                <a href="${resetLink}"
                   style="display: inline-block; padding: 12px 24px; background: #2563eb;
                          color: white; text-decoration: none; border-radius: 6px; margin: 16px 0;">
                    Reset Password
                </a>
                <p style="color: #666; font-size: 14px;">
                    This link expires in 1 hour. If you didn't request this, ignore this email.
                </p>
            </div>
        `,
    })
}
