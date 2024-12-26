const db = require('./db');

class Claim {
  static async create(data) {
    const query = `
      INSERT INTO claims (
        insurance_id, date, time, location, description,
        user_license_mongo_id, user_insurance_mongo_id,
        other_license_mongo_id, other_insurance_mongo_id,
        damage_photos_mongo_ids, constat_mongo_id,
        other_party_name, other_party_phone,
        status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *
    `;
    
    const values = [
      data.insuranceId,
      data.date,
      data.time,
      data.location,
      data.description,
      data.userLicenseMongoId,
      data.userInsuranceMongoId,
      data.otherLicenseMongoId,
      data.otherInsuranceMongoId,
      data.damagePhotosMongoIds,
      data.constatMongoId,
      data.otherPartyName,
      data.otherPartyPhone,
      'pending'
    ];

    const { rows } = await db.query(query, values);
    return rows[0];
  }

  static async addRepairDocuments(id, repairPhotoMongoId, repairBillMongoId) {
    const query = `
      UPDATE claims
      SET repair_photo_mongo_id = $1,
          repair_bill_mongo_id = $2,
          status = 'completed',
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *
    `;
    
    const { rows } = await db.query(query, [repairPhotoMongoId, repairBillMongoId, id]);
    return rows[0];
  }

  static async findByInsurance(insuranceId) {
    const query = `
      SELECT *
      FROM claims
      WHERE insurance_id = $1
      ORDER BY created_at DESC
    `;
    const { rows } = await db.query(query, [insuranceId]);
    return rows;
  }
}

module.exports = Claim;