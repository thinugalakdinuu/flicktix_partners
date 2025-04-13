import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const { email } = req.body;

      // Step 1: Create a Stripe account (if it doesn't exist)
      const account = await stripe.accounts.create({
        type: "express",
        email: email,
      });

      // Step 2: Create an account link to onboard the user
      const accountLink = await stripe.accountLinks.create({
        account: account.id,
        refresh_url: `${process.env.SITE_URL}/setup`, // URL to refresh the page if they fail
        return_url: `${process.env.SITE_URL}/dashboard`, // Where they return after completing the onboarding
        type: "account_onboarding",
      });

      // Step 3: Send back the URL for Stripe onboarding
      return res.status(200).json({ url: accountLink.url });
    } catch (error) {
      console.error("Stripe Onboarding Error:", error);
      return res.status(500).json({ error: "Failed to onboard Stripe account." });
    }
  } else {
    return res.status(405).json({ error: "Method Not Allowed" });
  }
}
