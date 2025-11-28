# Quick Fix: Vercel Root Directory Error

If you're seeing this error:
```
Error: The provided path "~/work/DmChat/DmChat/ttrpg-message-client/ttrpg-message-client" does not exist.
```

## Immediate Fix (Required Once)

**You need to manually update the Root Directory in Vercel dashboard:**

1. Go to: https://vercel.com/vincents-projects-838544f9/dm-chat/settings
2. Scroll down to **"Root Directory"** section
3. Set it to: `ttrpg-message-client`
4. Click **Save**

After this one-time fix, the GitHub Actions workflow will work correctly.

## Why This Happens

Vercel caches the project's root directory setting. When the project was first created, it may have been set incorrectly. The workflow tries to update it automatically via API, but sometimes manual intervention is required.

## After Fixing

Once you've updated the root directory in the dashboard:
- Future deployments via GitHub Actions will work automatically
- The workflow will deploy from the repository root
- Vercel will use the `ttrpg-message-client` root directory setting
- The build output will be correctly found at `dist/ttrpg-message-client/browser`

