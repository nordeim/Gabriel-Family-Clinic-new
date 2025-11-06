# 🏥 Gabriel Family Clinic - Docker Deployment Guide

## 📋 **OVERVIEW**

This guide provides complete instructions for deploying the Gabriel Family Clinic Healthcare Platform using Docker containers with Node.js 22 Alpine for maximum compatibility and security.

**Key Features:**
- ✅ Node.js 22 Alpine (latest stable with @supabase compatibility)
- ✅ Multi-stage Docker build (optimized for production)
- ✅ HIPAA-compliant security (non-root user, resource limits)
- ✅ Healthcare-specific configuration (CHAS, PDPA, Singapore timezone)
- ✅ Production-ready orchestration with Docker Compose

---

## 🔧 **PREREQUISITES**

### **System Requirements**
- Docker Engine 24.0+ 
- Docker Compose 2.0+
- 2GB+ RAM available
- 5GB+ disk space
- Linux/macOS/Windows with Docker Desktop

### **Required Software**
```bash
# Check Docker version
docker --version      # Should be 24.0+

# Check Docker Compose version  
docker-compose --version  # Should be 2.0+

# Alternative (new Docker Compose)
docker compose version  # Should be 2.0+
```

---

## 🚀 **QUICK START (5 Minutes)**

### **Step 1: Prepare Environment**
```bash
# Navigate to project directory
cd /workspace/gabriel-family-clinic

# Create required directories
sudo mkdir -p /var/lib/gabriel-clinic/{uploads,next-cache}

# Set proper permissions
sudo chown -R 1001:1001 /var/lib/gabriel-clinic/
sudo chmod -R 755 /var/lib/gabriel-clinic/
```

### **Step 2: Configure Environment**
```bash
# Copy template environment file
cp .env.docker .env

# Edit with your actual credentials
nano .env
```

**Required Configuration Updates:**
```bash
# Replace placeholders with actual values:
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_actual_service_role_key

# Optional: Add your domain
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### **Step 3: Build and Deploy**
```bash
# Build the Docker image
docker compose build

# Start the healthcare platform
docker compose up -d

# Check service status
docker compose ps
```

### **Step 4: Verify Deployment**
```bash
# Check logs
docker compose logs -f gabriel-clinic-frontend

# Test health endpoint
curl http://localhost:3000/api/health

# Access the platform
open http://localhost:3000
```

---

## 📦 **DETAILED DEPLOYMENT STEPS**

### **Step 1: Environment Setup**

#### **Create Production Directories**
```bash
# Create persistent data directories
sudo mkdir -p /var/lib/gabriel-clinic/{uploads,next-cache}

# Create logs directory
sudo mkdir -p /var/log/gabriel-clinic

# Set ownership for healthcare platform user (1001:1001)
sudo chown -R 1001:1001 /var/lib/gabriel-clinic/
sudo chown -R 1001:1001 /var/log/gabriel-clinic/

# Set appropriate permissions
sudo chmod -R 755 /var/lib/gabriel-clinic/
sudo chmod -R 755 /var/log/gabriel-clinic/
```

#### **Security Configuration**
```bash
# Create healthcare platform user group (if needed)
sudo groupadd -g 1001 healthcare-platform

# Set system-wide resource limits
echo "gabriel-clinic-frontend soft nofile 65536" | sudo tee -a /etc/security/limits.conf
echo "gabriel-clinic-frontend hard nofile 65536" | sudo tee -a /etc/security/limits.conf
```

### **Step 2: Environment Configuration**

#### **Required Environment Variables**
Update `.env` with your actual values:

```bash
# CRITICAL: Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_actual_service_role_key

# PRODUCTION: Application URL (Replace with your domain)
NEXT_PUBLIC_APP_URL=https://your-domain.com

# SECURITY: Generate secure secrets
SESSION_SECRET=$(openssl rand -base64 32)
JWT_SECRET=$(openssl rand -base64 32)

# OPTIONAL: External API Keys
GOOGLE_MAPS_API_KEY=your_google_maps_key
```

#### **Healthcare-Specific Configuration**
```bash
# Singapore Healthcare Compliance
NEXT_PUBLIC_CHAS_ENABLED=true
NEXT_PUBLIC_SINGAPORE_TIMEZONE=Asia/Singapore
NEXT_PUBLIC_HEALTHCARE_COMPLIANCE=HIPAA

# PDPA Compliance (Singapore Personal Data Protection Act)
ENABLE_PDPA_COMPLIANCE=true
DATA_RETENTION_DAYS=2555  # 7 years for medical records
```

### **Step 3: Docker Image Build**

#### **Production Build**
```bash
# Build with healthcare platform optimizations
docker compose build --no-cache

# Build with specific target (optional)
docker compose build --target production
```

#### **Build Verification**
```bash
# Verify image was created
docker images | grep gabriel-clinic

# Check image size and layers
docker history gabriel-clinic-frontend
```

### **Step 4: Container Orchestration**

#### **Start Healthcare Platform**
```bash
# Start in detached mode
docker compose up -d

# Start with specific service
docker compose up -d gabriel-clinic-frontend

# Start with logs
docker compose up
```

#### **Service Management**
```bash
# Check status
docker compose ps

# View logs
docker compose logs -f gabriel-clinic-frontend

# Restart service
docker compose restart gabriel-clinic-frontend

