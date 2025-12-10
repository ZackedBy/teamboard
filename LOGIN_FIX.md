# Login Issue Fix

## Problem
When accessing the login page at `http://172.16.7.59/login`, the frontend shows:
```
🔍 - Not Found - /api/v1/auth/login
```

But backend logs show:
```
POST /api/v1/auth/login 401
```

## Root Cause
1. Frontend was hardcoded to use `http://localhost:3000/api/v1`
2. When accessed from `http://172.16.7.59`, browser tries to reach `localhost:3000` on the client machine, not the server
3. CORS was not configured to allow requests from `http://172.16.7.59`

## Fix Applied

### 1. Updated Frontend Dockerfile
- Now accepts `VITE_API_BASE_URL` as a build argument
- Defaults to `http://localhost:3000/api/v1` for local development

### 2. Updated docker-compose.staging.yml
- Frontend now builds from source (not pre-built image)
- Passes `VITE_API_BASE_URL=http://172.16.7.59:3000/api/v1` as build arg
- This ensures the frontend knows where to find the backend API

### 3. Updated CORS Configuration
- Added `http://172.16.7.59` and `http://172.16.7.59:80` to allowed origins
- This allows the browser to make requests from the server IP

## Steps to Apply Fix

1. **Rebuild and restart services:**
   ```bash
   docker compose -f docker-compose.staging.yml down
   docker compose -f docker-compose.staging.yml up -d --build
   ```

2. **Verify the frontend is rebuilt:**
   ```bash
   docker compose -f docker-compose.staging.yml logs frontend | head -20
   ```

3. **Test the login:**
   - Open `http://172.16.7.59/login`
   - Try to login
   - Check browser console (F12) for any errors
   - Check backend logs: `docker logs course-project-zada-backend-1 --tail 20`

## Alternative: Use Environment Variable

If you want to change the API URL without rebuilding, you can:

1. **Set VITE_API_BASE_URL in .env file:**
   ```bash
   echo "VITE_API_BASE_URL=http://172.16.7.59:3000/api/v1" >> .env
   ```

2. **Rebuild frontend:**
   ```bash
   docker compose -f docker-compose.staging.yml build frontend
   docker compose -f docker-compose.staging.yml up -d frontend
   ```

## Verification

After applying the fix, you should see:
- ✅ Login page loads at `http://172.16.7.59/login`
- ✅ Login requests go to `http://172.16.7.59:3000/api/v1/auth/login`
- ✅ Backend receives requests (check logs)
- ✅ No CORS errors in browser console

## Troubleshooting

### Still seeing 404?
1. Check browser console (F12) - look for CORS errors
2. Check network tab - see what URL is being requested
3. Verify frontend was rebuilt: `docker images | grep frontend`
4. Check backend is running: `docker ps | grep backend`

### CORS errors?
1. Verify CORS config in `backend/src/app.js` includes `http://172.16.7.59`
2. Check backend logs for CORS errors
3. Try adding your exact origin to `ALLOWED_ORIGINS` in `.env`:
   ```bash
   ALLOWED_ORIGINS=http://172.16.7.59,http://172.16.7.59:80
   ```

### 401 errors?
- This is expected if credentials are wrong
- Check that user exists in database
- Verify password is correct

