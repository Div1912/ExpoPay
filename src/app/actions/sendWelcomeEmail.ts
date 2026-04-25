"use server";

import { Resend } from "resend";

export async function sendWelcomeEmail(email: string) {
  const resendApiKey = process.env.RESEND_API_KEY;

  if (!resendApiKey) {
    console.error("RESEND_API_KEY is not set in environment variables.");
    return { success: false, error: "Email configuration error" };
  }

  const resend = new Resend(resendApiKey);

  try {
    const { data, error } = await resend.emails.send({
      from: "ExpoPay <noreply@exporouter.site>", // Change exporouter.site to your actual domain
      to: [email],
      subject: "Welcome to ExpoPay! 🚀",
      html: `
        <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #000000; color: #ffffff; padding: 40px 30px; border-radius: 24px; border: 1px solid #222222;">
          <h1 style="color: #ffffff; font-size: 24px; font-weight: 900; letter-spacing: 2px; margin-bottom: 40px;">EXPO<span style="color: #C694F9;">PAY</span></h1>
          
          <h2 style="font-size: 24px; font-weight: bold; margin-bottom: 20px;">Welcome to the future of payments.</h2>
          
          <p style="color: #a1a1aa; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
            Hi there, <br><br>
            Thank you for verifying your email and joining ExpoPay! We're absolutely thrilled to have you onboard.
          </p>

          <h3 style="color: #ffffff; font-size: 18px; font-weight: bold; margin-top: 40px; margin-bottom: 15px;">What you can do right now:</h3>
          
          <ul style="color: #a1a1aa; font-size: 16px; line-height: 1.8; margin-bottom: 30px; padding-left: 20px;">
            <li><strong>Setup your 2FA:</strong> Secure your account with two-factor authentication.</li>
            <li><strong>Fund your Wallet:</strong> Deposit funds to start interacting with smart contracts.</li>
            <li><strong>Create Contracts:</strong> Set up secure, trustless escrow contracts with anyone, instantly.</li>
          </ul>
          
          <div style="margin: 40px 0;">
            <a href="https://exporouter.site/dashboard" style="background-color: #C694F9; color: #000000; padding: 16px 32px; text-decoration: none; border-radius: 50px; font-weight: 900; font-size: 16px; display: inline-block;">Go to Dashboard</a>
          </div>

          <p style="color: #666666; font-size: 12px; margin-top: 40px; border-top: 1px solid #222222; padding-top: 20px; line-height: 1.5;">
            If you have any questions, simply reply to this email.<br>
            © 2026 ExpoPay. All rights reserved.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err: any) {
    console.error("Failed to send welcome email:", err);
    return { success: false, error: err.message };
  }
}
