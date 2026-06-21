const DEFAULT_SECRET = "adhitya-neet-academy-student-session-secret-key-2026-secure";

function getSecretKey(): string {
  return process.env.STUDENT_JWT_SECRET || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SECRET;
}

/**
 * Signs a payload to produce a signed session token.
 */
export async function signToken(payload: { student_id: string; expiresAt: number }): Promise<string> {
  const secret = getSecretKey();
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  
  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const payloadStr = btoa(JSON.stringify(payload));
  const signatureBuffer = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(payloadStr)
  );
  
  const signatureArray = Array.from(new Uint8Array(signatureBuffer));
  const signatureHex = signatureArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return `${payloadStr}.${signatureHex}`;
}

/**
 * Verifies a token and returns the parsed payload if the signature is valid.
 */
export async function verifyToken(token: string): Promise<{ student_id: string; expiresAt: number } | null> {
  if (!token) return null;
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    
    const [payloadStr, signatureHex] = parts;
    const secret = getSecretKey();
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    
    const key = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );
    
    const match = signatureHex.match(/.{1,2}/g);
    if (!match) return null;
    const signatureBytes = new Uint8Array(match.map(byte => parseInt(byte, 16)));
    
    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      signatureBytes,
      encoder.encode(payloadStr)
    );
    
    if (!isValid) return null;
    
    const decoded = JSON.parse(atob(payloadStr));
    if (decoded.expiresAt && Date.now() > decoded.expiresAt) {
      return null; // Token has expired
    }
    
    return decoded;
  } catch (err) {
    console.error("Token verification error:", err);
    return null;
  }
}
