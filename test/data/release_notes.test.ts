import { beforeEach, describe, expect, it } from "vitest"
import type { Context } from "@/context"
import { generateReleaseNotes } from "@/data/release_notes"
import { Octomock } from "../octomock/octomock"

describe("generateReleaseNotes", () => {
  let octomock: Octomock
  let context: Context

  beforeEach(() => {
    octomock = new Octomock()
    context = {
      octokit: octomock.octokit,
      owner: "test-owner",
      repo: "test-repo",
      branch: "main"
    }
  })

  it("should generate release notes with correct parameters", async () => {
    const notes = await generateReleaseNotes(context, "v2.0.0", "main", "v1.0.0")

    expect(octomock.generateReleaseNotes).toHaveBeenCalledWith({
      owner: "test-owner",
      repo: "test-repo",
      tag_name: "v2.0.0",
      target_commitish: "main",
      previous_tag_name: "v1.0.0"
    })

    expect(notes).toBe("## What's Changed\n\n* Changes from v1.0.0 to v2.0.0\n* Target: main")
  })

  it("should return release notes body as a string", async () => {
    const notes = await generateReleaseNotes(context, "v3.0.0", "develop", "v2.5.0")

    expect(typeof notes).toBe("string")
    expect(notes).toContain("v3.0.0")
    expect(notes).toContain("v2.5.0")
    expect(notes).toContain("develop")
  })

  it("should handle different tag formats", async () => {
    const notes = await generateReleaseNotes(context, "1.0.0", "feature-branch", "0.9.0")

    expect(octomock.generateReleaseNotes).toHaveBeenCalledWith({
      owner: "test-owner",
      repo: "test-repo",
      tag_name: "1.0.0",
      target_commitish: "feature-branch",
      previous_tag_name: "0.9.0"
    })

    expect(notes).toContain("1.0.0")
    expect(notes).toContain("0.9.0")
  })

  it("should handle API errors gracefully", async () => {
    octomock.injectGenerateReleaseNotesError({ message: "Repository not found", status: 404 })

    // noinspection ES6RedundantAwait
    await expect(
      generateReleaseNotes(
        {
          ...context,
          repo: "nonexistent-repo"
        },
        "v1.0.0",
        "main",
        "v0.9.0"
      )
    ).rejects.toThrow("Repository not found")
  })

  it("should handle authentication errors", async () => {
    octomock.injectGenerateReleaseNotesError({ message: "Bad credentials", status: 401 })

    // noinspection ES6RedundantAwait
    await expect(generateReleaseNotes(context, "v1.0.0", "main", "v0.9.0")).rejects.toThrow("Bad credentials")
  })

  it("should handle permission errors", async () => {
    octomock.injectGenerateReleaseNotesError({ message: "Forbidden", status: 403 })

    // noinspection ES6RedundantAwait
    await expect(generateReleaseNotes(context, "v2.0.0", "main", "v1.0.0")).rejects.toThrow("Forbidden")
  })

  it("should handle tag not found errors", async () => {
    octomock.injectGenerateReleaseNotesError({ message: "No common ancestor", status: 422 })

    // noinspection ES6RedundantAwait
    await expect(generateReleaseNotes(context, "v3.0.0", "main", "invalid-tag")).rejects.toThrow(
      "No common ancestor"
    )
  })
})
