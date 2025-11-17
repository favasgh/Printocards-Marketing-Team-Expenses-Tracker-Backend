# Deployment Guide: Vercel (Frontend) + Render (Backend)

This guide will walk you through deploying your Marketing Team Expense Tracker application to production.

## Prerequisites

- GitHub account
- Vercel account (free tier available)
- Render account (free tier available)
- MongoDB Atlas cluster (free tier available)
- Cloudinary account (free tier available)

---

## Part 1: Deploy Backend to Render

### Step 1: Prepare Your Repository

1. **Push your code to GitHub** (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git push -u origin main
   ```

### Step 2: Create Render Web Service

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Select the repository containing your code

### Step 3: Configure Render Service

**Basic Settings:**
- **Name**: `printo-expense-api` (or your preferred name)
- **Region**: Choose closest to your users
- **Branch**: `main` (or your default branch)
- **Root Directory**: `server` (important!)
- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`

**Environment Variables:**
Click "Add Environment Variable" and add:

```
PORT=10000
NODE_ENV=production
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_strong_random_secret_key_here
CLIENT_URL=https://your-vercel-app.vercel.app
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

**Important Notes:**
- `PORT` should be `10000` (Render's default) or use `process.env.PORT`
- `CLIENT_URL` will be your Vercel URL (update after frontend deployment)
- Generate a strong `JWT_SECRET` (e.g., use `openssl rand -base64 32`)

### Step 4: Deploy

1. Click **"Create Web Service"**
2. Render will start building and deploying
3. Wait for deployment to complete (usually 2-5 minutes)
4. Copy your service URL (e.g., `https://printo-expense-api.onrender.com`)

### Step 5: Update MongoDB Atlas IP Whitelist

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Navigate to **Network Access**
3. Click **"Add IP Address"**
4. Click **"Allow Access from Anywhere"** (or add Render's IP ranges)
5. Save changes

---

## Part 2: Deploy Frontend to Vercel

### Step 1: Install Vercel CLI (Optional)

```bash
npm install -g vercel
```

### Step 2: Create Vercel Project via Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. Select the repository

### Step 3: Configure Vercel Project

**Framework Preset:** `Vite`

**Root Directory:** `client`

**Build and Output Settings:**
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

**Environment Variables:**
Click "Add" and add:

```
VITE_API_URL=https://your-render-app.onrender.com/api
```

Replace `your-render-app.onrender.com` with your actual Render backend URL.

### Step 4: Deploy

1. Click **"Deploy"**
2. Wait for build to complete (usually 1-3 minutes)
3. Copy your Vercel URL (e.g., `https://printo-expense-tracker.vercel.app`)

### Step 5: Update Backend CORS

1. Go back to Render Dashboard
2. Edit your Web Service
3. Update the `CLIENT_URL` environment variable:
   ```
   CLIENT_URL=https://your-vercel-app.vercel.app
   ```
4. Save and redeploy (or it will auto-redeploy)

---

## Part 3: Post-Deployment Configuration

### Step 1: Create Admin User

After deployment, create an admin user using Render's Shell:

1. In Render Dashboard, go to your service
2. Click **"Shell"** tab
3. Run:
   ```bash
   npm run create-new-admin "Admin Name" admin@example.com yourpassword123
   ```

Or use your local machine (make sure `.env` points to production MongoDB):
```bash
cd server
npm run create-new-admin "Admin Name" admin@example.com yourpassword123
```

### Step 2: Test Your Deployment

1. **Frontend**: Visit your Vercel URL
2. **Backend Health Check**: Visit `https://your-render-app.onrender.com/health`
3. **API Test**: Visit `https://your-render-app.onrender.com/` to see API info

### Step 3: Verify Environment Variables

**Backend (Render):**
- ✅ `MONGODB_URI` - MongoDB Atlas connection string
- ✅ `JWT_SECRET` - Strong random secret
- ✅ `CLIENT_URL` - Your Vercel frontend URL
- ✅ `CLOUDINARY_*` - Cloudinary credentials
- ✅ `NODE_ENV=production`
- ✅ `PORT=10000`

**Frontend (Vercel):**
- ✅ `VITE_API_URL` - Your Render backend URL with `/api` suffix

---

## Part 4: Custom Domain (Optional)

### Vercel Custom Domain

1. In Vercel project settings → **Domains**
2. Add your custom domain
3. Follow DNS configuration instructions
4. Update `CLIENT_URL` in Render with new domain

### Render Custom Domain

1. In Render service settings → **Custom Domains**
2. Add your custom domain
3. Update DNS records as instructed
4. Update `VITE_API_URL` in Vercel with new domain

---

## Troubleshooting

### Backend Issues

**Issue: MongoDB Connection Failed**
- Check MongoDB Atlas IP whitelist (allow Render IPs)
- Verify `MONGODB_URI` is correct
- Check MongoDB Atlas cluster is running

**Issue: CORS Errors**
- Verify `CLIENT_URL` in Render matches your Vercel URL exactly
- Check for trailing slashes
- Ensure `credentials: true` is set in CORS config

**Issue: Build Fails**
- Check `Root Directory` is set to `server`
- Verify `package.json` has `start` script
- Check Render build logs for specific errors

### Frontend Issues

**Issue: API Calls Fail**
- Verify `VITE_API_URL` includes `/api` suffix
- Check backend is running (visit Render service URL)
- Check browser console for CORS errors

**Issue: Build Fails**
- Check `Root Directory` is set to `client`
- Verify `package.json` has `build` script
- Check Vercel build logs

**Issue: Environment Variables Not Working**
- Ensure variables start with `VITE_` prefix
- Rebuild after adding environment variables
- Check Vercel environment variable settings

---

## Monitoring & Maintenance

### Render

- **Logs**: View real-time logs in Render dashboard
- **Metrics**: Monitor CPU, Memory, and Response times
- **Auto-deploy**: Enabled by default on git push

### Vercel

- **Analytics**: Enable in project settings
- **Logs**: View function logs in dashboard
- **Auto-deploy**: Enabled by default on git push

---

## Cost Estimates (Free Tier)

- **Render**: 750 hours/month free (enough for 24/7 single service)
- **Vercel**: Unlimited bandwidth, 100GB bandwidth/month
- **MongoDB Atlas**: 512MB storage free
- **Cloudinary**: 25GB storage, 25GB bandwidth/month free

---

## Quick Reference

### Render Backend URL Format
```
https://your-service-name.onrender.com
```

### Vercel Frontend URL Format
```
https://your-project-name.vercel.app
```

### Environment Variables Checklist

**Render (Backend):**
```
PORT=10000
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
JWT_SECRET=...
CLIENT_URL=https://your-vercel-app.vercel.app
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

**Vercel (Frontend):**
```
VITE_API_URL=https://your-render-app.onrender.com/api
```

---

## Next Steps

1. ✅ Deploy backend to Render
2. ✅ Deploy frontend to Vercel
3. ✅ Update CORS settings
4. ✅ Create admin user
5. ✅ Test all functionality
6. ✅ Set up custom domain (optional)
7. ✅ Configure monitoring (optional)

---

## Support

If you encounter issues:
1. Check Render/Vercel build logs
2. Verify all environment variables are set
3. Test API endpoints directly
4. Check browser console for errors
5. Review MongoDB Atlas connection status

