const Document = require('../models/Document');
const DocumentMongo = require('../models/DocumentMongo');
const Insurance = require('../models/Insurance');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: 'uploads/attestations/',
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'attestation-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

const insuranceController = {
  async uploadDocument(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }
  
      // First store in MongoDB
      const mongoDoc = await DocumentMongo.create({
        userId: req.body.userId,
        fileName: req.file.filename,
        filePath: req.file.path,
        documentType: req.body.documentType
      });
  
      // Then store in PostgreSQL with MongoDB reference
      const documentData = {
        userId: req.body.userId,
        fileName: req.file.filename,
        filePath: req.file.path,
        documentType: req.body.documentType,
        mongoId: mongoDoc.id  // Add MongoDB ID
      };
  
      const document = await Document.create(documentData);
  
      res.json({
        ...document,
        mongoId: mongoDoc.id
      });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async serveDocument(req, res) {
    try {
      const { id } = req.params;
      const file = await DocumentMongo.findById(id);
      
      if (!file) {
        return res.status(404).json({ message: 'Document not found' });
      }
  
      // Set the appropriate content type based on the file extension
      const isPDF = file.filename.toLowerCase().endsWith('.pdf');
      res.set('Content-Type', isPDF ? 'application/pdf' : file.contentType);
      res.set('Content-Disposition', `inline; filename="${file.filename}"`);
  
      const downloadStream = await DocumentMongo.getFileStream(id);
      downloadStream.pipe(res);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  async createInsurance(req, res) {
    try {
      const insurance = await Insurance.create(req.body);
      res.json(insurance);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  async getUserInsurances(req, res) {
    try {
      const insurances = await Insurance.findByUser(req.params.userId);
      res.json(insurances);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  async getPendingInsurances(req, res) {
    try {
      const insurances = await Insurance.findByStatus('pending');
      res.json(insurances);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  async getAllInsurances(req, res) {
    try {
      const insurances = await Insurance.findAll();
      res.json(insurances);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  async getInsurancesByStatus(req, res) {
    try {
      const { status } = req.params;
      const insurances = await Insurance.findByStatus(status);
      res.json(insurances);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  async updateInsuranceStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
     
      let attestationPath = null;
      let attestationMongoId = null;

      if (req.file && status === 'approved') {
        // Store attestation in MongoDB
        const attestation = await DocumentMongo.create({
          userId: req.body.userId || 'system',
          fileName: req.file.originalname,
          filePath: req.file.path,
          documentType: 'attestation'
        });
        
        attestationPath = req.file.path;
        attestationMongoId = attestation.id;
      }

      const insurance = await Insurance.updateStatus(id, status, attestationPath, attestationMongoId);
      res.json(insurance);
    } catch (error) {
      console.error('Error updating insurance:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async getInsuranceDocuments(req, res) {
    try {
      const { id } = req.params;
      const documents = await Insurance.findDocuments(id);
      res.json(documents);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  async getInsurance(req, res) {
    try {
      const { id } = req.params;
      const insurance = await Insurance.findById(id);
      if (!insurance) {
        return res.status(404).json({ message: 'Insurance not found' });
      }
      res.json(insurance);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = insuranceController;