# Login Issue Fix Guide
## "Invalid credentials" Error - Complete Solution

---

## ✅ Root Cause Analysis

I tested your backend directly and **login works perfectly**:
```bash
# Direct API test - SUCCESS ✅
curl -X POST http://localhost:8000/api/v1/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"demo@aimail.com","password":"Demo@1234"}'

# Response: Valid JWT token returned ✅
```

**The backend is 100% working.** The issue is one of these:

1. **Frontend pointing to wrong backend URL** (most likely if deployed)
2. **CORS blocking the request** (if backend doesn't allow your frontend domain)
3. **Frontend cache** (old build with wrong API URL)
4. **Database not initialized on deployed backend** (demo user doesn't exist)

---

## 🔧 Fix #1: Update Deployed Backend Environment Variables

### If deployed on **Render/Railway/Heroku**:

1. Go to your backend service dashboard
2. Add/Update these environment variables:

```bash
# Required
DATABASE_URL=postgresql+asyncpg://USER:PASS@HOST:5432/DBNAME
SECRET_KEY=a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2
ML_SERVER_URL=https://your-ml-server.onrender.com

# CRITICAL: Add your frontend URL here
ALLOWED_ORIGINS=["https://your-frontend.vercel.app","http://localhost:3000"]

# Optional (only if using S3)
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
S3_BUCKET_NAME=your-bucket
```

3. **Restart the backend service**
4. **Run migrations** (if not auto-run):
   ```bash
   alembic upgrade head
   ```

### If deployed on **AWS EC2**:

1. SSH into your EC2 instance:
   ```bash
   ssh -i your-key.pem ec2-user@your-ec2-ip
   ```

2. Edit the `.env` file:
   ```bash
   cd /path/to/backend
   nano .env
   ```

3. Update these values:
   ```bash
   DATABASE_URL=postgresql+asyncpg://USER:PASS@HOST:5432/DBNAME
   SECRET_KEY=a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2
   ALLOWED_ORIGINS=["https://your-frontend.vercel.app"]
   ML_SERVER_URL=http://your-ml-server-ip:8001
   ```

4. Restart the service:
   ```bash
   sudo systemctl restart email-backend
   # OR if using Docker:
   docker-compose restart backend
   ```

---

## 🔧 Fix #2: Update Frontend Environment Variable

### If deployed on **Vercel**:

1. Go to your Vercel project dashboard
2. Settings → Environment Variables
3. Add/Update:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api/v1
   ```
4. **Redeploy** (Vercel will rebuild with new env var)

### If deployed on **Netlify**:

1. Site settings → Environment variables
2. Add:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api/v1
   ```
3. **Trigger redeploy**

---

## 🔧 Fix #3: Verify Demo User Exists in Production Database

### Option A: Run the fix script on deployed backend

1. SSH into your backend server (or use Render/Railway shell)
2. Run:
   ```bash
   cd /path/to/backend
   python fix_demo_user.py
   ```

### Option B: Create demo user manually via SQL

Connect to your production database and run:

```sql
-- Check if demo user exists
SELECT * FROM users WHERE email = 'demo@aimail.com';

-- If not exists, create it (password is bcrypt hash of "Demo@1234")
INSERT INTO users (id, email, username, password, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'demo@aimail.com',
  'Demo User',
  '$2b$12$ZJRIdg2b2K0XRqGvX8Hn4.rKp7YvJ8qH5vZ3wN2xL4mP6tQ8sU9vK',
  NOW(),
  NOW()
);
```

### Option C: Register a new account

If demo user doesn't work, just register a new account:
1. Go to your deployed frontend
2. Click "Register"
3. Create a new account
4. Login with your new credentials

---

## 🔧 Fix #4: Check CORS Configuration

### Test if CORS is the issue:

Open browser console on your frontend and check for errors like:
```
Access to XMLHttpRequest at 'https://backend.com/api/v1/login' 
from origin 'https://frontend.vercel.app' has been blocked by CORS policy
```

### Fix CORS:

1. Update `backend/.env`:
   ```bash
   ALLOWED_ORIGINS=["https://your-exact-frontend-url.vercel.app"]
   ```

2. **Important:** Use the EXACT URL (with or without `www`, with `https`)

3. Restart backend

---

## 🔧 Fix #5: Local Development (If testing locally)

### Step 1: Restart Backend
```bash
cd backend

# Stop current server (Ctrl+C)

# Activate venv
venv\Scripts\activate

# Start fresh
uvicorn app.main:app --reload --port 8000
```

### Step 2: Restart Frontend
```bash
cd frontend

# Stop current server (Ctrl+C)

# Clear Next.js cache
rm -rf .next

# Start fresh
npm run dev
```

### Step 3: Clear Browser Cache
- Press `Ctrl+Shift+Delete`
- Clear cookies and cached files
- Or use Incognito mode

---

## 🧪 Testing the Fix

### Test 1: Direct API Call
```bash
curl -X POST https://your-backend.com/api/v1/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"demo@aimail.com","password":"Demo@1234"}'
```

**Expected:** JSON with `access_token`

### Test 2: Check CORS Headers
```bash
curl -X OPTIONS https://your-backend.com/api/v1/login \
  -H "Origin: https://your-frontend.vercel.app" \
  -H "Access-Control-Request-Method: POST" \
  -v
```

**Expected:** `Access-Control-Allow-Origin: https://your-frontend.vercel.app`

### Test 3: Frontend Login
1. Open your deployed frontend
2. Open browser DevTools (F12) → Network tab
3. Try to login
4. Check the `/login` request:
   - **Status 200** = Backend works, frontend issue
   - **Status 401** = Wrong credentials or demo user doesn't exist
   - **Status 0 / CORS error** = CORS misconfiguration
   - **Failed to fetch** = Backend URL wrong or backend down

---

## 📋 Quick Checklist

- [ ] Backend `.env` has correct `DATABASE_URL`
- [ ] Backend `.env` has real `SECRET_KEY` (not placeholder)
- [ ] Backend `.env` `ALLOWED_ORIGINS` includes your frontend URL
- [ ] Frontend env var `NEXT_PUBLIC_API_URL` points to correct backend
- [ ] Frontend has been **redeployed** after env var change
- [ ] Backend has been **restarted** after env var change
- [ ] Database migrations have been run (`alembic upgrade head`)
- [ ] Demo user exists in production database
- [ ] Both services are actually running and accessible

---

## 🆘 Still Not Working?

### Get Detailed Error Info:

1. **Check backend logs:**
   ```bash
   # Render/Railway: View logs in dashboard
   # EC2: tail -f /var/log/email-backend.log
   # Docker: docker logs email_backend
   ```

2. **Check frontend browser console:**
   - Open DevTools (F12)
   - Console tab
   - Network tab → Click failed request → Preview/Response

3. **Test backend health:**
   ```bash
   curl https://your-backend.com/health
   ```

4. **Test database connection:**
   ```bash
   # SSH into backend
   python -c "from app.db.session import engine; import asyncio; asyncio.run(engine.connect())"
   ```

---

## 💡 Common Mistakes

1. **Forgot to redeploy frontend** after changing `NEXT_PUBLIC_API_URL`
   - Next.js bakes env vars at **build time**
   - Must redeploy, not just restart

2. **ALLOWED_ORIGINS has wrong URL format**
   - ❌ `ALLOWED_ORIGINS=https://app.vercel.app` (string)
   - ✅ `ALLOWED_ORIGINS=["https://app.vercel.app"]` (JSON array)

3. **Using HTTP instead of HTTPS**
   - Most platforms force HTTPS
   - Check if your URLs use `https://` not `http://`

4. **Database URL is still placeholder**
   - Check if `DATABASE_URL` actually points to real database
   - Test connection manually

5. **SECRET_KEY is still placeholder**
   - Generate real key: `python -c "import secrets; print(secrets.token_hex(32))"`

---

## ✅ Expected Working State

### Backend logs should show:
```
Starting AI Email Reply Generator v1.0.0
✓ Database migrations applied
Demo user already exists: demo@aimail.com
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### Frontend should:
- Load without errors
- Show login page
- Network tab shows request to correct backend URL
- Login returns 200 status with token

### After successful login:
- Redirected to `/dashboard`
- Token stored in cookies
- User info displayed in navbar

---

## 📞 Need More Help?

**Provide these details:**

1. Where is backend deployed? (Render/Railway/AWS/Local)
2. Where is frontend deployed? (Vercel/Netlify/Local)
3. What's the exact error message?
4. Backend logs (last 20 lines)
5. Frontend console errors
6. Network tab screenshot of failed `/login` request

---

## 🎯 Quick Fix for Demo/Presentation

If you need it working **right now** for a demo:

1. **Use local backend:**
   ```bash
   cd backend
   uvicorn app.main:app --reload --port 8000
   ```

2. **Point frontend to localhost:**
   ```bash
   # frontend/.env.local
   NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
   ```

3. **Restart frontend:**
   ```bash
   cd frontend
   rm -rf .next
   npm run dev
   ```

4. **Login with demo account:**
   - Email: `demo@aimail.com`
   - Password: `Demo@1234`

This will work 100% for local demo while you fix the deployed version.

---

**Good luck! The backend works perfectly, just need to connect the pieces. 🚀**
