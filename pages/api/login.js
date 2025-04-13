import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const payload = { email, userType: 'partner' };

    const token = jwt.sign(payload, process.env.NEXT_JWT_SECRET, { expiresIn: '1h' });

    return res.status(200).json({ token });
  } else {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
}
