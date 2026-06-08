/**
 * Netlify Function: Salesforce File Proxy
 * Proxies a Salesforce ContentVersion VersionData binary to the client.
 *
 * Usage:
 *   /.netlify/functions/salesforce-file?versionId=068XXXXXXXXXXXXXXX
 */

const SF_API_VERSION = 'v66.0';
/** Classic Netlify responses are limited; large PDFs may need a streaming v2 function later. */
const MAX_PROXY_BYTES = 5.5 * 1024 * 1024;

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const versionId = event.queryStringParameters?.versionId;
    if (!versionId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'versionId is required' }),
      };
    }

    const clientId = process.env.SALESFORCE_CLIENT_ID;
    const clientSecret = process.env.SALESFORCE_CLIENT_SECRET;
    const tokenUrl = process.env.SALESFORCE_TOKEN_URL;
    const instanceUrl = process.env.SALESFORCE_INSTANCE_URL;

    if (!clientId || !clientSecret || !tokenUrl) {
      console.error('[Salesforce File Function] Missing credentials');
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Salesforce credentials not configured' }),
      };
    }

    const tokenResponse = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error(
        '[Salesforce File Function] Token request failed:',
        tokenResponse.status,
        errorText
      );
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Failed to authenticate with Salesforce' }),
      };
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;
    const tokenInstanceUrl = tokenData.instance_url || instanceUrl;

    if (!accessToken || !tokenInstanceUrl) {
      console.error('[Salesforce File Function] Invalid token response');
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Invalid token response from Salesforce' }),
      };
    }

    const sfUrl = `${tokenInstanceUrl}/services/data/${SF_API_VERSION}/sobjects/ContentVersion/${encodeURIComponent(versionId)}/VersionData`;

    const sfResponse = await fetch(sfUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!sfResponse.ok) {
      const errorText = await sfResponse.text();
      console.error(
        '[Salesforce File Function] VersionData fetch failed:',
        sfResponse.status,
        errorText
      );
      return {
        statusCode: sfResponse.status,
        body: JSON.stringify({ error: 'Failed to fetch file from Salesforce' }),
      };
    }

    const contentLength = Number(sfResponse.headers.get('content-length') || 0);
    if (contentLength > MAX_PROXY_BYTES) {
      return {
        statusCode: 413,
        body: JSON.stringify({
          error: 'File too large for proxy',
          hint: 'Use a smaller asset or serve large PDFs via a dedicated download path',
        }),
      };
    }

    const buffer = Buffer.from(await sfResponse.arrayBuffer());
    if (buffer.length > MAX_PROXY_BYTES) {
      return {
        statusCode: 413,
        body: JSON.stringify({ error: 'File too large for proxy' }),
      };
    }
    const contentType =
      sfResponse.headers.get('content-type') || 'application/octet-stream';

    return {
      statusCode: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=300',
      },
      body: buffer.toString('base64'),
      isBase64Encoded: true,
    };
  } catch (error) {
    console.error('[Salesforce File Function] Unexpected error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
