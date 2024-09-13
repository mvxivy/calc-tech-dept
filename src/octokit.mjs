import * as core from '@actions/core'
import * as github from '@actions/github'

export const createOctokit = () => {
  const token = core.getInput('GITHUB_TOKEN').trim()
  return github.getOctokit(token)
}

const getPullRequestNumber = context => {
  const prNumber =
    core.getInput('pull-request-number') ?? context.payload.pull_request.number
  if (!prNumber) {
    core.setFailed('Could not get pull request number from context')
    return
  }
  return prNumber
}

export const findCommentsByQuery = async (octokit, context, query) => {
  const prNumber = getPullRequestNumber(context)

  const { data: comments } = await octokit.rest.issues.listComments({
    ...context.repo,
    issue_number: prNumber
  })

  const filteredComments = comments.filter(comment =>
    comment.body.includes(query)
  )

  return filteredComments
}

export const createComment = async (octokit, context, comment) => {
  // Get the pull request number from the context
  const prNumber = getPullRequestNumber(context)
  if (!prNumber) {
    core.setFailed('Could not get pull request number from context')
    return
  }

  // Post the comment to the pull request
  await octokit.rest.issues.createComment({
    ...context.repo,
    issue_number: prNumber,
    body: comment
  })
}

export const deleteComment = async (octokit, context, commentId) => {
  core.debug(`-- DEBUG -- deleteComment\ncomment id: ${commentId}\n`)

  await octokit.rest.issues.deleteComment({
    ...context.repo,
    comment_id: commentId
  })
}

export const findAndDeleteComments = async (octokit, context, query) => {
  core.debug(`-- DEBUG -- findAndDeleteComments\nquery: ${query}\n`)

  const comments = await findCommentsByQuery(octokit, context, query)

  for (const comment of comments) {
    if (comment.body.includes(query)) {
      await deleteComment(octokit, context, comment.id)
    }
  }
}

export const updateComment = async (octokit, context, { id, body }) => {
  core.debug(`-- DEBUG -- updateComment\ncomment id: ${id}\n`)

  await octokit.rest.issues.updateComment({
    ...context.repo,
    comment_id: id,
    body
  })
}

export const findAndUpdateComment = async (
  octokit,
  context,
  query,
  newComment
) => {
  core.debug(
    `-- DEBUG -- findAndUpdateComment\nquery: ${query}\nnewComment: ${newComment}`
  )

  const [comment] = await findCommentsByQuery(octokit, context, query)
  if (!comment) {
    return false
  }

  await updateComment(octokit, context, { id: comment.id, body: newComment })

  return true
}
