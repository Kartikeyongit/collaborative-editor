let redisClient = null;

async function initializeRedis() {
  try {
    const { createClient } = require('redis');
    
    redisClient = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });

    redisClient.on('error', (err) => {
      console.warn('Redis error (using in-memory fallback):', err.message);
    });

    await redisClient.connect();
    console.log('Connected to Redis');
  } catch (error) {
    console.warn('Redis not available, using in-memory storage');
    redisClient = createInMemoryStore();
  }
}

function createInMemoryStore() {
  const store = new Map();
  
  return {
    sAdd: async (key, value) => {
      if (!store.has(key)) store.set(key, new Set());
      store.get(key).add(value);
    },
    sRem: async (key, value) => {
      if (store.has(key)) store.get(key).delete(value);
    },
    lPush: async (key, value) => {
      if (!store.has(key)) store.set(key, []);
      store.get(key).unshift(value);
    },
    lTrim: async (key, start, end) => {
      if (store.has(key)) {
        const arr = store.get(key);
        store.set(key, arr.slice(start, end + 1));
      }
    },
    lRange: async (key, start, end) => {
      if (!store.has(key)) return [];
      return store.get(key).slice(start, end + 1);
    },
    connect: async () => {},
    quit: async () => {}
  };
}

function getRedisClient() {
  return redisClient;
}

module.exports = { initializeRedis, get redisClient() { return redisClient; } };