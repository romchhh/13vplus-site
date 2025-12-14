import crypto from "crypto";

/**
 * Generate HMAC-MD5 signature for WayForPay
 */
export function generateWayForPaySignature(
  params: string[],
  secretKey: string
): string {
  const stringToSign = params.join(";");
  return crypto.createHmac("md5", secretKey).update(stringToSign, "utf8").digest("hex");
}

/**
 * Generate signature for purchase request
 */
export function generatePurchaseSignature(data: {
  merchantAccount: string;
  merchantDomainName: string;
  orderReference: string;
  orderDate: number;
  amount: number;
  currency: string;
  productNames: string[];
  productCounts: number[];
  productPrices: number[];
  secretKey: string;
}): string {
  const params = [
    data.merchantAccount,
    data.merchantDomainName,
    data.orderReference,
    data.orderDate.toString(),
    data.amount.toFixed(2),
    data.currency,
    ...data.productNames,
    ...data.productCounts.map((c) => c.toString()),
    ...data.productPrices.map((p) => p.toFixed(2)),
  ];
  return generateWayForPaySignature(params, data.secretKey);
}

/**
 * Generate signature for webhook response
 */
export function generateWebhookResponseSignature(data: {
  orderReference: string;
  status: string;
  time: number;
  secretKey: string;
}): string {
  const params = [
    data.orderReference,
    data.status,
    data.time.toString(),
  ];
  return generateWayForPaySignature(params, data.secretKey);
}

/**
 * Verify webhook signature
 */
export function verifyWebhookSignature(data: {
  merchantAccount: string;
  orderReference: string;
  amount: number;
  currency: string;
  authCode: string;
  cardPan: string;
  transactionStatus: string;
  reasonCode: number;
  secretKey: string;
  receivedSignature: string;
}): boolean {
  const params = [
    data.merchantAccount,
    data.orderReference,
    data.amount.toFixed(2),
    data.currency,
    data.authCode,
    data.cardPan,
    data.transactionStatus,
    data.reasonCode.toString(),
  ];
  const expectedSignature = generateWayForPaySignature(params, data.secretKey);
  return expectedSignature === data.receivedSignature;
}

