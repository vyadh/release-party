
/** Which part of the version to increment, or "none" to leave unchanged. */
export type VersionIncrement = VersionComponent | "none"

/** The part of the version to increment as understood by `semver` library. */
export type VersionComponent = "major" | "minor" | "patch"
