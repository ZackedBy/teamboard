# How to Access TeamBoard

## 🌐 Access URLs

### Frontend Application (Main Interface)
**URL**: http://localhost (or http://localhost:80)

This is where you interact with the TeamBoard application:
- Register/Login
- Create teams
- Manage tasks

### Backend API (JSON Endpoints)
**URL**: http://localhost:3000

This is the API server. You'll see:
- Root endpoint: `{"message":"🦄🌈✨👋🌎🌍🌏✨🌈🦄"}`
- API endpoints: `/api/v1/...`

**⚠️ Important**: If you're seeing emojis, you're on the backend API (port 3000), not the frontend (port 80)!

## 🔍 Troubleshooting Blank Page

### 1. Check you're on the correct URL
- ✅ **Correct**: http://localhost (frontend)
- ❌ **Wrong**: http://localhost:3000 (backend API)

### 2. Check Browser Console
Open Developer Tools (F12) and check the Console tab for errors:
- JavaScript errors
- Failed API requests
- Network errors

### 3. Verify Services are Running
```bash
docker-compose ps
```

All services should show "Up" status.

### 4. Check Browser Network Tab
- Open Developer Tools → Network tab
- Refresh the page
- Check if `index.html`, CSS, and JS files are loading (status 200)
- Check if API requests are failing

### 5. Clear Browser Cache
- Hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows/Linux)
- Or clear browser cache completely

## 🚀 Quick Test

1. Open http://localhost in your browser
2. You should see the **Login page** with:
   - "Login to TeamBoard" heading
   - Email and Password fields
   - "Register here" link at the bottom

3. If you see a blank page:
   - Open Developer Tools (F12)
   - Check Console for errors
   - Check Network tab to see what's loading/failing

## 📝 Expected Behavior

**First Visit (Not Logged In)**:
1. Browser loads http://localhost
2. React app starts
3. App checks if user is authenticated (not logged in)
4. Redirects to `/login`
5. Shows Login page

**After Login**:
1. User logs in successfully
2. Token saved in localStorage
3. Redirects to `/dashboard`
4. Shows Dashboard with cards for Teams, Tasks, etc.

## 🐛 Common Issues

### Blank White Page
- **Cause**: JavaScript error preventing React from rendering
- **Fix**: Check browser console for errors

### Blank Black/Dark Page
- **Cause**: CSS styling issue
- **Fix**: Check if CSS files are loading in Network tab

### "Cannot connect" Error
- **Cause**: Frontend can't reach backend API
- **Fix**: Verify backend is running on port 3000

### Infinite Redirect Loop
- **Cause**: Authentication state issue
- **Fix**: Clear localStorage: `localStorage.clear()` in browser console

---

**Still having issues?** Check the browser's Developer Console for specific error messages!

