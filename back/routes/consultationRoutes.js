const express = require('express');
const router = express.Router();
const consultationController = require('../controllers/consultationController');


// Create new consultation request
router.post('/create', consultationController.createConsultation);

// Get user's consultations
router.get('/user/:userId', consultationController.getUserConsultations);

// Get all consultations (for admin/agent)
router.get('/all',  consultationController.getAllConsultations);

// Get consultations by status
router.get('/status/:status', consultationController.getConsultationsByStatus);

// Update consultation status (for admin/agent)
router.patch('/:id/status', consultationController.updateConsultationStatus);

// Get specific consultation details
router.get('/:id', consultationController.getConsultation);

module.exports = router;