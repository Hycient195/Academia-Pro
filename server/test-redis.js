// Simple test to check if Redis service can be instantiated
const Redis = require('ioredis');

async function testRedis() {
  try {
    console.log('Testing Redis connection...');
    // console.log(process.env.REDIS_PASSWORD)

    const redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD || undefined,
      db: parseInt(process.env.REDIS_DB || '0'),
      lazyConnect: true,
    });

    // Test basic operations
    await redis.set('test:key', 'Hello Redis!');
    const value = await redis.get('test:key');
    console.log('Redis test successful:', value);

    await redis.del('test:key');
    await redis.quit();

    console.log('✅ Redis service test passed!');
  } catch (error) {
    console.error('❌ Redis test failed:', error.message);
  }
}

testRedis();