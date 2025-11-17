# Post-Deployment Checklist

Congratulations! Your frontend and backend are now deployed. Follow these steps to complete the setup.

## ✅ Step 1: Verify Deployments

### Frontend (Netlify/Vercel)
- [ ] Visit your frontend URL (e.g., `https://your-app.netlify.app`)
- [ ] Check that the app loads without errors
- [ ] Verify the logo and branding are correct
- [ ] Test that the page is responsive

### Backend (Render)
- [ ] Visit your backend health check: `https://your-backend.onrender.com/health`
- [ ] Should return: `{"status":"ok"}`
- [ ] Visit API info: `https://your-backend.onrender.com/`
- [ ] Should show API endpoints

## ✅ Step 2: Update Environment Variables

### Backend (Render) - Update CORS
1. Go to your Render dashboard
2. Select your backend service
3. Go to **Environment** tab
4. Update `CLIENT_URL` to your frontend URL:
   ```
   CLIENT_URL=https://your-frontend.netlify.app
   ```
   Or if using Vercel:
   ```
   CLIENT_URL=https://your-app.vercel.app
   ```
5. **Save** and wait for redeployment (or manually redeploy)

### Frontend (Netlify/Vercel) - Update API URL
1. Go to your frontend dashboard (Netlify/Vercel)
2. Go to **Site settings** → **Environment variables**
3. Update `VITE_API_URL`:
   ```
   VITE_API_URL=https://your-backend.onrender.com/api
   ```
4. **Redeploy** the site (or it will auto-redeploy)

## ✅ Step 3: Create Admin User

You need to create an admin account to access the admin dashboard.

### Option A: Using Render Shell (Recommended)
1. Go to Render dashboard → Your backend service
2. Click **Shell** tab
3. Run:
   ```bash
   npm run create-new-admin "Admin Name" admin@example.com yourpassword123
   ```
4. Note the credentials for login

### Option B: Using Local Machine
1. Make sure your local `.env` points to production MongoDB:
   ```env
   MONGODB_URI=your_production_mongodb_uri
   ```
2. Run from `server` directory:
   ```bash
   npm run create-new-admin "Admin Name" admin@example.com yourpassword123
   ```

