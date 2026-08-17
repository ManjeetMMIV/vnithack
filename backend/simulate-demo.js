const API_URL = "http://localhost:5000/api";

async function runDemo() {
    const propertyId = "PROP-DEMO-" + Math.floor(Math.random() * 1000);
    
    console.log(`\n--- HACKATHON DEMO SIMULATION ---`);
    console.log(`\n1. Creating authentic record for ${propertyId}...`);
    
    const createRes = await fetch(`${API_URL}/records`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            propertyId,
            owner: "John Doe",
            coordinates: "40.7128° N, 74.0060° W",
            clerkId: "CLERK-99"
        })
    });
    const createData = await createRes.json();
    console.log("Server Response:", createData);

    console.log(`\n2. Auditing the authentic record...`);
    const auditRes1 = await fetch(`${API_URL}/audit/${propertyId}`);
    const auditData1 = await auditRes1.json();
    console.log("Audit Result:", auditData1.status);

    console.log(`\n3. HACKING the centralized database! (Corrupt clerk alters ownership)`);
    const hackRes = await fetch(`${API_URL}/hack/${propertyId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newOwner: "Mafia Boss" })
    });
    const hackData = await hackRes.json();
    console.log("Server Response:", hackData);

    console.log(`\n4. Auditing the tampered record...`);
    const auditRes2 = await fetch(`${API_URL}/audit/${propertyId}`);
    const auditData2 = await auditRes2.json();
    
    console.log("Audit Result:", auditData2.status);
    console.log("Message:", auditData2.message);
    
    if (auditData2.status === "TAMPERED") {
        console.log("\n✅ SUCCESS: The blockchain successfully caught the tamper attempt in the centralized database!");
    } else {
        console.log("\n❌ FAILED: The tamper attempt went unnoticed.");
    }
}

runDemo();
