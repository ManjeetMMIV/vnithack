import * as chai from 'chai';
import request from 'supertest';
import sinon from 'sinon';
import mongoose from 'mongoose';
import { app, server } from '../server.js';
import Property from '../models/Property.js';
import blockchainService from '../blockchainService.js';

const { expect } = chai;

describe('Property API Routes', () => {
    let mockTxHash = "0xmockedtxhash123456789";

    before(async () => {
        // Wait for mongoose to connect (handled by server.js initialization)
        if (mongoose.connection.readyState === 0) {
            await new Promise(resolve => mongoose.connection.once('open', resolve));
        }
    });

    beforeEach(async () => {
        await Property.deleteMany({});
        
        // Mock Blockchain writes and reads
        sinon.stub(blockchainService, 'storeHashOnChain').resolves(mockTxHash);
        sinon.stub(blockchainService, 'verifyHashOnChain').callsFake(async (propertyId) => {
            // For tests, we assume the blockchain has exactly what's in the DB right now
            // unless we are specifically testing a tamper scenario.
            const p = await Property.findOne({ propertyId });
            if (!p) return { hash: "none", timestamp: 0 };
            
            // Re-hash to mock what's on chain
            const crypto = await import('crypto');
            const payloadString = JSON.stringify({
                propertyId: p.propertyId,
                owner: p.owner,
                coordinates: p.coordinates,
                clerkId: p.clerkId
            });
            const hash = crypto.createHash('sha256').update(payloadString).digest('hex');
            
            return { hash, timestamp: Date.now() / 1000 };
        });
    });

    afterEach(() => {
        sinon.restore();
    });

    after(async () => {
        await mongoose.disconnect();
        server.close();
    });

    describe('POST /api/records', () => {
        it('should create a new property successfully', async () => {
            const res = await request(app)
                .post('/api/records')
                .send({
                    propertyId: "TEST-001",
                    owner: "Alice",
                    coordinates: "10,20",
                    clerkId: "CLK-1"
                });

            expect(res.status).to.equal(201);
            expect(res.body).to.have.property('message', 'Record saved and cryptographically secured.');
            expect(res.body).to.have.property('blockchainTx', mockTxHash);

            const dbProp = await Property.findOne({ propertyId: "TEST-001" });
            expect(dbProp).to.not.be.null;
            expect(dbProp.owner).to.equal("Alice");
        });

        it('should return 400 if required fields are missing', async () => {
            const res = await request(app)
                .post('/api/records')
                .send({
                    owner: "Bob" // Missing propertyId, coordinates, clerkId
                });

            expect(res.status).to.equal(400);
            expect(res.body).to.have.property('error').that.includes('Missing required fields');
        });

        it('should return 409 Conflict if propertyId already exists', async () => {
            // Create first one
            await request(app).post('/api/records').send({
                propertyId: "TEST-002",
                owner: "Charlie",
                coordinates: "10,20",
                clerkId: "CLK-1"
            });

            // Try duplicate
            const res = await request(app).post('/api/records').send({
                propertyId: "TEST-002",
                owner: "David",
                coordinates: "30,40",
                clerkId: "CLK-2"
            });

            expect(res.status).to.equal(409);
            expect(res.body).to.have.property('error', 'Property ID already exists.');
        });
    });

    describe('GET /api/records', () => {
        it('should fetch all records', async () => {
            await Property.create([
                { propertyId: "TEST-003", owner: "Eve", coordinates: "0,0", clerkId: "CLK-1" },
                { propertyId: "TEST-004", owner: "Frank", coordinates: "1,1", clerkId: "CLK-2" }
            ]);

            const res = await request(app).get('/api/records');
            
            expect(res.status).to.equal(200);
            expect(res.body).to.be.an('array').with.lengthOf(2);
        });
    });

    describe('GET /api/records/:propertyId', () => {
        it('should fetch a single specific record', async () => {
            await Property.create({ propertyId: "TEST-005", owner: "Grace", coordinates: "5,5", clerkId: "CLK-1" });

            const res = await request(app).get('/api/records/TEST-005');
            
            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('propertyId', 'TEST-005');
            expect(res.body).to.have.property('owner', 'Grace');
        });

        it('should return 404 if record does not exist', async () => {
            const res = await request(app).get('/api/records/NON_EXISTENT');
            
            expect(res.status).to.equal(404);
            expect(res.body).to.have.property('error', 'Property not found.');
        });
    });

    describe('GET /api/audit/:propertyId', () => {
        it('should return 200 AUTHENTIC for a valid record', async () => {
            await request(app).post('/api/records').send({
                propertyId: "TEST-006",
                owner: "Hank",
                coordinates: "6,6",
                clerkId: "CLK-1"
            });

            const res = await request(app).get('/api/audit/TEST-006');
            
            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('status', 'AUTHENTIC');
        });

        it('should return 409 TAMPERED for an altered record', async () => {
            await request(app).post('/api/records').send({
                propertyId: "TEST-007",
                owner: "Ivy",
                coordinates: "7,7",
                clerkId: "CLK-1"
            });

            // Alter the mock to return a DIFFERENT hash than what's in the DB
            blockchainService.verifyHashOnChain.restore();
            sinon.stub(blockchainService, 'verifyHashOnChain').resolves({
                hash: "0xfakeblockchainhash",
                timestamp: Date.now() / 1000
            });

            const res = await request(app).get('/api/audit/TEST-007');
            
            expect(res.status).to.equal(409);
            expect(res.body).to.have.property('status', 'TAMPERED');
        });
    });

    describe('PUT /api/hack/:propertyId', () => {
        it('should successfully alter the record owner', async () => {
            await Property.create({ propertyId: "TEST-008", owner: "Jack", coordinates: "8,8", clerkId: "CLK-1" });

            const res = await request(app)
                .put('/api/hack/TEST-008')
                .send({ newOwner: "Hacker" });

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('newOwner', 'Hacker');

            const dbProp = await Property.findOne({ propertyId: "TEST-008" });
            expect(dbProp.owner).to.equal("Hacker");
        });
    });
});
