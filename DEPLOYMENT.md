# Nexora Deployment

## Current state

- GitHub remote: `https://github.com/MystoganzTv/nexora.git`
- Netlify site: `mystodev-nexora`
- Production URL: `https://mystodev-nexora.netlify.app`
- Branches:
  - `main` -> production deploy target
  - `mystodev` -> preview deploy target

## Automatic deploy flow

The repository includes a GitHub Actions workflow at `.github/workflows/netlify-deploy.yml`.

- Push to `main`:
  - builds the app
  - runs `prisma generate`
  - deploys to Netlify production

- Push to `mystodev`:
  - builds the app
  - runs `prisma generate`
  - deploys to a stable preview alias on Netlify

## Required GitHub repository secret

Add this secret in GitHub repository settings:

- `NETLIFY_AUTH_TOKEN`

Generate it from Netlify:

1. Open `User settings`
2. Open `Applications`
3. Create a personal access token
4. Save it in GitHub as `NETLIFY_AUTH_TOKEN`

## Required Netlify environment variables

Already set:

- `AUTH_SECRET`
- `NEXORA_ENABLE_DEMO_DATA`
- `NEXORA_TIMEZONE`

Still required:

- `DATABASE_URL`

Recommended scopes/contexts:

- contexts: `production`, `branch-deploy`, `deploy-preview`
- scopes: default all scopes is acceptable for this app

## Cloud Postgres

This app cannot use local PostgreSQL in Netlify. It needs a cloud PostgreSQL URL.

Recommended providers:

1. Neon
2. Supabase Postgres
3. Railway Postgres

Once the provider gives you a connection string:

1. Add `DATABASE_URL` in Netlify
2. Point it to the production database
3. Run Prisma migration against that cloud database
4. Run seed if you want demo operational data in production

## Prisma commands for cloud database

After setting `DATABASE_URL` to the cloud database:

```bash
npx prisma migrate deploy
npx prisma db seed
```

## Final checklist

- [x] GitHub repo connected
- [x] `main` branch pushed
- [x] `mystodev` branch pushed
- [x] Netlify site created
- [x] Netlify manual production deploy completed
- [x] Auth secret configured in Netlify
- [x] Demo mode disabled in Netlify
- [x] Timezone configured in Netlify
- [x] GitHub Actions workflow added
- [ ] `NETLIFY_AUTH_TOKEN` added in GitHub secrets
- [ ] `DATABASE_URL` added in Netlify
- [ ] Cloud Postgres provisioned
- [ ] Prisma migration deployed to cloud database
- [ ] Seed applied to cloud database
