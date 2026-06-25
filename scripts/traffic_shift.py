import sys
import os
import subprocess

NGINX_CONF_PATH = 'nginx/nginx.conf'

TEMPLATES = {
    0: """upstream django_web {
    server web:8000;
}

upstream playnest_app {
    server app:3000;
}

server {
    listen 80;
    server_name localhost;

    client_max_body_size 100M;

    location / {
        proxy_pass http://django_web;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Host $host;
        proxy_redirect off;
    }

    location /static/ {
        alias /app/staticfiles/;
    }

    location /media/ {
        alias /app/media/;
    }
}
""",
    5: """upstream django_web {
    server web:8000;
}

upstream playnest_app {
    server app:3000;
}

split_clients "$remote_addr" $variant {
    5.0%    playnest;
    *       django;
}

server {
    listen 80;
    server_name localhost;

    client_max_body_size 100M;

    location / {
        set $target http://django_web;
        if ($variant = "playnest") {
            set $target http://playnest_app;
        }
        proxy_pass $target;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Host $host;
        proxy_redirect off;
    }

    location /static/ {
        alias /app/staticfiles/;
    }

    location /media/ {
        alias /app/media/;
    }
}
""",
    25: """upstream django_web {
    server web:8000;
}

upstream playnest_app {
    server app:3000;
}

split_clients "$remote_addr" $variant {
    25.0%   playnest;
    *       django;
}

server {
    listen 80;
    server_name localhost;

    client_max_body_size 100M;

    location / {
        set $target http://django_web;
        if ($variant = "playnest") {
            set $target http://playnest_app;
        }
        proxy_pass $target;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Host $host;
        proxy_redirect off;
    }

    location /static/ {
        alias /app/staticfiles/;
    }

    location /media/ {
        alias /app/media/;
    }
}
""",
    50: """upstream django_web {
    server web:8000;
}

upstream playnest_app {
    server app:3000;
}

split_clients "$remote_addr" $variant {
    50.0%   playnest;
    *       django;
}

server {
    listen 80;
    server_name localhost;

    client_max_body_size 100M;

    location / {
        set $target http://django_web;
        if ($variant = "playnest") {
            set $target http://playnest_app;
        }
        proxy_pass $target;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Host $host;
        proxy_redirect off;
    }

    location /static/ {
        alias /app/staticfiles/;
    }

    location /media/ {
        alias /app/media/;
    }
}
""",
    100: """upstream playnest_app {
    server app:3000;
}

server {
    listen 80;
    server_name localhost;

    client_max_body_size 100M;

    location / {
        proxy_pass http://playnest_app;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Host $host;
        proxy_redirect off;
    }

    location /static/ {
        alias /app/staticfiles/;
    }

    location /media/ {
        alias /app/storage/;
    }
}
"""
}

def reload_nginx():
    print("Reloading Nginx configuration...")

def shift_traffic(percentage):
    if percentage not in TEMPLATES:
        print(f"Invalid percentage: {percentage}. Allowed: 0, 5, 25, 50, 100")
        sys.exit(1)

    with open(NGINX_CONF_PATH, 'w') as f:
        f.write(TEMPLATES[percentage])

    reload_nginx()
    print(f"Traffic shifted to {percentage}% PlayNest.")

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python scripts/traffic_shift.py <percentage>")
        sys.exit(1)

    try:
        perc = int(sys.argv[1])
        shift_traffic(perc)
    except ValueError:
        print("Percentage must be an integer.")
        sys.exit(1)
