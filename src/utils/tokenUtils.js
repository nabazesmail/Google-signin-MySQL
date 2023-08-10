const jwt = require('jsonwebtoken');

//generating JWT token
function generateToken(payload) {
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
  return token;
}


// Function to generate a random string of specified length
function generateRandomString(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomString = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomString += characters.charAt(randomIndex);
  }
  return randomString;
}

// Generate a unique temporary password within the required length range
function generateTemporaryPassword() {
  const passwordLength = Math.floor(Math.random() * (15 - 8 + 1)) + 8; // Generate a random length between 8 and 15
  const randomPart = generateRandomString(passwordLength - 5); // Subtracting 5 for timestamp part
  const timestampPart = Date.now().toString(36).slice(-5); // Use the last 5 characters of timestamp
  return `${randomPart}-${timestampPart}`;
}

module.exports = {
  generateToken , generateTemporaryPassword,
};


