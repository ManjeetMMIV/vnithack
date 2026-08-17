const { runQuery } = require('../neo4jClient');

/**
 * Agent 1: Graph Investigator Agent
 * Autonomous Graph Crawler that executes targeted Cypher queries on Neo4j Aura
 * to uncover multi-hop corruption rings, circular paths, and entity collisions.
 */
class GraphInvestigatorAgent {
  constructor(logger = () => {}) {
    this.log = logger;
  }

  /**
   * Executes a comprehensive traversal of the Neo4j graph database to extract
   * property transaction histories, cross-reference ownership chains, and 
   * proactively scan for circular transfers or benami proxy structures tied 
   * to a specific registry clerk.
   * 
   * @param {string} clerkId - The unique identifier of the clerk to investigate.
   * @returns {Object} An object containing the extracted subgraph, including clerk profile, properties, circular rings, and anomalies.
   */
  async investigate(clerkId) {
    this.log('GRAPH_INVESTIGATOR', ` Initializing Neo4j Autonomous Graph Crawl for Clerk [${clerkId}]...`);
    const startTime = Date.now();

    // 1. Fetch Clerk Profile & Scope
    this.log('GRAPH_QUERY', `Executing Cypher: MATCH (c:Clerk {id: "${clerkId}"}) RETURN c`);
    const clerkRecords = await runQuery(
      'MATCH (c:Clerk {id: $clerkId}) RETURN c',
      { clerkId }
    );

    if (clerkRecords.length === 0) {
      throw new Error(`Clerk with ID ${clerkId} not found in Neo4j registry.`);
    }

    const clerkProps = clerkRecords[0].get('c').properties;
    this.log('GRAPH_INVESTIGATOR', ` Clerk Profile: ${clerkProps.name} | ${clerkProps.zone} | Dept: ${clerkProps.department} | Status: ${clerkProps.status}`);

    // 2. Fetch all Properties Approved by this Clerk
    this.log('GRAPH_QUERY', `Executing Cypher: MATCH (c:Clerk {id: "${clerkId}"})-[r:APPROVED]->(p:Property) RETURN p, r`);
    const approvedRecords = await runQuery(`
      MATCH (c:Clerk {id: $clerkId})-[r:APPROVED]->(p:Property)
      RETURN p, r
      ORDER BY p.id
    `, { clerkId });

    const approvedProperties = approvedRecords.map(rec => {
      const p = rec.get('p').properties;
      const r = rec.get('r').properties;
      return {
        id: p.id,
        surveyNo: p.surveyNo,
        location: p.location,
        areaSqFt: p.areaSqFt ? (p.areaSqFt.toInt ? p.areaSqFt.toInt() : p.areaSqFt) : 0,
        marketValuationINR: p.marketValuationINR ? (p.marketValuationINR.toInt ? p.marketValuationINR.toInt() : p.marketValuationINR) : 0,
        circleRateINR: p.circleRateINR ? (p.circleRateINR.toInt ? p.circleRateINR.toInt() : p.circleRateINR) : 0,
        approvalDate: r.date,
        approvalFeeINR: r.feeINR ? (r.feeINR.toInt ? r.feeINR.toInt() : r.feeINR) : 0,
        registryHash: r.registryHash,
      };
    });

    this.log('GRAPH_INVESTIGATOR', ` Discovered ${approvedProperties.length} approved properties under clerk jurisdiction.`);

    // 3. Extract Full Ownership Graph & Entity Ties
    this.log('GRAPH_QUERY', `Traversing Subgraph: MATCH (c:Clerk {id: "${clerkId}"})-[:APPROVED]->(p:Property)<-[:OWNS]-(owner) RETURN owner, p`);
    const ownershipRecords = await runQuery(`
      MATCH (c:Clerk {id: $clerkId})-[:APPROVED]->(p:Property)<-[o:OWNS]-(owner)
      RETURN p.id AS propId, labels(owner)[0] AS ownerType, owner, o
    `, { clerkId });

    const propertyOwners = ownershipRecords.map(rec => ({
      propId: rec.get('propId'),
      ownerType: rec.get('ownerType'),
      owner: rec.get('owner').properties,
      purchasePriceINR: rec.get('o').properties.purchasePriceINR ? (rec.get('o').properties.purchasePriceINR.toInt ? rec.get('o').properties.purchasePriceINR.toInt() : rec.get('o').properties.purchasePriceINR) : 0,
      ownershipSince: rec.get('o').properties.since,
    }));

    // 4. Cycle & Circular Transfer Pattern Scan (Scoped to entities in this clerk's approved properties)
    this.log('GRAPH_QUERY', `Scanning for Circular Transfer Rings: MATCH (c:Clerk {id: "${clerkId}"})-[:APPROVED]->(p)<-[:OWNS*1..2]-(origin:Citizen)-[:TRANSFERRED_TO*2..6]->(origin)`);
    const cycleRecords = await runQuery(`
      MATCH (c:Clerk {id: $clerkId})-[:APPROVED]->(p:Property)<-[:OWNS]-(origin:Citizen)
      MATCH path = (origin)-[:TRANSFERRED_TO*2..6]->(origin)
      RETURN DISTINCT [n IN nodes(path) | {id: n.id, name: n.name, address: n.address, pan: n.pan}] AS cycleNodes,
             [r IN relationships(path) | {date: r.date, considerationINR: r.considerationINR, deedNo: r.deedNo}] AS cycleRels,
             length(path) AS hopCount
    `, { clerkId });

    const cycles = cycleRecords.map(rec => ({
      cycleNodes: rec.get('cycleNodes'),
      cycleRels: rec.get('cycleRels'),
      hopCount: rec.get('hopCount').toInt ? rec.get('hopCount').toInt() : rec.get('hopCount'),
    }));

    if (cycles.length > 0) {
      this.log('ANOMALY_SCAN', ` [CRITICAL] Detected Circular Transfer Loop (${cycles[0].hopCount} hops): ${cycles[0].cycleNodes.map(n => n.name).join('  ')}`);
    } else {
      this.log('ANOMALY_SCAN', ` No closed circular transfer loops found in direct ownership hops.`);
    }

    // 5. Shell Entity / Co-Location / Directorship Connections
    this.log('GRAPH_QUERY', `Inspecting Directorship & Address Co-locations: MATCH (c)-[:SAME_ADDRESS_AS|DIRECTOR_OF]-(target)`);
    const entityLinkRecords = await runQuery(`
      MATCH (c:Clerk {id: $clerkId})
      OPTIONAL MATCH (c)-[coloc:SAME_ADDRESS_AS]-(cit:Citizen)-[dir:DIRECTOR_OF]->(cmp:Company)
      OPTIONAL MATCH (cit2:Citizen)-[benami:SAME_ADDRESS_AS]-(cit3:Citizen)
      WHERE cit2.id IN [x IN $approvedPropOwnerIds | x] OR cit3.id IN [x IN $approvedPropOwnerIds | x]
      RETURN coloc, cit, dir, cmp, cit2, benami, cit3
    `, {
      clerkId,
      approvedPropOwnerIds: propertyOwners.map(po => po.owner.id || ''),
    });

    const collusionLinks = [];
    entityLinkRecords.forEach(rec => {
      const cit = rec.get('cit');
      const cmp = rec.get('cmp');
      const cit2 = rec.get('cit2');
      const cit3 = rec.get('cit3');
      const benami = rec.get('benami');

      if (cit && cmp) {
        collusionLinks.push({
          type: 'CLERK_SHELL_COLLUSION',
          details: `Clerk shares residential address with ${cit.properties.name} (Director of ${cmp.properties.name}, CIN: ${cmp.properties.cin})`,
        });
      }
      if (cit2 && cit3 && benami) {
        collusionLinks.push({
          type: 'BENAMI_CO_LOCATION',
          details: `Co-located property transactors at same address: ${cit2.properties.name} & ${cit3.properties.name} (${cit2.properties.address})`,
        });
      }
    });

    if (collusionLinks.length > 0) {
      collusionLinks.forEach(link => {
        this.log('ANOMALY_SCAN', ` [SUSPICIOUS TIE] ${link.details}`);
      });
    }

    // 6. Valuation & Circle Rate Anomaly Computation
    const valuationAnomalies = [];
    approvedProperties.forEach(prop => {
      const ownerRecord = propertyOwners.find(po => po.propId === prop.id);
      if (ownerRecord && prop.circleRateINR > 0) {
        const purchasePrice = ownerRecord.purchasePriceINR;
        const circleRate = prop.circleRateINR;
        const discountRatio = (circleRate - purchasePrice) / circleRate;

        if (discountRatio > 0.4) {
          valuationAnomalies.push({
            propId: prop.id,
            surveyNo: prop.surveyNo,
            marketValuationINR: prop.marketValuationINR,
            circleRateINR: prop.circleRateINR,
            registeredPriceINR: purchasePrice,
            undervaluationPercent: Math.round(discountRatio * 100),
          });
        }
      }
    });

    if (valuationAnomalies.length > 0) {
      valuationAnomalies.forEach(va => {
        this.log('ANOMALY_SCAN', ` Severe Undervaluation on ${va.propId} (${va.surveyNo}): Registered at ₹${va.registeredPriceINR.toLocaleString('en-IN')} vs Circle Rate ₹${va.circleRateINR.toLocaleString('en-IN')} (${va.undervaluationPercent}% Evasion)`);
      });
    }

    const elapsed = Date.now() - startTime;
    this.log('GRAPH_INVESTIGATOR', ` Neo4j Subgraph Crawl complete in ${elapsed}ms. Extracted ${approvedProperties.length} properties, ${propertyOwners.length} owners, ${cycles.length} cycles, ${collusionLinks.length} entity links.`);

    return {
      clerk: clerkProps,
      approvedProperties,
      propertyOwners,
      cycles,
      collusionLinks,
      valuationAnomalies,
      crawlDurationMs: elapsed,
    };
  }
}

module.exports = GraphInvestigatorAgent;
