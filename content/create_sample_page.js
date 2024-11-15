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

async function createSamplePage() {
    try {
        console.log('Checking for existing Sample page...');
        const pages = await makeRequest('GET', 'pages/?filter=slug:sample');
        
        const samplePageContent = {
            title: "Sample",
            slug: "sample",
            status: "published",
            feature_image: "https://images.unsplash.com/photo-1618477388954-7852f32655ec?auto=format&fit=crop&w=2000&q=80",
            custom_excerpt: "A sample page showcasing modern design elements with Tailwind CSS",
            mobiledoc: JSON.stringify({
                version: "0.3.1",
                atoms: [],
                cards: [
                    ["image", {
                        src: "https://images.unsplash.com/photo-1542831371-29b0f74f9713",
                        caption: "Modern Development"
                    }]
                ],
                markups: [
                    ["strong"],
                    ["em"],
                    ["code"]
                ],
                sections: [
                    [1, "h2", [[0, [0], 0, "Design Elements"]]],
                    [1, "p", [[0, [], 0, "Welcome to our sample page showcasing modern design elements and components. This page demonstrates the capabilities of Ghost CMS combined with Tailwind CSS."]]],
                    
                    [1, "h3", [[0, [0], 0, "Key Features"]]],
                    [3, "ul", [
                        [[0, [], 0, "Clean and minimalist black & white design"]],
                        [[0, [], 0, "Responsive layout for all devices"]],
                        [[0, [], 0, "Modern typography and spacing"]],
                        [[0, [], 0, "Interactive elements and animations"]]
                    ]],
                    
                    [10, 0],
                    
                    [1, "h3", [[0, [0], 0, "Technology Stack"]]],
                    [1, "p", [[0, [], 0, "Built with modern web technologies:"]]],
                    [3, "ul", [
                        [[0, [], 0, "Ghost CMS for content management"]],
                        [[0, [], 0, "Tailwind CSS for styling"]],
                        [[0, [], 0, "Responsive design principles"]]
                    ]],
                    
                    [1, "h3", [[0, [0], 0, "Code Example"]]],
                    [1, "p", [[0, [], 0, "Here's a simple code example:"]]],
                    [1, "pre", [[0, [], 0, `// Tailwind CSS class example
<div class="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all">
    <h3 class="text-xl font-bold mb-4">
        Modern Design
    </h3>
    <p class="text-gray-600">
        Clean and minimal approach
    </p>
</div>`]]],
                    
                    [1, "h2", [[0, [0], 0, "Final Thoughts"]]],
                    [1, "p", [[0, [], 0, "This sample page demonstrates how we can create elegant, modern web pages using Ghost CMS and Tailwind CSS. The combination provides both powerful content management and beautiful design capabilities."]]]
                ]
            }),
            visibility: "public"
        };

        if (pages.pages && pages.pages.length > 0) {
            const existingPage = pages.pages[0];
            console.log('Updating existing Sample page...');
            
            const updateData = {
                pages: [{
                    ...samplePageContent,
                    id: existingPage.id,
                    updated_at: existingPage.updated_at
                }]
            };
            
            await makeRequest('PUT', `pages/${existingPage.id}/`, updateData);
            console.log('Sample page updated successfully!');
        } else {
            console.log('Creating new Sample page...');
            const createData = {
                pages: [{
                    ...samplePageContent,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }]
            };
            
            await makeRequest('POST', 'pages/', createData);
            console.log('Sample page created successfully!');
        }

        console.log('\nSample page has been created/updated successfully!');
        console.log('To complete the setup:');
        console.log('1. Visit Ghost Admin: http://localhost:2368/ghost/');
        console.log('2. Go to Settings > Navigation');
        console.log('3. Add a new navigation item:');
        console.log('   - Label: Sample');
        console.log('   - URL: /sample/');
        console.log('4. Save your changes');

    } catch (error) {
        console.error('\nError:', error.message);
        console.error('\nTroubleshooting steps:');
        console.error('1. Ensure Ghost is running at http://localhost:2368');
        console.error('2. Verify your Admin API key is correct');
        console.error('3. Check if you have proper permissions');
    }
}

console.log('Starting Sample page creation process...');
createSamplePage();
