const mongoose = require('mongoose');

const maintenanceRecordSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  serviceType: String,
  cost: Number,
  notes: String
});

const vehicleSchema = new mongoose.Schema({
    vehicleId: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },
    make: String,
    model: String,
    year: Number,
    specs: { // Embedded object for static data
        engineSize: String, // e.g., '2.5L'
        fuelType: {
            type: String,
            enum: ['Gasoline', 'Diesel', 'Electric', 'Hybrid']
        }
    },
    maintenanceHistory: [maintenanceRecordSchema]
});

const Vehicle = mongoose.model('Vehicle', vehicleSchema);
module.exports = Vehicle;