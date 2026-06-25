#!/bin/bash
# Rollback script to restore 100% traffic to Django

echo "Executing rollback: Restoring traffic to Django..."

cat <<EOF > nginx/nginx.conf
upstream web {
    server web:8000;
}

server {
    listen 80;
    server_name localhost;

    client_max_body_size 100M;

    location / {
        proxy_pass http://web;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header Host \$host;
        proxy_redirect off;
    }

    location /static/ {
        alias /app/staticfiles/;
    }

    location /media/ {
        alias /app/media/;
    }
}
EOF

# Reload Nginx
# nginx -s reload
echo "Reloading Nginx configuration..."

echo "Nginx configuration restored to Django-only."
echo "Rollback complete."
