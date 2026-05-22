# Cohort Comms (C1 Week 2)

Simple cohort communication tool for the Cursor Boston summer cohort.

## Channels

- `#general` — cohort-wide discussion
- `#cursor-help` — questions about Cursor
- `#app-feedback` — testing or feedback requests for your app

## Login

No OAuth — pick your GitHub handle. Only handles on the cohort roster can post. The roster is built from:

- `githubHandle` values in cohort submission JSON files on `c1w*-submission` branches
- authors of merged PRs into those branches
- optional entries in [`data/roster-overrides.json`](data/roster-overrides.json)

## Run locally

From this folder:

```bash
npm install
cp .env.local.example .env.local   # fill in YOUR Firebase project values
npm run dev
```

Open http://localhost:3001

## Environment variables

Copy [`.env.local.example`](.env.local.example) to `.env.local` and fill in values from **your** Firebase project (not the cursor-boston monorepo unless you have access).

- `NEXT_PUBLIC_FIREBASE_*` — client reads from Firestore
- `FIREBASE_SERVICE_ACCOUNT_JSON` — server writes messages
- `GITHUB_TOKEN` — roster fetch (recommended)

## Use your own Firebase project

This app does **not** have to use the cursor-boston Firebase project. To switch accounts:

1. **Log out of the wrong Google account**
   ```bash
   npx firebase-tools@latest logout
   npx firebase-tools@latest login
   ```

2. **Create or pick a project** at [Firebase Console](https://console.firebase.google.com) (enable **Firestore**).

3. **Register a web app** → copy the `firebaseConfig` values into `.env.local` and Vercel env vars.

4. **Service account** → Project settings → Service accounts → Generate new private key → set `FIREBASE_SERVICE_ACCOUNT_JSON` on Vercel (single-line JSON).

5. **Deploy rules + index** from this folder:
   ```bash
   cd projects/c1w2-comms
   npx firebase-tools@latest use --add YOUR_PROJECT_ID
   npx firebase-tools@latest deploy --only firestore
   ```

6. **Update Vercel** → [c1w2-comms env vars](https://vercel.com/jonathanlittels-projects/c1w2-comms/settings/environment-variables) with the new values → **Redeploy**.

## Submission

PR target branch: `c1w2comms-submission`

Metadata file: `content/summer-cohort/c1/w2-comms/submissions/<github-handle>.json`
