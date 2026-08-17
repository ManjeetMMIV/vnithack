require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const MultiAgentOrchestrator = require("./agents/orchestrator");
const { runQuery } = require("./neo4jClient");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());



// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "NAGAR LangGraph Multi-Agent Server is running" });
});

// Dynamic Clerks Roster from Neo4j
app.get("/api/clerks", async (req, res) => {
  try {
    const records = await runQuery(`
      MATCH (c:Clerk)
      OPTIONAL MATCH (c)-[:APPROVED]->(p:Property)
      RETURN c.id AS id, c.name AS name, c.zone AS zone, c.department AS department, c.status AS status, count(p) AS propertyCount
      ORDER BY c.id
    `);

    const clerks = records.map(r => ({
      id: r.get('id'),
      name: r.get('name'),
      zone: r.get('zone'),
      department: r.get('department'),
      status: r.get('status'),
      properties: r.get('propertyCount').toInt ? r.get('propertyCount').toInt() : r.get('propertyCount'),
      risk: r.get('status') === 'CRITICAL_FLAG' ? 'Critical' : r.get('status') === 'FLAGGED' ? 'High' : r.get('status') === 'UNDER_WATCH' ? 'Medium' : 'Low',
    }));

    res.json(clerks);
  } catch (error) {
    console.error('Error fetching clerks from Neo4j:', error);
    res.status(500).json({ error: error.message });
  }
});

// Real-Time LangGraph Multi-Agent SSE Investigation Stream
app.get("/api/agent/analyze/:clerkId", async (req, res) => {
  const { clerkId } = req.params;

  // Set SSE headers
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  let isClosed = false;
  req.on("close", () => {
    isClosed = true;
  });

  const sendEvent = (eventType, data) => {
    if (!isClosed) {
      res.write(`event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`);
    }
  };

  try {
    const orchestrator = new MultiAgentOrchestrator((phase, message) => {
      const timestamp = new Date().toLocaleTimeString("en-US", { hour12: false });
      sendEvent("log", {
        phase,
        message,
        timestamp,
      });
    });

    const finalReport = await orchestrator.runInvestigation(clerkId);

    sendEvent("result", finalReport);
    res.end();
  } catch (error) {
    console.error(`LangGraph Investigation Error for ${clerkId}:`, error);
    sendEvent("log", {
      phase: "ERROR",
      message: ` Investigation halted: ${error.message}`,
      timestamp: new Date().toLocaleTimeString("en-US", { hour12: false }),
    });
    res.end();
  }
});

app.listen(PORT, () => {
  console.log(` NAGAR LangGraph Multi-Agent Server running at http://localhost:${PORT}`);
});
