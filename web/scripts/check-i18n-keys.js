#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const localesDir = path.resolve(__dirname, '../src/locales')
const enPath = path.join(localesDir, 'en/translation.json')

if (!fs.existsSync(enPath)) {
  console.error(`Error: Base English locale file not found at ${enPath}`)
  process.exit(1)
}

const en = JSON.parse(fs.readFileSync(enPath, 'utf8'))

function getNestedKeys(obj, prefix = '') {
  let keys = []
  for (const key of Object.keys(obj)) {
    if (key.startsWith('_')) continue // Skip metadata comments
    const fullPath = prefix ? `${prefix}.${key}` : key
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      keys = keys.concat(getNestedKeys(obj[key], fullPath))
    } else {
      keys.push(fullPath)
    }
  }
  return keys
}

const enKeys = new Set(getNestedKeys(en))
console.log(`Base English locale contains ${enKeys.size} translation keys.`)

const otherDirs = fs.readdirSync(localesDir).filter((d) => d !== 'en' && fs.statSync(path.join(localesDir, d)).isDirectory())

let hasErrors = false

for (const lang of otherDirs) {
  const langPath = path.join(localesDir, lang, 'translation.json')
  if (!fs.existsSync(langPath)) {
    console.warn(`[${lang}] No translation.json file found.`)
    continue
  }

  const langContent = JSON.parse(fs.readFileSync(langPath, 'utf8'))
  const langKeys = new Set(getNestedKeys(langContent))

  const missingInLang = [...enKeys].filter((k) => !langKeys.has(k))
  const extraInLang = [...langKeys].filter((k) => !enKeys.has(k))

  console.log(`\nChecking locale: [${lang}] (Found ${langKeys.size} keys)`)

  if (missingInLang.length > 0) {
    console.error(`❌ [${lang}] Missing ${missingInLang.length} keys:`)
    missingInLang.forEach((k) => console.error(`   - ${k}`))
    hasErrors = true
  } else {
    console.log(`✓ [${lang}] All base English keys are present.`)
  }

  if (extraInLang.length > 0) {
    console.warn(`⚠️  [${lang}] Contains ${extraInLang.length} extra keys not present in English:`)
    extraInLang.forEach((k) => console.warn(`   + ${k}`))
  }
}

if (hasErrors) {
  console.error('\ni18n check failed: Some translation keys are missing.')
  process.exit(1)
} else {
  console.log('\nAll i18n locale files are complete and synchronized! ✨')
  process.exit(0)
}
