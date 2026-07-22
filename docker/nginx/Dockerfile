FROM nginxinc/nginx-unprivileged:stable-alpine

# Switch to root temporarily to perform configuration setups
USER root

# Remove default configuration
RUN rm -f /etc/nginx/conf.d/default.conf

# Copy global configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy template configuration (will be processed by envsubst at startup)
COPY conf.d/app.conf.template /etc/nginx/templates/app.conf.template

# Ensure non-root nginx user owns configuration files and templates
RUN chown -R 101:101 /etc/nginx /var/cache/nginx /var/log/nginx

# Switch back to the unprivileged nginx user (uid 101)
USER 101

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
