import crypto from "crypto";

/**
 * Verify Plisio callback data
 * Based on Node.js example from Plisio documentation
 */
export function verifyPlisioCallback(
  data: Record<string, string | number | undefined>,
  secretKey: string
): boolean {
  if (!data.verify_hash || !secretKey) {
    return false;
  }

  const ordered = { ...data };
  const verifyHash = ordered.verify_hash;
  delete ordered.verify_hash;

  // Convert to JSON string (as per Plisio Node.js documentation)
  const string = JSON.stringify(ordered);

  // Generate HMAC-SHA1 hash
  const hmac = crypto.createHmac("sha1", secretKey);
  hmac.update(string);
  const hash = hmac.digest("hex");

  return hash === verifyHash;
}

