const { StateGraph, Annotation, START, END } = require('@langchain/langgraph');
const GraphInvestigatorAgent = require('./graphInvestigator');
const ForensicAnalyzerAgent = require('./forensicAnalyzer');
const ReportSynthesizerAgent = require('./reportSynthesizer');

/**
 * State Definition for the LangGraph Multi-Agent Investigation System
 */
const InvestigationStateAnnotation = Annotation.Root({
  clerkId: Annotation({
    reducer: (_, next) => next,
    default: () => '',
  }),
  graphData: Annotation({
    reducer: (_, next) => next,
    default: () => null,
  }),
  forensicData: Annotation({
    reducer: (_, next) => next,
    default: () => null,
  }),
  finalReport: Annotation({
    reducer: (_, next) => next,
    default: () => null,
  }),
  logger: Annotation({
    reducer: (_, next) => next,
    default: () => () => {},
  }),
});

/**
 * Node 1: Graph Crawler & Neo4j Subgraph Extraction Node
 * Orchestrates the autonomous database traversal agent to securely fetch 
 * structured transaction histories and known associates.
 * 
 * @param {Object} state - The current state of the LangGraph workflow.
 * @returns {Object} Updated state containing the graphData payload.
 */
async function graphCrawlerNode(state) {
  const log = state.logger || (() => {});
  log('INIT', `[LangGraph: graphCrawlerNode] Starting autonomous Neo4j crawl...`);

  const investigator = new GraphInvestigatorAgent(log);
  const graphData = await investigator.investigate(state.clerkId);

  return { graphData };
}

/**
 * Conditional Edge: Anomaly Detection Router
 * Evaluates whether the extracted graph topology warrants deep LLM forensic reasoning.
 * Bypasses the costly LLM inference if the subgraph exhibits zero risk indicators.
 * 
 * @param {Object} state - The current workflow state.
 * @returns {string} The name of the next node to execute ('forensicReasoner' or 'cleanSynthesizer').
 */
function anomalyRouter(state) {
  const log = state.logger || (() => {});
  const { graphData } = state;

  const hasCycles = graphData.cycles && graphData.cycles.length > 0;
  const hasCollusion = graphData.collusionLinks && graphData.collusionLinks.length > 0;
  const hasValuationGap = graphData.valuationAnomalies && graphData.valuationAnomalies.length > 0;
  const isFlagged = graphData.clerk && graphData.clerk.status !== 'CLEAN';

  if (hasCycles || hasCollusion || hasValuationGap || isFlagged) {
    log('CORRELATION', `[LangGraph Router] Anomalies detected in Neo4j subgraph. Routing to [forensicReasonerNode]...`);
    return 'forensicReasoner';
  } else {
    log('CORRELATION', `[LangGraph Router] Subgraph clean. Routing directly to [legalSynthesizerNode]...`);
    return 'cleanSynthesizer';
  }
}

/**
 * Node 2: Forensic AI Reasoner Node (OpenAI GPT-4o-mini)
 * Delegates complex spatial and financial deduction tasks to an LLM.
 * 
 * @param {Object} state - The current workflow state.
 * @returns {Object} Updated state containing the calculated forensicData.
 */
async function forensicReasonerNode(state) {
  const log = state.logger || (() => {});
  log('ML_INFERENCE', `[LangGraph: forensicReasonerNode] Executing deep chain-of-thought analysis...`);

  const analyzer = new ForensicAnalyzerAgent(log);
  const forensicData = await analyzer.analyze(state.graphData);

  return { forensicData };
}

/**
 * Node 3A: Clean Case Synthesis Node (Fast path)
 * Generates an automated clean-bill-of-health report for transactions
 * that did not trigger the anomaly detection heuristic.
 * 
 * @param {Object} state - The current workflow state.
 * @returns {Object} Updated state containing a benign forensicData object.
 */
async function cleanSynthesizerNode(state) {
  const log = state.logger || (() => {});
  log('RESULT', `[LangGraph: cleanSynthesizerNode] Compiling clean clearance record...`);

  const forensicData = {
    verdict: 'CLEAN_RECORD',
    riskScore: 0.04,
    patternTitle: 'Legitimate Residential Transactions',
    statutoryViolations: [],
    suspectRoster: [],
    reasoningSteps: [
      'All property valuations align with government circle rates.',
      'No circular ownership transfers or shell entity co-locations detected in Neo4j graph.',
      'All transactions comply with standard Sub-Registrar procedural norms.',
    ],
    recommendedAction: 'Standard title clearance. No police or administrative action required.',
  };

  return { forensicData };
}

/**
 * Node 3B: Final Legal & Graph Visualization Synthesis Node
 * Merges raw data and AI analysis into a structured JSON dossier intended 
 * for frontend visualization or law enforcement archiving.
 * 
 * @param {Object} state - The current workflow state.
 * @returns {Object} Updated state containing the finalReport.
 */
async function legalSynthesizerNode(state) {
  const log = state.logger || (() => {});
  log('RESULT', `[LangGraph: legalSynthesizerNode] Generating Police Dossier & Interactive Graph Topology...`);

  const synthesizer = new ReportSynthesizerAgent(log);
  const finalReport = synthesizer.synthesize(state.graphData, state.forensicData);

  return { finalReport };
}

/**
 * Build and compile the LangGraph Workflow
 */
function createLangGraphWorkflow() {
  const workflow = new StateGraph(InvestigationStateAnnotation)
    .addNode('graphCrawler', graphCrawlerNode)
    .addNode('forensicReasoner', forensicReasonerNode)
    .addNode('cleanSynthesizer', cleanSynthesizerNode)
    .addNode('legalSynthesizer', legalSynthesizerNode)
    .addEdge(START, 'graphCrawler')
    .addConditionalEdges('graphCrawler', anomalyRouter, {
      forensicReasoner: 'forensicReasoner',
      cleanSynthesizer: 'cleanSynthesizer',
    })
    .addEdge('forensicReasoner', 'legalSynthesizer')
    .addEdge('cleanSynthesizer', 'legalSynthesizer')
    .addEdge('legalSynthesizer', END);

  return workflow.compile();
}

/**
 * Master LangGraph Execution Helper
 */
class LangGraphOrchestrator {
  constructor(logEmitter = () => {}) {
    this.emitLog = logEmitter;
    this.app = createLangGraphWorkflow();
  }

  async runInvestigation(clerkId) {
    this.emitLog('INIT', `══════════════════════════════════════════════════════`);
    this.emitLog('INIT', ` LANGGRAPH MULTI-AGENT STATEGRAPH INITIALIZED`);
    this.emitLog('INIT', ` Target: Clerk [${clerkId}] | Directed StateGraph Execution`);
    this.emitLog('INIT', `══════════════════════════════════════════════════════`);

    const initialState = {
      clerkId,
      logger: this.emitLog,
    };

    const finalState = await this.app.invoke(initialState);
    return finalState.finalReport;
  }
}

module.exports = {
  createLangGraphWorkflow,
  LangGraphOrchestrator,
};
