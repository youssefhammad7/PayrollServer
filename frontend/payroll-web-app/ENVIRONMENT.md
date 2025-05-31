# Environment Configuration Guide

This guide explains how to configure environment variables for the Payroll Web Application.

## Quick Start

1. **Copy the example file:**
   ```bash
   cp env.example .env.local
   ```

2. **Edit the configuration:**
   ```bash
   # Open .env.local in your editor and update the values
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

## Environment Variables

### Required Variables

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `VITE_API_BASE_URL` | Backend API base URL | `https://localhost:7154/api` | `https://api.payroll.com/api` |

### Optional Variables

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `VITE_USE_REAL_API` | Use real API vs mock | `true` | `false` |
| `VITE_DEV_MODE` | Enable development features | `false` | `true` |

## Configuration Examples

### Development with Local Backend
```env
VITE_API_BASE_URL=https://localhost:7154/api
VITE_USE_REAL_API=true
VITE_DEV_MODE=true
```

### Development with Mock API
```env
VITE_API_BASE_URL=https://localhost:7154/api
VITE_USE_REAL_API=false
VITE_DEV_MODE=true
```

### Production
```env
VITE_API_BASE_URL=https://api.yourcompany.com/api
VITE_USE_REAL_API=true
VITE_DEV_MODE=false
```

## Environment Files

The application supports multiple environment files in order of precedence:

1. `.env.local` - Local overrides (not committed to git)
2. `.env.development` - Development environment
3. `.env.production` - Production environment
4. `.env` - Default values (not recommended for sensitive data)

## Validation

The application automatically validates environment configuration on startup:

- ✅ **Valid URL format** for `VITE_API_BASE_URL`
- ⚠️ **Warnings** for default values or development settings
- ❌ **Errors** for invalid configurations

Check the browser console for validation messages.

## Troubleshooting

### Common Issues

1. **API calls failing:**
   - Check `VITE_API_BASE_URL` is correct
   - Ensure backend server is running
   - Verify CORS configuration

2. **Environment variables not loading:**
   - Ensure file is named `.env.local` (not `.env.local.txt`)
   - Restart the development server after changes
   - Check for syntax errors in the .env file

3. **TypeScript errors:**
   - Environment variables are typed in `src/vite-env.d.ts`
   - All custom variables must be prefixed with `VITE_`

### Debug Information

The application logs environment configuration in development mode. Check the browser console for:

```
🔧 Environment Configuration Status
Configuration: { API_BASE_URL: "...", USE_REAL_API: true, ... }
```

## Security Notes

- Never commit `.env.local` or `.env.production` to version control
- Use `.env.example` as a template for required variables
- Sensitive data should be handled through secure deployment processes
- All environment variables are exposed to the client-side code

## API Integration

All API calls are centralized through:

- **Configuration**: `src/config/environment.ts` - Environment variable handling
- **Constants**: `../payroll-shared/src/constants/index.ts` - Shared API configuration  
- **Client**: `src/services/api/apiClient.ts` - Axios instance with interceptors

This ensures consistent API base URL usage across the entire application. 