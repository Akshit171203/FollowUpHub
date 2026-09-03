/**
 * ============================================================================
 * ENCRYPTION UTILITY
 * ============================================================================
 * Purpose: Provides AES-256-GCM encryption and decryption.
 * Used primarily to securely store third-party API tokens (like Jira) 
 * in the database instead of storing them as plain text.
 */
import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // 12 bytes is standard for GCM

// Key must be exactly 32 bytes for AES-256
function getEncryptionKey() {
  const keyStr = process.env.ENCRYPTION_KEY;
  if (!keyStr) {
    console.warn('WARNING: ENCRYPTION_KEY environment variable is not set. Using a fallback key for development ONLY.');
    // Keep a fallback just in case the .env isn't updated during testing
    return crypto.scryptSync('fallback_secret_password', 'salt', 32);
  }
  
  if (keyStr.length === 64 && /^[0-9a-f]+$/i.test(keyStr)) {
    return Buffer.from(keyStr, 'hex');
  }
  
  if (Buffer.from(keyStr, 'utf-8').length === 32) {
    return Buffer.from(keyStr, 'utf-8');
  }

  // Fallback for poorly sized keys
  const buf = Buffer.alloc(32);
  Buffer.from(keyStr, 'utf-8').copy(buf);
  return buf;
}

export function encrypt(text) {
  if (!text) return null;
  
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  
  return JSON.stringify({
    iv: iv.toString('hex'),
    encryptedData: encrypted,
    authTag: authTag,
  });
}

export function decrypt(encryptedJson) {
  if (!encryptedJson) return null;
  
  try {
    const { iv, encryptedData, authTag } = JSON.parse(encryptedJson);
    const key = getEncryptionKey();
    
    const decipher = crypto.createDecipheriv(
      ALGORITHM,
      key,
      Buffer.from(iv, 'hex')
    );
    
    decipher.setAuthTag(Buffer.from(authTag, 'hex'));
    
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (err) {
    console.error('Decryption failed:', err.message);
    throw new Error('Failed to decrypt data');
  }
}
