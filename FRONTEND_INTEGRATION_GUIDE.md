# Frontend API & RPC Integration Guide

Welcome to the Frontend Integration documentation! This guide exposes everything you need to connect the user interfaces to the backend services, the real-time event streams, and directly to the Polygon blockchain via RPCs.

---

## 1. Node.js Core Backend APIs (Port 5000)

The core backend handles creating records and auditing them against the blockchain.
Base URL: `http://localhost:5000/api`

### `POST /api/records`
Creates a new property record in MongoDB and hashes it to the Polygon blockchain.
**Body:**
```json
{
  "propertyId": "PROP-123",
  "owner": "John Doe",
  "coordinates": "40.7128° N, 74.0060° W",
  "clerkId": "CLK-042"
}
```
**Response:** `201 Created`
```json
{
  "message": "Record saved and cryptographically secured.",
  "propertyId": "PROP-123",
  "blockchainTx": "0x123abc..."
}
```

### `GET /api/audit/:propertyId`
Audits a property by comparing the MongoDB data hash against the Polygon blockchain hash.
**Response (Clean):** `200 OK`
```json
{
  "status": "AUTHENTIC",
  "message": "Record verified against the blockchain.",
  "hash": "a1b2c3d4..."
}
```
**Response (Tampered):** `409 Conflict`
```json
{
  "status": "TAMPERED",
  "message": "WARNING: Database mismatch detected! The data has been maliciously altered.",
  "expectedHash": "a1b2...",
  "actualHash": "f9e8...",
  "lastAuthenticTimestamp": "2026-08-17T12:00:00Z"
}
```

### `PUT /api/hack/:propertyId`
**Secret Demo Route:** Maliciously alters the database record without updating the blockchain to demonstrate the tamper-detection system.
**Body:**
```json
{ "newOwner": "Mafia Boss" }
```

---

## 2. Real-Time WebSockets (Socket.io)

For building real-time dashboards that react to system events immediately.
**Connection URL:** `http://localhost:5000`

### Setup Example (React/Next.js)
```javascript
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

socket.on("log", (event) => {
  console.log(event);
});
```

### Event Payload Examples
The `log` channel will emit the following event types:
- **`CREATE`**: Fired when a new record is saved and hashed.
- **`AUDIT_OK`**: Fired when an audit passes.
- **`TAMPER_ALERT`**: Fired when an audit catches a mismatch (Pulsing Red UI).
- **`HACK`**: Fired when the secret hack route is triggered.

---

## 3. Neo4j LangGraph Agent APIs (Port 3001)

The intelligent AI investigation layer.
Base URL: `http://localhost:3001/api`

### `GET /api/clerks`
Fetches all clerks and their risk status from Neo4j.
**Response:**
```json
[
  {
    "id": "CLK-089",
    "name": "S. Kulkarni",
    "zone": "Zone 7",
    "status": "CRITICAL_FLAG",
    "risk": "Critical",
    "properties": 4
  }
]
```

### `GET /api/agent/analyze/:clerkId`
**Server-Sent Events (SSE) Stream:** Runs a live multi-agent AI investigation on a specific clerk.
**Setup Example:**
```javascript
const eventSource = new EventSource("http://localhost:3001/api/agent/analyze/CLK-089");

eventSource.addEventListener("log", (e) => {
  const data = JSON.parse(e.data);
  console.log(`Phase: ${data.phase}`, data.message);
});

eventSource.addEventListener("result", (e) => {
  const report = JSON.parse(e.data);
  console.log("Final Report:", report);
  eventSource.close();
});
```

---

## 4. Blockchain Direct RPC (MetaMask / Ethers.js)

If you want the frontend to read/write directly to the Polygon blockchain (e.g., prompting the user's MetaMask extension), use these specs:

- **Network:** Polygon Amoy Testnet (Chain ID: `80002`)
- **RPC URL:** `https://rpc-amoy.polygon.technology/`
- **Contract Address:** *(Found in your `.env` file)*

### Contract ABI
```json
[
  {
    "inputs": [
      { "internalType": "string", "name": "propertyId", "type": "string" },
      { "internalType": "string", "name": "documentHash", "type": "string" }
    ],
    "name": "commitHash",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "propertyId", "type": "string" }
    ],
    "name": "getHash",
    "outputs": [
      { "internalType": "string", "name": "", "type": "string" },
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  }
]
```
