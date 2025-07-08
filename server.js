require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Salesforce authentication cache
let authToken = null;
let tokenExpiry = null;

async function getSalesforceToken() {
  if (authToken && tokenExpiry && new Date() < tokenExpiry) {
    return authToken;
  }

  try {
    const params = new URLSearchParams({
      grant_type: 'password',
      client_id: process.env.SF_CLIENT_ID,
      client_secret: process.env.SF_CLIENT_SECRET,
      username: process.env.SF_USERNAME,
      password: process.env.SF_PASSWORD
    });

    const response = await axios.post(
      'https://myrealestatecompany-dev-ed.my.salesforce.com/services/oauth2/token',
      params,
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    authToken = response.data.access_token;
    tokenExpiry = new Date(Date.now() + (response.data.expires_in * 1000));
    return authToken;
  } catch (error) {
    console.error('Salesforce authentication error:', error.response?.data);
    throw new Error('Failed to authenticate with Salesforce');
  }
}

// Serve the home page
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Proxied Salesforce API endpoint
app.get('/api/units', async (req, res) => {
  try {
    const token = await getSalesforceToken();
    const query = `SELECT Id,Name,Complete_Name__c,Bathrooms__c,Bedrooms__c,Garden_Area__c,Price__c,Status__c,Location__c FROM Unit__c WHERE Status__c='Available'`;
    
    const response = await axios.get(
      `https://myrealestatecompany-dev-ed.my.salesforce.com/services/data/v60.0/query`,
      {
        params: { q: query },
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    res.json(response.data.records);
  } catch (error) {
    console.error('Salesforce API error:', error.response?.data);
    res.status(500).json({ error: 'Failed to fetch units' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('SF_CLIENT_ID:', process.env.SF_CLIENT_ID);
  console.log('SF_CLIENT_SECRET:', process.env.SF_CLIENT_SECRET);
  console.log('SF_USERNAME:', process.env.SF_USERNAME);
  console.log('SF_PASSWORD:', process.env.SF_PASSWORD ? '***' : 'MISSING');
});

