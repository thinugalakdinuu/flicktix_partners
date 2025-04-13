import Stripe from "stripe";
import { client } from "@/lib/client"; // Sanity client

const stripe = new Stripe(process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { email, theaterName, location, pricing, partnerId } = req.body;

    try {
      // 1. Create Stripe account
      const account = await stripe.accounts.create({
        type: "standard",
        country: "US", // adjust to your region
        email,
      });

      // 2. Create theater in Sanity
      const theaterDoc = {
        _type: "theater",
        theaterName,
        location,
        pricing,
        stripeAccountId: account.id,
      };

      const createdTheater = await client.create(theaterDoc);

      // 3. Patch the partner document to link the created theater
      await client
        .patch(partnerId)
        .set({
          owner: {
            _type: "reference",
            _ref: createdTheater._id,
          },
        })
        .commit();

      res.status(200).json({ success: true, message: "Theater and partner link created successfully." });
    } catch (error) {
      console.error("Error creating theater and linking to partner:", error);
      res.status(500).json({ success: false, message: "Failed to create and link theater." });
    }
  } else {
    res.status(405).json({ success: false, message: "Method Not Allowed" });
  }
}
