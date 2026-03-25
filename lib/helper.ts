import JSEncrypt from 'jsencrypt';

/**
 * Decrypts a base64 encoded string using the server's private key via jsencrypt.
 * Used primarily for decrypting passwords sent from the client.
 */
export function decrypt(encryptedDataBase64: string): string {
    try {
        const decryptor = new JSEncrypt();
        decryptor.setPrivateKey(process.env.PRIVATE_KEY || '');

        const decrypted = decryptor.decrypt(encryptedDataBase64);
        return decrypted ? decrypted : encryptedDataBase64;
    } catch (error) {
        console.error("RSA Decryption failed:", error);
        return encryptedDataBase64;
    }
}

/**
 * Helper to encrypt data using the Public Key via jsencrypt.
 */
export function encrypt(data: string): string {
    try {
        const encryptor = new JSEncrypt();
        encryptor.setPublicKey(process.env.NEXT_PUBLIC_KEY || '');

        const encrypted = encryptor.encrypt(data);
        console.log(encrypted, "encrypted")
        return encrypted ? encrypted : data;
    } catch (error) {
        console.error("RSA Encryption failed:", error);
        return data;
    }
}

export const getCookie = (name: String) => {
    try {
        const value = `; ${document.cookie}`;
        const parts = value?.split(`; ${name}=`) || [];
        console.log(value, name, "parts")

        if (parts && parts.length === 2) return parts.pop()?.split(';').shift();
        return null;
    } catch (error) {
        console.error(error)
        return null;
    }
}