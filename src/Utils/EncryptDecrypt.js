const CryptoJS = require('crypto-js');

/**
 * Encrypts the given data to a JSON string using the provided key.
 *
 * @param {any} data - The data to be encrypted
 * @param {string} key - The key to be used for encryption
 * @return {string} The encrypted JSON string
 */

function encryptToJson(data, key) {
  try {
    // Convert JSON data to a string
    const jsonString = JSON.stringify(data);

    // Encrypt the string using AES
    const encrypted = CryptoJS.AES.encrypt(jsonString, key).toString();

    return encrypted;

  } catch (error) {
    console.error("Error encrypting JSON:", error.toString());
    return null;
  }
}

/**
 * Decrypts the given encrypted data using the provided key and returns the
 * decrypted JSON object. If decryption fails, it logs an error and returns
 * null.
 *
 * @param {string} encryptedData - The encrypted data to be decrypted
 * @param {string} key - The key used for decryption
 * @return {object} The decrypted JSON object, or null if decryption fails
 */

function decryptFromJson(encryptedData, key) {
  try {
    // Decrypt using AES
    const bytes = CryptoJS.AES.decrypt(encryptedData, key);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);

    // Parse JSON string
    const jsonData = JSON.parse(decrypted);

    return jsonData;
  } catch (error) {
    console.error("Error decrypting JSON:", error.toString());
    return null;
  }
}

module.exports = {encryptToJson, decryptFromJson};
