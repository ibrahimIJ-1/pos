"use server";

import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
});

export async function getCache<T>(cacheKey: string) {
  try {
    let data = await redis.get(cacheKey);
    if (!data) {
      return null;
    } else {
      return data as T;
    }
  } catch (error) {
    return null;
  }
}

export async function setCache(cacheKey: string, data: any, expireTime: number = 3600) {
  try {
    await redis.set(cacheKey, JSON.stringify(data), { ex: expireTime });
    return true;
  } catch (error) {
    return false;
  }
}

export async function deleteCache(cacheKey: string) {
  try {
    await redis.del(cacheKey);
    return true;
  } catch (error) {
    return false;
  }
}