const db = require('./db');

class Document {
  static async create(documentData) {
    const query = `
      INSERT INTO documents (
        user_id, file_name, file_path, document_type, mongo_id
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    
    const values = [
      documentData.userId,
      documentData.fileName,
      documentData.filePath,
      documentData.documentType,
      documentData.mongoId  // Make sure this is being passed from DocumentMongo
    ];
  
    const { rows } = await db.query(query, values);
    return rows[0];
  }

  // Add method to update MongoDB ID
  static async updateMongoId(id, mongoId) {
    const query = `
      UPDATE documents
      SET mongo_id = $1
      WHERE id = $2
      RETURNING *
    `;
    
    const { rows } = await db.query(query, [mongoId, id]);
    return rows[0];
  }

  static async findByUserAndType(userId, documentType) {
    const query = 'SELECT * FROM documents WHERE user_id = $1 AND document_type = $2';
    const { rows } = await db.query(query, [userId, documentType]);
    return rows;
  }
}

module.exports = Document;