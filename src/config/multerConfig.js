require('dotenv').config();

const multer = require('multer');

const storage=multer.memoryStorage();



const fileFilter = (req, file, cb) => {
  if (file.mimetype.split('/')[0] === 'image') {
    cb(null, true);
  }else{
    cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', file), false);
  }
};

// Initializing multer with the storage engine
const upload = multer({
  storage,
  fileFilter,
  limits: {fileSize:1000000000,files:1},
});

module.exports = upload;