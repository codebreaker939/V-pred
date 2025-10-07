const mongoose = require('mongoose');
const { Schema } = mongoose;

const telemetrySchema = new mongoose.Schema({
    // This is a REFERENCE to the vehicle this data belongs to.
    vehicle: {
        type: Schema.Types.ObjectId,
        ref: 'Vehicle', // Links to the 'Vehicle' model
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    engineTemp: Number,
    tirePressure: Number,
    oilLevel: String,
    location: { // Storing location data is a great pro feature
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            default: [0, 0]
        }
    }
});

const Telemetry = mongoose.model('Telemetry', telemetrySchema);
module.exports = Telemetry;