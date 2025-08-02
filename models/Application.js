const mongoose_app = require('mongoose');

const applicationSchema = new mongoose.Schema({
    permitCategory: { 
        type: String, 
        required: true, 
        enum: ['Building Permit', 'Electrical Permit', 'Occupancy Permit'],
        default: 'Building Permit' 
    },

    applicationType: { type: String, enum: ['Simple', 'Complex'] },
    permitType: { type: String, enum: ['New', 'Renewal', 'Amendatory'] },
    appliesFor: { locationalClearance: { type: Boolean, default: false }, fireSafetyClearance: { type: Boolean, default: false }, },
    permitNo: { type: String, required: true, unique: true },
    status: { type: String, default: 'For Evaluation' },
    dateFiled: { type: Date, default: Date.now },
    applicant: { type: String, required: true },
    applicantTIN: { type: String },
    applicantAddress: { type: String },
    applicantContactNo: { type: String },
    location: { type: String, required: true },
    lotNo: { type: String },
    blkNo: { type: String },
    tctNo: { type: String },
    taxDecNo: { type: String },
     latitude: { type: Number },
    longitude: { type: Number },
    scopeOfWork: { type: String, required: true },
    characterOfOccupancy: [{ type: String }],
    numberOfUnits: { type: Number },
    numberOfStorey: { type: Number },
    totalFloorArea: { type: Number },
    lotArea: { type: Number },
    totalEstimatedCost: { type: Number },
    costOfEquipmentInstalled: { type: Number },
    costBreakdown: { building: { type: Number, default: 0 }, electrical: { type: Number, default: 0 }, mechanical: { type: Number, default: 0 }, electronics: { type: Number, default: 0 }, plumbing: { type: Number, default: 0 }, others: { type: Number, default: 0 }, },
    proposedDateOfConstruction: { type: Date },
    expectedDateOfCompletion: { type: Date },
    inspector: { name: { type: String }, address: { type: String }, prcNo: { type: String }, ptrNo: { type: String }, issuedAt: { type: String }, validity: { type: String }, dateIssued: { type: String }, tin: { type: String }, },
    applicantSignature: { govIdNo: { type: String }, dateIssued: { type: String }, placeIssued: { type: String }, },
    lotOwnerConsent: { name: { type: String }, govIdNo: { type: String }, dateIssued: { type: String }, placeIssued: { type: String }, },
    notaryInfo: { docNo: { type: String }, pageNo: { type: String }, bookNo: { type: String }, seriesOf: { type: String }, notaryPublic: { type: String }, },
    assessedFees: { zoning: { type: Number, default: 0 }, filingFee: { type: Number, default: 0 }, lineAndGrade: { type: Number, default: 0 }, fencing: { type: Number, default: 0 }, architectural: { type: Number, default: 0 }, civilStructural: { type: Number, default: 0 }, electrical: { type: Number, default: 0 }, mechanical: { type: Number, default: 0 }, sanitary: { type: Number, default: 0 }, plumbing: { type: Number, default: 0 }, electronics: { type: Number, default: 0 }, interior: { type: Number, default: 0 }, surcharges: { type: Number, default: 0 }, penalties: { type: Number, default: 0 }, fireCodeConstructionTax: { type: Number, default: 0 }, hotworks: { type: Number, default: 0 }, }
});
const Application = mongoose.model('Application', applicationSchema);
module.exports = Application;