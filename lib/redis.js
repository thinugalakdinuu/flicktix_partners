import { createClient } from "redis";

const redis = createClient({
  username: "default",
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
  },
});

redis.on("error", (err) => console.error("Redis Client Error", err));

// We use a flag to avoid reconnecting every time
let isConnected = false;

export async function getRedisClient() {
  if (!isConnected) {
    await redis.connect();
    isConnected = true;
  }
  return redis;
}
