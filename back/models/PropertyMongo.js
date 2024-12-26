const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');

class PropertyMongo {
  static async initialize() {
    if (!PropertyMongo.bucket) {
      const db = mongoose.connection.db;
      PropertyMongo.bucket = new GridFSBucket(db, {
        bucketName: 'properties'
      });
    }
  }

  static async uploadDocument(file, metadata) {
    await PropertyMongo.initialize();
   
    return new Promise((resolve, reject) => {
      const uploadStream = PropertyMongo.bucket.openUploadStream(file.originalname, {
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
    await PropertyMongo.initialize();
    return PropertyMongo.bucket.openDownloadStream(new mongoose.Types.ObjectId(id));
  }
}

module.exports = PropertyMongo;