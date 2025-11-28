const { connectDatabase, disconnectDatabase } = require('./database');
const { connectRedis, getRedisClient, disconnectRedis } = require('./redis');

module.exports = {
    connectDatabase,
    disconnectDatabase,
    connectRedis,
    getRedisClient,
    disconnectRedis,
};
