const { LangGraphOrchestrator } = require('./langgraphWorkflow');

/**
 * MultiAgentOrchestrator
 * Powered by @langchain/langgraph StateGraph
 */
class MultiAgentOrchestrator {
  constructor(logEmitter = () => {}) {
    this.orchestrator = new LangGraphOrchestrator(logEmitter);
  }

  async runInvestigation(clerkId) {
    return await this.orchestrator.runInvestigation(clerkId);
  }
}

module.exports = MultiAgentOrchestrator;
