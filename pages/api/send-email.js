// pages/api/send-approval-email.js

import { Resend } from "resend";
import jwt from "jsonwebtoken";
import { getRedisClient } from "@/lib/redis";

const resend = new Resend(process.env.RESEND_API_KEY);
const secret = process.env.NEXT_JWT_SECRET;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const {
    email,
    theaterName,
    theaterAddress,
    contactTheater,
    adminName,
    adminContact,
    registrationDocUrl,
  } = req.body;

  try {
    // Generate token for security
    const token = jwt.sign(
      { requestId: email, action: "approve" },
      secret,
      { expiresIn: "24h" }
    );

    
    // Save the JWT token to Redis with the email
    const redis = await getRedisClient();
    await redis.set(token, email, { EX: 60 * 60 * 24 });  // Set expiration to 24 hours

    // Add all details to the query string
    const queryParams = new URLSearchParams({
      token,
      email,
      theaterName,
      theaterAddress,
      contactTheater,
      adminName,
      adminContact,
      registrationDocUrl,
    }).toString();

    const approvalUrl = `${process.env.SITE_URL}/admin/approve?${queryParams}`;

    // Email content with approval link
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <a href="${approvalUrl}">
            <img src="https://flicktix-app.vercel.app/images/red.png" alt="FlickTix Logo" style="width: 150px; height: auto;" />
          </a>
        </div>
        <h2 style="color: #BA181B;">🎟️ New Partner Signup Request</h2>
        <p><strong>Theater Name:</strong> ${theaterName}</p>
        <p><strong>Address:</strong> ${theaterAddress}</p>
        <p><strong>(Theater)Contact Number:</strong> ${contactTheater}</p>
        <p><strong>Official Email:</strong> ${email}</p>
        <p><strong>Admin Name:</strong> ${adminName}</p>
        <p><strong>Admin Contact:</strong> ${adminContact}</p>
        <p><strong>Registration Document:</strong> 
          <a href="${registrationDocUrl}" target="_blank" style="color: #0B090A;">View Document</a>
        </p>
        <div style="text-align: center; margin-top: 30px;">
          <a href="${approvalUrl}" 
             style="
               display: inline-block;
               padding: 12px 24px;
               font-size: 16px;
               color: white;
               background-color: #BA181B;
               border-radius: 6px;
               text-decoration: none;
               font-weight: bold;">
             ✅ Approve Partner
          </a>
        </div>
        <p style="margin-top: 30px; font-size: 12px; color: #555;">
          This link will expire in 24 hours. If you didn’t request this, please ignore this email.
        </p>
      </div>
    `;

    const response = await resend.emails.send({
      from: "Flicktix <onboarding@resend.dev>",
      to: ["thinugalakdinuu@gmail.com"], // Replace with verified emails in production
      subject: "New Partner Signup - FlickTix",
      html: htmlContent,
    });

    if (response.data && !response.error) {
      return res.status(200).json({ message: "Email sent successfully!" });
    } else {
      console.error("Resend error:", response.error);
      return res.status(500).json({ message: "Failed to send email.", response });
    }
  } catch (error) {
    console.error("Unexpected error:", error);
    return res.status(500).json({ message: "Internal server error", error });
  }
}
