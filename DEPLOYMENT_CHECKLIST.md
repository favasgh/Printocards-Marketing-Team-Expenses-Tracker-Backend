# Deployment Checklist

Use this checklist to ensure you complete all deployment steps correctly.

## Pre-Deployment

- [ ] Code is pushed to GitHub
- [ ] MongoDB Atlas cluster is created and running
- [ ] MongoDB Atlas IP whitelist includes your IP (for testing)
- [ ] Cloudinary account is set up
- [ ] All environment variables are documented

## Backend Deployment (Render)

- [ ] Created Render account
- [ ] Connected GitHub repository
- [ ] Created new Web Service
- [ ] Set Root Directory to `server`
- [ ] Set Build Command: `npm install`
- [ ] Set Start Command: `npm start`
- [ ] Added environment variable: `PORT=10000`
- [ ] Added environment variable: `NODE_ENV=production`
- [ ] Added environment variable: `MONGODB_URI`
- [ ] Added environment variable: `JWT_SECRET`
- [ ] Added environment variable: `CLOUDINARY_CLOUD_NAME`
- [ ] Added environment variable: `CLOUDINARY_API_KEY`
- [ ] Added environment variable: `CLOUDINARY_API_SECRET`
- [ ] Added environment variable: `CLIENT_URL` (will update after frontend deploy)
- [ ] Service deployed successfully
- [ ] Health check endpoint works: `https://your-app.onrender.com/health`
- [ ] API info endpoint works: `https://your-app.onrender.com/`
- [ ] Updated MongoDB Atlas IP whitelist to allow Render

## Frontend Deployment (Vercel)

- [ ] Created Vercel account
- [ ] Connected GitHub repository
- [ ] Created new project
- [ ] Set Framework Preset to `Vite`
- [ ] Set Root Directory to `client`
- [ ] Set Build Command: `npm run build`
- [ ] Set Output Directory: `dist`
- [ ] Added environment variable: `VITE_API_URL=https://your-render-app.onrender.com/api`
- [ ] Project deployed successfully
- [ ] Frontend loads without errors

## Post-Deployment

- [ ] Updated Render `CLIENT_URL` with Vercel URL
- [ ] Backend redeployed with updated CORS settings
- [ ] Created admin user via Render Shell or local script
- [ ] Tested login functionality
- [ ] Tested registration functionality
- [ ] Tested expense creation
- [ ] Tested admin dashboard
- [ ] Verified CORS is working (no CORS errors in console)
- [ ] Verified API calls are successful

## Testing Checklist

### Authentication
- [ ] User can register
- [ ] User can login
- [ ] Admin can login
- [ ] Protected routes require authentication
- [ ] JWT tokens are working

### User Features
- [ ] User can create expense
- [ ] User can upload receipt
- [ ] User can view their expenses
- [ ] User can edit pending expenses
- [ ] User can delete pending expenses

### Admin Features
- [ ] Admin can view all expenses
- [ ] Admin can filter expenses
- [ ] Admin can approve expenses
- [ ] Admin can reject expenses
- [ ] Admin can export reports (Excel)
- [ ] Admin can export reports (PDF)
- [ ] Charts are displaying correctly

### PWA Features (if applicable)
- [ ] Service worker is registered
- [ ] App can be installed
- [ ] Offline functionality works

## Environment Variables Reference

### Render (Backend)
```
PORT=10000
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority
JWT_SECRET=your-strong-secret-key-here
CLIENT_URL=https://your-vercel-app.vercel.app
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### Vercel (Frontend)
```
VITE_API_URL=https://your-render-app.onrender.com/api
```

## URLs to Save

- Backend URL: `https://________________.onrender.com`
- Frontend URL: `https://________________.vercel.app`
- MongoDB Atlas: `https://cloud.mongodb.com/`
- Cloudinary Dashboard: `https://cloudinary.com/console`

## Troubleshooting Notes

### If backend fails to start:
- Check Render logs
- Verify all environment variables are set
- Check MongoDB connection string format
- Verify PORT is set correctly

### If frontend can't connect to backend:
- Verify `VITE_API_URL` includes `/api` suffix
- Check CORS settings in backend
- Verify `CLIENT_URL` in backend matches frontend URL exactly
- Check browser console for specific errors

### If MongoDB connection fails:
- Verify MongoDB Atlas cluster is running
- Check IP whitelist includes Render IPs
- Verify connection string is correct
- Check MongoDB Atlas network access settings

---

**Last Updated:** After deployment
**Status:** ⬜ Not Started | 🟡 In Progress | ✅ Complete

