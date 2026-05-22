import rosterOverrides from "@/data/roster-overrides.json";
import { normalizeHandle } from "@/lib/comms";

const DEFAULT_OWNER = "rogerSuperBuilderAlpha";
const DEFAULT_REPO = "cursor-boston";

const CACHE_TTL_MS = 60 * 60 * 1000;

/** Cohort submission branches and their JSON submission directories. */
const SUBMISSION_SOURCES: ReadonlyArray<{
  branch: string;
  dirPath: string;
}> = [
  {
    branch: "c1w1pm-submission",
    dirPath: "content/summer-cohort/c1/w1-pm/submissions",
  },
  {
    branch: "c1w2comms-submission",
    dirPath: "content/summer-cohort/c1/w2-comms/submissions",
  },
  {
    branch: "c1w3mkt-submission",
    dirPath: "content/summer-cohort/c1/w3-mkt/submissions",
  },
  {
    branch: "c1w4edu-submission",
    dirPath: "content/summer-cohort/c1/w4-edu/submissions",
  },
  {
    branch: "c1w5startup-submission",
    dirPath: "content/summer-cohort/c1/w5-startup/submissions",
  },
  {
    branch: "c1w6oss-submission",
    dirPath: "content/summer-cohort/c1/w6-oss/submissions",
  },
];

const COHORT_SUBMISSION_BRANCHES = SUBMISSION_SOURCES.map((source) => source.branch);

interface ContentsApiItem {
  name?: unknown;
  type?: unknown;
  download_url?: unknown;
}

interface GitHubPullApiItem {
  merged_at?: unknown;
  base?: { ref?: unknown } | null;
  user?: { login?: unknown } | null;
}

interface RosterCache {
  handles: Set<string>;
  fetchedAt: number;
}

let rosterCache: RosterCache | null = null;

function getGithubRepoPair(): { owner: string; repo: string } {
  return {
    owner: process.env.GITHUB_REPO_OWNER || DEFAULT_OWNER,
    repo: process.env.GITHUB_REPO_NAME || DEFAULT_REPO,
  };
}

function githubHeaders(): HeadersInit {
  const token = process.env.GITHUB_TOKEN;
  return {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function addHandle(set: Set<string>, handle: string | null | undefined): void {
  if (!handle) return;
  const normalized = normalizeHandle(handle);
  if (normalized.length > 0) {
    set.add(normalized);
  }
}

function loadOverrideHandles(): string[] {
  const raw = rosterOverrides as { handles?: unknown };
  if (!Array.isArray(raw.handles)) return [];
  return raw.handles
    .filter((value): value is string => typeof value === "string")
    .map((value) => normalizeHandle(value))
    .filter((value) => value.length > 0);
}

async function fetchSubmissionHandles(
  owner: string,
  repo: string,
  handles: Set<string>
): Promise<void> {
  for (const source of SUBMISSION_SOURCES) {
    const url = new URL(
      `https://api.github.com/repos/${owner}/${repo}/contents/${source.dirPath}`
    );
    url.searchParams.set("ref", source.branch);

    const response = await fetch(url.toString(), {
      headers: githubHeaders(),
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      continue;
    }

    const items = (await response.json()) as ContentsApiItem[];
    if (!Array.isArray(items)) continue;

    for (const item of items) {
      if (item.type !== "file" || typeof item.name !== "string") continue;
      if (!item.name.endsWith(".json")) continue;
      if (typeof item.download_url !== "string") continue;

      try {
        const fileResponse = await fetch(item.download_url, {
          headers: githubHeaders(),
          next: { revalidate: 3600 },
        });
        if (!fileResponse.ok) continue;
        const payload = (await fileResponse.json()) as Record<string, unknown>;
        addHandle(
          handles,
          typeof payload.githubHandle === "string" ? payload.githubHandle : null
        );
      } catch {
        // Skip unreadable submission files.
      }
    }
  }
}

async function fetchMergedPrAuthors(
  owner: string,
  repo: string,
  handles: Set<string>
): Promise<void> {
  for (const baseBranch of COHORT_SUBMISSION_BRANCHES) {
    const url = new URL(
      `https://api.github.com/repos/${owner}/${repo}/pulls`
    );
    url.searchParams.set("state", "closed");
    url.searchParams.set("base", baseBranch);
    url.searchParams.set("per_page", "100");

    const response = await fetch(url.toString(), {
      headers: githubHeaders(),
      next: { revalidate: 3600 },
    });

    if (!response.ok) continue;

    const pulls = (await response.json()) as GitHubPullApiItem[];
    if (!Array.isArray(pulls)) continue;

    for (const pull of pulls) {
      if (typeof pull.merged_at !== "string" || pull.merged_at.length === 0) {
        continue;
      }
      addHandle(
        handles,
        typeof pull.user?.login === "string" ? pull.user.login : null
      );
    }
  }
}

async function buildRosterSet(): Promise<Set<string>> {
  const handles = new Set<string>();
  for (const handle of loadOverrideHandles()) {
    handles.add(handle);
  }

  const { owner, repo } = getGithubRepoPair();
  await Promise.all([
    fetchSubmissionHandles(owner, repo, handles),
    fetchMergedPrAuthors(owner, repo, handles),
  ]);

  return handles;
}

export async function getCohortRoster(): Promise<string[]> {
  const now = Date.now();
  if (rosterCache && now - rosterCache.fetchedAt < CACHE_TTL_MS) {
    return [...rosterCache.handles].sort((a, b) => a.localeCompare(b));
  }

  const handles = await buildRosterSet();
  rosterCache = { handles, fetchedAt: now };
  return [...handles].sort((a, b) => a.localeCompare(b));
}

export async function isHandleAllowed(handle: string): Promise<boolean> {
  const normalized = normalizeHandle(handle);
  if (!normalized) return false;
  const roster = await getCohortRoster();
  return roster.includes(normalized);
}
