# Environment Variables Setup

This project uses environment variables for configuration. Follow these steps to set up your environment.

## Quick Start

1. **Create or update the `.env` file** in the project root with your actual values:
   - For local development, update `NEXT_PUBLIC_API_URL` with your backend API URL
   - Example: `NEXT_PUBLIC_API_URL=http://localhost:8000/api`

2. **Restart your development server** after changing environment variables:
   ```bash
   npm run dev
   ```

## Environment Variables

### Required Variables

#### `NEXT_PUBLIC_API_URL`
- **Description**: Public API URL accessible on client-side
- **Type**: String (URL)
- **Default**: `http://localhost:8000/api`
- **Example**: `https://api.yourdomain.com`
- **Usage**: This is the base URL for all API calls made from the browser

### Optional Variables

#### `API_URL`
- **Description**: Server-side API URL (optional, falls back to `NEXT_PUBLIC_API_URL`)
- **Type**: String (URL)
- **Default**: Uses `NEXT_PUBLIC_API_URL` if not set
- **Usage**: Use this only if your server-side API URL is different from the client-side URL

#### `NEXT_PUBLIC_APP_ENV`
- **Description**: Application environment
- **Type**: String
- **Default**: `development`
- **Values**: `development`, `staging`, `production`
- **Usage**: Can be used for conditional logic based on environment

#### `NEXT_PUBLIC_APP_NAME`
- **Description**: Application name
- **Type**: String
- **Default**: `Trust Ledger`
- **Usage**: Can be used for branding or metadata

## File Structure

- **`.env`** - Environment variables file (should be git-ignored for security)
  - Contains all environment variables for your local development
  - Do NOT commit this file to git if it contains secrets

## Next.js Environment Variable Rules

1. **Client-side variables** must be prefixed with `NEXT_PUBLIC_`
   - These are exposed to the browser
   - Example: `NEXT_PUBLIC_API_URL`

2. **Server-side only variables** should NOT have `NEXT_PUBLIC_` prefix
   - These are only available in server-side code
   - Example: `API_URL` (if different from public URL)

3. **Security Note**: Never put secrets in `NEXT_PUBLIC_` variables as they will be exposed to the client

## Usage in Code

### Accessing Environment Variables

```typescript
// Client-side (browser)
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

// Server-side only
const serverApiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;
```

### Current Usage

The following files use environment variables:

- `src/lib/axios.ts` - Uses `NEXT_PUBLIC_API_URL` for API base URL

## Production Deployment

For production deployments:

1. Set environment variables in your hosting platform:
   - **Vercel**: Project Settings → Environment Variables
   - **Netlify**: Site Settings → Build & Deploy → Environment
   - **Other platforms**: Check their documentation

2. Ensure `NEXT_PUBLIC_API_URL` points to your production API

3. Never commit `.env` file with secrets to git

## Troubleshooting

### Variables not updating?
- Restart your development server after changing `.env` file
- Ensure variable names are correct (case-sensitive)
- Check that client-side variables have `NEXT_PUBLIC_` prefix

### API calls failing?
- Verify `NEXT_PUBLIC_API_URL` is correct
- Check network tab in browser DevTools
- Ensure CORS is configured on your backend

