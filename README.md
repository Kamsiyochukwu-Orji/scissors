# Scissor — URL Shortener

A fast, minimal URL shortener with custom branded slugs, QR code generation, and real-time click analytics.

**Stack:** React + TypeScript · Convex · Clerk · Tailwind CSS · Recharts · qrcode.react

---

## Features

- Shorten any URL to a 6-character slug in under a second
- Custom branded slugs with real-time availability checking
- QR code generation (SVG + PNG download, customizable colors, logo overlay)
- Real-time click analytics — clicks over time, top referrers, device breakdown
- Link expiry with branded 410 page
- Anonymous rate limiting (5 links/day)
- Full link dashboard — search, filter, bulk delete

---

## Prerequisites

- Node.js 18+
- A [Convex](https://convex.dev) account (free)
- A [Clerk](https://clerk.com) account (free)

---

## Setup

### 1. Clone and install dependencies

```bash
git clone <your-repo-url>
cd scissors
npm install
```

---

### 2. Set up Convex

Convex is the backend — it stores links, tracks clicks, and handles redirects.

**a) Create a Convex account**

Go to [convex.dev](https://convex.dev) and sign up.

**b) Initialize Convex in the project**

```bash
npx convex dev
```

On first run it will:
- Open a browser to log you in
- Ask: *"Create a new project or use an existing one?"* → choose **Create new project**
- Name it `scissors`
- Automatically push your schema and functions to the cloud
- Write your `VITE_CONVEX_URL` to `.env.local`

> Keep this terminal running — it watches for changes and syncs them live.

**c) Note your Convex URL**

After `npx convex dev` runs, your `.env.local` will have:
```
VITE_CONVEX_URL=https://your-deployment.convex.cloud
```

---

### 3. Set up Clerk

Clerk handles user authentication.

**a) Create a Clerk account**

Go to [clerk.com](https://clerk.com) and sign up.

**b) Create an application**

1. Click **Create application**
2. Name it `Scissor`
3. Choose your sign-in methods (e.g. Google, Email) → click **Create**

**c) Get your Publishable Key**

1. In the Clerk dashboard, go to **API Keys**
2. Copy the **Publishable key** — it starts with `pk_test_...`

**d) Add it to `.env.local`**

```
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
```

**e) Connect Clerk to Convex (JWT integration)**

This lets Convex verify Clerk-issued tokens so it knows who is signed in.

1. In the Clerk dashboard → **Configure** → **JWT Templates**
2. Click **New template** → select **Convex**
3. Leave the defaults → click **Save**
4. Copy the **Issuer URL** shown on that page (looks like `https://your-app.clerk.accounts.dev`)

5. Go to your [Convex dashboard](https://dashboard.convex.dev) → select your `scissors` deployment → **Settings** → **Environment Variables**
6. Add a new variable:
   - Key: `CLERK_JWT_ISSUER_DOMAIN`
   - Value: the Issuer URL you copied above

---

### 4. Final `.env.local`

Your `.env.local` should look like this:

```env
VITE_CONVEX_URL=https://your-deployment.convex.cloud
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
```

> `.env.local` is gitignored — never commit it.

---

## Running the app

You need **two terminals** running simultaneously:

**Terminal 1 — Convex backend (keep running):**
```bash
npx convex dev
```

**Terminal 2 — Vite frontend:**
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

---

## Running tests

**Unit + component tests (Vitest):**
```bash
npm run test:run
```

**E2E tests (Playwright) — requires the dev server to be running:**
```bash
npm run test:e2e
```

---

## Project structure

```
scissors/
├── convex/                  # Backend (runs on Convex cloud)
│   ├── schema.ts            # Database tables: links, clicks, rateLimits
│   ├── links.ts             # Mutations & queries for link CRUD
│   ├── analytics.ts         # Click tracking and aggregation queries
│   ├── http.ts              # HTTP redirect handler (302 / 410)
│   ├── crons.ts             # Daily job to mark expired links
│   └── auth.config.ts       # Clerk JWT configuration
│
├── src/
│   ├── components/
│   │   ├── ShortenForm.tsx        # Main URL shortening form
│   │   ├── QRCodeDisplay.tsx      # QR code renderer + download
│   │   ├── LinkDashboard.tsx      # Dashboard shell
│   │   ├── LinkTable.tsx          # Links table with actions
│   │   ├── AnalyticsDashboard.tsx # Recharts analytics charts
│   │   ├── BulkDeleteDialog.tsx   # Bulk delete confirmation
│   │   └── ui/                    # Button, Input, Modal primitives
│   ├── hooks/
│   │   ├── useDebounce.ts         # Debounce hook
│   │   └── useSlugCheck.ts        # Real-time slug availability check
│   ├── lib/
│   │   ├── slugUtils.ts           # Slug generation & validation
│   │   ├── urlValidation.ts       # URL validation & blocklist check
│   │   ├── blocklist.ts           # Known phishing domains
│   │   └── deviceParser.ts        # UA → device type
│   └── pages/
│       ├── HomePage.tsx           # Landing page + shorten form
│       ├── DashboardPage.tsx      # Auth-protected link dashboard
│       ├── RedirectPage.tsx       # /:slug catch-all redirect
│       └── ExpiredPage.tsx        # 410 branded expiry page
│
└── tests/
    ├── unit/                # Vitest unit tests (slug, URL, expiry)
    ├── components/          # Vitest + RTL component tests
    └── e2e/                 # Playwright E2E tests
```

---

## How redirects work

Short URLs are handled by a React Router catch-all route (`/:slug`). When a user visits `/abc123`, the `RedirectPage` component queries Convex for the slug and calls `window.location.replace(originalUrl)` — resulting in a seamless redirect. Expired links redirect to `/expired`.

---

## Deployment

1. Push your code to GitHub
2. Connect the repo to [Vercel](https://vercel.com)
3. Add your environment variables in the Vercel dashboard:
   - `VITE_CONVEX_URL`
   - `VITE_CLERK_PUBLISHABLE_KEY`
4. Deploy — Convex cloud handles the backend automatically
