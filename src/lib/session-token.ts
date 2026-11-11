export const SESSION_COOKIE_NAME = 'finanzapp_session';

const SESSION_SECRET =
  process.env.SESSION_SECRET ||
  process.env.AUTH_SECRET ||
  'finanzapp_crypto_hmac_secret_2026_x8f93e1c4a7b2d5e6';

const encoder = new TextEncoder();

export interface SessionPayload {
  sessionId: string;
  token: string;
  userId: string;
  exp: number; // timestamp en ms
}

/**
 * Clave criptográfica HMAC-SHA256 usando Web Crypto API.
 * 100% compatible con Edge Middleware y Node.js.
 */
async function getCryptoKey(): Promise<CryptoKey> {
  return await crypto.subtle.importKey(
    'raw',
    encoder.encode(SESSION_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

function toBase64Url(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(str: string): Uint8Array {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const padLen = (4 - (base64.length % 4)) % 4;
  const padded = base64 + '='.repeat(padLen);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Firma un token criptográfico HMAC-SHA256 con fecha de expiración.
 */
export async function signSessionToken(payload: SessionPayload): Promise<string> {
  const key = await getCryptoKey();
  const payloadJson = JSON.stringify(payload);
  const payloadB64 = toBase64Url(encoder.encode(payloadJson));

  const signatureBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(payloadB64));
  const signatureB64 = toBase64Url(signatureBuffer);

  return `${payloadB64}.${signatureB64}`;
}

/**
 * Verifica la firma criptográfica del token de sesión.
 * Si ha sido manipulado o ha expirado, retorna null inmediatamente.
 */
export async function verifySessionToken(tokenString?: string | null): Promise<SessionPayload | null> {
  if (!tokenString || typeof tokenString !== 'string' || !tokenString.includes('.')) {
    return null;
  }

  try {
    const [payloadB64, signatureB64] = tokenString.split('.');
    if (!payloadB64 || !signatureB64) return null;

    const key = await getCryptoKey();
    const signatureBytes = fromBase64Url(signatureB64);
    const valid = await crypto.subtle.verify(
      'HMAC',
      key,
      signatureBytes as unknown as BufferSource,
      encoder.encode(payloadB64)
    );

    if (!valid) return null;

    const payloadBytes = fromBase64Url(payloadB64);
    const payloadJson = new TextDecoder().decode(payloadBytes);
    const payload: SessionPayload = JSON.parse(payloadJson);

    // Verificar expiración
    if (!payload.exp || Date.now() > payload.exp) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}
