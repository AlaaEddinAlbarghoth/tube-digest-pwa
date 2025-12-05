
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TOKEN_PATH = path.join(__dirname, '../docs/vercel/vercel-token');
const DEPLOYMENT_ID = 'dpl_FWmwiZGRa2gmtFDmQ7UbH1XFPvok';
const ALIAS = 'tube-digest-pwa.vercel.app';

async function main() {
    console.log('--- Vercel Alias Assigner ---');

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
        console.log(`Assigning alias ${ALIAS} to ${DEPLOYMENT_ID}...`);

        const res = await fetch(`https://api.vercel.com/v2/deployments/${DEPLOYMENT_ID}/aliases`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ alias: ALIAS })
        });

        if (!res.ok) {
            const err = await res.text();
            throw new Error(`Alias failed: ${res.status} ${err}`);
        }

        const data = await res.json();
        console.log('\n✅ Alias assigned successfully!');
        console.log(`URL: https://${ALIAS}`);

    } catch (error) {
        console.error('\n❌ Error:', error.message);
    }
}

main();
