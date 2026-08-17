import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import propertyRoutes from "./routes/propertyRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Create HTTP Server & Socket.IO instance
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" }
});

// Real-time connection handler
io.on("connection", (socket) => {
    console.log(`Dashboard connected: ${socket.id}`);
});

// Middleware
app.use(cors());
app.use(express.json());

// Inject IO into request so routes can emit events
app.use((req, res, next) => {
    req.io = io;
    next();
});

// Routes
app.use("/api", propertyRoutes);

// Database Connection
async function connectDB() {
    let uri = process.env.MONGODB_URI;
    
    // If no URI is provided, use an in-memory MongoDB for testing
    if (!uri) {
        console.log("No MONGODB_URI found, starting in-memory MongoDB for testing...");
        const { MongoMemoryServer } = await import("mongodb-memory-server");
        const mongoServer = await MongoMemoryServer.create();
        uri = mongoServer.getUri();
    }

    try {
        await mongoose.connect(uri);
        console.log("Connected to MongoDB");
        
        // Prevent starting server multiple times during tests
        if (process.env.NODE_ENV !== "test") {
            server.listen(PORT, () => {
                console.log(`Server running on port ${PORT}`);
            });
        }
    } catch (error) {
        console.error("MongoDB connection error:", error);
    }
}

connectDB();

export { app, server };
