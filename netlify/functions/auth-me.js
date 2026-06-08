/**
 * Netlify Function: Auth Me (Salesforce ContactAuthREST, session cookie)
 *
 * Delegates to Salesforce Apex REST:
 * - GET /services/apexrest/ContactAuth/v1/me (Authorization: Bearer <contactAuthToken>)
 *
 * Env:
 * - SALESFORCE_CLIENT_ID / SALESFORCE_CLIENT_SECRET / SALESFORCE_TOKEN_URL / SALESFORCE_INSTANCE_URL
 * - SESSION_JWT_SECRET
 */
 
function json(statusCode, body, extraHeaders = {}) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      ...extraHeaders,
    },
    body: JSON.stringify(body),
  }
}
 
function parseCookies(cookieHeader) {
  const out = {}
  if (!cookieHeader) return out
  const parts = String(cookieHeader).split(';')
  for (const part of parts) {
    const [k, ...rest] = part.trim().split('=')
    if (!k) continue
    out[k] = rest.join('=')
  }
  return out
}
 
function getCookieHost(headers) {
  const host = headers?.host || headers?.Host || ''
  return String(host)
}
 
function isLocalhost(headers) {
  const host = getCookieHost(headers)
  return host.includes('localhost') || host.includes('127.0.0.1')
}
 
function clearSessionCookie(headers) {
  const secure = !isLocalhost(headers)
  const parts = [
    'cloudestate_session=',
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    'Max-Age=0',
  ]
  if (secure) parts.push('Secure')
  return parts.join('; ')
}
 
async function getSalesforceAccessToken() {
  const clientId = process.env.SALESFORCE_CLIENT_ID
  const clientSecret = process.env.SALESFORCE_CLIENT_SECRET
  const tokenUrl = process.env.SALESFORCE_TOKEN_URL
  const instanceUrl = process.env.SALESFORCE_INSTANCE_URL
 
  if (!clientId || !clientSecret || !tokenUrl) {
    throw new Error('Salesforce credentials not configured')
  }
 
  const tokenResponse = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
    }),
  })
 
  if (!tokenResponse.ok) {
    const errorText = await tokenResponse.text()
    throw new Error(`Salesforce token request failed (${tokenResponse.status}): ${errorText}`)
  }
 
  const tokenData = await tokenResponse.json()
  const accessToken = tokenData.access_token
  const tokenInstanceUrl = tokenData.instance_url || instanceUrl
 
  if (!accessToken || !tokenInstanceUrl) {
    throw new Error('Invalid token response from Salesforce')
  }
 
  return { accessToken, instanceUrl: tokenInstanceUrl }
}
 
export const handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return json(405, { success: false, error: 'Method not allowed' })
  }
 
  try {
    const sessionSecret = process.env.SESSION_JWT_SECRET
    if (!sessionSecret) {
      return json(500, { success: false, error: 'SESSION_JWT_SECRET not configured' })
    }
 
    const cookieHeader = event.headers?.cookie || event.headers?.Cookie || ''
    const cookies = parseCookies(cookieHeader)
    const raw = cookies.cloudestate_session
    if (!raw) {
      return json(200, { success: true, data: null })
    }
 
    const cookieJwt = decodeURIComponent(raw)
    const { jwtVerify } = await import('jose')
    const secretKey = new TextEncoder().encode(sessionSecret)
 
    const verified = await jwtVerify(cookieJwt, secretKey, { algorithms: ['HS256'] })
    const payload = verified.payload || {}
 
    const apiToken = payload.apiToken
    if (!verified.payload.sub || !apiToken) {
      return json(
        200,
        { success: true, data: null },
        { 'Set-Cookie': clearSessionCookie(event.headers) }
      )
    }

    const { accessToken, instanceUrl } = await getSalesforceAccessToken()
    const meUrl = `${instanceUrl}/services/apexrest/ContactAuth/v1/me`
    const sfRes = await fetch(meUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'X-Auth-Token': String(apiToken),
        'Content-Type': 'application/json',
      },
    })

    const sfText = await sfRes.text()
    let sfBody
    try {
      sfBody = sfText ? JSON.parse(sfText) : null
    } catch {
      sfBody = null
    }

    if (!sfRes.ok || !sfBody?.success) {
      return json(
        200,
        { success: true, data: null },
        { 'Set-Cookie': clearSessionCookie(event.headers) }
      )
    }

    const contact = sfBody.contact || {}
    const contactId = contact.id || contact.Id || verified.payload.sub
    const contactEmail = contact.email || contact.Email || payload?.contact?.email || ''
    const displayName = contact.name || contact.Name || payload?.contact?.firstName || ''

    const user = {
      id: contactId,
      username: contactEmail,
      firstName: displayName,
      lastName: '',
      email: contactEmail,
    }

    return json(200, { success: true, data: user })
  } catch (error) {
    // Invalid/expired token -> treat as logged out
    return json(
      200,
      { success: true, data: null },
      { 'Set-Cookie': clearSessionCookie(event.headers) }
    )
  }
}

