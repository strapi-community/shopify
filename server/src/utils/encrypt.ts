import crypto from 'crypto';
import { Shop } from '../repositories/validators';

const algorithm = 'aes-256-cbc';

const encrypt = (text: string, key: string): string => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
};

const decrypt = (text: string, key: string): string => {
  const [ivHex, encryptedHex] = text.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const encrypted = Buffer.from(encryptedHex, 'hex');
  const decipher = crypto.createDecipheriv(algorithm, Buffer.from(key), iv);
  let decrypted = decipher.update(encrypted);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
};

export const encryptShopTokens = (shop: Shop, encryptionKey: string) => {
    const { apiKey, apiSecretKey, adminApiAccessToken } = shop;
    return {
        ...shop,
        apiKey: apiKey ? encrypt(apiKey, encryptionKey) : apiKey,
        apiSecretKey: apiSecretKey ? encrypt(apiSecretKey, encryptionKey) : apiSecretKey,
        adminApiAccessToken: adminApiAccessToken ? encrypt(adminApiAccessToken, encryptionKey) : adminApiAccessToken,
    }
};

export const decryptShopTokens = (shop: Shop, encryptionKey: string) => {
    const { apiKey, apiSecretKey, adminApiAccessToken } = shop;
    return {
        ...shop,
        apiKey: apiKey ? decrypt(apiKey, encryptionKey) : apiKey,
        apiSecretKey: apiSecretKey ? decrypt(apiSecretKey, encryptionKey) : apiSecretKey,
        adminApiAccessToken: adminApiAccessToken ? decrypt(adminApiAccessToken, encryptionKey) : adminApiAccessToken,
    };
};
