import { generateKeyPairSync, publicEncrypt, privateDecrypt } from "crypto";

// Generate a key pair for a user
export const generateKeys = () => {
  const { publicKey, privateKey } = generateKeyPairSync("rsa", {
    modulusLength: 2048, // Key size
  });
  return { publicKey, privateKey };
};

// Encrypt a message
export const encrypt = (message, publicKey) => {
  return publicEncrypt(publicKey, Buffer.from(message)).toString("base64");
};

// Decrypt a message
export const decrypt = (encryptedMessage, privateKey) => {
  return privateDecrypt(
    privateKey,
    Buffer.from(encryptedMessage, "base64")
  ).toString();
};
