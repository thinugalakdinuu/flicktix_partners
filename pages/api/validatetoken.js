// pages/api/validatetoken.js
import jwt from 'jsonwebtoken';

export default function handler(req, res) {
  if (req.method === 'POST') {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    try {
      const decoded = jwt.verify(token, process.env.NEXT_JWT_SECRET);
      return res.status(200).json({ message: 'Token is valid', user: decoded });
    } catch (err) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}
