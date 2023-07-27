const randomstring = require("randomstring");

// Function to generate a secure secret key
function generateSecretKey(length = 32) {
  // You can customize the length as needed (32 characters by default)
  return randomstring.generate({ length });
 
}



module.exports = generateSecretKey;
