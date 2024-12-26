const db = require('./db');

class Property {
  static async create(data) {
    const query = `
      INSERT INTO property_registrations (
        user_id,
        property_type,
        property_address,
        property_size,
        property_usage,
        requested_date,
        title_deed_mongo_id,
        identity_doc_mongo_id,
        property_plan_mongo_id,
        location_cert_mongo_id,
        tax_cert_mongo_id,
        status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `;
   
    const values = [
      data.userId,
      data.propertyType,
      data.propertyAddress,
      data.propertySize,
      data.propertyUsage,
      new Date(),
      data.titleDeedMongoId,
      data.identityDocMongoId,
      data.propertyPlanMongoId,
      data.locationCertMongoId,
      data.taxCertMongoId,
      'pending'
    ];

    const { rows } = await db.query(query, values);
    return rows[0];
  }

  static async findByUser(userId) {
    const query = `
      SELECT *
      FROM property_registrations
      WHERE user_id = $1
      ORDER BY created_at DESC
    `;
    const { rows } = await db.query(query, [userId]);
    return rows;
  }

  static async getAll() {
    const query = `
      SELECT pr.*, 
             u.first_name, 
             u.last_name, 
             u.email,
             u.phone_number,
             u.card_number,
             u.address,
             u.birth_date
      FROM property_registrations pr
      JOIN users u ON pr.user_id = u.id
      ORDER BY pr.created_at DESC
    `;
    const { rows } = await db.query(query);
    return rows;
  }

  static async updateStatus(id, status) {
    const query = `
      UPDATE property_registrations
      SET status = $1,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;
    const { rows } = await db.query(query, [status, id]);
    return rows[0];
  }

  static async getDetails(id) {
    const query = `
      SELECT pr.*, 
             u.first_name, 
             u.last_name, 
             u.email,
             u.phone_number
      FROM property_registrations pr
      JOIN users u ON pr.user_id = u.id
      WHERE pr.id = $1
    `;
    const { rows } = await db.query(query, [id]);
    return rows[0];
  }
}

module.exports = Property;