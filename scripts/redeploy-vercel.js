
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TOKEN_PATH = path.join(__dirname, '../docs/vercel/vercel-token');
const PROJECT_NAME = 'tube-digest-pwa';
const REPO_ID = '1110333837';
const REPO_ORG = 'AlaaEddinAlbarghoth';
const REPO_NAME = 'tube-digest-pwa';

async function main() {
    console.log('--- Vercel Auto-Redeploy ---');

    // 1. Read Token
    let token;
    try {
        const content = fs.readFileSync(TOKEN_PATH, 'utf8').trim();
        token = content.split('\n')[0].trim();
    } catch (e) {
        console.error('❌ Could not read token from docs/vercel/vercel-token');
        process.exit(1);
    }

    if (!token) {
        console.error('❌ Token is empty');
        process.exit(1);
    }

    const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };

    try {
        // 2. Trigger Deployment
        console.log(`Triggering redeployment for ${PROJECT_NAME} (main branch)...`);

        const body = {
            name: PROJECT_NAME,
            gitSource: {
                type: 'github',
                repoId: REPO_ID,
                ref: 'main',
                repo: `${REPO_ORG}/${REPO_NAME}`
            },
            projectSettings: {
                framework: 'vite'
            }
        };

        const res = await fetch('https://api.vercel.com/v13/deployments', {
            method: 'POST',
            headers,
            body: JSON.stringify(body)
        });

        if (!res.ok) {
            const err = await res.text();
            throw new Error(`Deployment failed: ${res.status} ${err}`);
        }

        const data = await res.json();
        console.log('\n✅ Deployment triggered successfully!');
        console.log('--------------------------------------------------');
        console.log(`Deployment ID: ${data.id}`);
        console.log(`Status:        ${data.readyState}`);
        console.log(`Inspector URL: ${data.inspectorUrl}`);
        console.log('--------------------------------------------------');
        console.log('The build is now running on Vercel. It should complete in a minute.');

    } catch (error) {
        console.error('\n❌ Error:', error.message);
    }
}

main();
