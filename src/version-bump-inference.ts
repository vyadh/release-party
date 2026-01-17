import { maxImpact, messageImpact } from "./conventional-commits"
import type { PullRequest } from "./pull-requests"
import type { VersionIncrement } from "./versions"

/**
 * Infers the maximum version impact from a set of pull requests.
 */
export function inferImpactFromPRs(prs: PullRequest[]): VersionIncrement {
  return maxImpact(prs.map(inferVersionImpactFromPR))
}

function inferVersionImpactFromPR(pr: PullRequest): VersionIncrement {
  return messageImpact(pr.title)
}
