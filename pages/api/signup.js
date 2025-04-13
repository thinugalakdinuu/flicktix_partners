// /pages/api/partner/signup.js
import client from "@/lib/client"; // Your sanity client
import bcrypt from "bcryptjs";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { email, password, name } = req.body;

  const existingUser = await client.fetch(
    `*[_type == "partner" && email == $email][0]`,
    { email }
  );

  if (existingUser)
    return res.status(400).json({ message: "Email already in use" });

  const hashedPassword = await bcrypt.hash(password, 10);

  const result = await client.create({
    _type: "partner",
    email,
    passwordHash: hashedPassword,
    name,
    approved: false,
  });

  res.status(201).json({ message: "Partner created", partnerId: result._id });
}
