const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const insuranceController = require('../controllers/insuranceController');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const storage = multer.diskStorage({
  destination: 'uploads/attestations/',
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'attestation-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Document routes
router.post('/upload', upload.single('file'), insuranceController.uploadDocument);
router.get('/documents/serve/:id', insuranceController.serveDocument);

// Insurance routes
router.post('/create', insuranceController.createInsurance);
router.get('/user/:userId', insuranceController.getUserInsurances);
router.get('/all', insuranceController.getAllInsurances);
router.get('/pending', insuranceController.getPendingInsurances);
router.get('/status/:status', insuranceController.getInsurancesByStatus);
router.patch('/:id/status', upload.single('attestation'), insuranceController.updateInsuranceStatus);
router.get('/:id/documents', insuranceController.getInsuranceDocuments);
router.get('/:id', insuranceController.getInsurance);

// Payment routes
// In your Express backend routes
router.post('/create-checkout', async (req, res) => {
  try {
    const { insuranceId, annualPrice, planType, marque, modele } = req.body;
   
    const testAmount = Math.max(Math.round(annualPrice / 100), 1);
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'mad',
            product_data: {
              name: `Assurance Auto ${planType.toUpperCase()}`,
              description: `Assurance pour ${marque} ${modele}`,
            },
            unit_amount: testAmount * 10000,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `http://localhost:5173/insurance?payment_status=success`,
      cancel_url: `http://localhost:5173/insurance?payment_status=cancelled`,
      metadata: {
        insuranceId,
        planType
      },
    });
    res.json({ url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/refund', async (req, res) => {
  try {
    const { paymentIntentId } = req.body;
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId
    });
    res.json({ success: true, refund });
  } catch (error) {
    console.error('Refund error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;