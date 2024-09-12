import * as core from '@actions/core'
import { calcTechDept } from './calc-tech-dept.mjs'
// import { createOctokit } from './octokit.mjs'

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run() {
  // const oktokit = createOctokit()

  try {
    await calcTechDept()
  } catch (error) {
    // Fail the workflow run if an error occurs
    core.setFailed(error.message)
  }
}
