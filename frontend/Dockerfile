# Use an official Nginx runtime as a parent image
FROM nginx:alpine

# Copy the built frontend (contents of the 'build' folder) into the image
COPY build/ /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]