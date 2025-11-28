const Redis = require('ioredis');

let redisClient = null;

/**
 * Connect to Redis
 * @returns {Redis} - Redis client instance
 */
const connectRedis = () => {
    if (redisClient) {
        return redisClient;
    }

    const options = {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
        password: process.env.REDIS_PASSWORD || undefined,
        retryStrategy: times => {
            const delay = Math.min(times * 50, 2000);
            return delay;
        },
        maxRetriesPerRequest: 3,
    };

    redisClient = new Redis(options);

    redisClient.on('connect', () => {
        console.log('✅ Redis connected successfully');
    });

    redisClient.on('error', err => {
        console.error('❌ Redis connection error:', err.message);
    });

    redisClient.on('close', () => {
        console.warn('⚠️  Redis connection closed');
    });

    return redisClient;
};

/**
 * Get Redis client instance
 * @returns {Redis} - Redis client
 */
const getRedisClient = () => {
    if (!redisClient) {
        return connectRedis();
    }
    return redisClient;
};

/**
 * Disconnect from Redis
 */
const disconnectRedis = async () => {
    if (redisClient) {
        await redisClient.quit();
        redisClient = null;
        console.log('Redis connection closed');
    }
};

module.exports = {
    connectRedis,
    getRedisClient,
    disconnectRedis,
};
