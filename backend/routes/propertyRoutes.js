import express from "express";
import crypto from "crypto";
import Property from "../models/Property.js";
import blockchainService from "../blockchainService.js";

const router = express.Router();

function hashPayload(data) {
    const payloadString = JSON.stringify({
        propertyId: data.propertyId,
        owner: data.owner,
        coordinates: data.coordinates,
        clerkId: data.clerkId
    });
    return crypto.createHash('sha256').update(payloadString).digest('hex');
}

// 1. Create a new Land Record
router.post('/records', async (req, res) => {
    try {
        const { propertyId, owner, coordinates, clerkId } = req.body;

        const newProperty = new Property({ propertyId, owner, coordinates, clerkId });
        await newProperty.save();

        const hash = hashPayload({ propertyId, owner, coordinates, clerkId });
        const txHash = await blockchainService.storeHashOnChain(propertyId, hash);

        // Emit real-time event to the dashboard
        req.io.emit("log", {
            type: "CREATE",
            message: `New authentic record stored for ${propertyId}.`,
            propertyId,
            hash,
            txHash
        });

        res.status(201).json({ 
            message: "Record saved and cryptographically secured.", 
            propertyId,
            blockchainTx: txHash 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to create record." });
    }
});

// 2. Audit a Land Record
router.get('/audit/:propertyId', async (req, res) => {
    try {
        const { propertyId } = req.params;

        const property = await Property.findOne({ propertyId });
        if (!property) {
            return res.status(404).json({ error: "Property not found in database." });
        }

        const dbHash = hashPayload(property);
        const chainData = await blockchainService.verifyHashOnChain(propertyId);

        if (dbHash !== chainData.hash) {
            // Emit RED SIREN event to the dashboard
            req.io.emit("log", {
                type: "TAMPER_ALERT",
                message: `TAMPERING DETECTED on ${propertyId}! Database hash does not match immutable blockchain record.`,
                propertyId,
                expectedHash: chainData.hash,
                actualHash: dbHash
            });

            return res.status(409).json({ 
                status: "TAMPERED",
                message: "WARNING: Database mismatch detected! The data has been maliciously altered.",
                expectedHash: chainData.hash,
                actualHash: dbHash,
                lastAuthenticTimestamp: new Date(chainData.timestamp * 1000)
            });
        }

        // Emit success event
        req.io.emit("log", {
            type: "AUDIT_OK",
            message: `Audit passed for ${propertyId}. Record is 100% authentic.`,
            propertyId
        });

        res.status(200).json({ 
            status: "AUTHENTIC",
            message: "Record verified against the blockchain.",
            hash: dbHash
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to audit record." });
    }
});

// 3. The secret "Hack" Route for the Hackathon Demo
router.put('/hack/:propertyId', async (req, res) => {
    try {
        const { propertyId } = req.params;
        const { newOwner } = req.body;

        const property = await Property.findOne({ propertyId });
        if (!property) {
            return res.status(404).json({ error: "Property not found." });
        }

        property.owner = newOwner;
        await property.save();

        // Emit HACK event
        req.io.emit("log", {
            type: "HACK",
            message: `CRITICAL: Centralized database compromised! Record ${propertyId} maliciously altered to owner: ${newOwner}.`,
            propertyId
        });

        res.status(200).json({ 
            message: "SYSTEM COMPROMISED: Record secretly altered in centralized database.",
            newOwner: property.owner
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Hack failed." });
    }
});

export default router;
