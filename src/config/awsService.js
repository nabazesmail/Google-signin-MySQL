const {
  S3Client,
  PutObjectCommand
} = require('@aws-sdk/client-s3');
const {
  v4: uuidv4
} = require('uuid');
require('dotenv').config();

// Configure the AWS SDK with your access keys and region
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const s3Upload = async (file) => {
  const params = {
    Bucket: process.env.BUCKET_NAME,
    Key: `uploads/${uuidv4()}-${file.originalname}`,
    Body: file.buffer,
  };

  await s3Client.send(new PutObjectCommand(params));
};

module.exports = {
  s3Upload
};