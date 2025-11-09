# Netlify Deployment Guide

## Prerequisites
- Netlify account (sign up at https://netlify.com)
- Git repository (GitHub, GitLab, or Bitbucket)

## Deployment Steps

### 1. Push to Git Repository
Make sure your code is pushed to a Git repository (GitHub, GitLab, or Bitbucket).

### 2. Connect to Netlify
1. Go to [Netlify Dashboard](https://app.netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Connect your Git provider and select your repository
4. Netlify will automatically detect the settings from `netlify.toml`

### 3. Configure Environment Variables
In Netlify Dashboard, go to Site settings → Environment variables and add:
- `JWT_SECRET` - Your secret key for JWT tokens (use a strong random string)
- `DEMO_USERNAME` - Username for login (default: admin)
- `DEMO_PASSWORD` - Password for login (default: password)
- `CACHE_TTL_MS` - Cache TTL in milliseconds (default: 5000)

### 4. Deploy
Netlify will automatically deploy when you push to your main branch.

## Important Notes

### Database Limitations
⚠️ **SQLite on Netlify Functions has limitations:**
- The database is stored in `/tmp` which is ephemeral
- Data may be lost between function cold starts
- For production use, consider migrating to a persistent database service like:
  - Supabase (PostgreSQL)
  - PlanetScale (MySQL)
  - MongoDB Atlas
  - Firebase Firestore

### Native Dependencies
The `better-sqlite3` package requires native binaries. Netlify should handle this automatically during build, but if you encounter issues, you may need to:
1. Ensure Node.js version is compatible (Node 18+)
2. Check Netlify build logs for any compilation errors

### Function Timeout
Netlify Functions have a maximum execution time. For the free tier, it's 10 seconds. If you need longer execution times, consider upgrading to a paid plan.

## Testing Your Deployment
After deployment, test your endpoints:
- Health check: `https://your-site.netlify.app/health`
- Login: `POST https://your-site.netlify.app/api/login`
- Leaderboard: `GET https://your-site.netlify.app/api/leaderboard`

## Local Development
For local development, continue using:
```bash
npm run dev
```

The serverless function wrapper only runs in the Netlify environment.

