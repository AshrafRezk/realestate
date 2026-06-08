// netlify/functions/salesforce-lead.js

exports.handler = async (event) => {
    // Only allow POST
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method Not Allowed' }),
        };
    }

    try {
        const body = JSON.parse(event.body);
        const { name, country, phone, region, city, customerType, selectedUnit } = body;

        // Basic validation
        if (!name || !country || !phone || !region || !city || !customerType) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Missing required fields' }),
            };
        }

        // 1. Get Salesforce Token
        const tokenUrl = `${process.env.SALESFORCE_INSTANCE_URL}/services/oauth2/token`;
        const params = new URLSearchParams();
        params.append('grant_type', 'password');
        params.append('client_id', process.env.SALESFORCE_CLIENT_ID);
        params.append('client_secret', process.env.SALESFORCE_CLIENT_SECRET);
        params.append('username', process.env.SALESFORCE_USERNAME);
        params.append('password', `${process.env.SALESFORCE_PASSWORD}${process.env.SALESFORCE_SECURITY_TOKEN}`);

        const tokenRes = await fetch(tokenUrl, {
            method: 'POST',
            body: params,
        });

        if (!tokenRes.ok) {
            console.error('Failed to get SF Token', await tokenRes.text());
            throw new Error('Salesforce authentication failed');
        }

        const { access_token, instance_url } = await tokenRes.json();

        // 2. Map fields and insert Lead
        // Standard Salesforce requires LastName and Company.
        const leadPayload = {
            LastName: name,
            Company: customerType === 'Company' ? 'TBD Company' : 'Private Customer',
            Mobile_Country__c: country,
            Phone: phone,
            Region_Province__c: region,
            Lead_City__c: city,
            LeadSource: 'Website Bot',
            Private_Customer__c: customerType === 'Company' ? false : true,
            Description: selectedUnit ? `Interested in unit: ${selectedUnit}` : undefined
        };

        const sfApiUrl = `${instance_url}/services/data/v58.0/sobjects/Lead`;

        const sfRes = await fetch(sfApiUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${access_token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(leadPayload),
        });

        if (!sfRes.ok) {
            const errorData = await sfRes.text();
            console.error('SF Lead Creation Failed', errorData);
            return {
                statusCode: sfRes.status,
                body: JSON.stringify({ error: 'Salesforce API failed', details: errorData }),
            };
        }

        const result = await sfRes.json();

        return {
            statusCode: 200,
            body: JSON.stringify({ success: true, id: result.id }),
        };

    } catch (error) {
        console.error('Lead Submission Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal Server Error' }),
        };
    }
};
