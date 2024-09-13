import * as core from '@actions/core'
import * as github from '@actions/github'
import { calcTechDept } from './calc-tech-dept.mjs'
import {
  createOctokit,
  createComment,
  findAndUpdateComment
} from './octokit.mjs'

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run() {
  const octokit = createOctokit()
  try {
    const techDept = await calcTechDept()

    // output result in table format to pull request comment
    const tableContent = Object.entries(techDept)
      .map(([key, value]) => `| ${key} | ${value} |`)
      .join('\n')

    const commentTitle = '### Tech debt'
    const comment = `${commentTitle}\n\n| type | count |\n|---|---|\n${tableContent}`
    core.debug(comment)

    const updateResult = await findAndUpdateComment(
      octokit,
      github.context,
      commentTitle,
      comment
    )
    if (updateResult) {
      core.debug('Updated the existing comment')
      return
    }

    await createComment(octokit, github.context, comment)
  } catch (error) {
    // Fail the workflow run if an error occurs
    core.setFailed(error.message)
  }
}
