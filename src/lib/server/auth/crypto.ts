const encoder = new TextEncoder();
const decoder = new TextDecoder();

function toBase64Url(bytes: Uint8Array): string {
	let binary = '';
	for (const byte of bytes) binary += String.fromCharCode(byte);

	return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/u, '');
}

function fromBase64Url(value: string): Uint8Array<ArrayBuffer> {
	const base64 = value.replaceAll('-', '+').replaceAll('_', '/');
	const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
	const binary = atob(padded);
	const bytes = new Uint8Array(binary.length);

	for (let index = 0; index < binary.length; index += 1) {
		bytes[index] = binary.charCodeAt(index);
	}

	return bytes;
}

async function getEncryptionKey(secret: string): Promise<CryptoKey> {
	const digest = await crypto.subtle.digest('SHA-256', encoder.encode(secret));

	return crypto.subtle.importKey('raw', digest, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);
}

export function createRandomValue(length = 32): string {
	return toBase64Url(crypto.getRandomValues(new Uint8Array(length)));
}

export async function createCodeChallenge(verifier: string): Promise<string> {
	const digest = await crypto.subtle.digest('SHA-256', encoder.encode(verifier));
	return toBase64Url(new Uint8Array(digest));
}

export async function encryptJson(value: unknown, secret: string): Promise<string> {
	const iv = crypto.getRandomValues(new Uint8Array(12));
	const key = await getEncryptionKey(secret);
	const plaintext = encoder.encode(JSON.stringify(value));
	const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, plaintext);

	return `${toBase64Url(iv)}.${toBase64Url(new Uint8Array(encrypted))}`;
}

export async function decryptJson<T>(value: string, secret: string): Promise<T | null> {
	try {
		const [encodedIv, encodedPayload] = value.split('.');
		if (!encodedIv || !encodedPayload) return null;

		const key = await getEncryptionKey(secret);
		const decrypted = await crypto.subtle.decrypt(
			{ name: 'AES-GCM', iv: fromBase64Url(encodedIv) },
			key,
			fromBase64Url(encodedPayload)
		);

		return JSON.parse(decoder.decode(decrypted)) as T;
	} catch {
		return null;
	}
}
