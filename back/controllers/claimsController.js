// claimsController.js
const Claim = require('../models/Claim');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const ClaimMongo = require('../models/ClaimMongo');
const db = require('../models/db');

// Configure storage for both types of files in one configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Choose destination based on field name
    const dest = file.fieldname === 'constat' ? 'uploads/constats/' : 'uploads/damages/';
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const prefix = file.fieldname === 'constat' ? 'constat-' : 'damage-';
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, prefix + uniqueSuffix + path.extname(file.originalname));
  }
});

// Create multer upload instance
const upload = multer({ storage: storage });

const claimsController = {
  async createClaim(req, res) {
    try {
      const files = req.files;
      
      // Upload user documents
      const [userLicenseDoc, userInsuranceDoc] = await Promise.all([
        ClaimMongo.uploadDocument(files.userLicense[0], { type: 'license', owner: 'user' }),
        ClaimMongo.uploadDocument(files.userInsurance[0], { type: 'insurance', owner: 'user' })
      ]);

      // Upload other party documents
      const [otherLicenseDoc, otherInsuranceDoc] = await Promise.all([
        ClaimMongo.uploadDocument(files.otherLicense[0], { type: 'license', owner: 'other' }),
        ClaimMongo.uploadDocument(files.otherInsurance[0], { type: 'insurance', owner: 'other' })
      ]);

      // Upload damage photos
      const damagePhotos = await Promise.all(
        files.damagePhotos.map(photo => 
          ClaimMongo.uploadDocument(photo, { type: 'damage' })
        )
      );

      // Upload constat
      const constatDoc = await ClaimMongo.uploadDocument(
        files.constat[0],
        { type: 'constat' }
      );

      const claimData = {
        ...req.body,
        userLicenseMongoId: userLicenseDoc.id,
        userInsuranceMongoId: userInsuranceDoc.id,
        otherLicenseMongoId: otherLicenseDoc.id,
        otherInsuranceMongoId: otherInsuranceDoc.id,
        damagePhotosMongoIds: damagePhotos.map(photo => photo.id),
        constatMongoId: constatDoc.id
      };

      const claim = await Claim.create(claimData);
      res.json(claim);
    } catch (error) {
      console.error('Error creating claim:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async addRepairDocuments(req, res) {
    try {
      const { id } = req.params;
      const files = req.files;

      // Upload repair photo and bill
      const [repairPhoto, repairBill] = await Promise.all([
        ClaimMongo.uploadDocument(files.repairPhoto[0], { type: 'repair_photo' }),
        ClaimMongo.uploadDocument(files.repairBill[0], { type: 'repair_bill' })
      ]);

      const updatedClaim = await Claim.addRepairDocuments(
        id,
        repairPhoto.id,
        repairBill.id
      );

      res.json(updatedClaim);
    } catch (error) {
      console.error('Error uploading repair documents:', error);
      res.status(500).json({ message: error.message });
    }
  },


  async getInsuranceClaims(req, res) {
    try {
      const claims = await Claim.findByInsurance(req.params.insuranceId);
      res.json(claims);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  async updateClaimStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      const query = `
        UPDATE claims 
        SET status = $1
        WHERE id = $2 
        RETURNING *
      `;
      
      const { rows } = await db.query(query, [status, id]);
      
      if (rows.length === 0) {
        return res.status(404).json({ message: 'Claim not found' });
      }
      
      res.json(rows[0]);
    } catch (error) {
      console.error('Error updating claim status:', error);
      res.status(500).json({ message: error.message });
    }
  },
  
  // For getting all claims
  async getAllClaims(req, res) {
    try {
      const query = `
        SELECT c.*,
               i.marque, i.modele, i.immatriculation,
               u.first_name, u.last_name, u.email, u.phone_number
        FROM claims c
        LEFT JOIN insurances i ON c.insurance_id = i.id
        LEFT JOIN users u ON i.user_id = u.id
        ORDER BY c.created_at DESC
      `;
      
      const { rows } = await db.query(query);
      res.json(rows);
    } catch (error) {
      console.error('Error fetching all claims:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async getUserClaims(req, res) {
    try {
      const query = `
        SELECT c.*,
               i.marque, i.modele, i.immatriculation
        FROM claims c
        JOIN insurances i ON c.insurance_id = i.id
        WHERE i.user_id = $1
        ORDER BY c.created_at DESC
      `;
      
      const { rows } = await db.query(query, [req.params.userId]);
      res.json(rows);
    } catch (error) {
      console.error('Error fetching user claims:', error);
      res.status(500).json({ message: error.message });
    }
  },

  // Add to claimsController.js
async getClaimDetails(req, res) {
  try {
    const { id } = req.params;
    const query = `
      SELECT c.*,
             i.marque, i.modele, i.immatriculation,
             u.first_name, u.last_name, u.email, u.phone_number
      FROM claims c
      LEFT JOIN insurances i ON c.insurance_id = i.id
      LEFT JOIN users u ON i.user_id = u.id
      WHERE c.id = $1
    `;
    const { rows } = await db.query(query, [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Claim not found' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
},

async serveDocument(req, res) {
  try {
    const { id } = req.params;
    const downloadStream = await ClaimMongo.getFileStream(id);
    
    downloadStream.pipe(res);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
  
};

// Export both the controller and the upload middleware
module.exports = {
  claimsController,
  upload
};