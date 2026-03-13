# Deploying Trekora Backend on Railway

This repository is configured as a monorepo. To host the backend on Railway, follow these steps:

## 1. Create a New Service
1. Go to your [Railway Dashboard](https://railway.app/).
2. Click **+ New Service** -> **GitHub Repo**.
3. Select this repository.

## 2. Configure Service Settings
Once the service is created, you **must** set the root directory so Railway knows where the backend code lives:
1. Go to the **Settings** tab of your new service.
2. Find the **General** section.
3. Look for **Root Directory** and set it to: `apps/backend`
4. Railway will automatically redeploy.

## 3. Environment Variables
Add the following variables in the **Variables** tab:
- `NODE_ENV`: `production`
- `PORT`: `3000` (Railway provides this automatically, but good to have)
- `FRONTEND_URL`: (Your frontend URL, e.g., `https://trekora.up.railway.app`)
- `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME`: (Use Railway's Postgres service variables if you add a Database)
- `JWT_ACCESS_SECRET`: (Generate a strong secret)
- `JWT_REFRESH_SECRET`: (Generate a strong secret)
- `GMAIL_USER`: (Your email)
- `GMAIL_PASS`: (Your app password)
- `GOOGLE_CLIENT_ID`: (From Google Cloud Console)
- `GOOGLE_CLIENT_SECRET`: (From Google Cloud Console)
- `GOOGLE_CALLBACK_URL`: (e.g., `https://your-backend-url.up.railway.app/api/auth/google/callback`)

## Configuration Files
- `apps/backend/railway.json`: Configures the build and start commands.
- `apps/backend/Procfile`: Provides a fallback start command for Railway.
- `apps/backend/package.json`: Specified `node >= 20` to ensure a modern environment.

## Migrations
The deployment is configured to automatically run migrations before starting the server:
`npm run migration:run && npm run start:prod`
