# SA Elevate - Complete Project Guide & Documentation

This document provides a deep dive into the **SA Elevate** project. It covers the architecture, code logic, database structure, and a full guide on how to manage and deploy the application.

---

## 1. Where is the Code? (Project Architecture)

The project follows a standard React/Vite structure. Here is where you can find the "brain" of your application:

### 核心 Logic (The "How-To")
- **Authentication**: `src/hooks/useAuth.tsx` - This is where the login, logout, and user session logic lives.
- **Database Connection**: `src/lib/supabase.ts` - This connects your website to the Supabase backend.
- **Global Styles**: `src/index.css` - Contains the main colors, gradients, and fonts.

### Pages (The "Screens")
- **Home Page**: `src/pages/Index.tsx` - The main landing page.
- **Admin Dashboard**: `src/pages/AdminDashboard.tsx` - Where admins approve reviews and see user stats.
- **User Dashboard**: `src/pages/UserDashboard.tsx` - Where clients submit reviews.
- **Auth Page**: `src/pages/Auth.tsx` - The login and registration screen.

### Components (The "Blocks")
- **UI Elements**: `src/components/ui/` - Small reusable parts like Buttons, Cards, and Inputs (powered by Shadcn UI).
- **Sections**: `src/components/Hero.tsx`, `src/components/Services.tsx`, etc. - The large sections on your homepage.

---

## 2. Database Schema (Supabase)

Your application relies on two main tables in Supabase:

### `profiles` Table
Stores user information.
- `id`: Unique user ID (linked to Auth).
- `name`: Full name of the user.
- `email`: User's email.
- `role`: Can be `'user'` or `'admin'`. Admin role grants access to the `/admin` dashboard.
- `created_at`: Date the account was created.

### `reviews` Table
Stores client testimonials.
- `id`: Unique review ID.
- `user_id`: ID of the user who wrote it.
- `name`: Name to display (usually the user's name).
- `rating`: 1 to 5 stars.
- `message`: The actual review text.
- `status`: `'pending'` or `'approved'`. Only approved reviews show up on the homepage.

---

## 3. How to Use the Application

### For Users
1. **Sign Up**: Create an account on the `/auth` page.
2. **Submit Review**: Go to the **User Dashboard**, select a star rating, type your message, and hit "Submit".
3. **Wait for Approval**: The review will show as "Pending" until an admin approves it.

### For Admins
1. **Login**: Use an account that has the `admin` role in the database.
2. **Moderate**: Go to the **Admin Panel**.
3. **Approve**: Click the green checkmark on a review to make it visible on the public site.
4. **Manage Users**: View the list of all registered members.

---

## 4. Deployment Guide: Git to Vercel

### Step 1: Prepare your Code
Ensure you have saved all your changes in your editor (VS Code).

### Step 2: Push to GitHub
1. Open your terminal in the project folder.
2. Run these commands:
   ```bash
   git add .
   git commit -m "Finalizing documentation and fixes"
   git push origin main
   ```

### Step 3: Connect to Vercel
1. Go to [vercel.com](https://vercel.com).
2. Click **New Project**.
3. Import your GitHub repo.
4. **IMPORTANT**: You must add your environment variables in the "Environment Variables" section of the Vercel setup:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Click **Deploy**.

---

## 5. Frequently Asked Questions (FAQ)

### How do I change the website colors?
Go to `src/index.css` and modify the HSL values under `:root`. For example, changing `--primary` will change the main brand color across the entire site.

### How do I make someone an Admin?
1. Log in to your [Supabase Dashboard](https://supabase.com/dashboard).
2. Go to **Table Editor** > **profiles**.
3. Find the user and change their `role` column from `user` to `admin`.

### How do I update the images?
Place your new images in the `public/` folder and update the `src` paths in the components (like `Hero.tsx` or `About.tsx`).

---

## 6. Development Commands
- `npm run dev`: Start the local development server.
- `npm run build`: Build the site for production.
- `npm run lint`: Find and fix code style errors.
