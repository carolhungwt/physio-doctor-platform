# Deployment Guide - Google Cloud Run

## Problem & Solution

### Original Issue
Google Cloud Build was failing with:
```
error TS2305: Module '"@prisma/client"' has no exported member 'User'.
```

**Root Cause**: pnpm was blocking Prisma's postinstall script, preventing Prisma Client generation.

### Fixes Applied

1. **Added `.npmrc` files** to enable build scripts
2. **Updated `package.json`** to explicitly run `prisma generate`
3. **Created `Dockerfile`** for explicit control over build steps
4. **Created `cloudbuild.yaml`** for Google Cloud Build
5. **Added deployment configuration files**

---

## Files Created/Modified

### New Files
- `.npmrc` - Root pnpm configuration
- `apps/api/.npmrc` - API-specific pnpm configuration
- `cloudbuild.yaml` - Google Cloud Build configuration
- `Dockerfile` - Multi-stage Docker build
- `.dockerignore` - Docker ignore patterns
- `Procfile` - Process file for buildpacks
- `DEPLOYMENT_GUIDE.md` - This file

### Modified Files
- `package.json` - Added postinstall script
- `apps/api/package.json` - Added prisma scripts
- `pnpm-workspace.yaml` - Workspace configuration

---

## Deployment Options

### Option 1: Using Google Cloud Build (Recommended)

The `cloudbuild.yaml` file explicitly handles Prisma generation:

```bash
# Deploy to Google Cloud Run
gcloud builds submit --config cloudbuild.yaml

# Or deploy with specific project
gcloud builds submit --config cloudbuild.yaml --project YOUR_PROJECT_ID
```

**Steps in cloudbuild.yaml:**
1. Install pnpm globally
2. Install dependencies with `pnpm install --frozen-lockfile`
3. Run `pnpm --filter api prisma generate`
4. Build application with `pnpm run build`
5. Build and push Docker image

### Option 2: Using Dockerfile Directly

Build and deploy using the Dockerfile:

```bash
# Build image locally
docker build -t gcr.io/YOUR_PROJECT_ID/physio-doctor-platform:latest .

# Push to Google Container Registry
docker push gcr.io/YOUR_PROJECT_ID/physio-doctor-platform:latest

# Deploy to Cloud Run
gcloud run deploy physio-doctor-platform \
  --image gcr.io/YOUR_PROJECT_ID/physio-doctor-platform:latest \
  --platform managed \
  --region asia-east1 \
  --allow-unauthenticated
```

### Option 3: Using Buildpacks (If Fixed)

With the `.npmrc` and `package.json` fixes, buildpacks should now work:

```bash
# Deploy with automatic buildpack detection
gcloud run deploy physio-doctor-platform \
  --source . \
  --platform managed \
  --region asia-east1
```

---

## Environment Variables Required

### For API (apps/api)

```bash
# Database
DATABASE_URL="postgresql://user:password@host:5432/dbname"

# JWT
JWT_SECRET="your-secret-key-here"
JWT_EXPIRATION="7d"

# App Config
PORT=3001
NODE_ENV=production
```

### For Web (apps/web)

```bash
# API Connection
NEXT_PUBLIC_API_URL="https://your-api-url.run.app"

# App Config
PORT=3000
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
```

---

## Setting Environment Variables in Cloud Run

### Via gcloud CLI

```bash
# For API service
gcloud run services update physio-doctor-platform \
  --set-env-vars="DATABASE_URL=postgresql://..." \
  --set-env-vars="JWT_SECRET=your-secret" \
  --set-env-vars="NODE_ENV=production"

# Or use --env-vars-file
gcloud run services update physio-doctor-platform \
  --env-vars-file=.env.production
```

### Via Google Cloud Console

1. Go to Cloud Run → Select your service
2. Click "Edit & Deploy New Revision"
3. Go to "Variables & Secrets" tab
4. Add environment variables
5. Deploy

---

## Database Setup (Cloud SQL)

### 1. Create Cloud SQL Instance

```bash
gcloud sql instances create physio-db \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=asia-east1
```

### 2. Create Database

```bash
gcloud sql databases create physio_platform \
  --instance=physio-db
```

### 3. Create User

```bash
gcloud sql users create physio_user \
  --instance=physio-db \
  --password=YOUR_PASSWORD
```

### 4. Get Connection String

```bash
# Get connection name
gcloud sql instances describe physio-db --format="value(connectionName)"

# Use in Cloud Run with Cloud SQL Proxy
DATABASE_URL="postgresql://physio_user:password@/physio_platform?host=/cloudsql/PROJECT:REGION:physio-db"
```

### 5. Run Migrations

```bash
# From local machine with Cloud SQL Proxy
cloud_sql_proxy -instances=PROJECT:REGION:physio-db=tcp:5432

# In another terminal
cd apps/api
pnpm prisma migrate deploy
```

---

## Complete Deployment Steps

### Step 1: Prepare Environment

```bash
# Set your project
gcloud config set project YOUR_PROJECT_ID

# Enable required APIs
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable sql-component.googleapis.com
```

### Step 2: Setup Database

```bash
# Create Cloud SQL instance (takes ~10 minutes)
gcloud sql instances create physio-db \
  --database-version=POSTGRES_15 \
  --tier=db-g1-small \
  --region=asia-east1

# Create database
gcloud sql databases create physio_platform --instance=physio-db

# Create user
gcloud sql users create physio_user \
  --instance=physio-db \
  --password=STRONG_PASSWORD_HERE
```

