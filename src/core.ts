import { Octokit } from "octokit"
import { fetchReleases } from "./releases.js"
import { fetchPullRequests, PullRequest } from "./pull-requests.js"
import { createDraftRelease, Release, updateRelease } from "./release.js"
import { bumpTag, VersionIncrement } from "./versions.js"
import { inferImpactFromPRs } from "./version-bump-inference.js"

// todo need to re-generate release notes
// todo also need a version that just infers the next tag for running on feature branches

export interface UpsertedReleaseResult {
  release: Release | null
  action: "created" | "updated" | "none"
  version: string | null
  pullRequestCount: number
  versionIncrement: VersionIncrement
}

/**
 * Upserts (creates or updates) a draft release based on merged pull requests since the last release.
 *
 * This function:
 * 1. Fetches the last draft release and last published release for the branch
 * 2. Collects all pull requests merged since the last published release
 * 3. Infers the version increment from conventional commit messages in PR titles
 * 4. Updates existing draft release or creates a new one with the calculated version
 * 5. Does nothing if there are no new pull requests
 *
 * @param defaultTag - Default tag to use when no prior release exists (e.g. "v0.1.0")
 * @returns Result containing the release, action taken, and metadata
 */
export async function upsertDraftRelease(
  octokit: Octokit,
  owner: string,
  repo: string,
  branch: string,
  defaultTag: string
): Promise<UpsertedReleaseResult> {
  const context = await gatherReleaseContext(octokit, owner, repo, branch)

  if (context.pullRequests.length === 0) {
    return {
      release: null,
      action: "none",
      version: null,
      pullRequestCount: 0,
      versionIncrement: "none"
    }
  }

  const versionIncrement = inferImpactFromPRs(context.pullRequests)
  const nextVersion = calculateNextVersion(context.lastRelease, versionIncrement, defaultTag)

  const { release, action } = await performUpsert(
    octokit,
    owner,
    repo,
    branch,
    nextVersion,
    context.lastDraft
  )

  return {
    release,
    action,
    version: nextVersion,
    pullRequestCount: context.pullRequests.length,
    versionIncrement
  }
}

async function gatherReleaseContext(
  octokit: Octokit,
  owner: string,
  repo: string,
  branch: string
): Promise<ReleaseContext> {
  const releases = fetchReleases(octokit, owner, repo)

  // Finding releases needs to run sequentially to avoid racing on the cached data
  const lastDraft = await releases.findLastDraft(branch)
  const lastRelease = await releases.findLast(branch)

  const mergedSince = lastRelease?.publishedAt ?? null
  const pullRequests = await fetchPullRequests(octokit, owner, repo, branch, mergedSince).collect()

  return {
    lastDraft,
    lastRelease,
    pullRequests
  }
}

interface ReleaseContext {
  lastDraft: Release | null
  lastRelease: Release | null
  pullRequests: PullRequest[]
}

function calculateNextVersion(
  lastRelease: Release | null,
  increment: VersionIncrement,
  defaultTag: string
): string {
  return bumpTag(lastRelease?.tagName, increment, defaultTag)
}

// todo should really use a context object for octokit/owner/repo/branch...
async function performUpsert(
  octokit: Octokit,
  owner: string,
  repo: string,
  branch: string,
  nextVersion: string,
  existingDraft: Release | null
): Promise<{ release: Release; action: "created" | "updated" }> {
  if (existingDraft) {
    const release = await updateRelease(octokit, owner, repo, {
      ...existingDraft,
      name: nextVersion,
      tagName: nextVersion
    })
    return { release, action: "updated" }
  } else {
    const release = await createDraftRelease(octokit, owner, repo, nextVersion, branch, nextVersion)
    return { release, action: "created" }
  }
}
