# QAH Material Testing MVP

A small, mobile-first material testing monitor built to replace repetitive Google Sheets work:

**Project → Item → Tests Conducted → Photo/PDF Evidence**

The UI intentionally avoids wide spreadsheet-style tables. The app organizes the data for the user, surfaces tests that need attention, and keeps repetitive encoding fast.


## Visual direction

This build uses the supplied MPW BARMM seal as the institutional anchor and a restrained palette derived from it: deep navy/blue for structure and actions, gold as a small accent, and neutral off-white surfaces for long-form office use. Typography uses a refined native system stack (Aptos / Segoe UI Variable where available) so there is no external font request or bundled font file.

The visual refresh intentionally avoids dashboard-template patterns: no decorative gradients, oversized stat cards, glass effects, or wide data tables. Information hierarchy stays project → item → test, with the same no-horizontal-scroll behavior on mobile.

## MVP workflow

1. Sign in.
2. Find or create a project.
3. Open the project and select an item.
4. Record a test with date, result, remarks, and optional evidence.
5. Review test history per item or export the project to CSV when a spreadsheet/report copy is still needed.

## Included

### Projects
- Search by project ID, name, location, contractor, or project staff
- Filter by project status
- Recently active projects stay near the top as items/tests are added or edited
- Project location
- Contractor and project team fields
- Physical accomplishment and status
- Automatic test count and **Needs attention** count
- Latest failed/pending tests surfaced on the project page
- CSV export of project items and test records

### Faster encoding
- Add one project item normally
- **Paste multiple items directly from two Google Sheets columns**
- Duplicate item numbers are skipped automatically
- Search items inside projects when the list gets long
- Test date defaults to today
- Test-name suggestions learn from names already used in the same project; there is no rigid test-type list
- **Save & add another** for consecutive encoding
- **Record again** reuses a previous test name without copying the whole record
- Tests can be edited later instead of forcing users to work around typos
- Project items can be edited by Admins
- Test history can be searched and filtered by result

### Evidence storage
- Private Cloudflare R2 bucket
- Browser uploads directly to R2 using short-lived presigned URLs
- DB stores object keys and metadata, not file bytes
- JPG/PNG/WebP and browser-readable phone image formats are optimized to WebP/JPEG before upload
- Photos up to 30 MB may be selected; the browser resizes/compresses them before storage
- Target optimized photo size is roughly under 900 KB when practical, with max dimensions reduced progressively
- PDFs remain capped at 10 MB
- Up to 5 files per upload action and 20 evidence files per test
- Evidence can be removed cleanly from both R2 and the database when uploaded by mistake
- R2 object is HEAD-verified before attachment metadata is committed

### Access/security
- Username/password login
- bcrypt-hashed passwords
- Signed HttpOnly session cookie
- Server-side authentication checks
- Admin and User roles
- Private file bucket and temporary signed view links
- Upload MIME/size verification
- No public registration

## Roles

- **ADMIN**: create/edit projects, add/edit project items, record/edit tests, upload evidence.
- **USER**: view projects/items, record/edit tests, upload evidence.

The MVP intentionally avoids enterprise SSO, MFA, complex permission matrices, notifications, and approval workflows.

## Stack

- Next.js 15 / React 19 / TypeScript
- Prisma + PostgreSQL
- Cloudflare R2
- Plain CSS

## Updating an existing MVP database

`Project.location` is nullable at the database level so an existing database can be upgraded without breaking old project rows. The create/edit UI requires a location going forward.

After pulling this version, run:

```bash
npm install
npm run db:push
```

Then existing projects can be edited to add their location.

## Local setup

1. Copy `.env.example` to `.env`.
2. Set `DATABASE_URL` to a PostgreSQL database (Neon or Supabase Postgres is fine).
3. Set a long random `SESSION_SECRET` (32+ characters).
4. Create a **private** Cloudflare R2 bucket and add the four `R2_*` values.
5. Install dependencies:

```bash
npm install
```

6. Create DB tables and seed the admin account:

```bash
npm run db:push
npm run db:seed
```

7. Start:

```bash
npm run dev
```

Open `http://localhost:3000` and sign in using `SEED_ADMIN_USERNAME` / `SEED_ADMIN_PASSWORD` from `.env`.

## R2 CORS

Uploads go directly from the browser to R2, so configure bucket CORS for your app origin and `PUT` requests:

```json
[
  {
    "AllowedOrigins": ["http://localhost:3000", "https://YOUR-APP.vercel.app"],
    "AllowedMethods": ["PUT"],
    "AllowedHeaders": ["Content-Type"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

Keep the bucket private. `/api/attachments/:id` checks the logged-in user and creates a short-lived signed GET URL.

## File limits

- Photos: source selection up to 30 MB; optimized before upload
- PDFs: 10 MB max
- Stored/uploaded object: 10 MB max
- Up to 5 selected files per upload action
- Up to 20 total attachments per test

## Deployment

For Vercel, add the same environment variables in Project Settings and deploy. Run `npm run db:push` against the production database after this update, then `npm run db:seed` only when you intentionally want to create/update the seeded admin account.

For office rollout, replace the example seed password, keep DB/R2 credentials server-side, and use a long unique `SESSION_SECRET`.
