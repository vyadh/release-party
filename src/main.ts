// import { run } from "./cli"
import { getInput, info, setFailed, setOutput } from "./github/core"

export async function main(): Promise<void> {
  try {
    const question: string = getInput("question")
    info(`The question is: ${question}`)

    // Main logic here to check bundle size
    // run()

    setOutput("answer", 42)
  } catch (error) {
    if (error instanceof Error) setFailed(error.message)
  }
}
