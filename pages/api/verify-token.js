// pages/api/verify-token.js
import jwt from 'jsonwebtoken';
import { getRedisClient } from '@/lib/redis';  // Assuming you have a Redis client helper

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ error: 'No token provided' });
  }

  try {
    // Step 1: Verify the token signature and expiration with JWT
    const decoded = jwt.verify(token, process.env.NEXT_JWT_SECRET);

    // Step 2: Check if the token exists in Redis
    const redis = await getRedisClient();
    const email = await redis.get(token);  // Token should have been saved with the token as key in Redis

    if (!email) {
      return res.status(401).json({ error: 'Token is invalid or has already been used' });
    }

    // Step 3: Optionally, delete the token from Redis to prevent reuse
    await redis.del(token);  // Ensure token can only be used once

    // If all checks pass, return the decoded information
    return res.status(200).json({ valid: true, decoded });
  } catch (err) {
    console.error("Token verification error:", err);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}
