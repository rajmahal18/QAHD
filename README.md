# QAH Material Testing MVP

A small, mobile-first material testing monitor built to replace repetitive Google Sheets work:

**Project → Item → Tests Conducted → Photo/PDF Evidence**

The app stays intentionally simple: no wide spreadsheet-style tables, no dashboard clutter, and no complex workflow engine.

## v0.5 additions

### Accounts
- Admin-only **Accounts** page
- Personal **My account** page for every user
- Add/edit accounts with simple usernames
- Admin password reset using a temporary password
- Active/inactive account control
- Temporary-password flag after account creation/reset
- Users can change their own password after entering the current password
- Existing seeded admin is left untouched by the v0.5 upgrade
- `db:seed` now creates the configured admin only if it does not already exist; rerunning it no longer resets an existing password

The supplied safe upgrade creates these missing users as normal `USER` accounts:
- Janiza Maraki → `janizamaraki`
- Mahadiya Madeed → `mahadiyamadeed`
- LMTS → `lmts`

Temporary passwords are generated at upgrade time and printed once in the terminal. Existing usernames are skipped without modification.

### Test dates
The old single test date is replaced in the UI by:
- **Date Sampled**
- **Date Submitted**
- **Date Tested**

For new tests, at least one date is required. Date Tested becomes required once a result is marked Passed or Failed. Existing test dates are preserved by safely copying the old Date Conducted value into Date Tested during the v0.5 database upgrade. The legacy `conductedAt` column remains in place as an internal compatibility/sorting field, so no existing test row is dropped or rewritten destructively.

CSV export now includes all three explicit dates.

## Existing core workflow

- Search/filter projects
- Project location + optional Leaflet/OpenStreetMap pin
- Google Maps handoff
- Items per project
- Bulk item paste from Google Sheets
- Multiple tests per item
- Result/remarks/evidence
- Test-name suggestions
- Save & add another
- Record again
- Search/filter test history
- Private Cloudflare R2 evidence uploads
- Image resizing/compression before storage
- CSV export
- Admin/User roles

## Safe production database upgrade

Before deploying v0.5 against an existing production database, make sure your local `.env` points to the intended production database, then run:

```bash
npx tsx prisma/upgrade-v05-safe.ts
npx prisma generate
```

The first command is idempotent and intentionally limited. It:
1. Adds the new nullable test-date columns and account-state columns.
2. Backfills only missing new test dates from the existing legacy test date.
3. Creates the three named accounts only when their usernames do not already exist.
4. Never deletes/truncates tables, never resets existing passwords, and never modifies projects/items/attachments/results/remarks.

Copy the temporary passwords printed by the script before closing the terminal.

You can also use:

```bash
npm run db:upgrade-v05
```

## Local setup

1. Copy `.env.example` to `.env`.
2. Set `DATABASE_URL`.
3. Set a 32+ character `SESSION_SECRET`.
4. Add your private Cloudflare R2 credentials.
5. Install dependencies:

```bash
npm install
```

For a brand-new database:

```bash
npm run db:push
npm run db:seed
npm run dev
```

For an existing v0.4 database, use the v0.5 safe upgrade above instead of relying on a destructive reset.

## R2 CORS

Uploads go directly from the browser to R2. Allow your real app origin:

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

Keep the bucket private.

## Deployment

The repo includes:

```json
{
  "regions": ["sin1"]
}
```

in `vercel.json` so Vercel functions are pinned to Singapore.

Run the safe database upgrade against production **before** sending production traffic to the v0.5 build. Vercel build already runs `prisma generate` through the existing build script.