### Option C: Using MongoDB Atlas
1. Go to MongoDB Atlas → Your cluster
2. Browse Collections → `users` collection
3. Insert a document manually (not recommended, password won't be hashed)

## ✅ Step 4: Test Authentication

1. **Test Registration:**
   - Go to your frontend URL
   - Click "Register now"
   - Create a test user account
   - Verify registration works

2. **Test Login:**
   - Log in with the test user
   - Verify redirect to dashboard works
   - Check that user data loads

3. **Test Admin Login:**
   - Log in with admin credentials
   - Verify redirect to admin dashboard
   - Check that admin features are accessible

## ✅ Step 5: Test Core Features

### User Features
- [ ] Create a new expense
- [ ] Upload a receipt image
- [ ] View expense list
- [ ] Edit a pending expense
- [ ] Delete a pending expense
- [ ] Test filters (category, date range, search)

### Admin Features
- [ ] View all expenses
- [ ] Filter expenses (status, salesman, category, dates)
- [ ] Approve an expense
- [ ] Reject an expense (with comment)
- [ ] Export Excel report
- [ ] Export PDF report
- [ ] View charts (Category, Salesman, Timeline)

### PWA Features
- [ ] Install prompt appears (on supported browsers)
- [ ] App can be installed
- [ ] Test offline mode (DevTools → Network → Offline)
- [ ] Create expense while offline
- [ ] Verify sync when back online

## ✅ Step 6: Verify CORS is Working

1. Open browser DevTools (F12)
2. Go to **Console** tab
3. Try to log in or make an API call
4. Check for CORS errors
5. If you see CORS errors:
   - Verify `CLIENT_URL` in backend matches frontend URL exactly
   - Check for trailing slashes
   - Ensure backend has redeployed after environment variable change

## ✅ Step 7: Update MongoDB Atlas IP Whitelist

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Navigate to **Network Access**
3. Add Render IP addresses or allow all:
   - Click **"Add IP Address"**
   - Click **"Allow Access from Anywhere"** (for production)
   - Or add specific Render IP ranges
4. Save changes

## ✅ Step 8: Set Up Monitoring (Optional)

### Render
- Enable **Health Checks** in service settings
- Set up email notifications for deployment failures
- Monitor logs in the **Logs** tab

### Netlify/Vercel
- Enable **Deploy notifications**
- Set up **Analytics** (if available)
- Monitor build logs

## ✅ Step 9: Custom Domain (Optional)

### Frontend (Netlify/Vercel)
1. Go to **Domain settings**
2. Add your custom domain
3. Update DNS records as instructed
4. Wait for SSL certificate (automatic)

### Backend (Render)
1. Go to **Custom Domains** in service settings
2. Add your custom domain
3. Update DNS records
4. Update `CLIENT_URL` and `VITE_API_URL` with new domains

## ✅ Step 10: Final Checklist

- [ ] All environment variables are set correctly
- [ ] CORS is working (no errors in console)
- [ ] Admin user created and can log in
- [ ] Test user can register and log in
- [ ] Expenses can be created and viewed
- [ ] Admin can approve/reject expenses
- [ ] Reports can be exported
- [ ] PWA install prompt works
- [ ] Offline functionality works
- [ ] Mobile responsive design works
- [ ] All images/assets load correctly

## 🐛 Troubleshooting

### Issue: CORS Errors
**Solution:**
- Verify `CLIENT_URL` in backend matches frontend URL exactly
- No trailing slashes
- Include `https://` protocol
- Redeploy backend after changing environment variables

### Issue: API Calls Fail
**Solution:**
- Check `VITE_API_URL` includes `/api` suffix
- Verify backend is running (check health endpoint)
- Check browser console for specific errors
- Verify network tab shows correct API calls

### Issue: Admin Can't Log In
**Solution:**
- Verify admin user was created successfully
- Check MongoDB for user document
- Verify password is correct
- Check backend logs for errors

### Issue: Images Not Loading
**Solution:**
- Verify Cloudinary credentials are set
- Check image URLs in database
- Verify CORS allows image domains
- Check browser console for 403/404 errors

### Issue: Build Fails
**Solution:**
- Check build logs for specific errors
- Verify all dependencies are in `package.json`
- Check Node.js version compatibility
- Verify environment variables are set

## 📊 Performance Optimization (Optional)

1. **Enable CDN** (usually automatic on Netlify/Vercel)
2. **Optimize Images:**
   - Use WebP format
   - Compress images before upload
   - Use Cloudinary transformations
3. **Enable Caching:**
   - Set cache headers in backend
   - Use service worker for offline caching
4. **Monitor Bundle Size:**
   - Check build output for large files
   - Consider code splitting if needed

## 🔒 Security Checklist

- [ ] All environment variables are set (no hardcoded secrets)
- [ ] `.env` files are in `.gitignore`
- [ ] MongoDB connection string is secure
- [ ] JWT secret is strong and unique
- [ ] CORS is properly configured (not `*`)
- [ ] Rate limiting is enabled
- [ ] HTTPS is enforced (automatic on Netlify/Vercel/Render)

## 📝 Documentation

Update your documentation with:
- [ ] Production URLs (frontend and backend)
- [ ] Admin login credentials (store securely)
- [ ] Environment variable reference
- [ ] API endpoint documentation
- [ ] User guide for your team

## 🎉 You're Done!

Your application is now live and ready for use. Share the frontend URL with your team and start tracking expenses!

---

## Quick Reference

### URLs to Save
- **Frontend:** `https://________________`
- **Backend:** `https://________________`
- **Health Check:** `https://________________/health`
- **API Base:** `https://________________/api`

### Admin Credentials
- **Email:** `________________`
- **Password:** `________________` (store securely)

### Environment Variables

**Backend (Render):**
```
PORT=10000
NODE_ENV=production
MONGODB_URI=...
JWT_SECRET=...
CLIENT_URL=https://your-frontend.netlify.app
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

**Frontend (Netlify/Vercel):**
```
VITE_API_URL=https://your-backend.onrender.com/api
```

---

**Last Updated:** After deployment
**Status:** Ready for production use ✅

