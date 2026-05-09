# Docker Setup Guide - Project Management System

## Quick Start

### Prerequisites

- Docker Desktop installed and running
- Docker Compose 2.0+ installed
- At least 4GB RAM allocated to Docker

### Step 1: Create Environment File

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Edit `.env` and replace placeholder values:

- `GOOGLE_CLIENT_ID`, `GOOGLE_SECRET` - Get from Google Cloud Console
- `FACEBOOK_APP_ID`, `FACEBOOK_APP_SECRET` - Get from Facebook Developer Console
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` - Get from Cloudinary
- `AI_API_KEY` - Get from Google AI Studio (for Gemini)
- `MAIL_USER`, `MAIL_PASSWORD` - Email configuration for notifications

### Step 2: Build and Start Containers

**Build all services (first time only):**

```bash
docker-compose build
```

**Start all services:**

```bash
docker-compose up -d
```

**Watch startup logs:**

```bash
docker-compose logs -f
```

### Step 3: Verify All Services Are Running

```bash
docker-compose ps
```

You should see all 11 services with status `Up` and `healthy`.

### Step 4: Verify Services Are Accessible

**API Gateway:**

```bash
curl http://localhost:4000/api
```

**Storage Service:**

```bash
curl http://localhost:4001/health
```

**Frontend:**

```bash
curl http://localhost:3000
```

**RabbitMQ Management Console:**

```
http://localhost:15672
Username: guest
Password: guest
```

**Databases Access:**

MySQL (Auth, Audit, Notification, Project, Storage):

```bash
mysql -h localhost -P 3306 -u root -proot
# Show databases: SHOW DATABASES;
# Use specific DB: USE authdb;
```

PostgreSQL (Vector DB for RAG):

```bash
psql -h localhost -P 5432 -U admin -d root
# List databases: \l
# List tables: \dt
```

Redis (Cache):

```bash
redis-cli -h localhost -p 6379
# Check connection: PING
# Show keys: KEYS *
```

---

## Useful Docker Commands

### View Logs

**All services:**

```bash
docker-compose logs -f
```

**Specific service:**

```bash
docker-compose logs -f api-gateway
docker-compose logs -f auth-service
docker-compose logs -f project-service
```

**Last 100 lines:**

```bash
docker-compose logs --tail=100 api-gateway
```

### Manage Services

**Stop all services (but keep containers):**

```bash
docker-compose stop
```

**Stop and remove all containers:**

```bash
docker-compose down
```

**Stop specific service:**

```bash
docker-compose stop auth-service
```

**Restart service:**

```bash
docker-compose restart auth-service
```

**Rebuild specific service:**

```bash
docker-compose build auth-service
```

### Database Operations

**Connect to MySQL container:**

```bash
docker-compose exec mysql mysql -u root -proot
```

**Connect to PostgreSQL container:**

```bash
docker-compose exec postgres psql -U admin -d root
```

**Execute SQL query on MySQL:**

```bash
docker-compose exec mysql mysql -u root -proot -e "SELECT * FROM authdb.user;"
```

**Backup MySQL databases:**

```bash
docker-compose exec mysql mysqldump -u root -proot --all-databases > backup.sql
```

**Restore MySQL from backup:**

```bash
cat backup.sql | docker-compose exec -T mysql mysql -u root -proot
```

### Docker System Commands

**Remove unused volumes:**

```bash
docker volume prune
```

**Remove all stopped containers:**

```bash
docker container prune
```

**View resource usage:**

```bash
docker stats
```

**Clean everything (WARNING: removes data):**

```bash
docker-compose down -v
```

---

## Port Mappings

| Service             | Port  | Container Port | Access URL                           |
| ------------------- | ----- | -------------- | ------------------------------------ |
| API Gateway         | 4000  | 4000           | http://localhost:4000/api            |
| Storage Service     | 4001  | 4001           | http://localhost:4001                |
| Frontend            | 3000  | 3000           | http://localhost:3000                |
| MySQL               | 3306  | 3306           | mysql://root:root@localhost:3306     |
| PostgreSQL          | 5432  | 5432           | postgres://admin:root@localhost:5432 |
| Redis               | 6379  | 6379           | redis://localhost:6379               |
| RabbitMQ AMQP       | 5672  | 5672           | amqp://guest:guest@localhost:5672    |
| RabbitMQ Management | 15672 | 15672          | http://localhost:15672               |

---

## Database Credentials

### MySQL

- Host: `localhost`
- Port: `3306`
- User: `root`
- Password: `root` (or set in `.env` as `MYSQL_ROOT_PASSWORD`)
- Databases: `authdb`, `auditdb`, `notificationdb`, `projectdb`, `storagedb`

### PostgreSQL

- Host: `localhost`
- Port: `5432`
- User: `admin` (or set in `.env` as `POSTGRES_USER`)
- Password: `root` (or set in `.env` as `POSTGRES_PASSWORD`)
- Database: `root` (or set in `.env` as `POSTGRES_DB`)

### Redis

- Host: `localhost`
- Port: `6379`
- No authentication required

### RabbitMQ

- Host: `localhost`
- AMQP Port: `5672`
- Management Port: `15672`
- User: `guest` (or set in `.env` as `RABBITMQ_USER`)
- Password: `guest` (or set in `.env` as `RABBITMQ_PASSWORD`)

---

## Environment Variables Guide

### Infrastructure Variables

```env
RABBITMQ_USER=guest                          # RabbitMQ default user
RABBITMQ_PASSWORD=guest                      # RabbitMQ default password
RABBITMQ_PORT=5672                          # RabbitMQ AMQP port
RABBITMQ_MGMT_PORT=15672                    # RabbitMQ Management console port

