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
    const exp = now + 5 * 60;

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

function makeRequest(method, path, data = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 2368,
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
                console.log(`Response Status: ${res.statusCode}`);
                
                if (res.statusCode >= 400) {
                    reject(new Error(`API request failed with status ${res.statusCode}: ${data}`));
                    return;
                }

                try {
                    const parsedData = JSON.parse(data);
                    resolve(parsedData);
                } catch (e) {
                    resolve(data);
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        if (data) {
            req.write(JSON.stringify(data));
        }
        req.end();
    });
}

async function updateAboutPage() {
    try {
        // Check if About page exists
        console.log('Checking for existing About page...');
        const pages = await makeRequest('GET', 'pages/?filter=slug:about');
        
        const aboutPageContent = {
            title: "About",
            slug: "about",
            status: "published",
            feature_image: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=2000&q=80",
            custom_excerpt: "A showcase of Ghost theme development with modern design principles.",
            mobiledoc: JSON.stringify({
                version: "0.3.1",
                atoms: [],
                cards: [],
                markups: [["strong"], ["em"]],
                sections: [
                    [1, "p", [[0, [], 0, "Welcome to BoardX Theme Demo, a project showcasing modern Ghost theme development. This demo site exemplifies the possibilities of creating custom themes with Ghost CMS, focusing on clean design and optimal user experience."]]],
                    [1, "p", [[0, [], 0, "Our theme features:"]]],
                    [3, "ul", [
                        [[0, [], 0, "Clean and minimalist black & white design"]],
                        [[0, [], 0, "Responsive layout for all devices"]],
                        [[0, [], 0, "Optimized reading experience"]],
                        [[0, [], 0, "Modern typography and spacing"]]
                    ]],
                    [1, "h2", [[0, [], 0, "Technology Stack"]]],
                    [1, "p", [[0, [], 0, "This theme is built with modern web technologies:"]]],
                    [3, "ul", [
                        [[0, [], 0, "Ghost CMS for content management"]],
                        [[0, [], 0, "Tailwind CSS for styling"]],
                        [[0, [], 0, "Handlebars templating system"]]
                    ]],
                    [1, "h2", [[0, [], 0, "Features"]]],
                    [3, "ul", [
                        [[0, [], 0, "Tag-based content organization"]],
                        [[0, [], 0, "Reading time estimates"]],
                        [[0, [], 0, "Social sharing capabilities"]],
                        [[0, [], 0, "Responsive image handling"]]
                    ]],
                    [1, "p", [[0, [], 0, "Feel free to explore the various features and design elements throughout the site."]]],
                ]
            }),
            visibility: "public"
        };

        if (pages.pages && pages.pages.length > 0) {
            // Update existing page
            const existingPage = pages.pages[0];
            console.log('Updating existing About page...');
            
            const updateData = {
                pages: [{
                    ...aboutPageContent,
                    id: existingPage.id,
                    updated_at: existingPage.updated_at
                }]
            };
            
            await makeRequest('PUT', `pages/${existingPage.id}/`, updateData);
            console.log('About page updated successfully!');
        } else {
            // Create new page
            console.log('Creating new About page...');
            const createData = {
                pages: [{
                    ...aboutPageContent,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }]
            };
            
            await makeRequest('POST', 'pages/', createData);
            console.log('About page created successfully!');
        }

    } catch (error) {
        console.error('\nError:', error.message);
        console.error('\nTroubleshooting steps:');
        console.error('1. Ensure Ghost is running at http://localhost:2368');
        console.error('2. Verify your Admin API key is correct');
        console.error('3. Check if you have proper permissions');
    }
}

// Run the update
console.log('Starting About page update process...');
updateAboutPage();
