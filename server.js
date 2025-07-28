// server.js

// --- IMPORTS ---
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// --- DEBUGGING LOG ---
console.log("--- Server file version: 8.0 (JWT Integration) ---");

// --- INITIALIZATION ---
const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = 'your_super_secret_key_change_this_later';

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json());

// --- MONGODB CONNECTION ---
const MONGO_URI = 'mongodb+srv://admin123:admin123@cluster0.pwhiz83.mongodb.net/lgu-permit-db?retryWrites=true&w=majority&appName=Cluster0'; 
mongoose.connect(MONGO_URI)
.then(() => console.log('Successfully connected to MongoDB.'))
.catch(err => console.error('Connection error', err));

// --- MONGOOSE SCHEMAS & MODELS ---



// Application Schema
const applicationSchema = new mongoose.Schema({
// NEW: Field to store the type of permit
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

// User Schema
const userSchema = new mongoose.Schema({
    userAccessLevel: { type: String, required: true },
    employeeId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    office: { type: String, required: true },
    password: { type: String, required: true },
});
const User = mongoose.model('User', userSchema);


// --- AUTHENTICATION API ROUTES ---

// POST /api/auth/register
app.post('/api/auth/register', async (req, res) => {
    try {
        const { userAccessLevel, employeeId, name, email, office, password } = req.body;
        if (!employeeId || !password || !name || !email || !office) {
            return res.status(400).json({ message: 'Please fill out all required fields.' });
        }
        const existingUser = await User.findOne({ $or: [{ employeeId }, { email }] });
        if (existingUser) {
            return res.status(400).json({ message: 'User with this Employee ID or Email already exists.' });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = new User({ userAccessLevel, employeeId, name, email, office, password: hashedPassword });
        await newUser.save();
        res.status(201).json({ message: 'User registered successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Server error during registration.', error: error.message });
    }
});

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { userAccessLevel, employeeId, password } = req.body;
        if (!employeeId || !password) {
            return res.status(400).json({ message: 'Employee ID and password are required.' });
        }
        const user = await User.findOne({ employeeId, userAccessLevel });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials or user access level.' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials.' });
        }
        const payload = { user: { id: user.id, name: user.name, level: user.userAccessLevel } };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });
        res.status(200).json({ message: 'Login successful!', token });
    } catch (error) {
        res.status(500).json({ message: 'Server error during login.', error: error.message });
    }
});


// --- JWT Authentication Middleware ---
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }
    try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded.user;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid token.' });
    }
};


// --- APPLICATION API ROUTES (Now Protected) ---
// UPDATED: GET /api/applications - Now handles search and filtering
app.get('/api/applications', authMiddleware, async (req, res) => {
    try {
        const { search, status, dateFrom, dateTo, page = 1, limit = 10 } = req.query;
        const filter = {};

        if (status) {
            filter.status = status;
        }

        if (search) {
            const searchRegex = new RegExp(search, 'i');
            filter.$or = [
                { applicant: searchRegex },
                { permitNo: searchRegex },
                { location: searchRegex }
            ];
        }
        
        if (dateFrom || dateTo) {
            filter.dateFiled = {};
            if (dateFrom) {
                filter.dateFiled.$gte = new Date(dateFrom);
            }
            if (dateTo) {
                const toDate = new Date(dateTo);
                toDate.setHours(23, 59, 59, 999);
                filter.dateFiled.$lte = toDate;
            }
        }

        // Convert page and limit to numbers
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const skip = (pageNum - 1) * limitNum;

        // Get the total count of documents that match the filter for pagination
        const totalDocuments = await Application.countDocuments(filter);
        const totalPages = Math.ceil(totalDocuments / limitNum);

        // Fetch the paginated data
        const applications = await Application.find(filter)
            .sort({ dateFiled: -1 })
            .skip(skip)
            .limit(limitNum);
        
        // Send back the data along with pagination info
        res.json({
            applications,
            pagination: {
                currentPage: pageNum,
                totalPages,
                totalDocuments
            }
        });

    } catch (error) {
        res.status(500).json({ message: 'Error fetching applications', error });
    }
});






app.get('/api/applications', authMiddleware, async (req, res) => { try { const applications = await Application.find().sort({ dateFiled: -1 }); res.json(applications); } catch (error) { res.status(500).json({ message: 'Error fetching applications', error }); } });
app.post('/api/applications', authMiddleware, async (req, res) => { try { const newApplicationData = { ...req.body, permitNo: `2025-${new Date().getMonth() + 1}-${Math.floor(Math.random() * 1000) + 1200}` }; const newApplication = new Application(newApplicationData); const savedApplication = await newApplication.save(); res.status(201).json(savedApplication); } catch (error) { if (error.name === 'ValidationError') { return res.status(400).json({ message: 'Validation Error', errors: error.errors }); } res.status(400).json({ message: 'Error creating application', error }); } });
app.get('/api/applications/:id', authMiddleware, async (req, res) => { try { const application = await Application.findById(req.params.id); if (!application) return res.status(404).json({ message: 'Application not found' }); res.json(application); } catch (error) { res.status(500).json({ message: 'Error fetching application', error }); } });
app.put('/api/applications/:id', authMiddleware, async (req, res) => { try { const updatedApplication = await Application.findByIdAndUpdate( req.params.id, req.body, { new: true, runValidators: true } ); if (!updatedApplication) return res.status(404).json({ message: 'Application not found' }); res.json(updatedApplication); } catch (error) { res.status(500).json({ message: 'Error updating application', error }); } });
app.get('/api/applications/:id/report', authMiddleware, async (req, res) => {
    try {
        const application = await Application.findById(req.params.id).lean();
        if (!application) return res.status(404).send('Application not found');
        const templatePath = path.resolve(__dirname, 'report-template.docx');
        const content = fs.readFileSync(templatePath, 'binary');
        const zip = new PizZip(content);
        const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });
        const data = { ...application, dateFiledFormatted: new Date(application.dateFiled).toLocaleDateString() };
        doc.render(data);
        const buf = doc.getZip().generate({ type: 'nodebuffer', compression: 'DEFLATE' });
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        res.setHeader('Content-Disposition', `attachment; filename=Permit-Report-${application.permitNo}.docx`);
        res.send(buf);
    } catch (error) {
        console.error('Error in report generation route:', error);
        res.status(500).send('Internal Server Error');
    }
});


// --- START SERVER ---
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
