const db = require('../models/db');

const consultationController = {
  async createConsultation(req, res) {
    try {
      const {
        user_id,
        conservation_fonciere,
        title_number,
        title_index,
        special_index,
        property_type,
        property_address,
        purpose_of_consultation
      } = req.body;

      // Validate required fields
      if (!conservation_fonciere || !title_number || !property_type) {
        return res.status(400).json({
          message: 'Les champs conservation, numéro de titre et type de propriété sont obligatoires'
        });
      }

      const query = `
        INSERT INTO title_consultations (
          user_id,
          conservation_fonciere,
          title_number,
          title_index,
          special_index,
          property_type,
          property_address,
          purpose_of_consultation,
          status,
          created_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending', CURRENT_TIMESTAMP)
        RETURNING *
      `;

      const values = [
        user_id,
        conservation_fonciere,
        title_number,
        title_index,
        special_index,
        property_type,
        property_address,
        purpose_of_consultation
      ];

      const { rows } = await db.query(query, values);

      // Return the created consultation with user details
      const consultationQuery = `
        SELECT 
          c.*,
          u.first_name,
          u.last_name,
          u.email
        FROM title_consultations c
        LEFT JOIN users u ON u.id = c.user_id
        WHERE c.id = $1
      `;

      const consultation = await db.query(consultationQuery, [rows[0].id]);
      res.status(201).json(consultation.rows[0]);
    } catch (error) {
      console.error('Error creating consultation:', error);
      res.status(500).json({ message: 'Erreur lors de la création de la consultation' });
    }
  },

  async getUserConsultations(req, res) {
    try {
      const { userId } = req.params;

      const query = `
        SELECT 
          c.*,
          u.first_name,
          u.last_name,
          u.email,
          CASE 
            WHEN a.id IS NOT NULL THEN json_build_object(
              'id', a.id,
              'first_name', a.first_name,
              'last_name', a.last_name,
              'email', a.email
            )
            ELSE NULL
          END as agent
        FROM title_consultations c
        LEFT JOIN users u ON u.id = c.user_id
        LEFT JOIN users a ON a.id = c.agent_id
        WHERE c.user_id = $1
        ORDER BY c.created_at DESC
      `;

      const { rows } = await db.query(query, [userId]);
      res.json(rows);
    } catch (error) {
      console.error('Error fetching user consultations:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération des consultations' });
    }
  },

  async getAllConsultations(req, res) {
    try {
      const query = `
        SELECT 
          c.*,
          u.first_name,
          u.last_name,
          u.email,
          u.phone_number,
          u.card_number,
          u.address,
          CASE 
            WHEN a.id IS NOT NULL THEN json_build_object(
              'id', a.id,
              'first_name', a.first_name,
              'last_name', a.last_name,
              'email', a.email
            )
            ELSE NULL
          END as agent
        FROM title_consultations c
        LEFT JOIN users u ON u.id = c.user_id
        LEFT JOIN users a ON a.id = c.agent_id
        ORDER BY 
          CASE 
            WHEN c.status = 'pending' THEN 1
            WHEN c.status = 'processing' THEN 2
            ELSE 3
          END,
          c.created_at DESC
      `;
  
      const { rows } = await db.query(query);
      res.json(rows);
    } catch (error) {
      console.error('Error fetching all consultations:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération des consultations' });
    }
  },
  // Also update the getConsultation query
  async getConsultation(req, res) {
    try {
      const { id } = req.params;
  
      const query = `
        SELECT 
          c.*,
          u.first_name,
          u.last_name,
          u.email,
          u.phone_number,
          u.card_number,
          u.address,
          CASE 
            WHEN a.id IS NOT NULL THEN json_build_object(
              'id', a.id,
              'first_name', a.first_name,
              'last_name', a.last_name,
              'email', a.email
            )
            ELSE NULL
          END as agent
        FROM title_consultations c
        LEFT JOIN users u ON u.id = c.user_id
        LEFT JOIN users a ON a.id = c.agent_id
        WHERE c.id = $1
      `;
  
      const { rows } = await db.query(query, [id]);
  
      if (rows.length === 0) {
        return res.status(404).json({ message: 'Consultation introuvable' });
      }
  
      res.json(rows[0]);
    } catch (error) {
      console.error('Error fetching consultation:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération de la consultation' });
    }
  },

  async getConsultationsByStatus(req, res) {
    try {
      const { status } = req.params;
      
      // Validate status
      const validStatuses = ['pending', 'processing', 'completed', 'rejected'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: 'Statut invalide' });
      }

      const query = `
        SELECT 
          c.*,
          u.first_name,
          u.last_name,
          u.email,
          CASE 
            WHEN a.id IS NOT NULL THEN json_build_object(
              'id', a.id,
              'first_name', a.first_name,
              'last_name', a.last_name,
              'email', a.email
            )
            ELSE NULL
          END as agent
        FROM title_consultations c
        LEFT JOIN users u ON u.id = c.user_id
        LEFT JOIN users a ON a.id = c.agent_id
        WHERE c.status = $1
        ORDER BY c.created_at DESC
      `;

      const { rows } = await db.query(query, [status]);
      res.json(rows);
    } catch (error) {
      console.error('Error fetching consultations by status:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération des consultations' });
    }
  },

  async updateConsultationStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, agent_response, agent_id } = req.body;

      // Validate status
      const validStatuses = ['pending', 'processing', 'completed', 'rejected'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: 'Statut invalide' });
      }

      // Check if consultation exists
      const checkQuery = 'SELECT * FROM title_consultations WHERE id = $1';
      const checkResult = await db.query(checkQuery, [id]);
      
      if (checkResult.rows.length === 0) {
        return res.status(404).json({ message: 'Consultation introuvable' });
      }

      const query = `
        UPDATE title_consultations 
        SET 
          status = $1,
          agent_response = $2,
          agent_id = $3
        WHERE id = $4
        RETURNING *
      `;

      const values = [status, agent_response, agent_id, id];
      const { rows } = await db.query(query, values);

      // Fetch updated consultation with user and agent details
      const consultationQuery = `
        SELECT 
          c.*,
          u.first_name,
          u.last_name,
          u.email,
          CASE 
            WHEN a.id IS NOT NULL THEN json_build_object(
              'id', a.id,
              'first_name', a.first_name,
              'last_name', a.last_name,
              'email', a.email
            )
            ELSE NULL
          END as agent
        FROM title_consultations c
        LEFT JOIN users u ON u.id = c.user_id
        LEFT JOIN users a ON a.id = c.agent_id
        WHERE c.id = $1
      `;

      const updatedConsultation = await db.query(consultationQuery, [id]);
      res.json(updatedConsultation.rows[0]);
    } catch (error) {
      console.error('Error updating consultation status:', error);
      res.status(500).json({ message: 'Erreur lors de la mise à jour du statut' });
    }
  },

  async deleteConsultation(req, res) {
    try {
      const { id } = req.params;

      // Check if consultation exists and get its status
      const checkQuery = 'SELECT status FROM title_consultations WHERE id = $1';
      const checkResult = await db.query(checkQuery, [id]);
      
      if (checkResult.rows.length === 0) {
        return res.status(404).json({ message: 'Consultation introuvable' });
      }

      // Only allow deletion of pending consultations
      if (checkResult.rows[0].status !== 'pending') {
        return res.status(400).json({ 
          message: 'Seules les consultations en attente peuvent être supprimées' 
        });
      }

      const query = 'DELETE FROM title_consultations WHERE id = $1 RETURNING *';
      const { rows } = await db.query(query, [id]);

      res.json({ message: 'Consultation supprimée avec succès', consultation: rows[0] });
    } catch (error) {
      console.error('Error deleting consultation:', error);
      res.status(500).json({ message: 'Erreur lors de la suppression de la consultation' });
    }
  }
};

module.exports = consultationController;