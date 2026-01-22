import type { Context } from "@/context"

/**
 * Generates release notes content for a release using GitHub's auto-generated release notes.
 * The release notes are not saved anywhere and are intended to be used when creating a new release.
 *
 * @param context The GitHub context containing octokit, owner, and repo
 * @param tagName The tag name for the release
 * @param targetCommitish The commitish value that will be the target for the release's tag
 * @param previousTagName The name of the previous tag to use as the starting point for the release notes
 * @returns A string containing the generated release notes body
 */
export async function generateReleaseNotes(
  context: Context,
  tagName: string,
  targetCommitish: string,
  previousTagName: string
): Promise<string> {
  const response = await context.octokit.rest.repos.generateReleaseNotes({
    owner: context.owner,
    repo: context.repo,
    tag_name: tagName,
    target_commitish: targetCommitish,
    previous_tag_name: previousTagName
  })

  return response.data.body
}
