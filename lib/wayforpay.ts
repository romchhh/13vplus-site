import crypto from "crypto";

interface WebhookSignatureParams {
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
}

interface WebhookResponseParams {
  orderReference: string;
  status: string;
  time: number;
  secretKey: string;
}

export function verifyWebhookSignature(params: WebhookSignatureParams): boolean {
  const {
    merchantAccount,
    orderReference,
    amount,
    currency,
    authCode,
    cardPan,
    transactionStatus,
    reasonCode,
    secretKey,
    receivedSignature,
  } = params;

  // WayForPay webhook signature format:
  // merchantAccount;orderReference;amount;currency;authCode;cardPan;transactionStatus;reasonCode
  // IMPORTANT: Amount must be formatted with 2 decimal places
  const amountFormatted = amount.toFixed(2);
  
  const stringToSign = [
    merchantAccount,
    orderReference,
    amountFormatted,
    currency,
    authCode,
    cardPan,
    transactionStatus,
    reasonCode.toString(),
  ].join(";");

  console.log("[verifyWebhookSignature] String to sign:", stringToSign);

  const hmac = crypto.createHmac("md5", secretKey);
  hmac.update(stringToSign);
  const expectedSignature = hmac.digest("hex");

  console.log("[verifyWebhookSignature] Expected signature:", expectedSignature);
  console.log("[verifyWebhookSignature] Received signature:", receivedSignature);
  console.log("[verifyWebhookSignature] Match:", expectedSignature === receivedSignature);

  return expectedSignature === receivedSignature;
}

export function generateWebhookResponseSignature(params: WebhookResponseParams): string {
  const { orderReference, status, time, secretKey } = params;

  // Response signature format: orderReference;status;time
  const stringToSign = [orderReference, status, time.toString()].join(";");

  console.log("[generateWebhookResponseSignature] String to sign:", stringToSign);

  const hmac = crypto.createHmac("md5", secretKey);
  hmac.update(stringToSign);
  const signature = hmac.digest("hex");

  console.log("[generateWebhookResponseSignature] Generated signature:", signature);

  return signature;
}

// Payment form signature generation
interface PaymentFormParams {
  merchantAccount: string;
  merchantDomainName: string;
  orderReference: string;
  orderDate: number;
  amount: number;
  currency: string;
  productName: string[];
  productCount: number[];
  productPrice: number[];
  secretKey: string;
}

export function generatePaymentSignature(params: PaymentFormParams): string {
  const {
    merchantAccount,
    merchantDomainName,
    orderReference,
    orderDate,
    amount,
    currency,
    productName,
    productCount,
    productPrice,
    secretKey,
  } = params;

  // Payment signature format:
  // merchantAccount;merchantDomainName;orderReference;orderDate;amount;currency;productName[];productCount[];productPrice[]
  const productNameStr = productName.join(";");
  const productCountStr = productCount.join(";");
  const productPriceStr = productPrice.map(p => p.toFixed(2)).join(";");

  const stringToSign = [
    merchantAccount,
    merchantDomainName,
    orderReference,
    orderDate.toString(),
    amount.toFixed(2),
    currency,
    productNameStr,
    productCountStr,
    productPriceStr,
  ].join(";");

  console.log("[generatePaymentSignature] String to sign:", stringToSign);

  const hmac = crypto.createHmac("md5", secretKey);
  hmac.update(stringToSign);
  const signature = hmac.digest("hex");

  console.log("[generatePaymentSignature] Generated signature:", signature);

  return signature;
}

// Invoice signature generation for CREATE_INVOICE
interface InvoiceSignatureParams {
  merchantAccount: string;
  merchantDomainName: string;
  orderReference: string;
  orderDate: number;
  amount: number;
  currency: string;
  productName: string[];
  productCount: number[];
  productPrice: number[];
  secretKey: string;
}

export function generateInvoiceSignature(params: InvoiceSignatureParams): string {
  const {
    merchantAccount,
    merchantDomainName,
    orderReference,
    orderDate,
    amount,
    currency,
    productName,
    productCount,
    productPrice,
    secretKey,
  } = params;

  // Invoice signature format (same as payment):
  // merchantAccount;merchantDomainName;orderReference;orderDate;amount;currency;productName[];productCount[];productPrice[]
  const productNameStr = productName.join(";");
  const productCountStr = productCount.join(";");
  const productPriceStr = productPrice.map(p => p.toFixed(2)).join(";");

  const stringToSign = [
    merchantAccount,
    merchantDomainName,
    orderReference,
    orderDate.toString(),
    amount.toFixed(2),
    currency,
    productNameStr,
    productCountStr,
    productPriceStr,
  ].join(";");

  console.log("[generateInvoiceSignature] String to sign:", stringToSign);

  const hmac = crypto.createHmac("md5", secretKey);
  hmac.update(stringToSign);
  const signature = hmac.digest("hex");

  console.log("[generateInvoiceSignature] Generated signature:", signature);

  return signature;
}

// Legacy function names for backward compatibility
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
  return generatePaymentSignature({
    merchantAccount: data.merchantAccount,
    merchantDomainName: data.merchantDomainName,
    orderReference: data.orderReference,
    orderDate: data.orderDate,
    amount: data.amount,
    currency: data.currency,
    productName: data.productNames,
    productCount: data.productCounts,
    productPrice: data.productPrices,
    secretKey: data.secretKey,
  });
}
