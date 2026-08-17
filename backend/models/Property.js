import mongoose from "mongoose";

const propertySchema = new mongoose.Schema({
    propertyId: {
        type: String,
        required: true,
        unique: true
    },
    owner: {
        type: String,
        required: true
    },
    coordinates: {
        type: String,
        required: true
    },
    clerkId: {
        type: String,
        required: true
    }
}, { timestamps: true });

export default mongoose.model("Property", propertySchema);
