import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

let adminDb: Firestore | null = null;

function parseServiceAccount(): Record<string, unknown> | null {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw) return null;

  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON is not valid JSON");
  }
}

function getAdminApp(): App | null {
  const existingApp = getApps()[0];
  if (existingApp) return existingApp;

  const serviceAccount = parseServiceAccount();
  if (!serviceAccount) return null;

  return initializeApp({
    credential: cert(serviceAccount as Parameters<typeof cert>[0]),
    projectId:
      typeof serviceAccount.project_id === "string"
        ? serviceAccount.project_id
        : process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  });
}

export function getAdminDb(): Firestore | null {
  if (adminDb) return adminDb;

  const app = getAdminApp();
  if (!app) return null;

  adminDb = getFirestore(app);
  return adminDb;
}
