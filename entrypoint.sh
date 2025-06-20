#!/bin/sh

# Set default values if environment variables are not set
export FRONTEND_PORT=${FRONTEND_PORT:-3000}

echo "🚀 Starting Nginx with frontend on port $FRONTEND_PORT"

# Ensure we have the necessary directories and permissions
mkdir -p /etc/nginx/conf.d
mkdir -p /var/cache/nginx
mkdir -p /var/log/nginx

# Substitute environment variables in nginx template
envsubst '$FRONTEND_PORT' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf

# Test nginx configuration
nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Nginx configuration is valid"
else
    echo "❌ Nginx configuration test failed"
    exit 1
fi

# Start nginx
echo "🌐 Starting Nginx on port $FRONTEND_PORT"
exec nginx -g "daemon off;" 