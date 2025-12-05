
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TOKEN_PATH = path.join(__dirname, '../docs/vercel/vercel-token');
const PROJECT_NAME = 'tube-digest-pwa';

async function main() {
    console.log('--- Checking Recent Deployments ---');

    let token;
    try {
        const content = fs.readFileSync(TOKEN_PATH, 'utf8').trim();
        token = content.split('\n')[0].trim();
    } catch (e) {
        console.error('❌ Could not read token');
        process.exit(1);
    }

    const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };

    try {
        const res = await fetch(`https://api.vercel.com/v6/deployments?limit=3&projectId=prj_AEbvQB8gw61m48pm9zqj75g0M1Ru`, { headers });
        const data = await res.json();

        data.deployments.forEach(d => {
            console.log(`\nID: ${d.uid}`);
            console.log(`State: ${d.state}`);
            console.log(`Created: ${new Date(d.created).toLocaleString()}`);
            console.log(`Commit: ${d.meta.githubCommitMessage}`);
            console.log(`URL: https://${d.url}`);
        });

    } catch (error) {
        console.error('\n❌ Error:', error.message);
    }
}

main();
