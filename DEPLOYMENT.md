# Deployment & change workflow

## Daily workflow

1. Open the project and pull the latest code:
   ```powershell
   cd C:\Users\Akash\OneDrive\Desktop\portfolio
   git pull
   ```
2. Run the site locally:
   ```powershell
   cd frontend
   npm run dev
   ```
   The frontend runs on `http://localhost:5173` and proxies `/api` to `http://localhost:5000`.
3. Make changes, test them, then commit and push:
   ```powershell
   git add .
   git commit -m "Describe the change"
   git push
   ```
4. Vercel redeploys automatically after a push to `main`.
   Render (backend) also redeploys automatically if it is connected to the same repository.

For risky changes, use a branch and open a Pull Request. Vercel creates a preview URL for every branch, and the backend now allows `https://portfolio-*.vercel.app` preview origins.

## One-time production settings (important)

### Render (backend)

Set these in the Render dashboard → Environment:

| Variable | Value |
|---|---|
| `NODE_ENV` | `production` |
| `CORS_ORIGIN` | `https://portfolio-omega-ochre-71.vercel.app,http://localhost:5173` |
| `JWT_SECRET` | A random 64-character string (see command below) |
| `ADMIN_PASS` | A new strong password (not `Admin@1234`) |
| `ADMIN_USER` | `admin` (or your preferred username) |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_KEY` | Supabase **service_role** key (server only) |
| `MAIL_USER` / `MAIL_PASS` | Gmail address + Gmail app password |
| `ADMIN_EMAIL` | Where contact notifications should go |

Generate a JWT secret:

```powershell
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

> If `ADMIN_PASS` is still the old default, the API now **disables admin login** (HTTP 503) until a strong password is set. This is intentional. Set the password before merging/deploying.

### Vercel (frontend)

Project → Settings → Environment Variables:

| Variable | Value |
|---|---|
| `VITE_API_URL` | `https://portfolio-rura.onrender.com/api` |
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase **anon/publishable** key |

Also confirm Project → Settings → General → **Root Directory** is `frontend`.

## Security notes

- Never commit `backend/.env` or `frontend/.env`. Both are gitignored; use the provided `.env.example` files as templates.
- The Supabase `service_role` key must only ever exist on the backend. The frontend must use the anon key.
- Admin tokens are JWTs and expire automatically (`JWT_EXPIRES_IN`, default 8h).
- If you have ever pasted the service key or admin password into a public place, rotate them in Supabase/Render.
- The API now only accepts JPG/PNG/GIF/WebP/PDF (plus MP4/WebM/OGG/MOV for media uploads), so SVG and HTML uploads are blocked.
- Vercel now sends a Content-Security-Policy and other security headers (`frontend/vercel.json`).

## Adding a resume PDF

1. Upload the PDF somewhere public (Supabase Storage is fine).
2. In the site, log in at `/admin` → **Settings** → **Resume URL**, paste the URL, and save.
3. The Resume page shows a **Download CV** button when a URL is configured. Without one, it offers **Print / Save as PDF**.

## Changing site content

Most text and projects are database-driven:

- **Admin → Projects** for projects, cover images, galleries, publish state.
- **Admin → Skills / Experience / Education** for the resume pages.
- **Admin → Settings** for the resume URL and social links.
- Static page copy lives in `frontend/src/pages/` and `frontend/src/components/sections/`.

## If the live site breaks

1. Vercel → Deployments: open the failed deployment and read the build log.
2. Render → Logs: check for `[SECURITY CONFIG ERROR]`, CORS messages, or Supabase errors.
3. Vercel can instantly roll back to the previous deployment from the Deployments page.
