import { readdirSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import * as core from '@actions/core'

const rootDir = './src'

const readDirDeep = dir => {
  const files = readdirSync(dir, { withFileTypes: true })
  return files.flatMap(file => {
    const filePath = path.join(dir, file.name)
    return file.isDirectory() ? readDirDeep(filePath) : filePath
  })
}

const matchQuery =
  query =>
  (content, prevMatches = 0) =>
    (content.match(query) ?? []).length + prevMatches

const createRegexByQuery = query =>
  new RegExp(`\\/\\/.*${query}.*|\\/\\*[\\s\\S]*?${query}[\\s\\S]*?\\*\\/`, 'g')
const todoQuery = createRegexByQuery('TODO')
const fixmeQuery = createRegexByQuery('FIXME')
const tsIgnoreQuery = createRegexByQuery('@ts-ignore')

const calcTechDept = async () => {
  console.time('Calculate tech dept')
  const queries = ['TODO', 'FIXME', '@ts-ignore']
  const calcTodo = matchQuery(todoQuery)
  const calcFixme = matchQuery(fixmeQuery)
  const calcTsIgnore = matchQuery(tsIgnoreQuery)

  const calculator = {
    TODO: { count: 0, handler: calcTodo },
    FIXME: { count: 0, handler: calcFixme },
    '@ts-ignore': { count: 0, handler: calcTsIgnore }
  }

  const files = readDirDeep(rootDir)

  const fileLoaderPromises = files.map(file =>
    readFile(file, { encoding: 'utf-8' })
  )
  for await (const content of fileLoaderPromises) {
    for (const query of queries) {
      const { handler } = calculator[query]
      calculator[query].count += handler(content)
    }
  }

  const result = {}
  for (const query of queries) {
    result[query] = calculator[query].count
    core.debug(`Found ${query}: ${calculator[query].count}`)
  }

  console.timeEnd('Calculate tech dept')
  return result
}

export { calcTechDept }
