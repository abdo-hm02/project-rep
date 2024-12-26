const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');

class ClaimMongo {
  static async initialize() {
    if (!ClaimMongo.bucket) {
      const db = mongoose.connection.db;
      ClaimMongo.bucket = new GridFSBucket(db, {
        bucketName: 'claims'
      });
    }
  }

  static async uploadDocument(file, metadata) {
    await ClaimMongo.initialize();
    
    return new Promise((resolve, reject) => {
      const uploadStream = ClaimMongo.bucket.openUploadStream(file.originalname, {
        metadata: {
          ...metadata,
          uploadDate: new Date()
        }
      });

      const readStream = require('stream').Readable.from(file.buffer);
      readStream
        .pipe(uploadStream)
        .on('error', reject)
        .on('finish', () => {
          resolve({
            id: uploadStream.id.toString(),
            filename: file.originalname
          });
        });
    });
  }

  static async getFileStream(id) {
    await ClaimMongo.initialize();
    return ClaimMongo.bucket.openDownloadStream(new mongoose.Types.ObjectId(id));
  }
}

module.exports = ClaimMongo;