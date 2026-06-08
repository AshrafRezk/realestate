/**
 * Normalize Salesforce id values from SOQL / REST responses.
 * Lookup fields may be plain ids or HTML anchors:
 * <a href="/a0BOm00000DWNJs" target="_blank">Project name</a>
 */
function pickId(value) {
  if (value == null) return ''
  const raw = String(value).trim()
  if (!raw) return ''

  if (/^[a-zA-Z0-9]{15,18}$/.test(raw)) return raw

  const fromHref = raw.match(/href=["']\/([a-zA-Z0-9]{15,18})["']/i)
  if (fromHref?.[1]) return fromHref[1]

  const fromPath = raw.match(/\/([a-zA-Z0-9]{15,18})\b/)
  if (fromPath?.[1]) return fromPath[1]

  return ''
}

/** Display label from lookup HTML or plain text (not a record id). */
function pickLabel(value) {
  if (value == null) return ''
  const raw = String(value).trim()
  if (!raw) return ''

  const fromAnchor = raw.match(/<a[^>]*>([^<]+)<\/a>/i)
  if (fromAnchor?.[1]) return fromAnchor[1].trim()

  if (/^[a-zA-Z0-9]{15,18}$/.test(raw)) return ''

  return raw
}

function pickSfLookup(value) {
  return { id: pickId(value), name: pickLabel(value) }
}

module.exports = { pickId, pickLabel, pickSfLookup }
