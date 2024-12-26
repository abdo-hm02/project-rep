// models/DocumentMongo.js
const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');
const fs = require('fs').promises;
const path = require('path');

class DocumentMongo {
  static async initialize() {
    if (!DocumentMongo.bucket) {
      const db = mongoose.connection.db;
      DocumentMongo.bucket = new GridFSBucket(db, {
        bucketName: 'documents'
      });
    }
  }

  static async create(fileData) {
    await DocumentMongo.initialize();
    
    const { userId, fileName, filePath, documentType } = fileData;
    const metadata = {
      userId,
      documentType,
      uploadDate: new Date(),
      originalName: fileName,
      originalPath: filePath // Keep track of original path for reference
    };

    const uploadStream = DocumentMongo.bucket.openUploadStream(fileName, {
      metadata
    });

    try {
      const fileContent = await fs.readFile(filePath);
      
      return new Promise((resolve, reject) => {
        const stream = require('stream');
        const readStream = new stream.PassThrough();
        readStream.end(fileContent);
        
        readStream
          .pipe(uploadStream)
          .on('error', reject)
          .on('finish', () => {
            resolve({
              id: uploadStream.id.toString(),
              fileName,
              metadata
            });
          });
      });
    } catch (error) {
      throw new Error(`Error uploading to MongoDB: ${error.message}`);
    }
  }

  static async findById(id) {
    await DocumentMongo.initialize();
    
    try {
      const files = await DocumentMongo.bucket.find({ 
        _id: new mongoose.Types.ObjectId(id) 
      }).toArray();
      return files[0];
    } catch (error) {
      throw new Error(`Error finding document: ${error.message}`);
    }
  }

  static async getFileStream(id) {
    await DocumentMongo.initialize();
    return DocumentMongo.bucket.openDownloadStream(
      new mongoose.Types.ObjectId(id)
    );
  }

  // Helper method to migrate existing files
  static async migrateExistingFile(filePath, metadata) {
    if (!await fs.access(filePath).then(() => true).catch(() => false)) {
      throw new Error('File not found');
    }

    return await this.create({
      ...metadata,
      filePath
    });
  }
}

module.exports = DocumentMongo;