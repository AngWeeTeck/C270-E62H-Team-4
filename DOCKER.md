# Docker Setup Guide

This project includes Docker configuration for containerized deployment of the Forum application with MongoDB.

## Prerequisites

- [Docker](https://www.docker.com/products/docker-desktop) (version 20.10+)
- [Docker Compose](https://docs.docker.com/compose/) (version 1.29+)

## Quick Start

### Option 1: Using Docker Compose (Recommended)

This will start both the backend API server and MongoDB database:

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Stop and remove volumes (clean reset)
docker-compose down -v
```

Services will be available at:
- **Backend API**: http://localhost:5000
- **MongoDB**: mongodb://localhost:27017/forum_db
- **Health Check**: http://localhost:5000/api/health

### Option 2: Build and Run Manually

```bash
# Build the Docker image
docker build -t forum-backend:latest .

# Run the container with MongoDB
docker run -d \
  --name forum-backend \
  -p 5000:5000 \
  -e MONGODB_URI=mongodb://host.docker.internal:27017/forum_db \
  -e NODE_ENV=production \
  forum-backend:latest

# View logs
docker logs -f forum-backend

# Stop the container
docker stop forum-backend
docker rm forum-backend
```

## Environment Variables

Create a `.env` file in the `backend/` directory (copy from `.env.example`):

```bash
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://mongodb:27017/forum_db
CORS_ORIGIN=http://localhost:3000
LOG_LEVEL=debug
```

## Docker Compose Services

### MongoDB
- **Image**: mongo:7.0-alpine
- **Port**: 27017
- **Volume**: `mongodb_data` (persistent storage)
- **Health Check**: Automatic startup detection

### Backend API
- **Build**: Dockerfile (multi-stage build)
- **Port**: 5000
- **Environment**: Production configuration
- **Health Check**: API endpoint monitoring

## Common Docker Commands

### View Running Containers
```bash
docker-compose ps
```

### Access MongoDB Shell
```bash
docker-compose exec mongodb mongosh
```

### View Backend Logs
```bash
docker-compose logs -f backend
```

### Rebuild Image (after code changes)
```bash
docker-compose up --build -d
```

### Access Backend Container
```bash
docker-compose exec backend sh
```

### Test Backend Health
```bash
curl http://localhost:5000/api/health
```

### Run Tests in Container
```bash
docker-compose exec backend npm test
```

## Troubleshooting

### Port Already in Use
```bash
# Find what's using the port
lsof -i :5000

# Change port in docker-compose.yml
ports:
  - "5001:5000"  # Use 5001 instead
```

### MongoDB Connection Issues
```bash
# Verify MongoDB is running
docker-compose ps

# Check MongoDB logs
docker-compose logs mongodb

# Restart MongoDB
docker-compose restart mongodb
```

### Container Won't Start
```bash
# View detailed logs
docker-compose logs backend

# Rebuild without cache
docker-compose build --no-cache backend
docker-compose up -d
```

### Reset Everything
```bash
# Stop all services
docker-compose down

# Remove volumes
docker volume rm forum-mongodb_data

# Remove image
docker rmi forum-backend:latest

# Start fresh
docker-compose up -d
```

## Performance Tips

1. **Use named volumes** for persistent MongoDB data
2. **Multi-stage builds** reduce final image size
3. **Alpine images** are smaller and faster
4. **Health checks** ensure services are ready before dependencies start
5. **Non-root user** runs for better security

## Production Deployment

For production, consider:

1. **Use specific image tags** instead of `latest`:
   ```yaml
   image: mongo:7.0-alpine  # Specific version
   ```

2. **Enable MongoDB authentication**:
   ```yaml
   environment:
     MONGO_INITDB_ROOT_USERNAME: admin
     MONGO_INITDB_ROOT_PASSWORD: secure_password
   ```

3. **Add reverse proxy** (Nginx/Traefik):
   ```yaml
   services:
     nginx:
       image: nginx:alpine
       ports:
         - "80:80"
       depends_on:
         - backend
   ```

4. **Environment-specific configs**:
   ```bash
   docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
   ```

5. **Resource limits**:
   ```yaml
   services:
     backend:
       deploy:
         resources:
           limits:
             cpus: '1'
             memory: 512M
   ```

## Docker Network

Containers communicate via the `forum-network` bridge network:
- Backend → MongoDB: `mongodb:27017`
- External → Backend: `localhost:5000`
- External → MongoDB: `localhost:27017`

## File Structure

```
.
├── Dockerfile              # Production image definition
├── docker-compose.yml      # Multi-service orchestration
├── .dockerignore          # Files to exclude from Docker build
├── backend/
│   ├── .env.example       # Environment variables template
│   ├── package.json       # Node.js dependencies
│   ├── server.js          # Express server
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   └── tests/             # Unit tests
└── frontend/              # Frontend application
```

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [MongoDB Docker Image](https://hub.docker.com/_/mongo)
