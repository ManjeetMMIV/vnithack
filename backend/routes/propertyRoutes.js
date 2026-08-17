import express from "express";
import crypto from "crypto";
import Property from "../models/Property.js";
import blockchainService from "../blockchainService.js";

const router = express.Router();

/**
 * Helper function to generate a SHA-256 hash of the property payload.
 * Ensures consistent serialization of property data for blockchain verification.
 * 
 * @param {Object} data - The property data containing propertyId, owner, coordinates, and clerkId.
 * @returns {string} The hex string representation of the SHA-256 hash.
 */
function hashPayload(data) {
    const payloadString = JSON.stringify({
        propertyId: data.propertyId,
        owner: data.owner,
        coordinates: data.coordinates,
        clerkId: data.clerkId
    });
    return crypto.createHash('sha256').update(payloadString).digest('hex');
}

/**
 * POST /records
 * Creates a new property record in the MongoDB database and hashes it to the Polygon blockchain.
 * Handles edge cases such as missing required fields (400) and duplicate property IDs (409).
 */
router.post('/records', async (req, res) => {
    try {
        const { propertyId, owner, coordinates, clerkId } = req.body;

        if (!propertyId || !owner || !coordinates || !clerkId) {
            return res.status(400).json({ error: "Missing required fields: propertyId, owner, coordinates, clerkId." });
        }

        const newProperty = new Property({ propertyId, owner, coordinates, clerkId });
        await newProperty.save();

        const hash = hashPayload({ propertyId, owner, coordinates, clerkId });
        const txHash = await blockchainService.storeHashOnChain(propertyId, hash);

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
        if (error.code === 11000) {
            return res.status(409).json({ error: "Property ID already exists." });
        }
        console.error(error);
        res.status(500).json({ error: "Failed to create record." });
    }
});

/**
 * GET /records
 * Retrieves all land records from the centralized MongoDB database.
 * Used by the frontend to display a list of all properties.
 */
router.get('/records', async (req, res) => {
    try {
        const properties = await Property.find().sort({ createdAt: -1 });
        res.status(200).json(properties);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch records." });
    }
});

/**
 * GET /records/:propertyId
 * Retrieves the raw details of a specific property from the database without performing an audit.
 */
router.get('/records/:propertyId', async (req, res) => {
    try {
        const { propertyId } = req.params;
        const property = await Property.findOne({ propertyId });
        if (!property) {
            return res.status(404).json({ error: "Property not found." });
        }
        res.status(200).json(property);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch record." });
    }
});

/**
 * GET /audit/:propertyId
 * Audits a property by comparing the data hash in MongoDB against the immutable hash on the Polygon blockchain.
 * Emits real-time alerts if tampering is detected.
 */
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

        req.io.emit("log", {
            type: "AUDIT_OK",
            message: `Audit passed for ${propertyId}. Record is authentic.`,
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

/**
 * PUT /hack/:propertyId
 * Secret demo route used during presentations to maliciously alter the database record 
 * without updating the blockchain, thereby demonstrating the tamper-detection system.
 */
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
