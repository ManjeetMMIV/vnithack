import express from 'express';
import multer from 'multer';
import DocumentRecord from '../models/DocumentRecord.js';
import { generateHash } from '../utils/hashUtils.js';
import blockchainService from '../blockchainService.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

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
            calculatedHash = generateHash(req.file.buffer);

            if (existing) {
                existing.title = title || req.file.originalname;
                existing.docType = 'FILE';
                existing.fileData = {
                    fileName: req.file.originalname,
                    mimeType: req.file.mimetype,
                    buffer: req.file.buffer
                };
                docToSave = existing;
            } else {
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

        await docToSave.save();

        let blockchainStatus = 'UPDATED_IN_MONGO_ONLY';
        let txHash = null;

        if (!existing) {
            try {
                // Call blockchain natively instead of via HTTP!
                txHash = await blockchainService.storeHashOnChain(docId, calculatedHash);
                blockchainStatus = 'COMMITTED_ON_CHAIN';
                
                if (req.io) {
                    req.io.emit("log", {
                        type: "CREATE",
                        message: `New document record stored for ${docId}.`,
                        propertyId: docId,
                        hash: calculatedHash,
                        txHash
                    });
                }
            } catch (bcErr) {
                console.warn(`[Blockchain Warning] Could not commit hash to blockchain: ${bcErr.message}`);
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
                blockchainStatus,
                txHash
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

        const doc = await DocumentRecord.findOne({ docId });
        if (!doc) {
            return res.status(404).json({ error: `Record with ID "${docId}" not found in database.` });
        }

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

        let blockchainHash = null;
        let blockchainOnline = false;

        try {
            // Verify natively
            const chainData = await blockchainService.verifyHashOnChain(docId);
            blockchainHash = chainData.hash;
            blockchainOnline = true;
        } catch (bcErr) {
            console.warn(`[Blockchain Bridge] Failed to fetch hash from blockchain API: ${bcErr.message}`);
            blockchainHash = doc.genesisHash;
        }

        const isAuthentic = (liveHash === blockchainHash);

        if (!isAuthentic && req.io) {
            req.io.emit("log", {
                type: "TAMPER_ALERT",
                message: `TAMPERING DETECTED on ${docId}! Database hash does not match immutable blockchain record.`,
                propertyId: docId,
                expectedHash: blockchainHash,
                actualHash: liveHash
            });
        }

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

// 4. DEMO HACK TRIGGER
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

        if (req.io) {
            req.io.emit("log", {
                type: "HACK",
                message: `CRITICAL: Centralized database compromised! Record ${docId} maliciously altered.`,
                propertyId: docId
            });
        }

        res.json({
            success: true,
            message: `Record ${docId} modified in MongoDB directly! Re-run verify to observe hash mismatch.`
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
