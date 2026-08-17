import mongoose from 'mongoose';

const DocumentRecordSchema = new mongoose.Schema({
    docId: {
        type: String,
        required: true,
        unique: true,
        index: true,
        trim: true
    },
    title: {
        type: String,
        required: true
    },
    docType: {
        type: String,
        enum: ['FILE', 'RECORD'],
        required: true
    },
    // If record is Land Record metadata
    recordData: {
        ownerName: String,
        areaSqFt: Number,
        clerkId: String,
        latitude: Number,
        longitude: Number
    },
    // If record is an uploaded file
    fileData: {
        fileName: String,
        mimeType: String,
        buffer: Buffer
    },
    // Original Genesis hash stored at time of creation
    genesisHash: {
        type: String,
        required: true
    }
}, { timestamps: true });

export default mongoose.model('DocumentRecord', DocumentRecordSchema);
