# nginx Config Reference

nginx is the single public API gateway. Config is bind-mounted read-only — no custom Docker image needed.

## File location

`nginx/nginx.conf` ? mounted at `/etc/nginx/conf.d/default.conf` inside `eam_nginx`

## Current EAM routing config

```nginx
upstream backend {
    server backend:3000;
    keepalive 32;
}

server {
    listen 80;
    server_name localhost;
    server_tokens off;
    client_max_body_size 10m;
    proxy_read_timeout 60s;

    # HTTP/1.1 keepalive to upstream
    proxy_http_version 1.1;
    proxy_set_header Connection "";

    # Common headers — forwarded on every request
    proxy_set_header Host              $host;
    proxy_set_header X-Real-IP         $remote_addr;
    proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;

    # API — all REST traffic
    location /api/ {
        proxy_pass http://backend;
    }

    # Swagger UI (non-prefixed in NestJS)
    location /api/docs {
        proxy_pass http://backend;
    }

    # Health endpoint (used by load balancers)
    location = /health {
        proxy_pass http://backend/health;
    }

    # Root — informational
    location / {
        return 200 '{"service":"EAM API Gateway","api":"http://localhost/api/v1/","docs":"http://localhost/api/docs","health":"http://localhost/health","wiki":"http://localhost:3001","dbAdmin":"http://localhost:5050"}';
        add_header Content-Type application/json;
    }
}
```

## WebSocket pattern (for frontend HMR when routing through nginx)

```nginx
location /ws/ {
    proxy_pass http://frontend:5173;
    proxy_http_version 1.1;
    proxy_set_header Upgrade    $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host       $host;
    proxy_read_timeout 3600s;
}
```

## Operations

| Task | Command |
|------|---------|
| Test config | `docker exec eam_nginx nginx -t` |
| Reload (no restart) | `docker exec eam_nginx nginx -s reload` |
| Restart container | `docker compose restart nginx` |
| View access log | `docker logs eam_nginx -f` |

## Rules

- NGINX-RULE-01: Use named `upstream` blocks — never hardcode `proxy_pass http://backend:3000`
- NGINX-RULE-02: Always set `proxy_http_version 1.1` + `Connection ""` for upstream keepalive
- NGINX-RULE-03: Always forward X-Real-IP, X-Forwarded-For, X-Forwarded-Proto
- NGINX-RULE-04: `server_tokens off` — never expose nginx version
- NGINX-RULE-06: Test with `nginx -t` before reloading
- NGINX-RULE-07: Config changes do NOT require image rebuild — edit nginx/nginx.conf then reload