MYSQL_ROOT_PASSWORD=root                     # MySQL root password
MYSQL_PORT=3306                              # MySQL port

POSTGRES_USER=admin                          # PostgreSQL user
POSTGRES_PASSWORD=root                       # PostgreSQL password
POSTGRES_DB=root                             # PostgreSQL database name
POSTGRES_PORT=5432                           # PostgreSQL port

REDIS_PORT=6379                              # Redis port
REDIS_TTL=120                                # Redis TTL for cache (seconds)
REDIS_MAX=100                                # Redis max connections
```

### API Gateway

```env
API_GATEWAY_PORT=4000                        # API Gateway port
GLOBAL_PREFIX=api                            # API route prefix
JWT_SECRET=<random_string>                   # JWT secret key
JWT_EXPIRES_IN=3600s                         # JWT expiration time
CORS_ORIGIN=http://localhost:3000            # CORS allowed origins
FRONTEND_ORIGIN=http://localhost:3000        # Frontend URL

GOOGLE_CLIENT_ID=                            # Google OAuth2 Client ID
GOOGLE_SECRET=                               # Google OAuth2 Secret
FACEBOOK_APP_ID=                             # Facebook App ID
FACEBOOK_APP_SECRET=                         # Facebook App Secret
```

### Auth Service

```env
AUTH_SERVICE_NAME=AUTH_SERVICE               # Service name for RabbitMQ
AUTH_QUEUE_NAME=AUTH_QUEUE                   # RabbitMQ queue name
JWT_REFRESH_SECRET=<random_string>           # JWT refresh secret
RESET_PASSWORD_SECRET=<random_string>        # Password reset secret
JWT_ACCESS_EXPIRES_IN=15m                    # Access token expiration
JWT_REFRESH_EXPIRES_IN=7d                    # Refresh token expiration
MAIL_USER=                                   # Email for sending notifications
MAIL_PASSWORD=                               # Email app password
```

### Project Service

```env
PROJECT_SERVICE_NAME=PROJECT_SERVICE         # Service name for RabbitMQ
PROJECT_QUEUE_NAME=PROJECT_QUEUE             # RabbitMQ queue name
AI_API_KEY=                                  # Google Gemini API key
CHAT_MODEL=gemini-2.5-flash                 # Gemini model for chat
EMBEDDING_MODEL=gemini-embedding-2           # Gemini model for embeddings
```

### Storage Service

```env
STORAGE_SERVICE_NAME=STORAGE_SERVICE         # Service name
STORAGE_SERVICE_PORT=4001                    # Storage service port
CLOUDINARY_CLOUD_NAME=                       # Cloudinary cloud name
CLOUDINARY_API_KEY=                          # Cloudinary API key
CLOUDINARY_API_SECRET=                       # Cloudinary API secret
```

### Frontend

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api        # API endpoint
NEXT_PUBLIC_API_GATEWAY_URL=http://localhost:4000    # API Gateway URL
NEXT_PUBLIC_FRONTEND=http://localhost:3000           # Frontend URL
```

