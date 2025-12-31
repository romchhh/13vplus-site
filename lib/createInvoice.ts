import { generateInvoiceSignature } from "./wayforpay";

interface CreateInvoiceParams {
  merchantAccount: string;
  merchantSecret: string;
  merchantDomainName: string;
  orderReference: string;
  amount: number;
  currency: string;
  productNames: string[];
  productCounts: number[];
  productPrices: number[];
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  serviceUrl?: string;
  paymentSystems?: string;
  orderTimeout?: number;
  language?: string;
}

export async function createWayForPayInvoice(params: CreateInvoiceParams): Promise<{
  success: boolean;
  invoiceUrl?: string;
  qrCode?: string;
  reason?: string;
  reasonCode?: string | number;
}> {
  const {
    merchantAccount,
    merchantSecret,
    merchantDomainName,
    orderReference,
    amount,
    currency,
    productNames,
    productCounts,
    productPrices,
    customerName,
    customerEmail,
    customerPhone,
    serviceUrl,
    paymentSystems,
    orderTimeout = 86400, // 24 hours default
    language = "UA",
  } = params;

  const orderDate = Math.floor(Date.now() / 1000);

  // Generate signature for invoice
  const merchantSignature = generateInvoiceSignature({
    merchantAccount,
    merchantDomainName,
    orderReference,
    orderDate,
    amount,
    currency,
    productName: productNames,
    productCount: productCounts,
    productPrice: productPrices,
    secretKey: merchantSecret,
  });

  // Prepare invoice data for CREATE_INVOICE API
  // WayForPay expects productName, productPrice, productCount as arrays
  // IMPORTANT: amount and productPrice must be sent as STRINGS with 2 decimal places for JSON API
  const invoicePayload: Record<string, string | number | string[] | number[]> = {
    transactionType: "CREATE_INVOICE",
    merchantAccount,
    merchantAuthType: "SimpleSignature",
    merchantDomainName,
    merchantSignature,
    apiVersion: 1,
    language,
    orderReference,
    orderDate,
    amount: amount.toFixed(2), // Send as string
    currency,
    orderTimeout,
    productName: productNames,
    productPrice: productPrices.map(p => p.toFixed(2)), // Send as strings
    productCount: productCounts,
  };

  // Add customer info if provided
  if (customerName) {
    const nameParts = customerName.trim().split(/\s+/);
    if (nameParts.length >= 2) {
      invoicePayload.clientFirstName = nameParts[0];
      invoicePayload.clientLastName = nameParts.slice(1).join(" ");
    } else {
      invoicePayload.clientFirstName = customerName;
    }
  }

  if (customerEmail) {
    invoicePayload.clientEmail = customerEmail;
  }

  if (customerPhone) {
    invoicePayload.clientPhone = customerPhone;
  }

  if (serviceUrl) {
    invoicePayload.serviceUrl = serviceUrl;
  }

  // Add payment systems for installment
  if (paymentSystems) {
    invoicePayload.paymentSystems = paymentSystems;
  }

  console.log("[createWayForPayInvoice] Payload to send:", JSON.stringify(invoicePayload, null, 2));

  // Call WayForPay API to create invoice
  const response = await fetch("https://api.wayforpay.com/api", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(invoicePayload),
  });

  // Check if response is JSON before parsing
  const contentType = response.headers.get("content-type");
  let result;
  
  if (contentType && contentType.includes("application/json")) {
    result = await response.json();
    console.log("[createWayForPayInvoice] Response:", JSON.stringify(result, null, 2));
  } else {
    const textResponse = await response.text();
    console.error("[createWayForPayInvoice] Non-JSON response:", textResponse.substring(0, 500));
    return {
      success: false,
      reason: `WayForPay API returned non-JSON response: ${textResponse.substring(0, 200)}`,
    };
  }

  if (result.reasonCode === "Ok" || result.reasonCode === 1100) {
    return {
      success: true,
      invoiceUrl: result.invoiceUrl,
      qrCode: result.qrCode,
    };
  } else {
    return {
      success: false,
      reason: result.reason,
      reasonCode: result.reasonCode,
    };
  }
}

