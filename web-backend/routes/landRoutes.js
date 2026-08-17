const express = require('express');
const router = express.Router();
const axios = require('axios');
const LandRecord = require('../models/LandRecord');
const { calculateLandRecordHash } = require('../utils/hashUtils');

const BLOCKCHAIN_API_URL = process.env.BLOCKCHAIN_API_URL || 'http://localhost:8545/api/blockchain';

// 1. Create New Record (Saves to MongoDB + Commits Hash to Teammate's Blockchain API)
router.post('/records', async (req, res) => {
    try {
        const { propertyId, ownerName, coordinates, areaSqFt, clerkId } = req.body;

        const existing = await LandRecord.findOne({ propertyId });
        if (existing) {
            return res.status(400).json({ error: 'Property ID already exists.' });
        }

        const newRecord = new LandRecord({
            propertyId,
            ownerName,
            coordinates,
            areaSqFt,
            clerkId,
            history: [{
                action: 'INITIAL_REGISTRATION',
                modifiedBy: clerkId,
                newOwner: ownerName
            }]
        });

        // Calculate deterministic hash
        const genesisHash = calculateLandRecordHash(newRecord);
        newRecord.storedExpectedHash = genesisHash;
        newRecord.currentDataHash = genesisHash;

        await newRecord.save();

        // Call teammate's blockchain service to commit the hash on-chain
        try {
            await axios.post(`${BLOCKCHAIN_API_URL}/commit`, {
                propertyId,
                hash: genesisHash
            });
            console.log(`[Blockchain Bridge] Hash committed to ledger for ${propertyId}`);
        } catch (bcError) {
            console.warn(`[Blockchain Bridge Warning] Teammate API offline, falling back to MongoDB expected hash.`);
        }

        res.status(201).json({ success: true, data: newRecord });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Auditor Verification (Compares Live MongoDB Hash vs Teammate's On-Chain Hash)
router.get('/records/verify/:propertyId', async (req, res) => {
    try {
        const record = await LandRecord.findOne({ propertyId: req.params.propertyId });
        if (!record) {
            return res.status(404).json({ error: 'Record not found in Central Database.' });
        }

        // 1. Recompute live SHA-256 hash from DB values
        const liveCalculatedHash = calculateLandRecordHash(record);

        // 2. Fetch the immutable hash stored on the blockchain
        let onChainImmutableHash = record.storedExpectedHash; // Local fallback
        let sourceOfTruth = 'MongoDB Genesis Snapshot';

        try {
            const bcRes = await axios.get(`${BLOCKCHAIN_API_URL}/verify/${req.params.propertyId}`);
            if (bcRes.data?.blockchainHash) {
                onChainImmutableHash = bcRes.data.blockchainHash;
                sourceOfTruth = 'Hardhat / Smart Contract Ledger';
            }
        } catch (bcError) {
            console.warn(`[Blockchain Service] Bridge down, using stored genesis hash.`);
        }

        // 3. Mathematical proof of tampering
        const isTampered = liveCalculatedHash !== onChainImmutableHash;

        res.json({
            success: true,
            data: record,
            verification: {
                currentCalculatedHash: liveCalculatedHash,
                immutableLedgerHash: onChainImmutableHash,
                sourceOfTruth,
                integrityPassed: !isTampered,
                status: !isTampered ? 'AUTHENTIC_VERIFIED' : 'TAMPERED_ALERT'
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Demo Tamper Trigger (Maliciously edits MongoDB without updating the Blockchain)
router.post('/records/tamper', async (req, res) => {
    try {
        const { propertyId, maliciousNewOwner, maliciousClerkId } = req.body;

        const record = await LandRecord.findOne({ propertyId });
        if (!record) {
            return res.status(404).json({ error: 'Property not found.' });
        }

        const previousOwner = record.ownerName;

        // Mutate state in central DB
        record.ownerName = maliciousNewOwner || 'Land Mafia Syndicate Pvt Ltd';
        record.clerkId = maliciousClerkId || 'ROGUE_CLERK_999';
        record.isTampered = true;
        record.currentDataHash = calculateLandRecordHash(record);
        record.history.push({
            action: 'UNAUTHORIZED_ALTERATION',
            modifiedBy: record.clerkId,
            previousOwner,
            newOwner: record.ownerName
        });

        await record.save();

        res.json({
            success: true,
            message: 'Malicious modification executed directly on MongoDB.',
            tamperedRecord: record
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. Fetch All Records (for Mafia Graph & Directory)
router.get('/records', async (req, res) => {
    try {
        const records = await LandRecord.find().sort({ createdAt: -1 });
        res.json({ success: true, data: records });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;