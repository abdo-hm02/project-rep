const express = require('express');
const router = express.Router();
const { claimsController } = require('../controllers/claimsController');
const multer = require('multer');

// Configure multer for memory storage
const upload = multer({ storage: multer.memoryStorage() });

// Initial claim creation - upload all initial documents
router.post('/create', 
 upload.fields([
   { name: 'userLicense', maxCount: 1 },
   { name: 'userInsurance', maxCount: 1 },
   { name: 'otherLicense', maxCount: 1 },
   { name: 'otherInsurance', maxCount: 1 },
   { name: 'damagePhotos', maxCount: 5 },
   { name: 'constat', maxCount: 1 }
 ]),
 claimsController.createClaim
);

// Add repair documents after claim is validated
router.post('/:id/repair-documents',
 upload.fields([
   { name: 'repairPhoto', maxCount: 1 },
   { name: 'repairBill', maxCount: 1 }
 ]),
 claimsController.addRepairDocuments
);

// Get claims by insurance ID
router.get('/insurance/:insuranceId', claimsController.getInsuranceClaims);

// Get all claims (for agent dashboard)
router.get('/all', claimsController.getAllClaims);

// Get claims for a specific user
router.get('/user/:userId', claimsController.getUserClaims);

// Update claim status (for agent to validate/close)
router.patch('/:id/status', claimsController.updateClaimStatus);

router.get('/:id', claimsController.getClaimDetails);


router.get('/documents/serve/:id', claimsController.serveDocument);

module.exports = router;