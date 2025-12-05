#!/bin/sh

# Replace environment variables in config.template.js and output to config.js
# We use a specific list of variables to avoid leaking system env vars
envsubst '${BACKEND_BASE_URL} ${APP_ENV}' < /usr/share/nginx/html/config.template.js > /usr/share/nginx/html/config.js

# Start Nginx
exec "$@"
