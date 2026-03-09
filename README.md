# Portfolio Application

A full-stack portfolio application built with the MERN stack (MongoDB, Express, React, Node.js) and Vite.

## 🚀 Technologies

- **Frontend:** React, Vite, Framer Motion, Three.js
- **Backend:** Node.js, Express.js
- **Database:** MongoDB Atlas (Mongoose)

## 📦 Local Development Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   Create a `.env` file in the root directory and copy the variables from `.env.example`:
   ```bash
   cp .env.example .env
   ```
   Fill in your `MONGODB_URI` from MongoDB Atlas. For more detailed instructions on MongoDB setup, see [MONGODB_SETUP.md](./MONGODB_SETUP.md).

3. **Start Development Server**
   Run both frontend and backend concurrently:
   ```bash
   npm run dev:full
   ```
   - Frontend: http://localhost:5173
   - Backend: http://localhost:3001

## ☁️ Deployment Guide (Free Tier Options)

This project can be easily deployed using free-tier cloud providers. 

### Recommended Free Stack:
- **Database:** [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (Free M0 Sandbox)
- **Frontend:** [Vercel](https://vercel.com) or [Netlify](https://netlify.com)
- **Backend:** [Render](https://render.com) or [Koyeb](https://koyeb.com)

### Backend Deployment (e.g., Render)
1. Create a new "Web Service" linking to your GitHub repository.
2. Build Command: `npm install`
3. Start Command: `npm run server`
4. Environment Variables:
   - `MONGODB_URI` = Your Atlas connection string
   - `ADMIN_PASSWORD` = Your desired admin password
   - `FRONTEND_URL` = Your deployed frontend URL (e.g., `https://my-portfolio.vercel.app`)

### Frontend Deployment (e.g., Vercel)
1. Import your GitHub repository to Vercel.
2. Framework Preset: `Vite`
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. Environment Variables:
   - `VITE_API_URL` = Your backend URL (e.g., `https://my-backend.onrender.com`)

*(Note: Verify that your frontend's environment variable inside `vite.config.js` or API service correctly points to the configured `VITE_API_URL` for production requests).*
