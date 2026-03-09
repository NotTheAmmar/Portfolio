# Modern AI-Powered Portfolio

A full-stack, customizable portfolio application built with the MERN stack (MongoDB, Express, React, Node.js) and Vite. 
This portfolio features a sleek 3D interactive hero section using Three.js, seamless animations with Framer Motion, and AI-powered interactions via the Gemini API.

It includes a secure Admin Dashboard that allows you to dynamically update your skills, projects, experience, and other details without touching the code.

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

## ☁️ Deployment

This project is configured to be easily deployed on free-tier cloud providers like Render, Vercel, and MongoDB Atlas.

For step-by-step instructions on taking this full-stack application live, please read the [Deployment Guide (DEPLOYMENT.md)](./DEPLOYMENT.md).

For setting up the cloud database specifically, reference the [MongoDB Setup Guide (MONGODB_SETUP.md)](./MONGODB_SETUP.md).