---

## Troubleshooting

### Service fails to connect to RabbitMQ

**Error:** `Cannot connect to amqp://...`
**Solution:**

- Check RabbitMQ container is running: `docker-compose ps rabbitmq`
- Check RabbitMQ logs: `docker-compose logs rabbitmq`
- RabbitMQ takes ~10-15 seconds to start, give it time with `depends_on: condition: service_healthy`

### Database connection errors

**Error:** `Cannot connect to MySQL/PostgreSQL`
**Solution:**

- Check database containers are running: `docker-compose ps mysql` and `docker-compose ps postgres`
- Check database logs: `docker-compose logs mysql` and `docker-compose logs postgres`
- Verify `.env` has correct credentials
- Wait for database to be ready (takes ~5-10 seconds)

### API Gateway cannot reach microservices

**Error:** `Service connection timeout`
**Solution:**

- Ensure all microservice containers are running
- Check service logs: `docker-compose logs auth-service`, etc.
- Verify container names in docker-compose.yml are used correctly
- All services must be on the same network (`backend` network)

### Frontend cannot reach API Gateway

**Error:** `Failed to fetch from API`
**Solution:**

- Check `NEXT_PUBLIC_API_URL` in `.env` is set correctly
- For localhost development: `NEXT_PUBLIC_API_URL=http://api-gateway:4000/api` (inside container) or `http://localhost:4000/api` (from host)
- Check API Gateway is running: `docker-compose ps api-gateway`
- Check API Gateway logs: `docker-compose logs api-gateway`

### Port already in use

**Error:** `Address already in use`
**Solution:**

```bash
# Find process using the port
netstat -ano | findstr :4000  # Windows
lsof -i :4000                 # macOS/Linux

# Kill process or change port in .env
```

### Out of disk space

**Error:** `no space left on device`
**Solution:**

```bash
# Clean up unused Docker resources
docker system prune -a
docker volume prune

# Remove old images/containers
docker-compose down -v
```

### Memory/CPU usage too high

**Solution:**

- Reduce memory limits in docker-compose.yml if needed
- Stop unnecessary services
- Monitor with `docker stats`

---

## Performance Tips

1. **Use Docker Desktop's resource limits wisely:**
   - CPU: 4+ cores recommended
   - RAM: 4GB+ recommended

2. **Build optimization:**

   ```bash
   # Build in parallel (default)
   docker-compose build

   # Build specific service only
   docker-compose build auth-service
   ```

3. **Volume mounting:**
   - Docker volumes (default) are faster than host volumes
   - Use host volumes only for development

4. **Network optimization:**
   - Services communicate using container names (automatic DNS)
   - No need to expose all ports if only internal communication

---

## Production Considerations

For production deployment:

1. **Use environment-specific `.env` files:**

   ```bash
   docker-compose --env-file .env.production up -d
   ```

2. **Enable restart policies:**
   - Already set to `restart: always` in docker-compose.yml

3. **Configure proper logging:**

   ```bash
   docker-compose logs --follow --tail=100
   ```

4. **Use secrets management:**
   - Don't commit `.env` file to git
   - Use Docker Secrets or environment variable management
   - Rotate sensitive values regularly

5. **Set up monitoring:**
   - Use `docker stats` to monitor resource usage
   - Consider integrating with monitoring tools (Prometheus, Datadog)

6. **Backup databases:**
   ```bash
   # Daily MySQL backup
   docker-compose exec mysql mysqldump -u root -proot --all-databases > backups/$(date +%Y%m%d).sql
   ```

---

## Next Steps

1. Copy `.env.example` to `.env` and configure
2. Run `docker-compose build`
3. Run `docker-compose up -d`
4. Verify all services: `docker-compose ps`
5. Test endpoints as shown in "Verify Services Are Accessible"
6. Check logs: `docker-compose logs -f`

---

## Support & Documentation

- Docker Documentation: https://docs.docker.com/
- Docker Compose Documentation: https://docs.docker.com/compose/
- Service-specific docs: Check README.md in each service directory

For issues, check logs first:

```bash
docker-compose logs [service-name]
```

---

**Happy containerizing! 🐳**
