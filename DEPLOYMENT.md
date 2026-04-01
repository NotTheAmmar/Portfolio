# Deployment Guide

This guide will walk you through deploying your MERN stack portfolio using free-tier cloud services. This setup consists of three distinct parts:
1. **The Database:** MongoDB Atlas 
2. **The Backend (Server):** Render (or Koyeb)
3. **The Frontend (Client):** Vercel (or Netlify)

---

## Part 1: Database (MongoDB Atlas)

Before deploying any code, your database needs to be securely hosted in the cloud.

> **Important:** Your detailed MongoDB setup instructions are located in [`MONGODB_SETUP.md`](./MONGODB_SETUP.md).

### Quick Checklist:
- [ ] Created a Free M0 Sandbox cluster on MongoDB Atlas.
- [ ] Created a database user with a secure password.
- [ ] Whitelisted IPs (use `0.0.0.0/0` to allow access from anywhere, including your backend server).
- [ ] Copied your connection string (e.g., `mongodb+srv://user:pass@cluster0...`).

---

## Part 2: Backend Deployment (Render)

Render provides an excellent free tier for hosting Node.js/Express Web Services.

1. Create an account on [Render.com](https://render.com).
2. Click **New +** and select **Web Service**.
3. Connect your GitHub account and select your `portfolio` repository.
4. **Configuration settings:**
   - **Name:** `portfolio-api` (or similar)
   - **Root Directory:** *(leave blank if your `package.json` is at the root)* 
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm run server`
5. **Environment Variables (Advanced > Environment Variables):** Add all the keys from your `.env` file that the backend needs:
   - `MONGODB_URI` = Your Atlas connection string
   - `ADMIN_PASSWORD` = A secure password for the admin panel
   - `FRONTEND_URL` = *(Leave this blank for now, we will come back and fill this in after deploying the frontend)*
   - `GEMINI_API_KEY` = Your Gemini API Key from Google AI Studio.
   - `CLOUDINARY_CLOUD_NAME` = Your Cloudinary Cloud Name
   - `CLOUDINARY_API_KEY` = Your Cloudinary API Key
   - `CLOUDINARY_API_SECRET` = Your Cloudinary API Secret
6. Click **Create Web Service**. 
7. Once your service is live, **copy the URL provided by Render** (e.g., `https://portfolio-api-xyz.onrender.com`). You will need this for the frontend!

---

## Part 3: Frontend Deployment (Vercel)

Vercel is incredibly fast and optimized for Vite and React applications.

1. Log into [Vercel](https://vercel.com) using your GitHub account.
2. Click **Add New... > Project**.
3. Import your `portfolio` repository.
4. **Configuration settings:**
   - **Framework Preset:** `Vite`
   - **Root Directory:** `./`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. **Environment Variables:**
   - `VITE_API_URL` = Paste the **Render backend URL** you copied in Part 2 here (e.g., `https://portfolio-api-xyz.onrender.com`). **Do not include a trailing slash `/` at the end.**
6. Click **Deploy**.
7. Once Vercel finishes, it will give you a live URL for your frontend (e.g., `https://my-portfolio.vercel.app`).

---

## Part 4: Final Connection (CORS Setup)

For your backend and frontend to communicate securely, you need to tell your backend exactly what frontend URL is allowed to talk to it.

1. Go back to your **Render Web Service** dashboard.
2. Navigate to the **Environment** tab.
3. Update the `FRONTEND_URL` variable to be your **Vercel live URL** (e.g., `https://my-portfolio.vercel.app`).
4. Render will automatically redeploy the backend with the new environment variable.

---

## Success! 🎉

Your full-stack MERN portfolio is now successfully deployed and live! 

### How to update your site going forward:
Because you linked your GitHub repository to both Vercel and Render:
1. Make your changes locally.
2. Commit your code: `git commit -m "Update hero section"`
3. Push to GitHub: `git push origin main`

Vercel and Render will **automatically detect the push and automatically deploy the new version** for you!
