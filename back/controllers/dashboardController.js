// dashboardController.js
const db = require('../models/db');

const dashboardController = {
  async getUserDashboardStats(req, res) {
    try {
      const { userId } = req.params;

      // Get all stats in parallel for better performance
      const [activeInsurances, documents, claims] = await Promise.all([
        // Count active insurances
        db.query(
          'SELECT COUNT(*) FROM insurances WHERE user_id = $1 AND status = $2',
          [userId, 'approved']
        ),
        // Count user's documents
        db.query(
          'SELECT COUNT(*) FROM documents WHERE user_id = $1',
          [userId]
        ),
        // Count transactions (approved insurances + resolved claims)
        db.query(`
          SELECT COUNT(*) FROM (
            SELECT id FROM insurances WHERE user_id = $1 AND status = 'approved'
            UNION ALL
            SELECT c.id FROM claims c
            JOIN insurances i ON c.insurance_id = i.id
            WHERE i.user_id = $1 AND c.status = 'resolved'
          ) AS transactions`,
          [userId]
        )
      ]);

      const stats = {
        activeInsurances: parseInt(activeInsurances.rows[0].count),
        documents: parseInt(documents.rows[0].count),
        transactions: parseInt(claims.rows[0].count)
      };

      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  async getUserRecentActivities(req, res) {
    try {
      const { userId } = req.params;
      
      // Get recent activities combining insurance and claims actions
      const query = `
        (SELECT 
          'insurance' as type,
          i.id,
          i.status,
          i.created_at as timestamp,
          CASE 
            WHEN i.status = 'approved' THEN 'Assurance approuvée'
            WHEN i.status = 'pending' THEN 'Demande d''assurance soumise'
            WHEN i.status = 'rejected' THEN 'Demande d''assurance rejetée'
          END as title,
          CONCAT(i.marque, ' ', i.modele) as details
        FROM insurances i
        WHERE i.user_id = $1)
        UNION ALL
        (SELECT 
          'claim' as type,
          c.id,
          c.status,
          c.created_at as timestamp,
          CASE 
            WHEN c.status = 'pending' THEN 'Déclaration de sinistre soumise'
            WHEN c.status = 'in_progress' THEN 'Sinistre en traitement'
            WHEN c.status = 'resolved' THEN 'Sinistre résolu'
          END as title,
          c.description as details
        FROM claims c
        JOIN insurances i ON c.insurance_id = i.id
        WHERE i.user_id = $1)
        ORDER BY timestamp DESC
        LIMIT 10`;

      const { rows } = await db.query(query, [userId]);
      res.json(rows);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = dashboardController;