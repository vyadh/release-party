/**
 * GitHub related functions.
 *
 * This avoids use of `@actions/core`, which massively increases (quadruples) the bundle size
 * despite only needing a few simple functions.
 *
 * This largely copies what we need from, which is under the same MIT licence:
 * https://github.com/actions/toolkit/blob/main/packages/core/src/file-command.ts
 */

// We use any as a valid input type
/* eslint-disable @typescript-eslint/no-explicit-any */

import * as crypto from "crypto"
import * as fs from "fs"
import * as os from "os"
import { toCommandValue } from "./utils"

export function issueFileCommand(command: string, message: any): void {
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

export function prepareKeyValueMessage(key: string, value: any): string {
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