### Step 3: Build and Deploy

```bash
# Submit build to Cloud Build
gcloud builds submit --config cloudbuild.yaml

# Deploy API to Cloud Run
gcloud run deploy physio-api \
  --image gcr.io/YOUR_PROJECT_ID/physio-doctor-platform:latest \
  --platform managed \
  --region asia-east1 \
  --add-cloudsql-instances PROJECT:REGION:physio-db \
  --set-env-vars="DATABASE_URL=postgresql://..." \
  --set-env-vars="JWT_SECRET=..." \
  --allow-unauthenticated

# Get API URL
API_URL=$(gcloud run services describe physio-api --format='value(status.url)')

# Deploy Web to Cloud Run
gcloud run deploy physio-web \
  --source apps/web \
  --platform managed \
  --region asia-east1 \
  --set-env-vars="NEXT_PUBLIC_API_URL=$API_URL" \
  --allow-unauthenticated
```

### Step 4: Run Database Migrations

```bash
# Option A: From local with Cloud SQL Proxy
cloud_sql_proxy -instances=PROJECT:REGION:physio-db=tcp:5432 &
cd apps/api
DATABASE_URL="postgresql://physio_user:password@localhost:5432/physio_platform" \
  pnpm prisma migrate deploy

# Option B: From Cloud Run Job
gcloud run jobs create prisma-migrate \
  --image gcr.io/YOUR_PROJECT_ID/physio-doctor-platform:latest \
  --add-cloudsql-instances PROJECT:REGION:physio-db \
  --set-env-vars="DATABASE_URL=..." \
  --command="pnpm" \
  --args="--filter,api,prisma,migrate,deploy"

gcloud run jobs execute prisma-migrate
```

---

## Troubleshooting

### Build Fails: "Module '@prisma/client' has no exported member"

**Solution**: The fixes in this commit should resolve this. If it persists:

1. Check `.npmrc` is committed
2. Verify `postinstall` script in `apps/api/package.json`
3. Try using `cloudbuild.yaml` instead of buildpacks

### Database Connection Fails

**Check:**
1. Cloud SQL instance is running
2. DATABASE_URL is correct
3. Cloud SQL Admin API is enabled
4. Cloud Run service has Cloud SQL instance connected

### Prisma Migrations Fail

**Common issues:**
1. Database doesn't exist → Create it first
2. User doesn't have permissions → Grant permissions
3. Connection string incorrect → Check format

### Deployment Timeout

**Solutions:**
1. Increase timeout in `cloudbuild.yaml` (default: 1800s)
2. Use larger machine type (E2_HIGHCPU_8)
3. Check for large dependencies

---

## Monitoring & Logs

### View Logs

```bash
# Cloud Build logs
gcloud builds log BUILD_ID

# Cloud Run logs
gcloud run services logs read physio-api --limit=50

# Follow logs in real-time
gcloud run services logs tail physio-api
```

### View Metrics

```bash
# In Google Cloud Console
# Cloud Run → Select service → Metrics tab

# Check:
# - Request count
# - Request latency
# - Container CPU utilization
# - Container memory utilization
# - Error rate
```

---

## Cost Optimization

### Cloud Run Pricing Tips

1. **Set minimum instances to 0** (default) - No charges when idle
2. **Set maximum instances** to prevent runaway costs
3. **Use CPU allocation: "CPU is only allocated during request processing"**
4. **Right-size memory**: Start with 512MB, adjust based on metrics

### Cloud SQL Pricing Tips

1. Start with `db-f1-micro` or `db-g1-small`
2. Enable automatic backups (7-day retention)
3. Consider read replicas for scaling reads
4. Use connection pooling (PgBouncer)

---

## Production Checklist

- [ ] Environment variables set correctly
- [ ] Database created and migrated
- [ ] JWT secret is strong and secure
- [ ] CORS configured properly
- [ ] API authentication working
- [ ] Cloud SQL backups enabled
- [ ] Monitoring and alerts setup
- [ ] Custom domain configured (optional)
- [ ] SSL/TLS certificate (automatic with Cloud Run)
- [ ] Error tracking setup (Sentry, etc.)
- [ ] Rate limiting implemented
- [ ] Load testing completed

---

## Next Steps After Deployment

1. **Test the deployed application**
   ```bash
   # Get URLs
   gcloud run services list
   
   # Test API health
   curl https://your-api-url.run.app
   
   # Test web app
   open https://your-web-url.run.app
   ```

2. **Setup Custom Domain** (Optional)
   ```bash
   gcloud run domain-mappings create \
     --service physio-api \
     --domain api.yourdomain.com
   ```

3. **Enable Cloud Armor** (DDoS Protection)
4. **Setup Cloud CDN** for static assets
5. **Configure Cloud Monitoring alerts**
6. **Setup CI/CD pipeline** (GitHub Actions)

---

## Support

If you encounter issues:

1. Check the logs first
2. Review environment variables
3. Verify database connection
4. Check Google Cloud Build logs
5. Review this deployment guide

For Prisma-specific issues:
- https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-google-cloud-run

For Cloud Run issues:
- https://cloud.google.com/run/docs/troubleshooting

