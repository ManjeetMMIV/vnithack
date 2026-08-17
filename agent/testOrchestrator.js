require('dotenv').config();
const MultiAgentOrchestrator = require('./agents/orchestrator');
const { closeDriver } = require('./neo4jClient');

async function runCliTest() {
  const clerkId = process.argv[2] || 'CLK-042';

  console.log(`\n================ RUNNING MULTI-AGENT TEST FOR ${clerkId} ================\n`);

  const orchestrator = new MultiAgentOrchestrator((phase, message) => {
    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
    const colors = {
      INIT: '\x1b[36m',              // Cyan
      GRAPH_INVESTIGATOR: '\x1b[34m',// Blue
      GRAPH_QUERY: '\x1b[90m',       // Gray
      ANOMALY_SCAN: '\x1b[33m',      // Yellow
      ML_INFERENCE: '\x1b[35m',      // Magenta
      CORRELATION: '\x1b[33m',       // Yellow
      RESULT: '\x1b[32m',            // Green
    };
    const reset = '\x1b[0m';
    const color = colors[phase] || reset;
    console.log(`[${timestamp}] ${color}[${phase}]${reset} ${message}`);
  });

  try {
    const report = await orchestrator.runInvestigation(clerkId);
    console.log('\n--- FINAL DOSSIER PREVIEW ---');
    console.log('Risk Score:   ', report.riskScore);
    console.log('Pattern:      ', report.patternTitle);
    console.log('Violations:   ', report.statutoryViolations);
    console.log('Suspects:     ', report.suspectRoster);
    console.log('Action:       ', report.recommendedAction);
    console.log('Graph Nodes:  ', report.visualGraph.nodes.length);
    console.log('Graph Edges:  ', report.visualGraph.edges.length);
  } catch (err) {
    console.error(' Pipeline Error:', err);
  } finally {
    await closeDriver();
  }
}

runCliTest();
