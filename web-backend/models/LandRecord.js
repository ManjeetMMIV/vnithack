const mongoose = require('mongoose');
const { calculateLandRecordHash } = require('../utils/hashUtils');

const LandRecordSchema = new mongoose.Schema({
  propertyId: {
    type: String,
    required: true,
    unique: true,
    index: true,
    trim: true,
  },
  ownerName: {
    type: String,
    required: true,
    trim: true,
  },
  coordinates: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
  },
  areaSqFt: {
    type: Number,
    required: true,
    default: 1000
  },
  clerkId: {
    type: String,
    required: true,
    trim: true,
  },
  storedExpectedHash: {
    type: String,
    required: true,
  },
  currentDataHash: {
    type: String,
    required: true,
  },
  isTampered: {
    type: Boolean,
    default: false,
  },
  history: [
    {
      action: String,
      modifiedBy: String,
      timestamp: { type: Date, default: Date.now },
      previousOwner: String,
      newOwner: String
    }
  ]
}, { timestamps: true });

LandRecordSchema.pre('validate', function(next) {
  if (this.isNew) {
    const computed = calculateLandRecordHash(this);
    this.currentDataHash = computed;
    this.storedExpectedHash = computed;
  }
  next();
});

module.exports = mongoose.model('LandRecord', LandRecordSchema);