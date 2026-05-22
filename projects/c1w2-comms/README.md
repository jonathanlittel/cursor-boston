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
cp ../../.env.local .env.local   # needs Firebase + GITHUB_TOKEN
npm run dev
```

Open http://localhost:3001

## Environment variables

- `NEXT_PUBLIC_FIREBASE_*` — client reads from Firestore
- `FIREBASE_SERVICE_ACCOUNT_JSON` — server writes messages
- `GITHUB_TOKEN` — roster fetch (recommended)

## Submission

PR target branch: `c1w2comms-submission`

Metadata file: `content/summer-cohort/c1/w2-comms/submissions/<github-handle>.json`
