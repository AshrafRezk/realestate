# Salesforce Integration Overview

## Current Status
✅ Netlify functions are already configured for Salesforce integration

## Authentication Flow
1. User submits email/password via frontend login form
2. Frontend calls `/.netlify/functions/auth-login` (POST)
3. Netlify function:
   - Gets Salesforce access token using OAuth2 (client credentials)
   - Calls Salesforce Apex REST: `/services/apexrest/ContactAuth/v1/login`
   - On success: Creates JWT session cookie (`cloudestate_session`)
   - Returns user data to frontend

## Netlify Functions Inventory

**Authentication**
- `auth-login.js` - User login (email/password → JWT session)
- `auth-me.js` - Get current user from session
- `auth-logout.js` - Clear session cookie

**Salesforce Data Access**
- `salesforce-query.js` - Execute SOQL queries (generic)
- `salesforce-create.js` - Create Salesforce records
- `salesforce-units.js` - Fetch units data
- `salesforce-news.js` - Fetch news/content
- `salesforce-file.js` - Fetch files/documents
- `salesforce-lead.js` - Fetch lead details

**CRM Features**
- `cases.js` - Customer cases
- `leads.js` - Lead management
- `my-opportunities.js` - User opportunities
- `website-feature-switch.js` - Feature toggle management

## Required Environment Variables

Add these to your Netlify deployment settings or local `.env` file:

```
SALESFORCE_CLIENT_ID=your_client_id
SALESFORCE_CLIENT_SECRET=your_client_secret
SALESFORCE_TOKEN_URL=https://your-instance.salesforce.com/services/oauth2/token
SALESFORCE_INSTANCE_URL=https://your-instance.salesforce.com
SESSION_JWT_SECRET=your_jwt_secret_key
```

## Local Development Setup

**For local Netlify functions testing:**
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Create .env file with variables above
echo "SALESFORCE_CLIENT_ID=..." > .env.local

# Start dev server with Netlify functions
netlify dev
```

This will start:
- Vite dev server on http://localhost:5173
- Netlify functions on http://localhost:8888/.netlify/functions/*

## Next Steps

1. **Get credentials from supervisor**: SALESFORCE_CLIENT_ID, SECRET, TOKEN_URL, INSTANCE_URL
2. **Create .env file** in project root with these variables
3. **Test authentication flow**: Try login on the website
4. **Verify data access**: Check if SOQL queries return data
