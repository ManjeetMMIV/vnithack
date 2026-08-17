# 🛡️  AI Fraud Intelligence Engine (Backend & Frontend)

Autonomous **LangGraph Multi-Agent StateGraph** & **Neo4j Aura Cloud** system built for land registry corruption discovery and criminal syndicate detection.

---

## 📁 Clean Directory Layout

```
d:\vnithack\agent\
├── agents/                      # 🤖 LangGraph Multi-Agent Architecture
│   ├── graphInvestigator.js     # Agent 1: Neo4j Cypher Graph Crawler & Subgraph Extractor
│   ├── forensicAnalyzer.js      # Agent 2: OpenAI GPT-4o-mini Forensic CoT Reasoner
│   ├── reportSynthesizer.js     # Agent 3: Police Dossier & Visual Topology Synthesizer
│   ├── langgraphWorkflow.js     # LangGraph StateGraph Definition & Conditional Router
│   └── orchestrator.js          # Master Orchestrator (Importable by other services)
│
├── frontend/                    # ⚛️ React 18 + Vite Auditor Dashboard
│   ├── src/
│   │   ├── App.jsx              # Main Dashboard Controller
│   │   ├── GraphVisualizer.jsx  # Interactive Canvas Neo4j Subgraph Visualizer
│   │   ├── PoliceDossier.jsx    # Statutory Charges & Suspect Roster Report Card
│   │   ├── App.css              # Custom UI & Terminal Styling
│   │   └── main.jsx
│   └── package.json
│
├── neo4jClient.js               # 🔌 Neo4j Aura Connection Pool Helper
├── seedGraph.js                 # 🌿 Database Seeder (5 Clerks, 20 Properties, Syndicates)
├── server.js                    # 🚀 Express API Server (REST & SSE Stream endpoints)
├── verifyGraph.js               # 🔍 Cypher Query Verification Test Suite
├── testOrchestrator.js          # 🧪 LangGraph CLI Testing Suite
├── .env.example                 # 🔑 Environment Template
└── package.json
```

---

## ⚡ Quick Start for Developers

### 1. Environment Setup
Copy `.env.example` to `.env` in the `agent/` folder:
```bash
cp .env.example .env
```
Ensure your `.env` contains:
```env
NEO4J_URI=neo4j+s://0ea2e782.databases.neo4j.io
NEO4J_USER=0ea2e782
NEO4J_PASSWORD=your_neo4j_password
OPENAI_API_KEY=sk-proj-your_openai_key
PORT=3001
```

### 2. Install Dependencies
In the `agent/` directory:
```bash
npm install
cd frontend && npm install && cd ..
```

### 3. Seed the Neo4j Aura Database (One-time)
```bash
npm run seed
```

### 4. Start Backend Server (Port 3001)
```bash
npm start
```

### 5. Start Frontend Dev Server (Port 5173)
```bash
cd frontend
npm run dev
```
Open **`http://localhost:5173`** in your browser.

---

## 🔌 API Endpoints for Integration

| Method | Endpoint | Description | Response Type |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Service health check | `JSON` |
| `GET` | `/api/clerks` | Fetch dynamic clerk roster from Neo4j | `JSON Array` |
| `GET` | `/api/agent/analyze/:clerkId` | Real-time LangGraph multi-agent investigation stream | `Server-Sent Events (text/event-stream)` |

---

## 📦 Programmatic Export for Other Backend Services

If another Node.js/Express service in the project needs to run the LangGraph Multi-Agent investigation directly without HTTP:

```javascript
const MultiAgentOrchestrator = require('./agents/orchestrator');

const orchestrator = new MultiAgentOrchestrator((phase, message) => {
  console.log(`[${phase}] ${message}`);
});

// Run autonomous LangGraph investigation on any clerk ID
const finalReport = await orchestrator.runInvestigation('CLK-042');
console.log('Risk Score:', finalReport.riskScore);
console.log('Pattern:', finalReport.patternTitle);
console.log('Suspects:', finalReport.suspectRoster);
```
