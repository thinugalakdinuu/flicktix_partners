// /pages/api/partner/signup.js
import sanityClient from "@/lib/sanity"; // Your sanity client
import bcrypt from "bcryptjs";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { email, password, name } = req.body;

  const existingUser = await sanityClient.fetch(
    `*[_type == "partner" && email == $email][0]`,
    { email }
  );

  if (existingUser)
    return res.status(400).json({ message: "Email already in use" });

  const hashedPassword = await bcrypt.hash(password, 10);

  const result = await sanityClient.create({
    _type: "partner",
    email,
    passwordHash: hashedPassword,
    name,
    approved: false,
  });

  res.status(201).json({ message: "Partner created", partnerId: result._id });
}
