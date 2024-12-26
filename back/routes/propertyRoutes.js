const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/propertyController');
const multer = require('multer');

// Configure multer for memory storage
const upload = multer({ storage: multer.memoryStorage() });

// Register new property with all required documents
router.post('/register',
  upload.fields([
    { name: 'identityDoc', maxCount: 1 },
    { name: 'titleDeed', maxCount: 1 },
    { name: 'propertyPlan', maxCount: 1 },
    { name: 'locationCert', maxCount: 1 },
    { name: 'taxCert', maxCount: 1 }
  ]),
  propertyController.registerProperty
);

// Get user's property registrations
router.get('/user/:userId', propertyController.getUserProperties);

// Get all property registrations (for admin/agent dashboard)
router.get('/all', propertyController.getAllProperties);

// Get specific property registration details
router.get('/:id', propertyController.getPropertyDetails);

// Update property registration status
router.patch('/:id/status',
  upload.fields([
    { name: 'final_document', maxCount: 1 }
  ]),
  propertyController.updatePropertyStatus
);

// Serve stored documents
router.get('/documents/serve/:id', propertyController.serveDocument);

module.exports = router;