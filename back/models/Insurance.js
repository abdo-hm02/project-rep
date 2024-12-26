const db = require('./db');

class Insurance {
  static async create(data) {
    const query = `
      INSERT INTO insurances (
        user_id, license_doc_id, registration_doc_id, marque, modele,
        date_circulation, immatriculation, places, valeur_neuf,
        usage_type, kilometrage, parking_type, options, plan_type,
        annual_price, license_mongo_id, registration_mongo_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      RETURNING *
    `;
    
    const values = [
      data.userId,
      data.licenseDocId,
      data.registrationDocId,
      data.marque,
      data.modele,
      data.dateCirculation,
      data.immatriculation,
      data.places,
      data.valeurNeuf,
      data.usageType,
      data.kilometrage,
      data.parkingType,
      data.options,
      data.planType,
      data.annualPrice,
      data.licenseMongoId,
      data.registrationMongoId
    ];

    const { rows } = await db.query(query, values);
    return rows[0];
  }

  static async findByUser(userId) {
    const query = `
      SELECT i.*, 
             dl.file_path as license_path,
             dl.mongo_id as license_mongo_id,
             dr.file_path as registration_path,
             dr.mongo_id as registration_mongo_id
      FROM insurances i
      LEFT JOIN documents dl ON i.license_doc_id = dl.id
      LEFT JOIN documents dr ON i.registration_doc_id = dr.id
      WHERE i.user_id = $1
    `;
    const { rows } = await db.query(query, [userId]);
    return rows;
  }

  static async findByStatus(status) {
    const query = `
      SELECT i.*,
             dl.file_name as license_filename,
             dl.file_path as license_path,
             dl.mongo_id as license_mongo_id,
             dr.file_name as registration_filename,
             dr.file_path as registration_path,
             dr.mongo_id as registration_mongo_id,
             u.id as user_id,
             u.first_name,
             u.last_name,
             u.email,
             u.phone_number,
             u.card_number
      FROM insurances i
      LEFT JOIN documents dl ON i.license_doc_id = dl.id
      LEFT JOIN documents dr ON i.registration_doc_id = dr.id
      LEFT JOIN users u ON i.user_id = u.id
      WHERE i.status = $1
      ORDER BY i.created_at DESC
    `;
    const { rows } = await db.query(query, [status]);
    return rows;
  }

  static async updateStatus(id, status, attestationPath = null, attestationMongoId = null) {
    const query = `
      UPDATE insurances
      SET status = $1,
          attestation_path = COALESCE($2, attestation_path),
          attestation_mongo_id = COALESCE($3, attestation_mongo_id)
      WHERE id = $4
      RETURNING *
    `;
    const values = [status, attestationPath, attestationMongoId, id];
    const { rows } = await db.query(query, values);
    return rows[0];
  }

  static async findDocuments(id) {
    const query = `
      SELECT d.*
      FROM documents d
      WHERE d.id IN (
        SELECT license_doc_id FROM insurances WHERE id = $1
        UNION
        SELECT registration_doc_id FROM insurances WHERE id = $1
      )
    `;
    const { rows } = await db.query(query, [id]);
    return rows;
  }

  static async findAll() {
    const query = `
      SELECT i.*,
             dl.file_name as license_filename,
             dl.file_path as license_path,
             dl.mongo_id as license_mongo_id,
             dr.file_name as registration_filename,
             dr.file_path as registration_path,
             dr.mongo_id as registration_mongo_id,
             u.id as user_id,
             u.first_name,
             u.last_name,
             u.email,
             u.phone_number,
             u.card_number
      FROM insurances i
      LEFT JOIN documents dl ON i.license_doc_id = dl.id
      LEFT JOIN documents dr ON i.registration_doc_id = dr.id
      LEFT JOIN users u ON i.user_id = u.id
      ORDER BY i.created_at DESC
    `;
    const { rows } = await db.query(query);
    return rows;
  }

  static async findById(id) {
    const query = `
      SELECT i.*,
             dl.file_name as license_filename,
             dl.file_path as license_path,
             dl.mongo_id as license_mongo_id,
             dr.file_name as registration_filename,
             dr.file_path as registration_path,
             dr.mongo_id as registration_mongo_id
      FROM insurances i
      LEFT JOIN documents dl ON i.license_doc_id = dl.id
      LEFT JOIN documents dr ON i.registration_doc_id = dr.id
      WHERE i.id = $1
    `;
    const { rows } = await db.query(query, [id]);
    return rows[0];
  }
}

module.exports = Insurance;