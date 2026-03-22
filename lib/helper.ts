import JSEncrypt from 'jsencrypt';

/**
 * Decrypts a base64 encoded string using the server's private key via jsencrypt.
 * Used primarily for decrypting passwords sent from the client.
 */
export function decrypt(encryptedDataBase64: string): string {
    try {
        let privateKeyRaw = process.env.PRIVATE_KEY || '';

        // Auto-format the private key if it lacks proper PEM newlines from the .env file
        let privateKey = privateKeyRaw.replace(/\\n/g, '\n');
        if (!privateKey.includes('\n')) {
            const header = '-----BEGIN PRIVATE KEY-----';
            const footer = '-----END PRIVATE KEY-----';
            privateKey = privateKey.trim();
            if (privateKey.startsWith(header) && privateKey.endsWith(footer)) {
                const body = privateKey.substring(header.length, privateKey.length - footer.length).trim();
                const formattedBody = body.match(/.{1,64}/g)?.join('\n') || body;
                privateKey = `${header}\n${formattedBody}\n${footer}`;
            }
        }

        const decryptor = new JSEncrypt();
        decryptor.setPrivateKey(privateKey);

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
        let publicKeyRaw = process.env.PUBLIC_KEY || '';
        let publicKey = publicKeyRaw.replace(/\\n/g, '\n');

        if (!publicKey.includes('\n')) {
            const header = '-----BEGIN PUBLIC KEY-----';
            const footer = '-----END PUBLIC KEY-----';
            publicKey = publicKey.trim();
            if (publicKey.startsWith(header) && publicKey.endsWith(footer)) {
                const body = publicKey.substring(header.length, publicKey.length - footer.length).trim();
                const formattedBody = body.match(/.{1,64}/g)?.join('\n') || body;
                publicKey = `${header}\n${formattedBody}\n${footer}`;
            }
        }

        const encryptor = new JSEncrypt();
        encryptor.setPublicKey(publicKey);

        const encrypted = encryptor.encrypt(data);
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

        if (parts && parts.length === 2) return parts.pop()?.split(';').shift();
        return null;
    } catch (error) {
        console.error(error)
        return null;
    }
}