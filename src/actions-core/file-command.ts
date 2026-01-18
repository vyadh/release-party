/**
 * GitHub related functions. See comment in `core.ts`.
 */

import * as crypto from "node:crypto"
import * as fs from "node:fs"
import * as os from "node:os"
import { type DataItem, toCommandValue } from "@/actions-core/utils"

export function issueFileCommand(command: string, message: DataItem): void {
  const filePath = process.env[`GITHUB_${command}`]
  if (!filePath) {
    throw new Error(`Unable to find environment variable for file command ${command}`)
  }
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing file at path: ${filePath}`)
  }

  fs.appendFileSync(filePath, `${toCommandValue(message)}${os.EOL}`, {
    encoding: "utf8"
  })
}

export function prepareKeyValueMessage(key: string, value: DataItem): string {
  const delimiter = `ghadelimiter_${crypto.randomUUID()}`
  const convertedValue = toCommandValue(value)

  // These should realistically never happen, but just in case someone finds a
  // way to exploit uuid generation let's not allow keys or values that contain
  // the delimiter.
  if (key.includes(delimiter)) {
    throw new Error(`Unexpected input: name should not contain the delimiter "${delimiter}"`)
  }

  if (convertedValue.includes(delimiter)) {
    throw new Error(`Unexpected input: value should not contain the delimiter "${delimiter}"`)
  }

  return `${key}<<${delimiter}${os.EOL}${convertedValue}${os.EOL}${delimiter}`
}
