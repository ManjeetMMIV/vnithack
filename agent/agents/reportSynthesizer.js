/**
 * Agent 3: Legal & Graph Synthesis Agent
 * Synthesizes final Police Intelligence Dossier and builds an interactive
 * node-edge graph visualization payload directly from Neo4j records.
 */
class ReportSynthesizerAgent {
  constructor(logger = () => {}) {
    this.log = logger;
  }

  /**
   * Transforms raw forensic deductions and graph relationships into a standardized,
   * police-grade intelligence dossier. Constructs the visual node-edge payload required 
   * for interactive dashboard mapping (e.g., ForceGraph).
   * 
   * @param {Object} graphData - The raw extracted subgraph.
   * @param {Object} forensicData - The AI-generated forensic reasoning and verdicts.
   * @returns {Object} The finalized intelligence report optimized for UI rendering and review.
   */
  synthesize(graphData, forensicData) {
    this.log('RESULT', ` Synthesizing NAGAR Intelligence Dossier & Dynamic Graph Topology...`);

    const clerk = graphData.clerk;
    const properties = graphData.approvedProperties;
    const owners = graphData.propertyOwners;
    const cycles = graphData.cycles;

    // 1. Construct Visual Graph Payload (Nodes & Edges)
    const nodesMap = new Map();
    const edges = [];

    // Add Clerk Node
    nodesMap.set(clerk.id, {
      id: clerk.id,
      label: `${clerk.id}\n${clerk.name}`,
      name: clerk.name,
      type: 'CLERK',
      color: '#6c5ce7',
      size: 26,
      details: `${clerk.zone} | ${clerk.department}`,
    });

    // Add Property Nodes & Clerk -> Approved -> Property Edges
    properties.forEach(p => {
      nodesMap.set(p.id, {
        id: p.id,
        label: `${p.id}\n${p.surveyNo}`,
        name: p.surveyNo,
        type: 'PROPERTY',
        color: '#0984e3',
        size: 20,
        details: `${p.location} | ₹${(p.marketValuationINR / 10000000).toFixed(2)} Cr`,
      });

      edges.push({
        id: `${clerk.id}-${p.id}`,
        from: clerk.id,
        to: p.id,
        label: 'APPROVED',
        color: '#a29bfe',
        dashes: false,
      });
    });

    // Add Owner Nodes & Owner -> Owns -> Property Edges
    owners.forEach(po => {
      const o = po.owner;
      if (!nodesMap.has(o.id)) {
        const isCompany = po.ownerType === 'Company';
        nodesMap.set(o.id, {
          id: o.id,
          label: `${o.id}\n${o.name}`,
          name: o.name,
          type: isCompany ? 'COMPANY' : 'CITIZEN',
          color: isCompany ? '#e17055' : '#00b894',
          size: isCompany ? 24 : 18,
          details: isCompany ? `CIN: ${o.cin}` : `Address: ${o.address}`,
        });
      }

      edges.push({
        id: `${o.id}-${po.propId}`,
        from: o.id,
        to: po.propId,
        label: 'OWNS',
        color: '#00cec9',
        dashes: true,
      });
    });

    // Add Cycle Edges with Glowing Red / Highlight if present
    if (cycles.length > 0) {
      cycles.forEach(cycle => {
        const cycleNodes = cycle.cycleNodes;
        for (let i = 0; i < cycleNodes.length - 1; i++) {
          const fromNode = cycleNodes[i];
          const toNode = cycleNodes[i + 1];

          edges.push({
            id: `cycle-${fromNode.id}-${toNode.id}-${i}`,
            from: fromNode.id,
            to: toNode.id,
            label: 'TRANSFERRED_TO (LOOP)',
            color: '#d63031',
            width: 3,
            highlight: true,
          });
        }
      });
    }

    const visualGraph = {
      nodes: Array.from(nodesMap.values()),
      edges,
    };

    this.log('RESULT', ` Graph Topology Compiled: ${visualGraph.nodes.length} nodes, ${visualGraph.edges.length} relationships.`);
    this.log('RESULT', ` Final Recommendation: ${forensicData.recommendedAction}`);

    const finalReport = {
      clerkId: clerk.id,
      clerkName: clerk.name,
      zone: clerk.zone,
      department: clerk.department,
      status: forensicData.verdict,
      riskScore: forensicData.riskScore,
      patternTitle: forensicData.patternTitle,
      statutoryViolations: forensicData.statutoryViolations,
      suspectRoster: forensicData.suspectRoster,
      reasoningSteps: forensicData.reasoningSteps,
      recommendedAction: forensicData.recommendedAction,
      linkedProperties: properties.map(p => p.id),
      propertyDetails: properties,
      visualGraph,
    };

    return finalReport;
  }
}

module.exports = ReportSynthesizerAgent;
