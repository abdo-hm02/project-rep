const Property = require('../models/Property');
const db = require('../models/db')
const PropertyMongo = require('../models/PropertyMongo');

const propertyController = {
    async registerProperty(req, res) {
        try {
          const files = req.files;
          const userId = req.body.userId; // Get userId from request body
    
          if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
          }
    
          // Upload all documents to MongoDB
          const [
            identityDoc,
            titleDeed,
            propertyPlan,
            locationCert,
            taxCert
          ] = await Promise.all([
            PropertyMongo.uploadDocument(files.identityDoc[0], { type: 'identity' }),
            PropertyMongo.uploadDocument(files.titleDeed[0], { type: 'deed' }),
            PropertyMongo.uploadDocument(files.propertyPlan[0], { type: 'plan' }),
            PropertyMongo.uploadDocument(files.locationCert[0], { type: 'location' }),
            PropertyMongo.uploadDocument(files.taxCert[0], { type: 'tax' })
          ]);
    
          const propertyData = {
            userId: userId, // Use the userId from request body
            propertyType: req.body.propertyType,
            propertyAddress: req.body.propertyAddress,
            propertySize: req.body.propertySize,
            propertyUsage: req.body.propertyUsage,
            identityDocMongoId: identityDoc.id,
            titleDeedMongoId: titleDeed.id,
            propertyPlanMongoId: propertyPlan.id,
            locationCertMongoId: locationCert.id,
            taxCertMongoId: taxCert.id
          };
    
          const property = await Property.create(propertyData);
          res.json(property);
        } catch (error) {
          console.error('Error registering property:', error);
          res.status(500).json({ message: error.message });
        }
      },

  async getUserProperties(req, res) {
    try {
      const properties = await Property.findByUser(req.params.userId);
      res.json(properties);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  async getAllProperties(req, res) {
    try {
      const properties = await Property.getAll();
      res.json(properties);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  async updatePropertyStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, agent_response, agent_id, title_number } = req.body;
      
      let finalDocumentId = null;
      
      // Handle final document upload if provided
      if (req.files?.final_document) {
        const finalDoc = await PropertyMongo.uploadDocument(
          req.files.final_document[0],
          { type: 'final_certificate' }
        );
        finalDocumentId = finalDoc.id;
      }
  
      const query = `
        UPDATE property_registrations
        SET status = $1,
            agent_response = $2,
            agent_id = $3,
            title_number = $4,
            final_document_mongo_id = $5,
            decision_date = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $6
        RETURNING *
      `;
  
      const values = [
        status,
        agent_response,
        agent_id,
        title_number,
        finalDocumentId,
        id
      ];
  
      const { rows } = await db.query(query, values);
      
      if (rows.length === 0) {
        return res.status(404).json({ message: 'Property registration not found' });
      }
      
      res.json(rows[0]);
    } catch (error) {
      console.error('Error updating property status:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async getPropertyDetails(req, res) {
    try {
      const property = await Property.getDetails(req.params.id);
      
      if (!property) {
        return res.status(404).json({ message: 'Property registration not found' });
      }
      
      res.json(property);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  async serveDocument(req, res) {
    try {
      const { id } = req.params;
      const downloadStream = await PropertyMongo.getFileStream(id);
      downloadStream.pipe(res);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = propertyController;