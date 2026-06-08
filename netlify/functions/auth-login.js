/**
 * Netlify Function: Auth Login (Salesforce ContactAuthREST, session cookie)
 *
 * Delegates to Salesforce Apex REST:
 * - POST /services/apexrest/ContactAuth/v1/login
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
 
function getCookieHost(headers) {
  const host = headers?.host || headers?.Host || ''
  return String(host)
}
 
function isLocalhost(headers) {
  const host = getCookieHost(headers)
  return host.includes('localhost') || host.includes('127.0.0.1')
}
 
function buildSessionCookie(token, headers, maxAgeSeconds) {
  const secure = !isLocalhost(headers)
  const parts = [
    `cloudestate_session=${encodeURIComponent(token)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${maxAgeSeconds}`,
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
  if (event.httpMethod !== 'POST') {
    return json(405, { success: false, error: 'Method not allowed' })
  }
 
  try {
    const { email, password } = JSON.parse(event.body || '{}')
    if (!email || !password) {
      return json(400, { success: false, error: 'Email and password are required' })
    }
 
    const sessionSecret = process.env.SESSION_JWT_SECRET
    if (!sessionSecret) {
      return json(500, { success: false, error: 'SESSION_JWT_SECRET not configured' })
    }
 
    const { accessToken, instanceUrl } = await getSalesforceAccessToken()

    const loginUrl = `${instanceUrl}/services/apexrest/ContactAuth/v1/login`
    const sfRes = await fetch(loginUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: String(email).trim(), password: String(password) }),
    })

    const sfText = await sfRes.text()
    let sfBody
    try {
      sfBody = sfText ? JSON.parse(sfText) : null
    } catch {
      sfBody = null
    }

    if (!sfRes.ok || !sfBody?.success) {
      // Server-side log for debugging only.
      console.info('[auth-login] salesforce login failed', {
        status: sfRes.status,
        errorCode: sfBody?.errorCode,
        message: sfBody?.message,
        email: String(email).trim().toLowerCase(),
      })
      return json(401, { success: false, error: 'Invalid credentials' })
    }

    const contact = sfBody.contact || {}
    const contactId = contact.id || contact.Id
    const contactEmail = contact.email || contact.Email || String(email).trim()
    const displayName = contact.name || contact.Name || ''

    const user = {
      id: contactId,
      username: contactEmail,
      firstName: displayName,
      lastName: '',
      email: contactEmail,
    }

    const apiToken = sfBody.token
    const expiresAtRaw = sfBody.expiresAt
    const expiresAtMs = expiresAtRaw ? Date.parse(expiresAtRaw) : NaN
    const now = Date.now()
    const maxAgeSeconds = Number.isFinite(expiresAtMs)
      ? Math.max(60, Math.floor((expiresAtMs - now) / 1000))
      : 60 * 60 * 24 * 30

    const { SignJWT } = await import('jose')
    const secretKey = new TextEncoder().encode(sessionSecret)
    const cookieJwt = await new SignJWT({
      apiToken,
      expiresAt: expiresAtRaw || null,
      contact: user,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject(user.id)
      .setIssuedAt()
      .setExpirationTime(`${maxAgeSeconds}s`)
      .sign(secretKey)
 
    return json(
      200,
      { success: true, data: { user } },
      {
        'Set-Cookie': buildSessionCookie(cookieJwt, event.headers, maxAgeSeconds),
      }
    )
  } catch (error) {
    console.error('[auth-login] error:', error)
    return json(500, { success: false, error: 'Internal server error' })
  }
}

