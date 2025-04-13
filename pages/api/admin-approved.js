import { client } from "@/lib/client";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
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

  if (
    !email || !theaterName || !theaterAddress || !contactTheater ||
    !adminName || !adminContact || !registrationDocUrl
  ) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  try {
    // Query Sanity for a partner that matches the theaterAddress
    const query = `*[_type == "partner" && theaterAddress == $theaterAddress][0]`;
    const params = { theaterAddress };

    const partner = await client.fetch(query, params);

    if (!partner) {
      return res.status(404).json({ success: false, message: 'Partner not found' });
    }

    // If a matching partner is found, process it here (e.g., approve the partner or update the record)
    console.log("✅ Found Partner:", partner);

    // Optionally, update the partner or create a new record based on the approval
    // Example: update the partner's status
    await client.patch(partner._id) // Assuming you want to update the partner document
      .set({
        status: 'approved',
      })
      .commit();

    return res.status(200).json({ success: true, message: 'Partner approved and processed' });
  } catch (error) {
    console.error('❌ Error approving partner:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error', error });
  }
}
