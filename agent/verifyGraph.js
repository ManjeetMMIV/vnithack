require('dotenv').config();
const { runQuery, closeDriver } = require('./neo4jClient');

async function testQueries() {
  console.log(' Running real Cypher queries on Neo4j Aura...\n');

  // Query 1: List all 5 clerks and their approved properties count
  console.log('--- 1. Clerks & Approved Properties Count ---');
  const clerksRes = await runQuery(`
    MATCH (c:Clerk)
    OPTIONAL MATCH (c)-[:APPROVED]->(p:Property)
    RETURN c.id AS id, c.name AS name, c.zone AS zone, c.status AS status, count(p) AS approvedCount
    ORDER BY c.id
  `);
  clerksRes.forEach(record => {
    console.log(`[${record.get('id')}] ${record.get('name')} | Zone: ${record.get('zone')} | Status: ${record.get('status')} | Approved Properties: ${record.get('approvedCount').toInt()}`);
  });

  // Query 2: Test Circular Loop Detection on CLK-042
  console.log('\n--- 2. Circular Transfer Cycle Detection for CLK-042 ---');
  const cycleRes = await runQuery(`
    MATCH (c:Clerk {id: 'CLK-042'})-[:APPROVED]->(p:Property)
    MATCH path = (origin:Citizen)-[:TRANSFERRED_TO*2..5]->(origin)
    RETURN origin.name AS loopOrigin, [n IN nodes(path) | n.name] AS ringCycle, length(path) AS hopCount
    LIMIT 1
  `);
  if (cycleRes.length > 0) {
    const r = cycleRes[0];
    console.log(` Loop Origin: ${r.get('loopOrigin')}`);
    console.log(` Fraud Ring Path: ${r.get('ringCycle').join('  ')} (${r.get('hopCount').toInt()} hops)`);
  }

  // Query 3: Shell Company Director Link for CLK-017
  console.log('\n--- 3. Shell Company / Collusion Detection for CLK-017 ---');
  const shellRes = await runQuery(`
    MATCH (c:Clerk {id: 'CLK-017'})-[:SAME_ADDRESS_AS]-(director:Citizen)-[:DIRECTOR_OF]->(cmp:Company)
    RETURN c.name AS clerkName, director.name AS directorName, cmp.name AS companyName, cmp.cin AS cin
  `);
  if (shellRes.length > 0) {
    const r = shellRes[0];
    console.log(` Clerk Collusion: ${r.get('clerkName')} shares address with ${r.get('directorName')} (Director of ${r.get('companyName')}, CIN: ${r.get('cin')})`);
  }

  await closeDriver();
}

testQueries();
