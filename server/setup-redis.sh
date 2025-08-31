#!/bin/bash

# Academia Pro - Redis Setup Script
# This script helps set up Redis for the Academia Pro application

set -e

echo "🚀 Academia Pro - Redis Setup"
echo "================================"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"

# Create .env file if it doesn't exist
if [ ! -f "server/.env" ]; then
    echo "📝 Creating .env file..."
    cp server/.env.example server/.env 2>/dev/null || echo "# Add your environment variables here" > server/.env
fi

# Check if Redis environment variables are set
if ! grep -q "REDIS_HOST" server/.env; then
    echo "⚠️  Redis environment variables not found in .env file"
    echo "📝 Adding Redis environment variables to .env file..."

    cat >> server/.env << EOF

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
REDIS_URL=redis://localhost:6379
REDIS_TTL=3600
REDIS_KEY_PREFIX=academia_pro:
EOF
fi

echo "🐳 Starting Redis with Docker Compose..."
if command -v docker-compose &> /dev/null; then
    docker-compose -f docker-compose.redis.yml up -d
else
    docker compose -f docker-compose.redis.yml up -d
fi

echo "⏳ Waiting for Redis to be ready..."
sleep 5

# Test Redis connection
echo "🔍 Testing Redis connection..."
if command -v docker &> /dev/null; then
    docker exec academia-pro-redis redis-cli ping
fi

echo "✅ Redis setup completed!"
echo ""
echo "📋 Next steps:"
echo "1. Install Redis dependencies: cd server && npm install ioredis @types/ioredis"
echo "2. Start your NestJS application"
echo "3. Redis will be available at localhost:6379"
echo "4. Redis Insight (GUI) will be available at http://localhost:5540"
echo ""
echo "📚 Useful commands:"
echo "- View Redis logs: docker logs academia-pro-redis"
echo "- Access Redis CLI: docker exec -it academia-pro-redis redis-cli"
echo "- Stop Redis: docker-compose -f docker-compose.redis.yml down"
echo ""
echo "🔧 Configuration:"
echo "- Redis config: redis.conf"
echo "- Environment variables: server/.env"
echo "- Docker compose: docker-compose.redis.yml"