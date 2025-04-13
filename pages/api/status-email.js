import { Resend } from "resend";
import jwt from "jsonwebtoken";
import { getRedisClient } from "@/lib/redis"; // Assuming you have a function to get Redis client

const resend = new Resend(process.env.RESEND_API_KEY);
const secret = process.env.NEXT_JWT_SECRET;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const {
    email,
    theaterName,
    status, // status could be 'approved' or 'denied'
  } = req.body;

  try {
    // Email content based on approval status
    let subject, message, buttonText, buttonColor, buttonLink;

    if (status === "approved") {
      subject = "Partner Signup Approved - FlickTix";
      message = `
        <p>Dear ${theaterName},</p>
        <p>We are happy to inform you that your partner signup request has been approved. Welcome to FlickTix!</p>
        <p>If you have any questions, feel free to reach out to our support team.</p>
      `;
      buttonText = "Set Up Your Account";
      buttonColor = "#28a745"; // Green for approved

      // Generate token for security
      const token = jwt.sign(
        { email, theaterName },
        secret,
        { expiresIn: "24h" }
      );

      // Save the JWT token to Redis with the email
      const redis = await getRedisClient();
      await redis.set(token, email, { EX: 60 * 60 * 24 });  // Set expiration to 24 hours

      // Add token and data to the query string
      buttonLink = `${process.env.SITE_URL}/setup?token=${token}&email=${encodeURIComponent(email)}&theaterName=${encodeURIComponent(theaterName)}`; // Setup page with token
    } else if (status === "denied") {
      subject = "Partner Signup Denied - FlickTix";
      message = `
        <p>Dear ${theaterName},</p>
        <p>We regret to inform you that your partner signup request has been denied. If you have any questions, please contact us.</p>
      `;
      buttonText = "Contact Support";
      buttonColor = "#dc3545"; // Red for denied
      buttonLink = `${process.env.SITE_URL}/support`; // Support page
    } else {
      return res.status(400).json({ message: "Invalid status" });
    }

    // Email content
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <a href="${buttonLink}">
            <img src="https://flicktix-app.vercel.app/images/red_white.png" alt="FlickTix Logo" style="width: 150px; height: auto; display: block; margin: 0 auto;" />
          </a>
        </div>
        <h2 style="color: #BA181B;">${subject}</h2>
        <p>${message}</p>
        <div style="text-align: center; margin-top: 30px;">
          <a href="${buttonLink}" 
             style="display: inline-block; padding: 12px 24px; font-size: 16px; color: white; background-color: ${buttonColor}; border-radius: 6px; text-decoration: none; font-weight: bold;">
             ${buttonText}
          </a>
        </div>
        <p style="margin-top: 30px; font-size: 12px; color: #555;">
          This is an automated email. Please do not reply.
        </p>
      </div>
    `;

    // Send email to partner
    const response = await resend.emails.send({
      from: "FlickTix <onboarding@resend.dev>", // Your verified email
      to: [email], // Partner's email
      subject,
      html: htmlContent,
    });

    if (response.data && !response.error) {
      return res.status(200).json({ message: "Status email sent successfully!" });
    } else {
      console.error("Resend error:", response.error);
      return res.status(500).json({ message: "Failed to send email.", response });
    }
  } catch (error) {
    console.error("Unexpected error:", error);
    return res.status(500).json({ message: "Internal server error", error });
  }
}
