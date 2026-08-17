import crypto from 'crypto';

export function generateHash(data) {
    if (Buffer.isBuffer(data)) {
        return crypto.createHash('sha256').update(data).digest('hex');
    }
    if (typeof data === 'object' && data !== null) {
        const sortedString = JSON.stringify(data, Object.keys(data).sort());
        return crypto.createHash('sha256').update(sortedString).digest('hex');
    }
    return crypto.createHash('sha256').update(String(data || '').trim()).digest('hex');
}
