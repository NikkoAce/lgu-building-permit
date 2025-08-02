const Application_controller = require('../models/Application');
const fs_controller = require('fs');
const path_controller = require('path');
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');


const getAllApplications = async (req, res) => {
    try {
        const { search, status, dateFrom, dateTo, page = 1, limit = 10 } = req.query;
        const filter = {};

        if (status) filter.status = status;
        if (search) {
            const searchRegex = new RegExp(search, 'i');
            filter.$or = [{ applicant: searchRegex }, { permitNo: searchRegex }, { location: searchRegex }];
        }
        if (dateFrom || dateTo) {
            filter.dateFiled = {};
            if (dateFrom) filter.dateFiled.$gte = new Date(dateFrom);
            if (dateTo) {
                const toDate = new Date(dateTo);
                toDate.setHours(23, 59, 59, 999);
                filter.dateFiled.$lte = toDate;
            }
        }

        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const skip = (pageNum - 1) * limitNum;

        const totalDocuments = await Application.countDocuments(filter);
        const totalPages = Math.ceil(totalDocuments / limitNum);

        const applications = await Application.find(filter).sort({ dateFiled: -1 }).skip(skip).limit(limitNum);
        
        res.json({
            applications,
            pagination: { currentPage: pageNum, totalPages, totalDocuments }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching applications', error });
    }
};

const createApplication = async (req, res) => {
    try {
        const newApplicationData = { ...req.body, permitNo: `2025-${new Date().getMonth() + 1}-${Math.floor(Math.random() * 1000) + 1200}` };
        const newApplication = new Application(newApplicationData);
        const savedApplication = await newApplication.save();
        res.status(201).json(savedApplication);
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: 'Validation Error', errors: error.errors });
        }
        res.status(400).json({ message: 'Error creating application', error });
    }
};

const getApplicationById = async (req, res) => {
    try {
        const application = await Application.findById(req.params.id);
        if (!application) return res.status(404).json({ message: 'Application not found' });
        res.json(application);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching application', error });
    }
};

const updateApplication = async (req, res) => {
    try {
        const updatedApplication = await Application.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!updatedApplication) return res.status(404).json({ message: 'Application not found' });
        res.json(updatedApplication);
    } catch (error) {
        res.status(500).json({ message: 'Error updating application', error });
    }
};

const generateReport = async (req, res) => {
    try {
        const application = await Application.findById(req.params.id).lean();
        if (!application) return res.status(404).send('Application not found');
        const templatePath = path_controller.resolve(__dirname, 'report-template.docx');
        const content = fs_controller.readFileSync(templatePath, 'binary');
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
};

module.exports = { getAllApplications, createApplication, getApplicationById, updateApplication, generateReport };