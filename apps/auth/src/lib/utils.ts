export async function encryptData(apiKey: string, encryptionSecret: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(apiKey);

  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(encryptionSecret),
    { name: "PBKDF2" },
    false,
    ["deriveBits", "deriveKey"]
  );

  const salt = crypto.getRandomValues(new Uint8Array(16));

  const key = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: 100_000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt"]
  );

  const iv = crypto.getRandomValues(new Uint8Array(12));

  const encryptedData = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv,
    },
    key,
    data
  );

  const encryptedGoodies = Buffer.concat([
    Buffer.from(salt),
    Buffer.from(iv),
    Buffer.from(encryptedData),
  ]).toString("base64");

  return encryptedGoodies;
}
