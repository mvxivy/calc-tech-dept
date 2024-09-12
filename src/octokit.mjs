import * as core from '@actions/core'
import * as github from '@actions/github'

const createOctokit = () => {
  const token = core.getInput('github-token').trim()
  return github.getOctokit(token)
}

export { createOctokit }
