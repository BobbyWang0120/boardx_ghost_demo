const http = require('http');
const crypto = require('crypto');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Check if API key is available
if (!process.env.GHOST_ADMIN_API_KEY) {
    console.error('\nError: Ghost Admin API key not found!');
    console.error('\nPlease follow these steps:');
    console.error('1. Copy .env.example to .env');
    console.error('2. Get your Admin API key from Ghost Admin > Settings > Integrations');
    console.error('3. Add your API key to the .env file');
    process.exit(1);
}

// Ghost Admin API Configuration
const [id, secret] = process.env.GHOST_ADMIN_API_KEY.split(':');

// Create Admin API JWT token
function createToken() {
    const now = Math.floor(Date.now() / 1000);
    const exp = now + 5 * 60; // Token expires in 5 minutes

    const header = Buffer.from(JSON.stringify({
        alg: 'HS256',
        typ: 'JWT',
        kid: id
    })).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');

    const payload = Buffer.from(JSON.stringify({
        iat: now,
        exp: exp,
        aud: '/v3/admin/'
    })).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');

    const signature = crypto
        .createHmac('sha256', Buffer.from(secret, 'hex'))
        .update(`${header}.${payload}`)
        .digest('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/g, '');

    return `${header}.${payload}.${signature}`;
}

// Helper function to make API requests
function makeRequest(method, path, data = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 2369,
            path: `/ghost/api/v3/admin/${path}`,
            method: method,
            headers: {
                'Authorization': `Ghost ${createToken()}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Accept-Version': 'v3.0'
            }
        };

        const req = http.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                // Log response status
                console.log(`Response Status: ${res.statusCode}`);
                
                if (res.statusCode >= 400) {
                    reject(new Error(`API request failed with status ${res.statusCode}: ${data}`));
                    return;
                }

                // Handle 204 No Content response
                if (res.statusCode === 204) {
                    resolve({ success: true });
                    return;
                }

                try {
                    const parsedData = JSON.parse(data);
                    resolve(parsedData);
                } catch (e) {
                    reject(new Error(`Failed to parse response: ${e.message}`));
                }
            });
        });

        req.on('error', (error) => {
            reject(new Error(`Request failed: ${error.message}`));
        });

        if (data) {
            req.write(JSON.stringify(data));
        }
        req.end();
    });
}

async function deleteAllPostsExceptComingSoon() {
    try {
        // Test connection first
        console.log('Testing API connection...');
        const testResponse = await makeRequest('GET', 'site/');
        console.log('API connection successful.');

        // Get all posts
        console.log('\nFetching all posts...');
        const response = await makeRequest('GET', 'posts/?limit=all&formats=mobiledoc,html,plaintext');
        
        if (!response.posts) {
            throw new Error(`Failed to fetch posts. API Response: ${JSON.stringify(response)}`);
        }

        const posts = response.posts;
        console.log(`Found ${posts.length} posts total.`);

        // Filter posts to delete (exclude "Coming soon" post)
        const postsToDelete = posts.filter(post => post.title !== 'Coming soon');
        console.log(`Will delete ${postsToDelete.length} posts (keeping "Coming soon" post).`);

        // Delete posts one by one
        let successCount = 0;
        let failureCount = 0;

        for (const post of postsToDelete) {
            process.stdout.write(`Deleting post: ${post.title}... `);
            try {
                await makeRequest('DELETE', `posts/${post.id}/`);
                process.stdout.write('✓\n');
                successCount++;
            } catch (error) {
                process.stdout.write('✗\n');
                console.error(`  Error: ${error.message}`);
                failureCount++;
            }
        }

        console.log('\nOperation completed.');
        console.log('Summary:');
        console.log(`- Total posts found: ${posts.length}`);
        console.log(`- Successfully deleted: ${successCount}`);
        console.log(`- Failed to delete: ${failureCount}`);
        console.log(`- Posts kept: ${posts.length - postsToDelete.length}`);
    } catch (error) {
        console.error('\nError:', error.message);
        console.error('\nTroubleshooting steps:');
        console.error('1. Ensure Ghost is running at http://localhost:2369');
        console.error('2. Verify your Admin API key is correct');
        console.error('3. Check if you have proper permissions');
        console.error('4. Try accessing Ghost Admin in your browser');
    }
}

// Run the deletion process
console.log('Starting post deletion process...');
deleteAllPostsExceptComingSoon();
