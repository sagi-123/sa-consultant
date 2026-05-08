# SA Elevate - Project Documentation

## 1. Overview
**SA Elevate** is a modern web application built for **SA Consultant & Staffing**. It features a professional landing page, user authentication, and specialized dashboards for both clients and administrators to manage reviews and portfolio items.

## 2. Tech Stack
- **Frontend**: [React 18](https://reactjs.org/) with [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [Vanilla CSS](https://developer.mozilla.org/en-US/docs/Web/CSS)
- **UI Components**: [Shadcn UI](https://ui.shadcn.com/) (Radix UI primitives)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Backend/Database**: [Supabase](https://supabase.com/) (PostgreSQL & Authentication)
- **Routing**: [React Router DOM v6](https://reactrouter.com/)
- **Deployment**: [Vercel](https://vercel.com/)

---

## 3. Project Structure
```text
sa-elevate/
├── public/              # Static assets (images, robots.txt, etc.)
├── src/
│   ├── components/      # Reusable UI components
│   │   ├── ui/          # Shadcn UI primitives
│   │   ├── Navbar.tsx   # Global Navigation
│   │   └── Hero.tsx     # Hero section
│   ├── hooks/           # Custom React hooks (useAuth, useMobile, etc.)
│   ├── lib/             # Third-party configurations (supabase.ts, utils.ts)
│   ├── pages/           # Main page components (Index, Auth, Dashboards)
│   ├── types/           # TypeScript definitions (database.types.ts)
│   ├── App.tsx          # Main App component & Router configuration
│   └── main.tsx         # Entry point
├── supabase/            # Supabase migrations and configurations
├── index.html           # Main HTML template
├── tailwind.config.ts   # Tailwind CSS configuration
└── vercel.json          # Vercel deployment rules (SPA routing)
```

---

## 4. Key Features
### 🔐 Authentication
- Handled via Supabase Auth.
- Support for Email/Password registration and login.
- Persistent sessions via `useAuth` hook.

### 👥 User Dashboard
- Profile management.
- Submission of client reviews/testimonials.
- Real-time status tracking of submitted reviews (Pending/Approved).

### 🛡️ Admin Dashboard
- **Review Moderation**: Approve or delete reviews submitted by users.
- **User Management**: View registered users and their roles.
- **Stats Grid**: Overview of total users, reviews, and pending tasks.

---

## 5. Development Guide
### Prerequisites
- Node.js (v18+)
- Bun or NPM

### Setup
1. Clone the repository: `git clone <repo-url>`
2. Install dependencies: `npm install`
3. Set up Environment Variables: Create a `.env.local` file with:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
4. Run locally: `npm run dev`

---

## 6. Deployment Guide: Git to Vercel

### Step 1: Push Code to GitHub
1. Initialize Git (if not done): `git init`
2. Add all files: `git add .`
3. Commit: `git commit -m "Initial commit"`
4. Create a repo on GitHub and link it:
   ```bash
   git remote add origin https://github.com/your-username/sa-elevate.git
   git branch -M main
   git push -u origin main
   ```

### Step 2: Connect to Vercel
1. Log in to [Vercel](https://vercel.com/).
2. Click **"Add New"** > **"Project"**.
3. Import your GitHub repository.
4. **Environment Variables**: Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in the Vercel project settings.
5. **Build Settings**:
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
6. Click **Deploy**.

---

## 7. Maintenance & Commands
- **Linting**: `npm run lint` - Checks for code quality issues.
- **Testing**: `npm run test` - Runs Vitest unit tests.
- **Build**: `npm run build` - Generates a production-ready bundle in `/dist`.