# Stop services
docker compose down
```

---

## 🔒 **HEALTHCARE COMPLIANCE & SECURITY**

### **HIPAA Compliance Features**

#### **Container Security**
```yaml
# From docker-compose.yml
user: "1001:1001"           # Non-root user
security_opt:
  - no-new-privileges:true  # Prevent privilege escalation
```

#### **Resource Limits (DoS Protection)**
```yaml
deploy:
  resources:
    limits:
      cpus: '2.0'           # Max 2 CPU cores
      memory: 2G            # Max 2GB RAM
    reservations:
      cpus: '1.0'           # Reserved 1 CPU
      memory: 1G            # Reserved 1GB RAM
```

#### **Network Isolation**
```yaml
networks:
  gabriel-clinic-network:
    driver: bridge
    subnet: 172.20.0.0/16   # Isolated network
```

### **Data Persistence**
```bash
# Persistent volumes for critical data
- uploads_data:/app/public/uploads     # Patient documents
- next_cache:/app/.next/cache          # Application cache
```

---

## 🛠️ **MAINTENANCE & MONITORING**

### **Health Checks**
```bash
# Check container health
docker compose ps

# Manual health check
docker exec gabriel-clinic-frontend curl -f http://localhost:3000/api/health

# View health check logs
docker compose logs gabriel-clinic-frontend | grep health
```

### **Backup Procedures**
```bash
# Backup persistent data
sudo tar -czf gabriel-clinic-backup-$(date +%Y%m%d).tar.gz /var/lib/gabriel-clinic/

# Backup logs
sudo tar -czf gabriel-clinic-logs-$(date +%Y%m%d).tar.gz /var/log/gabriel-clinic/
```

### **Update Procedure**
```bash
# Pull latest changes
git pull origin main

# Rebuild with latest code
docker compose build --no-cache

# Rolling update
docker compose up -d --force-recreate

# Verify update
docker compose ps
```

---

## 🚨 **TROUBLESHOOTING**

### **Common Issues**

#### **Build Failures**
```bash
# Clear Docker cache
docker system prune -a

# Rebuild from scratch
docker compose build --no-cache --pull

# Check for missing environment variables
docker compose config
```

#### **Runtime Errors**
```bash
# View detailed logs
docker compose logs gabriel-clinic-frontend

# Check container resources
docker stats gabriel-clinic-frontend

# Access container shell (debugging)
docker exec -it gabriel-clinic-frontend /bin/sh
```

#### **Performance Issues**
```bash
# Monitor resource usage
docker stats

# Check disk usage
docker system df

# Analyze logs for errors
docker compose logs gabriel-clinic-frontend | grep ERROR
```

### **Environment-Specific Issues**

#### **Port Conflicts**
```bash
# Check port 3000 usage
netstat -tulpn | grep 3000

# Change port in docker-compose.yml
ports:
  - "3001:3000"  # Use 3001 externally
```

#### **Permission Issues**
```bash
# Fix directory permissions
sudo chown -R 1001:1001 /var/lib/gabriel-clinic/

# Check container user
docker exec gabriel-clinic-frontend id
```

---

## 📊 **MONITORING & LOGGING**

### **Log Management**
```bash
# View recent logs
docker compose logs --tail=50 gabriel-clinic-frontend

# Follow logs in real-time
docker compose logs -f gabriel-clinic-frontend

# Export logs for analysis
docker compose logs gabriel-clinic-frontend > gabriel-clinic-logs.txt
```

### **Performance Monitoring**
```bash
# Resource usage
docker stats gabriel-clinic-frontend

# Container information
docker inspect gabriel-clinic-frontend

# Health check status
docker inspect --format='{{.State.Health.Status}}' gabriel-clinic-frontend
```

---

## 🚀 **PRODUCTION DEPLOYMENT**

### **With Reverse Proxy (Nginx)**
```nginx
# /etc/nginx/sites-available/gabriel-clinic
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### **With SSL Certificate (Let's Encrypt)**
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

---

## ✅ **DEPLOYMENT CHECKLIST**

### **Pre-Deployment**
- [ ] Docker 24.0+ and Docker Compose 2.0+ installed
- [ ] Supabase project configured and credentials ready
- [ ] Domain name configured (if using HTTPS)
- [ ] Required directories created with proper permissions
- [ ] Environment variables configured in `.env`

### **Deployment**
- [ ] Docker image builds successfully
- [ ] Container starts without errors
- [ ] Health check endpoint responds
- [ ] Application loads at http://localhost:3000
- [ ] Patient portal accessible
- [ ] All features functional

### **Post-Deployment**
- [ ] SSL certificate configured (production)
- [ ] Monitoring and logging setup
- [ ] Backup procedures implemented
- [ ] Security scans completed
- [ ] Performance tests passed
- [ ] Healthcare compliance verified

---

## 📞 **SUPPORT**

### **Documentation**
- **Healthcare Platform**: `/workspace/gabriel-family-clinic/README.md`
- **Deployment Guide**: This document
- **Environment Configuration**: `.env.docker`

### **Troubleshooting Resources**
- **Container Logs**: `docker compose logs gabriel-clinic-frontend`
- **Health Check**: `curl http://localhost:3000/api/health`
- **System Resources**: `docker stats gabriel-clinic-frontend`

---

**🏥 Gabriel Family Clinic Healthcare Platform**  
*Production-Ready Docker Deployment*  
*Generated: 2025-11-06 11:24:01*
