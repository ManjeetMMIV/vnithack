const express = require('express');
const router = express.Router();
const multer = require('multer');
const axios = require('axios');
const DocumentRecord = require('../models/DocumentRecord');
const { generateHash } = require('../utils/hashUtils');

// Multer memory storage (keeps file in memory buffer)
const upload = multer({ storage: multer.memoryStorage() });

// Blockchain API Base URL (teammate's service)
const BLOCKCHAIN_API_URL = process.env.BLOCKCHAIN_API_URL || 'http://localhost:8545/api/blockchain';

// 1. SUBMIT OR UPDATE DOCUMENT / LAND RECORD
router.post('/documents', upload.single('file'), async (req, res) => {
    try {
        const { docId, title, ownerName, areaSqFt, clerkId, latitude, longitude, textContent } = req.body;

        if (!docId) {
            return res.status(400).json({ error: 'Document / Record ID is required.' });
        }

        const existing = await DocumentRecord.findOne({ docId });

        let calculatedHash = '';
        let docToSave = null;

        if (req.file) {
            // Binary File Upload (PDF/Image/Doc)
            calculatedHash = generateHash(req.file.buffer);

            if (existing) {
                // UPDATE existing record in MongoDB without modifying genesisHash
                existing.title = title || req.file.originalname;
                existing.docType = 'FILE';
                existing.fileData = {
                    fileName: req.file.originalname,
                    mimeType: req.file.mimetype,
                    buffer: req.file.buffer
                };
                docToSave = existing;
            } else {
                // CREATE new record
                docToSave = new DocumentRecord({
                    docId,
                    title: title || req.file.originalname,
                    docType: 'FILE',
                    fileData: {
                        fileName: req.file.originalname,
                        mimeType: req.file.mimetype,
                        buffer: req.file.buffer
                    },
                    genesisHash: calculatedHash
                });
            }
        } else {
            // Structured Land Record
            const recordPayload = {
                title: title || 'Land Record',
                ownerName: ownerName || 'Default Owner',
                areaSqFt: Number(areaSqFt) || 0,
                clerkId: clerkId || 'NMC_OFFICER_01',
                coordinates: {
                    latitude: Number(latitude) || 0,
                    longitude: Number(longitude) || 0
                },
                rawText: textContent || ''
            };

            calculatedHash = generateHash(recordPayload);

            if (existing) {
                // UPDATE existing record in MongoDB
                existing.title = recordPayload.title;
                existing.docType = 'RECORD';
                existing.recordData = {
                    ownerName: recordPayload.ownerName,
                    areaSqFt: recordPayload.areaSqFt,
                    clerkId: recordPayload.clerkId,
                    latitude: recordPayload.coordinates.latitude,
                    longitude: recordPayload.coordinates.longitude
                };
                docToSave = existing;
            } else {
                // CREATE new record
                docToSave = new DocumentRecord({
                    docId,
                    title: recordPayload.title,
                    docType: 'RECORD',
                    recordData: {
                        ownerName: recordPayload.ownerName,
                        areaSqFt: recordPayload.areaSqFt,
                        clerkId: recordPayload.clerkId,
                        latitude: recordPayload.coordinates.latitude,
                        longitude: recordPayload.coordinates.longitude
                    },
                    genesisHash: calculatedHash
                });
            }
        }

        // Save in MongoDB
        await docToSave.save();

        // Send to blockchain ONLY on initial creation
        // If it's an update, the blockchain is left untouched to demonstrate tampering/mismatch
        let blockchainStatus = 'UPDATED_IN_MONGO_ONLY';

        if (!existing) {
            try {
                const response = await axios.post(`${BLOCKCHAIN_API_URL}/commit`, {
                    id: docId,
                    hash: calculatedHash
                });
                blockchainStatus = 'COMMITTED_ON_CHAIN';
                console.log(`[Blockchain] Genesis hash committed for ID: ${docId}`, response.data);
            } catch (bcErr) {
                console.warn(`[Blockchain Warning] Could not reach blockchain API: ${bcErr.message}`);
                blockchainStatus = 'SAVED_LOCALLY_BC_OFFLINE';
            }
        }

        res.status(200).json({
            success: true,
            message: existing
                ? `Record ${docId} updated in MongoDB! Blockchain still holds original genesis hash.`
                : `Record ${docId} registered and committed to Blockchain.`,
            isUpdate: !!existing,
            data: {
                docId,
                title: docToSave.title,
                newCalculatedHash: calculatedHash,
                originalGenesisHash: docToSave.genesisHash,
                blockchainStatus
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. VERIFY DOCUMENT / RECORD INTEGRITY BY ID
router.get('/documents/verify/:docId', async (req, res) => {
    try {
        const { docId } = req.params;

        // Fetch document from MongoDB
        const doc = await DocumentRecord.findOne({ docId });
        if (!doc) {
            return res.status(404).json({ error: `Record with ID "${docId}" not found in database.` });
        }

        // Recompute live hash from current MongoDB data
        let liveHash = '';
        if (doc.docType === 'FILE') {
            liveHash = generateHash(doc.fileData.buffer);
        } else {
            const currentPayload = {
                title: doc.title,
                ownerName: doc.recordData.ownerName,
                areaSqFt: doc.recordData.areaSqFt,
                clerkId: doc.recordData.clerkId,
                coordinates: {
                    latitude: doc.recordData.latitude,
                    longitude: doc.recordData.longitude
                },
                rawText: ''
            };
            liveHash = generateHash(currentPayload);
        }

        // Query friend's Blockchain API with the docId param
        let blockchainHash = null;
        let blockchainOnline = false;

        try {
            const bcResponse = await axios.get(`${BLOCKCHAIN_API_URL}/verify/${docId}`);
            blockchainHash = bcResponse.data.hash || bcResponse.data.blockchainHash;
            blockchainOnline = true;
        } catch (bcErr) {
            console.warn(`[Blockchain Bridge] Failed to fetch hash from blockchain API: ${bcErr.message}`);
            // Fallback to stored genesis hash if the blockchain node is offline
            blockchainHash = doc.genesisHash;
        }

        // Compare hashes
        const isAuthentic = (liveHash === blockchainHash);

        res.json({
            success: true,
            docId: doc.docId,
            title: doc.title,
            docType: doc.docType,
            recordDetails: doc.docType === 'RECORD' ? doc.recordData : { fileName: doc.fileData.fileName },
            verification: {
                liveDatabaseHash: liveHash,
                blockchainStoredHash: blockchainHash,
                isAuthentic: isAuthentic,
                blockchainOnline: blockchainOnline,
                statusText: isAuthentic
                    ? 'AUTHENTIC RECORD - NO TAMPERING DETECTED'
                    : 'TAMPER DETECTED - HASH MISMATCH'
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. VIEW / DOWNLOAD STORED DOCUMENT
router.get('/documents/view/:docId', async (req, res) => {
    try {
        const doc = await DocumentRecord.findOne({ docId: req.params.docId });
        if (!doc) {
            return res.status(404).send('Document not found');
        }

        if (doc.docType === 'FILE') {
            res.set('Content-Type', doc.fileData.mimeType);
            res.set('Content-Disposition', `inline; filename="${doc.fileData.fileName}"`);
            return res.send(doc.fileData.buffer);
        } else {
            return res.json({
                docId: doc.docId,
                title: doc.title,
                recordData: doc.recordData,
                genesisHash: doc.genesisHash,
                createdAt: doc.createdAt
            });
        }
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// 4. DEMO HACK TRIGGER (Maliciously mutates MongoDB without notifying Blockchain)
router.post('/documents/tamper/:docId', async (req, res) => {
    try {
        const { docId } = req.params;
        const doc = await DocumentRecord.findOne({ docId });
        if (!doc) {
            return res.status(404).json({ error: 'Record not found.' });
        }

        if (doc.docType === 'FILE') {
            doc.fileData.buffer = Buffer.from(doc.fileData.buffer.toString() + ' [MALICIOUS_MODIFICATION]');
        } else {
            doc.recordData.ownerName = 'Gangs of Wasseypur Syndicate LLC';
            doc.recordData.clerkId = 'CORRUPT_ADMIN_666';
        }

        await doc.save();

        res.json({
            success: true,
            message: `Record ${docId} modified in MongoDB directly! Re-run verify to observe hash mismatch.`
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;