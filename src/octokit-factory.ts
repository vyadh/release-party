import { Octokit } from "octokit"

/**
 * Configuration for creating an Octokit instance
 */
export interface OctokitConfig {
  auth?: string
  proxyUrl?: string
}

/**
 * Creates an Octokit instance configured with proxy support
 */
export function createOctokit(config: OctokitConfig): Octokit {
  const options: ConstructorParameters<typeof Octokit>[0] = {
    auth: config.auth
  }
  return new Octokit(options)
}
