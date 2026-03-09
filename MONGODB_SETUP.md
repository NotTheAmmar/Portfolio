# MongoDB Atlas Setup Guide

Quick guide to connect your portfolio to MongoDB Atlas (cloud database).

---

## Step 1: Create MongoDB Atlas Account

1. Go to [mongodb.com/cloud/atlas/register](https://www.mongodb.com/cloud/atlas/register)
2. Sign up for free account
3. Choose **FREE tier** (M0 Sandbox)

---

## Step 2: Create Cluster

1. Click **"Build a Database"**
2. Select **FREE** tier (M0)
3. Choose a cloud provider & region (closest to you)
4. Name your cluster (or keep default)
5. Click **"Create Deployment"**

---

## Step 3: Create Database User

1. Create username and password
   - **IMPORTANT:** Save these credentials!
2. Click **"Create Database User"**

---

## Step 4: Configure Network Access

1. Click **"Add IP Address"**
2. Select **"Allow Access from Anywhere"** (0.0.0.0/0)
   - For production, use specific IPs
3. Click **"Confirm"**

---

## Step 5: Get Connection String

1. Click **"Connect"** on your cluster
2. Choose **"Connect your application"**
3. Select **Node.js** driver
4. Copy the connection string - looks like:
   ```
   mongodb+srv://username:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Replace `<password>` with your actual password
6. Add database name after `.net/`: `.net/portfolio?retryWrites...`

---

## Step 6: Update .env File

Update your `.env` file:

```env
# MongoDB Atlas Connection
MONGODB_URI=mongodb+srv://username:yourpassword@cluster0.xxxxx.mongodb.net/portfolio?retryWrites=true&w=majority

# Server Configuration
PORT=3001

# Admin Panel
ADMIN_PASSWORD=your_secure_password_here

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# API URL for frontend (Vite requires VITE_ prefix)
VITE_API_URL=http://localhost:3001

# Gemini API Key (For AI features)
GEMINI_API_KEY=your_gemini_api_key_here
```

---

## Step 7: Seed Database

Run the seed script to populate Atlas:

```bash
npm run seed
```

Expected output:
```
MongoDB Connected: cluster0-shard-00-00.xxxxx.mongodb.net
Cleared existing data
✓ Portfolio data seeded
✓ Selection data seeded

Database seeding completed successfully!
```

---

## Step 8: Run Application

```bash
npm run dev:full
```

Visit:
- Portfolio: http://localhost:5173
- Admin: http://localhost:5173/admin

---

## Verify Data in Atlas

1. Go to your cluster in MongoDB Atlas
2. Click **"Browse Collections"**
3. You should see:
   - `portfolios` collection (1 document)
   - `selections` collection (1 document)

---

## Common Issues

### Authentication Failed

- Double-check username/password in connection string
- Make sure password is URL-encoded (no special characters)
- Use MongoDB's password generator if issues persist

### Connection Timeout

- Verify IP whitelist includes 0.0.0.0/0
- Check firewall isn't blocking port 27017

### Database Not Found

- Make sure you added `/portfolio` after `.net/` in connection string
- Example: `.net/portfolio?retryWrites...`

---

## Production Deployment

### Backend (Render/Railway)

1. Deploy Express backend
2. Add `MONGODB_URI` environment variable in hosting dashboard
3. Your Atlas database works from anywhere!

### Frontend (Vercel/Netlify)

1. Add environment variable:
   ```
   VITE_API_URL=https://your-backend.onrender.com
   ```
2. Deploy!

---

## Free Tier Limits

MongoDB Atlas M0 (Free):
- ✅ 512 MB storage
- ✅ Shared RAM
- ✅ Perfect for this portfolio
- ✅ No credit card required

Your portfolio data is < 1 MB, so free tier is plenty!

---

## Next Steps

1. Create Atlas account
2. Set up cluster (5 minutes)
3. Copy connection string to `.env`
4. Run `npm run seed`
5. Run `npm run dev:full`
6. Test admin dashboard - changes save to cloud! ☁️

🎉 **Benefit:** Your data is in the cloud - works from anywhere, no local MongoDB needed!
