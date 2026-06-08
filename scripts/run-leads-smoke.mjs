#!/usr/bin/env node
/**
 * Invoke the Netlify leads handler locally (same code path as production POST).
 * Usage: node scripts/run-leads-smoke.mjs
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { createRequire } from 'node:module'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

function loadEnv() {
  const envPath = join(root, '.env')
  if (!existsSync(envPath)) return
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    const val = trimmed.slice(eq + 1).trim()
    if (!process.env[key]) process.env[key] = val
  }
}

loadEnv()

const require = createRequire(import.meta.url)
const leadsPath = join(root, 'netlify/functions/leads.js')
const { handler } = require(leadsPath)

const stamp = new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14)
const body = {
  firstName: 'Acceptance',
  lastName: `Test-${stamp}`,
  email: `acceptance.test.${stamp}@cloudestate.demo`,
  phone: '+966500000001',
  profile: 'Investor',
  message: `Automated acceptance smoke test ${stamp}`,
}

const event = {
  httpMethod: 'POST',
  body: JSON.stringify(body),
}

const result = await handler(event)
const payload = JSON.parse(result.body || '{}')
console.log(JSON.stringify({ statusCode: result.statusCode, payload }, null, 2))

if (result.statusCode >= 400 || !payload.success) {
  process.exit(1)
}

const evidence = {
  leadId: payload.data?.id,
  timestamp: new Date().toISOString(),
  endpoint: 'netlify/functions/leads.js (local handler)',
  request: body,
  response: payload,
}
writeFileSync(
  join(root, '..', 'Nemar_real_estate', 'docs', 'acceptance-lead-evidence.json'),
  JSON.stringify(evidence, null, 2) + '\n',
)
console.log(`\nPASS — Lead Id ${evidence.leadId}`)
