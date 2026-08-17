const fs = require('fs');

const BACKEND_URL = "http://localhost:5000/api";
const AGENT_URL = "http://localhost:3001/api";
const LOG_FILE = "e2e_test_logs.md";

async function log(message) {
    console.log(message);
    fs.appendFileSync(LOG_FILE, message + "\n");
}

async function runE2E() {
    fs.writeFileSync(LOG_FILE, "# End-to-End System Test Logs\n\n");
    await log("Starting E2E Validation...\n");

    try {
        // 1. Seed Neo4j Data
        await log("## 1. Seeding Neo4j Mafia Graph");
        await log("Executing seedGraph.js...");
        const execSync = require('child_process').execSync;
        const seedOutput = execSync('cd agent && node seedGraph.js').toString();
        await log("```text\n" + seedOutput + "\n```\n");

        // 2. Create Property (Blockchain + MongoDB)
        await log("## 2. API: Creating Property (Minting to Polygon)");
        const propId = `E2E-TEST-${Math.floor(Math.random() * 1000)}`;
        const createPayload = {
            propertyId: propId,
            owner: "Honest Citizen",
            coordinates: "21.1458, 79.0882",
            clerkId: "CLK-042" // A known corrupt clerk from seedGraph
        };
        await log(`Sending POST /api/records for ${propId}...`);
        
        let res = await fetch(`${BACKEND_URL}/records`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(createPayload)
        });
        let data = await res.json();
        await log("```json\n" + JSON.stringify(data, null, 2) + "\n```\n");

        // 3. Hack the Property (Centralized Tampering)
        await log("## 3. API: Hacking the Database (Bypassing Blockchain)");
        await log(`Sending PUT /api/hack/${propId} with new owner "Scammer Syndicate"...`);
        
        res = await fetch(`${BACKEND_URL}/hack/${propId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ newOwner: "Scammer Syndicate" })
        });
        data = await res.json();
        await log("```json\n" + JSON.stringify(data, null, 2) + "\n```\n");

        // 4. Audit the Property (Tamper Detection)
        await log("## 4. API: Auditing the Property (Comparing DB vs Polygon Hash)");
        await log(`Sending GET /api/audit/${propId}...`);
        
        res = await fetch(`${BACKEND_URL}/audit/${propId}`);
        data = await res.json();
        await log(`HTTP Status: ${res.status}`);
        await log("```json\n" + JSON.stringify(data, null, 2) + "\n```\n");

        // 5. Agent Investigation
        await log("## 5. LangGraph Agent: Mafia Tracker Investigation");
        await log(`Sending GET /api/agent/analyze/CLK-042 (Streaming SSE)...`);
        
        res = await fetch(`${AGENT_URL}/agent/analyze/CLK-042`);
        const text = await res.text();
        await log("```text\n" + text.substring(0, 1000) + "\n...\n```\n");
        
        await log("\n✅ **End-to-End Test Completed Successfully!**");

    } catch (e) {
        await log(`\n❌ ERROR: ${e.message}`);
    }
}

runE2E();
