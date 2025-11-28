# Deployment Guide

## Vercel Deployment via GitHub Actions

This project is configured to automatically deploy to Vercel when changes are pushed to the `main` branch.

### Setup Instructions

1. **Get Vercel Credentials:**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Navigate to your project settings
   - Go to the "Settings" → "General" tab
   - Copy the following:
     - **Project ID** (found in the project settings)
     - **Org ID** (found in your team/account settings)
   - Go to [Vercel Tokens](https://vercel.com/account/tokens)
   - Create a new token and copy it

2. **Add GitHub Secrets:**
   - Go to your GitHub repository
   - Navigate to **Settings** → **Secrets and variables** → **Actions**
   - Add the following secrets:
     - `VERCEL_TOKEN` - Your Vercel API token
     - `VERCEL_ORG_ID` - Your Vercel organization ID
     - `VERCEL_PROJECT_ID` - Your Vercel project ID

3. **Environment Configuration:**
   - The production build automatically uses `environment.prod.ts`
   - Development uses `environment.ts` (for local development)
   - The build command runs: `npm run build` which uses `--configuration production`

### How It Works

1. When you push to `main` branch, the GitHub Actions workflow runs
2. Tests are executed first (`test-web` job)
3. If tests pass, the `deploy-vercel` job:
   - Builds the Angular app with production configuration
   - Deploys to Vercel using the Vercel CLI
   - The production environment file is automatically used via `fileReplacements` in `angular.json`

### Manual Deployment

If you need to deploy manually:

```bash
cd ttrpg-message-client
npm run build
vercel --prod
```

### Environment Files

- **Development**: `src/environments/environment.ts` → `http://localhost:5044/api`
- **Production**: `src/environments/environment.prod.ts` → `https://dmchat-099d.onrender.com/api`

The production environment is automatically used when building with `--configuration production`.

